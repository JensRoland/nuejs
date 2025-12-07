import { defineConfig } from 'vite'
import nue from 'vite-plugin-nue'

export default defineConfig({
  plugins: [nue()],

  // Source files location
  root: 'frontend',

  build: {
    // Output to app/public for PHP to serve
    outDir: '../app/public/dist',
    emptyOutDir: true,

    // Generate manifest for PHP integration
    manifest: true,

    rollupOptions: {
      input: 'frontend/main.js'
    }
  },

  // Dev server config
  server: {
    // Proxy API requests to PHP backend
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
