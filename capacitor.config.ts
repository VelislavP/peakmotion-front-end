import type { CapacitorConfig } from '@capacitor/cli';
import { interval, repeat } from 'rxjs';

const config: CapacitorConfig = {
  appId: 'com.peakmotion.runner',
  appName: 'Peak Motion',
  webDir: 'www',
  plugins: {
    BackgroundRunner: {
      label: 'com.peakmotion.runner.check',
      src: 'runners/runner.js',
      event: 'myCustomEvent',
      repeat: true,
      interval: 1,
      autoStart: true
    },
  }
};

export default config;
