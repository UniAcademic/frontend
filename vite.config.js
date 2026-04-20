import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  base: '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './testSetup.js'
  }
=======
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
>>>>>>> 66b5dfe0a3e5416882d5edab3a2b544bf1988129
})
