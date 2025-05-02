// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy pour l'API Expedition
      '/api/expedition': {
        target: 'https://api.expedition.mitosis.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/expedition/, '/v1/status')
      },
      // Proxy pour la Theo Vault
      '/api/theo': {
        target: 'https://matrix-proxy.mitomat.workers.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/theo/, '/theo/portfolio')
      },
      // Proxy pour le Testnet $MITO
      '/api/testnet': {
        target: 'https://mito-api.customrpc.workers.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/testnet/, '/api/wallet')
      },
    }
  }
})
