// Runs React Testing Library's cleanup after each test to prevent state leaks.
import '@testing-library/react/pure';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
