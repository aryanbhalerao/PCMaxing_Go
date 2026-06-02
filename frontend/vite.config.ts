import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/_/backend': {
        target: 'http://localhost:5000',
        rewrite: (path) => path.replace(/^\/_\/backend/, ''),
      },
    },
  },
});
