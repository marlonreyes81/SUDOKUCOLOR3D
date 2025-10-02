import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.getcapacitor.app',
  appName: 'Sudoku Color 3D',
  webDir: 'out',
  server: {
    url: 'http://localhost:9002',
    cleartext: true
  }
};

export default config;
