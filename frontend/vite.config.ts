/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  build: {
    // Enable code splitting with optimized chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react/jsx-runtime'],
          'vendor-misc': ['lucide-react'],
        },
      },
    },
    // Optimize chunk size and compression
    chunkSizeWarningLimit: 500,
    // Enable source maps for production debugging (smaller inline maps)
    sourcemap: 'hidden',
    // Enable minification optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    cssCodeSplit: true, // Split CSS into separate files
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react/jsx-runtime',

      'lucide-react'
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  // Performance optimizations
  server: {
    // Optimize HMR
    hmr: {
      overlay: false,
    },
    // Enable compression
    middlewareMode: false,
  },
  // Enable experimental features for better performance
  esbuild: {
    // Remove unused imports
    treeShaking: true,
  },
})