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
        manualChunks: (id) => {
          // Vendor chunk for React and core libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }

            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('cloudinary')) {
              return 'vendor-cloudinary';
            }
            // Other vendor libraries
            return 'vendor-misc';
          }
          
          // Admin components chunk
          if (id.includes('/components/Admin') || 
              id.includes('/components/PaintingManager') ||
              id.includes('/components/OrderManager') ||
              id.includes('/components/ImageUploader')) {
            return 'admin';
          }
          
          // Gallery components chunk
          if (id.includes('/components/Gallery') ||
              id.includes('/components/PaintingGrid') ||
              id.includes('/components/PaintingCard') ||
              id.includes('/components/PaintingModal')) {
            return 'gallery';
          }
          

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