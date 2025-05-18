import React from 'react';

// Mock usePrivy hook
export const usePrivy = jest.fn(() => ({
  ready: true,
  authenticated: false,
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  linkAccount: jest.fn(),
  unlinkAccount: jest.fn(),
  signMessage: jest.fn(),
  createWallet: jest.fn(),
  setWalletPassword: jest.fn(),
  exportWallet: jest.fn(),
  isModalOpen: false,
  setModalOpen: jest.fn(),
}));

// Mock PrivyProvider component
export const PrivyProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Mock PrivyClientConfig type
export type PrivyClientConfig = {
  appId: string;
  loginMethods?: string[];
  onSuccess?: (user: any) => void;
  embeddedWallets?: any;
  externalWallets?: any;
  walletConnectCloudProjectId?: string;
};