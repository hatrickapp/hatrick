#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
APP_DIR="$ROOT_DIR/client/app"
ANDROID_DIR="$APP_DIR/builds/android"
GOOGLE_WEB_CLIENT_ID="${GOOGLE_WEB_CLIENT_ID:-626214828265-8ov0nevk3otr34u6fpei491mb7ld5kcq.apps.googleusercontent.com}"
GOOGLE_ANDROID_CLIENT_ID="${GOOGLE_ANDROID_CLIENT_ID:-626214828265-skihrhgv2lsa9796a1pjldrjjj0oialt.apps.googleusercontent.com}"
MOBILE_ICON_SOURCE="${MOBILE_ICON_SOURCE:-$APP_DIR/src/assets/app-logo.png}"
export GOOGLE_WEB_CLIENT_ID
export GOOGLE_ANDROID_CLIENT_ID
export MOBILE_ICON_SOURCE
export VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-$GOOGLE_WEB_CLIENT_ID}"

cd "$APP_DIR"

npm run build

if [ ! -d "$ANDROID_DIR" ]; then
  npm run cap:add:android
else
  rm -rf builds/android/app/src/main/assets/public
  npm run cap:sync
fi

node <<'NODE'
const fs = require('fs')
const path = require('path')

const manifestPath = path.join(process.cwd(), 'builds/android/app/src/main/AndroidManifest.xml')
let manifest = fs.readFileSync(manifestPath, 'utf8')

manifest = manifest.replace(
  /<activity\b([^>]*\bandroid:name="\.MainActivity"[^>]*)>/,
  (match, attrs) => {
    if (/\bandroid:screenOrientation=/.test(attrs)) return match
    return `<activity${attrs}\n            android:screenOrientation="portrait">`
  },
)

fs.writeFileSync(manifestPath, manifest)
NODE

node "$ROOT_DIR/Scripts/generate_mobile_icons.cjs"

echo "Android is ready. Open with: cd client/app && npm run cap:open:android"
