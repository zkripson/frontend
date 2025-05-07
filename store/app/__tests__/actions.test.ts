import { renderHook } from '@testing-library/react';
import useAppActions from '../actions';
import { setAppIsReady, setIsInGame } from '..';
import useSystemFunctions from '@/hooks/useSystemFunctions';

// Mock the useSystemFunctions hook
jest.mock('@/hooks/useSystemFunctions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useAppActions', () => {
  const mockDispatch = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useSystemFunctions as jest.Mock).mockReturnValue({
      dispatch: mockDispatch,
    });
  });

  it('should call dispatch with setAppIsReady action when setAppReady is called', () => {
    // Arrange
    const { result } = renderHook(() => useAppActions());
    const isReady = true;

    // Act
    result.current.setAppReady(isReady);

    // Assert
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(setAppIsReady(isReady));
  });

  it('should call dispatch with setIsInGame action when setInGame is called', () => {
    // Arrange
    const { result } = renderHook(() => useAppActions());
    const isInGame = true;

    // Act
    result.current.setInGame(isInGame);

    // Assert
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(setIsInGame(isInGame));
  });

  it('should handle setting app not ready', () => {
    // Arrange
    const { result } = renderHook(() => useAppActions());
    const isReady = false;

    // Act
    result.current.setAppReady(isReady);

    // Assert
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(setAppIsReady(isReady));
  });

  it('should handle setting not in game', () => {
    // Arrange
    const { result } = renderHook(() => useAppActions());
    const isInGame = false;

    // Act
    result.current.setInGame(isInGame);

    // Assert
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(setIsInGame(isInGame));
  });
});