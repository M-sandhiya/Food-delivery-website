import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // optional: auto opens in browser
  },
  build: {
    outDir: 'dist',
  },
  // 🔥 This is critical for React Router to avoid 404
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
