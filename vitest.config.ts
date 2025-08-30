import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
    setupFiles: ['./test/setup.ts'],
    environment: 'node',
    globals: true,
  },
});