import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  preview: { port: 3000 },
  // React + motion (drag, layout, presence) land around 210 kB gzipped; that's expected.
  build: { chunkSizeWarningLimit: 650 },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
