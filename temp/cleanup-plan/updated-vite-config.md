# Updated Vite Configuration

Here's the proposed updated Vite configuration file that will support our new file structure:

```javascript
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';
import checker from 'vite-plugin-checker';

export default defineConfig({
  // Set the root directory to src instead of project root
  root: 'src',
  // Assets directory is now inside src
  publicDir: 'assets',
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    checker({
      typescript: true,
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
      // Updated aliases to match the new structure
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@entities': resolve(__dirname, 'src/entities'),
      '@managers': resolve(__dirname, 'src/managers'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@constants': resolve(__dirname, 'src/constants'),
      '@shared': resolve(__dirname, 'shared'),
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
```

This updated configuration:

1. Sets the root to `src` directory
2. Updates the `publicDir` to `assets` inside src
3. Adds new path aliases that match our directory structure
4. Keeps the same build output settings
5. Maintains compatibility with existing TypeScript support
