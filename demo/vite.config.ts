import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      'react-raphael': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      '/tests/harness.tsx': fileURLToPath(new URL('../tests/harness.tsx', import.meta.url)),
    },
  },
  build: { outDir: '../demo-dist', emptyOutDir: true },
});
