import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { build as esbuildBuild } from 'esbuild';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'compile-plugin-config-cjs',
      apply: 'build',
      async writeBundle() {
        await esbuildBuild({
          entryPoints: [path.resolve(__dirname, 'plugin.config.ts')],
          outfile: path.resolve(__dirname, 'dist', 'plugin.config.cjs'),
          bundle: true,
          platform: 'node',
          format: 'cjs',
          sourcemap: false,
          tsconfig: path.resolve(__dirname, 'tsconfig.json'),
        });
      },
    },
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
