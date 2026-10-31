import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Δύο σελίδες: η αρχική (landing) στο "/" και η εφαρμογή στο "/app/".
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        app: fileURLToPath(new URL('./app/index.html', import.meta.url)),
      },
    },
  },
  server: {
    port: 5173,
    // Οι κλήσεις προς /api προωθούνται στο backend, χωρίς προβλήματα CORS/https.
    proxy: {
      '/api': {
        target: 'http://localhost:5008',
        changeOrigin: true,
      },
    },
  },
})