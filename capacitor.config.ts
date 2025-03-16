import type { CapacitorConfig } from '@capacitor/cli';
import { interval, repeat } from 'rxjs';

const config: CapacitorConfig = {
  appId: 'com.peakmotion.runner',
  appName: 'Peak Motion',
  webDir: 'www',
  server: {
    androidScheme: "https",
    allowNavigation: ["*"]
  },
  plugins: {
    BackgroundRunner: {
        label: "io.ionic.starter.peakmotion",
        src: "runners/runner.js",
        event: "notificationTest",
        repeat: true,
        interval: 1,
        autoStart: true,
    },
  }
};

export default config;
