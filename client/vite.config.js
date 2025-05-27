import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'react-icons'],
          charts: ['chart.js', 'react-chartjs-2'],
          utils: ['axios', 'date-fns', 'moment'],
          media: ['hls.js', 'mediasoup-client'],
          swiper: ['swiper'],
          gsap: ['gsap'],
          socket: ['socket.io-client'],
          oauth: ['@react-oauth/google'],
          toast: ['react-toastify'],
          signature: ['react-signature-canvas'],
          emoji: ['emoji-picker-react']
        }
      }
    },
    chunkSizeWarningLimit: 1500,
    sourcemap: false,
    target: 'es2015',
    minify: 'esbuild',
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'framer-motion',
      'react-icons',
      'chart.js',
      'react-chartjs-2'
    ]
  },
  esbuild: {
    target: 'es2015',
    drop: ['console', 'debugger']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
})
