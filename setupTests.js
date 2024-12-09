
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock MutationObserver
class MockMutationObserver {
  constructor(callback) {
    this.callback = callback;
    this.observe = vi.fn();
    this.disconnect = vi.fn();
  }
}

global.MutationObserver = MockMutationObserver;