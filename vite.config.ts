import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/features': resolve(__dirname, 'src/features'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/store': resolve(__dirname, 'src/store'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/styles': resolve(__dirname, 'src/styles'),
    },
  },
  define: {
    'process.env': process.env,
  },
  server: {
    port: 3000,
    host: true,
    open: true,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          charts: ['chart.js', 'react-chartjs-2'],
          pdf: ['jspdf', 'jspdf-autotable'],
          i18n: ['react-i18next', 'i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'chart.js',
      'react-chartjs-2',
      'jspdf',
      'jspdf-autotable',
      'zustand',
      'date-fns',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'canvas-confetti',
      'react-hot-toast',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})