import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
    root: 'src',
    publicDir: 'assets',
    plugins: [
        legacy({
            targets: ['defaults', 'not IE 11'],
        }),
        checker({
            typescript: true,
        }),
        nodePolyfills({
            // Whether to polyfill `node:` protocol imports.
            protocolImports: true,
            // Whether to polyfill specific globals.
            globals: {
                Buffer: true, // Explicitly enable Buffer polyfill
                global: true,
                process: true,
            },
        }),
    ],
    define: {
        'process.env': {},
        global: {},
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
        include: ['buffer', 'process'],
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
            buffer: 'buffer',
            process: 'process',
        },
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
            },
        },
    },
    server: {
        open: true,
    },
})
