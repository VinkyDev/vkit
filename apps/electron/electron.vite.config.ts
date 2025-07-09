import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@vkit/api'],
      }),
    ],
    resolve: {
      alias: {
        '@vkit/api': resolve('../../packages/api/src'),
      },
    },
  },
  preload: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@vkit/api'],
      }),
    ],
  },
  // renderer: {}
});
