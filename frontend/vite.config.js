import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target:      'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target:        'es2020',
    sourcemap:     false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':   ['react', 'react-dom', 'react-router-dom'],
          'query-vendor':   ['@tanstack/react-query'],
          'form-vendor':    ['react-hook-form', '@hookform/resolvers', 'zod'],
          'radix-vendor':   [
            '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',   '@radix-ui/react-select',
            '@radix-ui/react-tooltip','@radix-ui/react-popover',
            '@radix-ui/react-switch', '@radix-ui/react-checkbox',
            '@radix-ui/react-avatar', '@radix-ui/react-progress',
            '@radix-ui/react-separator',
          ],
          'chart-vendor':   ['recharts'],
          'utils-vendor':   ['dayjs', 'clsx', 'axios', 'zustand', 'lucide-react'],
        },
      },
    },
  },
});
