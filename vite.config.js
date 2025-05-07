// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// this is the correct Vite plugin for Tailwind:
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    // call the exact name you imported:
    tailwindcss(),  
  ],
  server: {
    proxy: {
      '/api/expedition': {
        target: 'https://api.expedition.mitosis.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/expedition/, '/v1/status')
      },
      '/api/theo': {
        target: 'https://matrix-proxy.mitomat.workers.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/theo/, '/theo/portfolio')
      },
      '/api/testnet': {
        target: 'https://mito-api.customrpc.workers.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/testnet/, '/api/wallet')
      },
    }
  }
})
