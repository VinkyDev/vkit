import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    write: false,
  },
  plugins: [
    electron([
      {
        entry: 'src/main.ts',
        // onstart(options) {
        //   options.reload();
        // },
      },
      {
        entry: 'src/preload.ts',
        onstart(options) {
          options.reload();
        },
      },
    ]),
  ],
});
