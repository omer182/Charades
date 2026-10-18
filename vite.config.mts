import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// `vite build` builds the site into dist/. `vite build --ssr server/index.ts` bundles the Node server
// (rooms for the phone remote, plus serving dist/) into dist-server/index.mjs.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    // The room server runs separately in dev (npm run dev:server).
    proxy: { '/socket.io': { target: 'http://localhost:3001', ws: true } },
  },
  preview: { port: 3000 },
  build: isSsrBuild
    ? {
        outDir: 'dist-server',
        copyPublicDir: false,
        rollupOptions: { output: { entryFileNames: 'index.mjs' } },
      }
    : // React + motion (drag, layout, presence) land around 210 kB gzipped; that's expected.
      { chunkSizeWarningLimit: 650 },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
  },
}));
