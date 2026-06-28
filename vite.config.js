import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  test: {
    // Use jsdom so React hooks (useState, useEffect) work in the test environment.
    environment: 'jsdom',

    // Automatically import Vitest globals (describe, it, expect, vi) without
    // needing to import them in every test file.
    globals: true,

    // Run React Testing Library setup (cleanup after each test) automatically.
    setupFiles: ['./src/tests/setup.js'],
  },
});
