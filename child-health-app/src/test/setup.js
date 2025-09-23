import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    DEV: true,
    VITE_ESIGNET_URL: 'https://test.esignet.com/api',
    VITE_ESIGNET_CLIENT_ID: 'test-client',
    VITE_API_BASE_URL: 'http://localhost:3001/api'
  },
  writable: true
});

// Mock IndexedDB
globalThis.indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn((key) => {
    return localStorageMock._storage[key] || null;
  }),
  setItem: vi.fn((key, value) => {
    localStorageMock._storage[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock._storage[key];
  }),
  clear: vi.fn(() => {
    localStorageMock._storage = {};
  }),
  _storage: {}
};
globalThis.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
globalThis.sessionStorage = sessionStorageMock;

// Mock geolocation
globalThis.navigator.geolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn()
};

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});