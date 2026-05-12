import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/trading-journal/react/',
  plugins: [react()],
  build: {
    outDir: '../react',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      },
    },
  },
});