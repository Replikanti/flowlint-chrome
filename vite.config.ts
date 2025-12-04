import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
      // Alias the backend logger to our browser shim
      {
        find: /.*\/flowlint-app\/packages\/logger$/,
        replacement: path.resolve(__dirname, 'src/utils/logger-shim.ts'),
      },
      // Alias config to local stub to avoid Octokit dependency
      {
        find: /.*\/flowlint-app\/packages\/config\/flowlint-config/,
        replacement: path.resolve(__dirname, 'src/stubs/flowlint-config.ts'),
      },
      // Alias for the review package to make imports cleaner (optional but good)
      {
        find: '@flowlint/review',
        replacement: path.resolve(__dirname, '../flowlint-app/packages/review'),
      },
    ],
  },
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
      },
    },
    minify: false,
    sourcemap: true,
  },
  define: {
    'process.env': {},
    'global': 'window',
  },
});
