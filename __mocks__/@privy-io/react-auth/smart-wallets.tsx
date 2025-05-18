import React from 'react';

// Mock SmartWalletsProvider component
export const SmartWalletsProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Mock useSmartWallets hook
export const useSmartWallets = jest.fn(() => ({
  client: null,
  address: null,
  isConnected: false,
  connect: jest.fn(),
  disconnect: jest.fn(),
  getClientForChain: jest.fn().mockResolvedValue(null),
  sendTransaction: jest.fn(),
  signMessage: jest.fn(),
  switchChain: jest.fn(),
}));