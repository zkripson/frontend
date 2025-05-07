import { renderHook } from '@testing-library/react';
import useGameActions from '../actions';
import useSystemFunctions from '@/hooks/useSystemFunctions';
import { usePrivy } from '@privy-io/react-auth';
import gameAPI from '../api';
import {
  setGameSession,
  setGameSessionInfo,
  setLoadingCreateGameSession,
  setLoadingForfeitGame,
  setLoadingGameSessionInfo,
  setLoadingJoinGameSession,
  setLoadingRegisterGameContract,
  setLoadingStartGame,
  setLoadingSubmitBoardCommitment,
} from '..';

// Mock dependencies
jest.mock('@/hooks/useSystemFunctions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@privy-io/react-auth', () => ({
  usePrivy: jest.fn(),
}));

jest.mock('../api', () => ({
  createGameSession: jest.fn(),
  getGameSessionInformation: jest.fn(),
  joinGameSession: jest.fn(),
  submitBoardCommitment: jest.fn(),
  startGame: jest.fn(),
  forfeitGame: jest.fn(),
  registerGameContract: jest.fn(),
}));

// Mock console.error to avoid test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('useGameActions', () => {
  const mockDispatch = jest.fn();
  const mockWallet = { address: '0x123' };
  const mockUser = { wallet: mockWallet };
  const mockGameSessionInfo = { 
    sessionId: 'game123',
    status: 'CREATED',
    players: ['0x123'],
    currentTurn: null,
    gameContractAddress: null,
    gameId: null,
    turnStartedAt: null,
    createdAt: Date.now(),
    lastActivityAt: Date.now()
  };
  const mockGameSession = {
    createdAt: Date.now(),
    creator: '0x123',
    sessionId: 'game123',
    status: 'CREATED'
  };
  
  // Test callbacks
  const mockCallbacks = {
    onSuccess: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock hook returns
    (useSystemFunctions as jest.Mock).mockReturnValue({
      dispatch: mockDispatch,
      gameState: { gameSessionInfo: mockGameSessionInfo },
    });
    
    (usePrivy as jest.Mock).mockReturnValue({
      user: mockUser,
    });
  });

  describe('createGameSession', () => {
    it('should create a game session successfully', async () => {
      // Arrange
      gameAPI.createGameSession = jest.fn().mockResolvedValue(mockGameSession);
      gameAPI.getGameSessionInformation = jest.fn().mockResolvedValue(mockGameSessionInfo);
      
      const { result } = renderHook(() => useGameActions());

      // Act
      await result.current.createGameSession(mockCallbacks);

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingCreateGameSession(true));
      expect(gameAPI.createGameSession).toHaveBeenCalledWith(mockWallet.address);
      expect(mockDispatch).toHaveBeenCalledWith(setGameSession(mockGameSession));
      expect(gameAPI.getGameSessionInformation).toHaveBeenCalledWith(mockGameSession.sessionId);
      expect(mockDispatch).toHaveBeenCalledWith(setGameSessionInfo(mockGameSessionInfo));
      expect(mockCallbacks.onSuccess).toHaveBeenCalledWith(mockGameSession);
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingCreateGameSession(false));
    });

    it('should handle errors when creating a game session', async () => {
      // Arrange
      const mockError = new Error('API error');
      gameAPI.createGameSession = jest.fn().mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useGameActions());

      // Act
      await result.current.createGameSession(mockCallbacks);

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingCreateGameSession(true));
      expect(gameAPI.createGameSession).toHaveBeenCalledWith(mockWallet.address);
      expect(mockCallbacks.onError).toHaveBeenCalledWith(mockError);
      expect(console.error).toHaveBeenCalledWith(mockError);
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingCreateGameSession(false));
    });

    it('should not create a game session if user has no wallet', async () => {
      // Arrange
      (usePrivy as jest.Mock).mockReturnValue({
        user: { wallet: null },
      });
      
      // Reset mock calls count before this specific test
      mockDispatch.mockClear();
      
      const { result } = renderHook(() => useGameActions());

      // Act
      await result.current.createGameSession(mockCallbacks);

      // Assert
      expect(gameAPI.createGameSession).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalledWith(setGameSession(expect.anything()));
    });
  });

  describe('fetchGameSessionInformation', () => {
    it('should fetch game session information successfully', async () => {
      // Arrange
      gameAPI.getGameSessionInformation = jest.fn().mockResolvedValue(mockGameSessionInfo);
      
      const { result } = renderHook(() => useGameActions());

      // Act
      await result.current.fetchGameSessionInformation('game123');

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingGameSessionInfo(true));
      expect(gameAPI.getGameSessionInformation).toHaveBeenCalledWith('game123');
      expect(mockDispatch).toHaveBeenCalledWith(setGameSessionInfo(mockGameSessionInfo));
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingGameSessionInfo(false));
    });

    it('should handle errors when fetching game session information', async () => {
      // Arrange
      const mockError = new Error('API error');
      gameAPI.getGameSessionInformation = jest.fn().mockRejectedValue(mockError);
      
      const { result } = renderHook(() => useGameActions());

      // Act
      await result.current.fetchGameSessionInformation('game123');

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingGameSessionInfo(true));
      expect(gameAPI.getGameSessionInformation).toHaveBeenCalledWith('game123');
      expect(console.error).toHaveBeenCalledWith(mockError);
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingGameSessionInfo(false));
    });
  });

  describe('joinGameSession', () => {
    it('should join a game session successfully', async () => {
      // Arrange
      const mockJoinResponse = { 
        success: true, 
        sessionId: 'game123', 
        status: 'JOINED',
        players: ['0x123', '0x456']
      };
      gameAPI.joinGameSession = jest.fn().mockResolvedValue(mockJoinResponse);
      
      const { result } = renderHook(() => useGameActions());

      // Act
      await result.current.joinGameSession(mockCallbacks);

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingJoinGameSession(true));
      expect(gameAPI.joinGameSession).toHaveBeenCalledWith(
        mockGameSessionInfo.sessionId, 
        mockWallet.address
      );
      expect(mockCallbacks.onSuccess).toHaveBeenCalledWith(mockJoinResponse);
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingJoinGameSession(false));
    });
    
    it('should not join if user has no wallet', async () => {
      // Arrange
      (usePrivy as jest.Mock).mockReturnValue({
        user: { wallet: null },
      });
      
      // Reset mock calls count before this specific test
      mockDispatch.mockClear();
      
      const { result } = renderHook(() => useGameActions());

      // Act
      await result.current.joinGameSession(mockCallbacks);

      // Assert
      expect(gameAPI.joinGameSession).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalledWith(setLoadingJoinGameSession(true));
    });
  });

  describe('submitBoardCommitment', () => {
    it('should submit board commitment successfully', async () => {
      // Arrange
      const mockBoardCommitment = "0xcommitmenthash";
      const mockResponse = { 
        success: true, 
        player: '0x123',
        allBoardsSubmitted: false,
        gameStatus: 'BOARD_SETUP'
      };
      
      gameAPI.submitBoardCommitment = jest.fn().mockResolvedValue(mockResponse);
      
      const { result } = renderHook(() => useGameActions());

      // Act
      await result.current.submitBoardCommitment(mockBoardCommitment, mockCallbacks);

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingSubmitBoardCommitment(true));
      expect(gameAPI.submitBoardCommitment).toHaveBeenCalledWith(
        mockGameSessionInfo.sessionId,
        mockWallet.address,
        mockBoardCommitment
      );
      expect(mockCallbacks.onSuccess).toHaveBeenCalledWith(mockResponse);
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingSubmitBoardCommitment(false));
    });
  });

  describe('startGame', () => {
    it('should start game successfully', async () => {
      // Arrange
      const mockResponse = { 
        success: true, 
        status: 'IN_PROGRESS',
        currentTurn: '0x123',
        gameContractAddress: '0xgamecontract',
        gameId: 'game123'
      };
      
      gameAPI.startGame = jest.fn().mockResolvedValue(mockResponse);
      
      const { result } = renderHook(() => useGameActions());

      // Act
      await result.current.startGame(mockCallbacks);

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingStartGame(true));
      expect(gameAPI.startGame).toHaveBeenCalledWith(
        mockGameSessionInfo.sessionId,
        mockWallet.address
      );
      expect(mockCallbacks.onSuccess).toHaveBeenCalledWith(mockResponse);
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingStartGame(false));
    });
  });

  describe('forfeitGame', () => {
    it('should forfeit game successfully', async () => {
      // Arrange
      const mockReason = 'PLAYER_QUIT' as any; // Using any to avoid importing the enum
      const mockResponse = { 
        success: true, 
        status: 'FORFEITED',
        winner: '0x456'
      };
      
      gameAPI.forfeitGame = jest.fn().mockResolvedValue(mockResponse);
      
      const { result } = renderHook(() => useGameActions());

      // Act
      await result.current.forfeitGame(mockReason, mockCallbacks);

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingForfeitGame(true));
      expect(gameAPI.forfeitGame).toHaveBeenCalledWith(
        mockGameSessionInfo.sessionId,
        mockWallet.address,
        mockReason
      );
      expect(mockCallbacks.onSuccess).toHaveBeenCalledWith(mockResponse);
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingForfeitGame(false));
    });
  });

  describe('registerGameContract', () => {
    it('should register game contract successfully', async () => {
      // Arrange
      const mockGameContractAddress = '0xgamecontract';
      const mockGameId = 'game123';
      const mockResponse = { 
        success: true, 
        sessionId: 'game123',
        status: 'CONTRACT_REGISTERED',
        gameContractAddress: mockGameContractAddress,
        gameId: mockGameId
      };
      
      gameAPI.registerGameContract = jest.fn().mockResolvedValue(mockResponse);
      
      const { result } = renderHook(() => useGameActions());

      // Act
      await result.current.registerGameContract(mockGameContractAddress, mockGameId, mockCallbacks);

      // Assert
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingRegisterGameContract(true));
      expect(gameAPI.registerGameContract).toHaveBeenCalledWith(
        mockGameSessionInfo.sessionId,
        mockGameContractAddress,
        mockGameId
      );
      expect(mockCallbacks.onSuccess).toHaveBeenCalledWith(mockResponse);
      expect(mockDispatch).toHaveBeenCalledWith(setLoadingRegisterGameContract(false));
    });

    it('should not register game contract if gameSessionInfo is undefined', async () => {
      // Arrange
      (useSystemFunctions as jest.Mock).mockReturnValue({
        dispatch: mockDispatch,
        gameState: { gameSessionInfo: undefined },
      });
      
      // Reset mock calls count before this specific test
      mockDispatch.mockClear();
      
      const { result } = renderHook(() => useGameActions());

      // Act
      await result.current.registerGameContract('0xgamecontract', 'game123', mockCallbacks);

      // Assert
      expect(gameAPI.registerGameContract).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalledWith(setLoadingRegisterGameContract(true));
    });
  });
});