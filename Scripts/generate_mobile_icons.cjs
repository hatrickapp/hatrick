#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const rootDir = path.resolve(__dirname, '..')
const appDir = path.join(rootDir, 'client/app')
const { PNG } = require(path.join(appDir, 'node_modules/pngjs'))
const iconSourcePath = process.env.MOBILE_ICON_SOURCE
  ? path.resolve(process.env.MOBILE_ICON_SOURCE)
  : path.join(appDir, 'src/assets/app-logo.png')
const iosIconDir = path.join(appDir, 'builds/ios/App/App/Assets.xcassets/AppIcon.appiconset')
const androidResDir = path.join(appDir, 'builds/android/app/src/main/res')

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function readPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath))
}

function compositeOverWhite(source) {
  const output = new PNG({ width: source.width, height: source.height })
  for (let index = 0; index < source.data.length; index += 4) {
    const alpha = source.data[index + 3] / 255
    output.data[index] = Math.round(source.data[index] * alpha + 255 * (1 - alpha))
    output.data[index + 1] = Math.round(source.data[index + 1] * alpha + 255 * (1 - alpha))
    output.data[index + 2] = Math.round(source.data[index + 2] * alpha + 255 * (1 - alpha))
    output.data[index + 3] = 255
  }
  return output
}

function resized(source, size) {
  const output = new PNG({ width: size, height: size })
  const scaleX = source.width / size
  const scaleY = source.height / size

  for (let y = 0; y < size; y += 1) {
    const sourceY = Math.min(source.height - 1, Math.floor((y + 0.5) * scaleY))
    for (let x = 0; x < size; x += 1) {
      const sourceX = Math.min(source.width - 1, Math.floor((x + 0.5) * scaleX))
      const sourceIndex = (sourceY * source.width + sourceX) * 4
      const outputIndex = (y * size + x) * 4
      output.data[outputIndex] = source.data[sourceIndex]
      output.data[outputIndex + 1] = source.data[sourceIndex + 1]
      output.data[outputIndex + 2] = source.data[sourceIndex + 2]
      output.data[outputIndex + 3] = source.data[sourceIndex + 3]
    }
  }

  return output
}

function writePng(filePath, image) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, PNG.sync.write(image))
}

function writeText(filePath, contents) {
  ensureDir(path.dirname(filePath))
  if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== contents) {
    fs.writeFileSync(filePath, contents)
  }
}

const icon = compositeOverWhite(readPng(iconSourcePath))

if (fs.existsSync(path.dirname(iosIconDir))) {
  ensureDir(iosIconDir)
  writePng(path.join(iosIconDir, 'AppIcon-512@2x.png'), resized(icon, 1024))
  writeText(path.join(iosIconDir, 'Contents.json'), `{
  "images" : [
    {
      "filename" : "AppIcon-512@2x.png",
      "idiom" : "universal",
      "platform" : "ios",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
`)
}

if (fs.existsSync(androidResDir)) {
  const densities = [
    ['mipmap-mdpi', 48],
    ['mipmap-hdpi', 72],
    ['mipmap-xhdpi', 96],
    ['mipmap-xxhdpi', 144],
    ['mipmap-xxxhdpi', 192],
  ]

  for (const [dir, size] of densities) {
    const densityDir = path.join(androidResDir, dir)
    writePng(path.join(densityDir, 'ic_launcher.png'), resized(icon, size))
    writePng(path.join(densityDir, 'ic_launcher_round.png'), resized(icon, size))
    writePng(path.join(densityDir, 'ic_launcher_foreground.png'), resized(icon, size))
  }

  writeText(path.join(androidResDir, 'values/ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
`)
}
