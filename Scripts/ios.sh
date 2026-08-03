#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
APP_DIR="$ROOT_DIR/client/app"
IOS_DIR="$APP_DIR/builds/ios"
GOOGLE_WEB_CLIENT_ID="${GOOGLE_WEB_CLIENT_ID:-626214828265-8ov0nevk3otr34u6fpei491mb7ld5kcq.apps.googleusercontent.com}"
GOOGLE_IOS_CLIENT_ID="${GOOGLE_IOS_CLIENT_ID:-626214828265-5r2ajs1g4cjtnhl12ql60h7jb5oq34a9.apps.googleusercontent.com}"
GOOGLE_IOS_REVERSED_CLIENT_ID="${GOOGLE_IOS_REVERSED_CLIENT_ID:-com.googleusercontent.apps.626214828265-5r2ajs1g4cjtnhl12ql60h7jb5oq34a9}"
export GOOGLE_WEB_CLIENT_ID
export GOOGLE_IOS_CLIENT_ID
export GOOGLE_IOS_REVERSED_CLIENT_ID
export VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-$GOOGLE_WEB_CLIENT_ID}"

cd "$APP_DIR"

npm run build

if [ ! -d "$IOS_DIR" ]; then
  npm run cap:add:ios
fi

node <<'NODE'
const fs = require('fs')
const path = require('path')

const appDir = process.cwd()
const entitlementsPath = path.join(appDir, 'builds/ios/App/App/App.entitlements')
const infoPlistPath = path.join(appDir, 'builds/ios/App/App/Info.plist')
const projectPath = path.join(appDir, 'builds/ios/App/App.xcodeproj/project.pbxproj')

const defaultGoogleIosClientId = '626214828265-5r2ajs1g4cjtnhl12ql60h7jb5oq34a9.apps.googleusercontent.com'
const defaultGoogleIosReversedClientId = 'com.googleusercontent.apps.626214828265-5r2ajs1g4cjtnhl12ql60h7jb5oq34a9'
const googleIosClientId = process.env.GOOGLE_IOS_CLIENT_ID || defaultGoogleIosClientId
const googleIosReversedClientId = process.env.GOOGLE_IOS_REVERSED_CLIENT_ID || defaultGoogleIosReversedClientId

function writeFileIfChanged(filePath, contents) {
  if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== contents) {
    fs.writeFileSync(filePath, contents)
  }
}

function setBuildSetting(block, key, value) {
  const escapedValue = value === '' ? '""' : value
  const pattern = new RegExp(`\\n\\s*${key} = .*?;`)
  if (pattern.test(block)) {
    return block.replace(pattern, `\n\t\t\t\t${key} = ${escapedValue};`)
  }
  return block.replace(
    '\n\t\t\t\tINFOPLIST_FILE = App/Info.plist;',
    `\n\t\t\t\t${key} = ${escapedValue};\n\t\t\t\tINFOPLIST_FILE = App/Info.plist;`,
  )
}

