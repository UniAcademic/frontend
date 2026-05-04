import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/ms-usuario': {
        target: 'http://ec2-3-13-7-224.us-east-2.compute.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ms-usuario/, '/ms-usuario/api/v1'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Remove browser-specific headers that may cause 403 on the backend
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './testSetup.js',
    exclude: ['e2e/**', 'node_modules/**'],
  }
})
