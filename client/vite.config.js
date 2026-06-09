import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/',
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/auth': {
                target: 'http://localhost:5001',
                changeOrigin: true
            }
        }
    },
    build: {
        // Handle framer-motion and Three.js module directives
        rollupOptions: {
            onwarn(warning, warn) {
                // Suppress "use client" directive warnings
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return;
                }
                warn(warning);
            }
        }
    },
    optimizeDeps: {
        include: ['framer-motion', 'three', '@react-three/fiber', '@react-three/drei']
    }
})
