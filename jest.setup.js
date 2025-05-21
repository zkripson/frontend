// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Add TextEncoder/TextDecoder to the global scope for viem
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock problematic dependencies
jest.mock('@privy-io/react-auth', () => ({
  usePrivy: jest.fn(() => ({
    ready: true,
    authenticated: false,
    user: {
      id: 'mock-user-id',
      linkedAccounts: [],
    },
    login: jest.fn(),
    logout: jest.fn(),
  })),
  PrivyProvider: ({ children }) => children,
  PrivyClientConfig: {},
  isPrivyWallet: jest.fn(() => false),
}));

jest.mock('@privy-io/react-auth/smart-wallets', () => ({
  SmartWalletsProvider: ({ children }) => children,
  useSmartWallets: jest.fn(() => ({
    client: null,
    address: null,
    isConnected: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    getClientForChain: jest.fn().mockResolvedValue(null),
  })),
}));

// Mock viem chains
jest.mock('viem/chains', () => ({
  base: {
    id: 8453,
    name: 'Base',
    network: 'base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: ['https://mainnet.base.org'],
      },
    },
  },
  baseSepolia: {
    id: 84532,
    name: 'Base Sepolia',
    network: 'base-sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: {
        http: ['https://sepolia.base.org'],
      },
    },
  },
}));

// Add custom matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = Boolean(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be in the document`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be in the document`,
        pass: false,
      };
    }
  },
});

// Filter out React JSX transform warning
const originalWarn = console.warn;
console.warn = function filterWarning(...args) {
  // Suppress React JSX transform warning
  if (args[0] && typeof args[0] === 'string' && args[0].includes('outdated JSX transform')) {
    return;
  }
  originalWarn.apply(console, args);
};

// Mock Audio API
global.Audio = jest.fn(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  volume: 1,
  currentTime: 0,
  duration: 0,
  paused: true,
}));

// Mock WebSocket globally
global.WebSocket = jest.fn(() => ({
  close: jest.fn(),
  send: jest.fn(),
  readyState: 1, // WebSocket.OPEN
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onopen: null,
  onclose: null,
  onmessage: null,
  onerror: null,
}));

// Mock Farcaster Frame SDK
jest.mock('@farcaster/frame-sdk', () => ({
  sdk: {
    context: {
      frameData: null,
      user: null,
    },
    actions: {
      ready: jest.fn(),
      close: jest.fn(),
      openUrl: jest.fn(),
    },
  },
}));