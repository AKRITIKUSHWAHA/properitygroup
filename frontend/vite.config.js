import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    port: 5175,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://njs-proprty-group-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
