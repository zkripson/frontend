import { renderHook } from '@testing-library/react';
import useInviteActions from '../actions';
import inviteAPI from '../api';
import { setInviteAcceptance, setInviteCreation, setLoadingInviteAcceptance, setLoadingInviteCreation } from '../index';
import { AxiosError } from 'axios';

// Mock the dependencies
jest.mock('@/hooks/useSystemFunctions', () => () => ({
  dispatch: jest.fn(action => mockDispatch(action)),
  navigate: { push: jest.fn(route => mockNavigate.push(route)) },
}));

jest.mock('@/hooks/usePrivyLinkedAccounts', () => () => ({
  evmWallet: mockEvmWallet,
}));

jest.mock('../api', () => ({
  createInvite: jest.fn(),
  acceptInvite: jest.fn(),
}));

jest.mock('@/store/app/actions', () => () => ({
  showToast: jest.fn((message, type) => mockShowToast(message, type)),
}));

// Mock Redux actions
jest.mock('../index', () => ({
  setLoadingInviteCreation: jest.fn(payload => ({ type: 'invite/setLoadingInviteCreation', payload })),
  setInviteCreation: jest.fn(payload => ({ type: 'invite/setInviteCreation', payload })),
  setLoadingInviteAcceptance: jest.fn(payload => ({ type: 'invite/setLoadingInviteAcceptance', payload })),
  setInviteAcceptance: jest.fn(payload => ({ type: 'invite/setInviteAcceptance', payload })),
}));

// Setup mocks we can access in tests
const mockDispatch = jest.fn();
const mockNavigate = { push: jest.fn() };
const mockShowToast = jest.fn();
let mockEvmWallet = { address: '0x1234567890' };

describe('useInviteActions', () => {
  // Mock response data
  const mockInviteCreationResponse = {
    id: 'inv_123',
    code: 'ABCD1234',
    creator: '0x1234567890',
    expiresAt: Date.now() + 3600000, // 1 hour from now
    sessionId: 'session_123',
    inviteLink: 'https://example.com/join/ABCD1234',
  };

  const mockInviteAcceptanceResponse = {
    success: true,
    inviteId: 'inv_123',
    sessionId: 'session_123',
    creator: '0xABCDEF',
    acceptedBy: '0x1234567890',
    status: 'WAITING' as const,
  };

  const mockCallbacks = {
    onSuccess: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEvmWallet = { address: '0x1234567890' };

    // Setup API mock implementations
    (inviteAPI.createInvite as jest.Mock).mockResolvedValue(mockInviteCreationResponse);
    (inviteAPI.acceptInvite as jest.Mock).mockResolvedValue(mockInviteAcceptanceResponse);
    
    // Silence console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createInvite', () => {
    it('should create an invite successfully', async () => {
      const { result } = renderHook(() => useInviteActions());
      
      await result.current.createInvite(mockCallbacks);

      // Verify API was called correctly
      expect(inviteAPI.createInvite).toHaveBeenCalledWith({
        creator: mockEvmWallet.address,
        sessionId: null,
      });

      // Verify redux actions
      expect(mockDispatch).toHaveBeenCalledTimes(3);
      expect(setLoadingInviteCreation).toHaveBeenCalledWith(true);
      expect(setInviteCreation).toHaveBeenCalledWith(mockInviteCreationResponse);
      expect(setLoadingInviteCreation).toHaveBeenCalledWith(false);

      // Verify callback was called
      expect(mockCallbacks.onSuccess).toHaveBeenCalledWith(mockInviteCreationResponse);
    });

    it('should handle createInvite errors', async () => {
      const mockError = new Error('Failed to create invite');
      (inviteAPI.createInvite as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useInviteActions());
      
      await result.current.createInvite(mockCallbacks);

      // Verify error callback was called
      expect(mockCallbacks.onError).toHaveBeenCalledWith(mockError);

      // Verify loading state is reset
      expect(setLoadingInviteCreation).toHaveBeenLastCalledWith(false);
    });
  });

  describe('acceptInvite', () => {
    const inviteCode = 'ABCD1234';

    it('should accept an invite successfully', async () => {
      const { result } = renderHook(() => useInviteActions());
      
      await result.current.acceptInvite(inviteCode, mockCallbacks);

      // Verify API was called correctly
      expect(inviteAPI.acceptInvite).toHaveBeenCalledWith({
        code: inviteCode,
        player: mockEvmWallet.address,
      });

      // Verify redux actions
      expect(mockDispatch).toHaveBeenCalledTimes(3);
      expect(setLoadingInviteAcceptance).toHaveBeenCalledWith(true);
      expect(setInviteAcceptance).toHaveBeenCalledWith(mockInviteAcceptanceResponse);
      expect(setLoadingInviteAcceptance).toHaveBeenCalledWith(false);

      // Verify toast was shown
      expect(mockShowToast).toHaveBeenCalledWith('Invite Accepted', 'success');

      // Verify navigation
      expect(mockNavigate.push).toHaveBeenCalledWith(`/${mockInviteAcceptanceResponse.sessionId}`);

      // Verify callback was called
      expect(mockCallbacks.onSuccess).toHaveBeenCalledWith(mockInviteAcceptanceResponse);
    });

    it('should handle already accepted invite error', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          data: {
            error: 'Invite cannot be used again with status: accepted',
          },
        },
      } as unknown as AxiosError<{ error?: string }>;

      (inviteAPI.acceptInvite as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useInviteActions());
      
      await result.current.acceptInvite(inviteCode, mockCallbacks);

      // Verify custom error message
      expect(mockShowToast).toHaveBeenCalledWith('This invite has already been accepted', 'error');

      // Verify error callback was called
      expect(mockCallbacks.onError).toHaveBeenCalledWith(mockError);

      // Verify loading state is reset
      expect(setLoadingInviteAcceptance).toHaveBeenLastCalledWith(false);
    });

    it('should handle generic API error', async () => {
      const mockError = {
        isAxiosError: true,
        response: {
          data: {
            error: 'Invalid invite code',
          },
        },
      } as unknown as AxiosError<{ error?: string }>;

      (inviteAPI.acceptInvite as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useInviteActions());
      
      await result.current.acceptInvite(inviteCode, mockCallbacks);

      // Verify API error message is shown
      expect(mockShowToast).toHaveBeenCalledWith('Invalid invite code', 'error');

      // Verify error callback was called
      expect(mockCallbacks.onError).toHaveBeenCalledWith(mockError);
    });

    it('should handle generic non-API error', async () => {
      const mockError = new Error('Network error');
      (inviteAPI.acceptInvite as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useInviteActions());
      
      await result.current.acceptInvite(inviteCode, mockCallbacks);

      // Verify generic error message is shown
      expect(mockShowToast).toHaveBeenCalledWith('Error accepting invite', 'error');

      // Verify error callback was called
      expect(mockCallbacks.onError).toHaveBeenCalledWith(mockError);
    });
  });
});