import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,

        allowedHosts: [
            'localhost',
            '.trycloudflare.com',   // cloudflared
        ],

        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                configure: (proxy, options) => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        // Preserve Authorization header through proxy
                        if (req.headers.authorization) {
                            proxyReq.setHeader('Authorization', req.headers.authorization);
                        }
                    });
                }
            }
        }

    }
})