const entitlements = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.developer.applesignin</key>
\t<array>
\t\t<string>Default</string>
\t</array>
</dict>
</plist>
`

writeFileIfChanged(entitlementsPath, entitlements)

const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>CAPACITOR_DEBUG</key>
\t<string>$(CAPACITOR_DEBUG)</string>
\t<key>CFBundleDevelopmentRegion</key>
\t<string>en</string>
\t<key>CFBundleDisplayName</key>
\t<string>Hatrick</string>
\t<key>CFBundleExecutable</key>
\t<string>$(EXECUTABLE_NAME)</string>
\t<key>CFBundleIdentifier</key>
\t<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
\t<key>CFBundleInfoDictionaryVersion</key>
\t<string>6.0</string>
\t<key>CFBundleName</key>
\t<string>$(PRODUCT_NAME)</string>
\t<key>CFBundlePackageType</key>
\t<string>APPL</string>
\t<key>CFBundleShortVersionString</key>
\t<string>$(MARKETING_VERSION)</string>
\t<key>CFBundleURLTypes</key>
\t<array>
\t\t<dict>
\t\t\t<key>CFBundleURLSchemes</key>
\t\t\t<array>
\t\t\t\t<string>$(GOOGLE_IOS_REVERSED_CLIENT_ID)</string>
\t\t\t</array>
\t\t</dict>
\t</array>
\t<key>CFBundleVersion</key>
\t<string>$(CURRENT_PROJECT_VERSION)</string>
\t<key>GIDClientID</key>
\t<string>$(GOOGLE_IOS_CLIENT_ID)</string>
\t<key>LSRequiresIPhoneOS</key>
\t<true/>
\t<key>UILaunchStoryboardName</key>
\t<string>LaunchScreen</string>
\t<key>UIMainStoryboardFile</key>
\t<string>Main</string>
\t<key>UIRequiredDeviceCapabilities</key>
\t<array>
\t\t<string>armv7</string>
\t</array>
\t<key>UISupportedInterfaceOrientations</key>
\t<array>
\t\t<string>UIInterfaceOrientationPortrait</string>
\t</array>
\t<key>UISupportedInterfaceOrientations~ipad</key>
\t<array>
\t\t<string>UIInterfaceOrientationPortrait</string>
\t</array>
\t<key>UIViewControllerBasedStatusBarAppearance</key>
\t<true/>
</dict>
</plist>
`
writeFileIfChanged(infoPlistPath, infoPlist)

let project = fs.readFileSync(projectPath, 'utf8')

if (!project.includes('504EC3191FED79650016851F /* App.entitlements */')) {
  project = project.replace(
    '\t\t504EC3131FED79650016851F /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };\n',
    '\t\t504EC3131FED79650016851F /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };\n\t\t504EC3191FED79650016851F /* App.entitlements */ = {isa = PBXFileReference; lastKnownFileType = text.plist.entitlements; path = App.entitlements; sourceTree = "<group>"; };\n',
  )
}

if (!project.includes('\t\t\t\t504EC3191FED79650016851F /* App.entitlements */,')) {
  project = project.replace(
    '\t\t\t\t504EC3131FED79650016851F /* Info.plist */,\n',
    '\t\t\t\t504EC3131FED79650016851F /* Info.plist */,\n\t\t\t\t504EC3191FED79650016851F /* App.entitlements */,\n',
  )
}

project = project.replace(
  /(504EC3171FED79650016851F \/\* Debug \*\/ = \{[\s\S]*?buildSettings = \{)([\s\S]*?)(\n\t\t\t\};\n\t\t\tname = Debug;\n\t\t\};)/,
  (_match, start, settings, end) => {
    let next = settings
    next = setBuildSetting(next, 'CODE_SIGN_ENTITLEMENTS', 'App/App.entitlements')
    next = setBuildSetting(next, 'GOOGLE_IOS_CLIENT_ID', googleIosClientId)
    next = setBuildSetting(next, 'GOOGLE_IOS_REVERSED_CLIENT_ID', googleIosReversedClientId)
    return start + next + end
  },
)

project = project.replace(
  /(504EC3181FED79650016851F \/\* Release \*\/ = \{[\s\S]*?buildSettings = \{)([\s\S]*?)(\n\t\t\t\};\n\t\t\tname = Release;\n\t\t\};)/,
  (_match, start, settings, end) => {
    let next = settings
    next = setBuildSetting(next, 'CODE_SIGN_ENTITLEMENTS', 'App/App.entitlements')
    next = setBuildSetting(next, 'GOOGLE_IOS_CLIENT_ID', googleIosClientId)
    next = setBuildSetting(next, 'GOOGLE_IOS_REVERSED_CLIENT_ID', googleIosReversedClientId)
    return start + next + end
  },
)

writeFileIfChanged(projectPath, project)
NODE

rm -rf builds/ios/App/App/public
npm run cap:sync
node "$ROOT_DIR/Scripts/generate_mobile_icons.cjs"
plutil -lint builds/ios/App/App/Info.plist builds/ios/App/App/App.entitlements

echo "iOS is ready. Open with: cd client/app && npm run cap:open:ios"
