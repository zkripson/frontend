// Mock for @farcaster/frame-sdk
export const sdk = {
  context: {
    frameData: null,
    user: null,
  },
  actions: {
    ready: jest.fn(),
    close: jest.fn(),
    openUrl: jest.fn(),
  },
};

export default sdk;