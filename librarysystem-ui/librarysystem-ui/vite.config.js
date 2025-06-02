import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          console.log('🔄 Proxy rewrite:', path);
          return path;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📤 Sending Request to Backend:', req.method, req.url);
            console.log('🎯 Target URL:', `http://localhost:8080${req.url}`);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 Response from Backend:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})