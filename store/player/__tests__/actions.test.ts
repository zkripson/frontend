import { renderHook } from '@testing-library/react-hooks';
import { usePlayerActions } from '../actions';
import { playerApi } from '../api';
import * as playerActions from '../index';

// Mock dependencies
jest.mock('../api');
jest.mock('../../hooks/useSystemFunctions', () => ({
  useSystemFunctions: () => ({
    handleError: jest.fn(),
  }),
}));
jest.mock('../../hooks/usePrivyLinkedAccounts', () => ({
  usePrivyLinkedAccounts: () => ({
    address: '0x1234567890abcdef1234567890abcdef12345678',
  }),
}));
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));

describe('usePlayerActions', () => {
  const mockDispatch = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const mockCallbacks = { onSuccess: mockOnSuccess, onError: mockOnError };
  
  // Create spies on the Redux action creators
  const setCreateProfileLoadingSpy = jest.spyOn(playerActions, 'setCreateProfileLoading');
  const setGetProfileLoadingSpy = jest.spyOn(playerActions, 'setGetProfileLoading');
  const setUpdateProfileLoadingSpy = jest.spyOn(playerActions, 'setUpdateProfileLoading');
  const setGetOngoingSessionsLoadingSpy = jest.spyOn(playerActions, 'setGetOngoingSessionsLoading');
  const setGetPlayerRewardsLoadingSpy = jest.spyOn(playerActions, 'setGetPlayerRewardsLoading');
  const setGetPlayerPointsLoadingSpy = jest.spyOn(playerActions, 'setGetPlayerPointsLoading');
  const setGetLeaderboardLoadingSpy = jest.spyOn(playerActions, 'setGetLeaderboardLoading');
  const setGetWeeklyLeaderboardLoadingSpy = jest.spyOn(playerActions, 'setGetWeeklyLeaderboardLoading');
  const setGetPointsDistributionLoadingSpy = jest.spyOn(playerActions, 'setGetPointsDistributionLoading');
  const setGetPointsStatsLoadingSpy = jest.spyOn(playerActions, 'setGetPointsStatsLoading');
  
  const setPlayerProfileSpy = jest.spyOn(playerActions, 'setPlayerProfile');
  const setOngoingSessionsSpy = jest.spyOn(playerActions, 'setOngoingSessions');
  const setPlayerRewardsSpy = jest.spyOn(playerActions, 'setPlayerRewards');
  const setPlayerPointsSpy = jest.spyOn(playerActions, 'setPlayerPoints');
  const setLeaderboardSpy = jest.spyOn(playerActions, 'setLeaderboard');
  const setWeeklyLeaderboardSpy = jest.spyOn(playerActions, 'setWeeklyLeaderboard');
  const setPointsDistributionSpy = jest.spyOn(playerActions, 'setPointsDistribution');
  const setPointsStatsSpy = jest.spyOn(playerActions, 'setPointsStats');

  beforeEach(() => {
    jest.clearAllMocks();
    (require('react-redux') as any).useDispatch = () => mockDispatch;
  });

  // Test cases for createProfile
  describe('createProfile', () => {
    it('should call the correct actions when createProfile succeeds', async () => {
      // Mock API response
      const mockProfile = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        username: 'SailorMoon',
        avatar: 'https://example.com/avatar.png',
        createdAt: 1234567890000,
        totalGames: 0,
        wins: 0,
        losses: 0,
        preferences: {
          theme: 'dark',
          notifications: true,
          soundEnabled: false,
          animationsEnabled: true,
          autoSubmitOnHit: false
        }
      };
      
      const mockResponse = {
        success: true,
        message: 'Profile created successfully',
        profile: mockProfile
      };
      
      (playerApi.createProfile as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Render the hook
      const { result } = renderHook(() => usePlayerActions());
      
      // Create test data
      const createProfileData = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        username: 'SailorMoon',
        avatar: 'https://example.com/avatar.png',
        preferences: {
          theme: 'dark',
          notifications: true,
          soundEnabled: false,
          animationsEnabled: true,
          autoSubmitOnHit: false
        }
      };

      // Call the function
      await result.current.createProfile(createProfileData, mockCallbacks);

      // Assertions
      expect(setCreateProfileLoadingSpy).toHaveBeenCalledWith(true);
      expect(playerApi.createProfile).toHaveBeenCalledWith(createProfileData);
      expect(setPlayerProfileSpy).toHaveBeenCalledWith(mockProfile);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse);
      expect(setCreateProfileLoadingSpy).toHaveBeenCalledWith(false);
    });

    it('should handle errors when createProfile fails', async () => {
      // Mock API error
      const mockError = new Error('Profile creation failed');
      (playerApi.createProfile as jest.Mock).mockRejectedValueOnce(mockError);

      // Render the hook
      const { result } = renderHook(() => usePlayerActions());
      
      // Create test data
      const createProfileData = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        username: 'SailorMoon',
        avatar: 'https://example.com/avatar.png',
        preferences: {
          theme: 'dark',
          notifications: true,
          soundEnabled: false,
          animationsEnabled: true,
          autoSubmitOnHit: false
        }
      };

      // Call the function and catch the error
      try {
        await result.current.createProfile(createProfileData, mockCallbacks);
        fail('The function should have thrown an error');
      } catch (error) {
        // Assertions
        expect(setCreateProfileLoadingSpy).toHaveBeenCalledWith(true);
        expect(playerApi.createProfile).toHaveBeenCalledWith(createProfileData);
        expect(mockOnError).toHaveBeenCalledWith(mockError);
        expect(setCreateProfileLoadingSpy).toHaveBeenCalledWith(false);
      }
    });
  });

  // Test cases for getProfile
  describe('getProfile', () => {
    it('should call the correct actions when getProfile succeeds', async () => {
      // Mock API response
      const mockProfile = {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        username: 'SailorMoon',
        avatar: 'https://example.com/avatar.png',
        createdAt: 1234567890000,
        totalGames: 42,
        wins: 25,
        losses: 17,
        preferences: {
          theme: 'dark',
          notifications: true,
          soundEnabled: true
        }
      };
      
      (playerApi.getProfile as jest.Mock).mockResolvedValueOnce(mockProfile);

      // Render the hook
      const { result } = renderHook(() => usePlayerActions());
      
      // Call the function
      await result.current.getProfile('0x1234567890abcdef1234567890abcdef12345678', mockCallbacks);

      // Assertions
      expect(setGetProfileLoadingSpy).toHaveBeenCalledWith(true);
      expect(playerApi.getProfile).toHaveBeenCalledWith('0x1234567890abcdef1234567890abcdef12345678');
      expect(setPlayerProfileSpy).toHaveBeenCalledWith(mockProfile);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockProfile);
      expect(setGetProfileLoadingSpy).toHaveBeenCalledWith(false);
    });
  });

  // Test cases for getPlayerRewards
  describe('getPlayerRewards', () => {
    it('should call the correct actions when getPlayerRewards succeeds', async () => {
      // Mock API response
      const mockRewards = {
        player: '0x1234567890abcdef1234567890abcdef12345678',
        totalPoints: '5420',
        weeklyPoints: '850',
        claimablePoints: '150',
        referralPoints: {
          earned: '250',
          pending: '0'
        },
        streak: {
          currentDays: 7,
          type: 'daily',
          lastClaimDate: '2025-01-20',
          nextClaimDate: '2025-01-21'
        },
        claimHistory: [
          {
            date: '2025-01-19',
            amount: '100',
            transactionHash: '0xabc123...',
            week: 3
          }
        ],
        claimStatus: {
          canClaim: true,
          nextClaimDate: '2025-01-21',
          reason: null
        }
      };
      
      (playerApi.getPlayerRewards as jest.Mock).mockResolvedValueOnce(mockRewards);

      // Render the hook
      const { result } = renderHook(() => usePlayerActions());
      
      // Call the function
      await result.current.getPlayerRewards('0x1234567890abcdef1234567890abcdef12345678', mockCallbacks);

      // Assertions
      expect(setGetPlayerRewardsLoadingSpy).toHaveBeenCalledWith(true);
      expect(playerApi.getPlayerRewards).toHaveBeenCalledWith('0x1234567890abcdef1234567890abcdef12345678');
      expect(setPlayerRewardsSpy).toHaveBeenCalledWith(mockRewards);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockRewards);
      expect(setGetPlayerRewardsLoadingSpy).toHaveBeenCalledWith(false);
    });
  });

  // Add additional test cases for other actions as needed
});