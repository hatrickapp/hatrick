import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.hatrick.app',
  appName: 'Hatrick',
  webDir: 'builds/dist',
  backgroundColor: '#F9F5F6',
  zoomEnabled: false,
  initialFocus: false,
  loggingBehavior: 'debug',
  plugins: {
    Keyboard: {
      resize: 'none',
      resizeOnFullScreen: false,
    },
  },
  server: {
    iosScheme: 'https',
    androidScheme: 'https',
  },
  android: {
    path: 'builds/android',
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    path: 'builds/ios',
  },
}

export default config
