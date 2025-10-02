import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sudokucolor.game',
  appName: 'Sudoku Color 3D',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
