import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: 'assets',
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  define: {
    'process.env': {},
    'global': {}
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/js'),
      'buffer': 'buffer',
      'process': 'process'
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  server: {
    open: true
  }
});
