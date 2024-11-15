import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        minify: false,
        rollupOptions: {
            input: 'index.html',
            output: {
                entryFileNames: 'index.js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
    },
});
