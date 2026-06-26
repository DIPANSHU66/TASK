import { defineConfig } from 'vite';

export default defineConfig({
  base: '/scheduling-algo/',
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
});
