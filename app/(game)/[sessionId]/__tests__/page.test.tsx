import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import GameSession from "../page";
import useGameWebSocket from "@/hooks/useGameWebSocket";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import useGameActions from "@/store/game/actions";
import { useLoadingSequence } from "@/hooks/useLoadingSequence";
import { useToggleInfo } from "@/hooks/useToggleInfo";

// Mock the hooks
jest.mock("@/hooks/useGameWebSocket", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("@/hooks/usePrivyLinkedAccounts", () => jest.fn());
jest.mock("@/hooks/useSystemFunctions", () => jest.fn());
jest.mock("@/store/game/actions", () => jest.fn());
jest.mock("@/hooks/useLoadingSequence", () => ({
  useLoadingSequence: jest.fn(),
}));
jest.mock("@/hooks/useToggleInfo", () => ({
  useToggleInfo: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useParams: () => ({ sessionId: "test-session-id" }),
}));

// Mock the AudioProvider and useAudio
jest.mock("@/providers/AudioProvider", () => ({
  useAudio: () => ({
    play: jest.fn(),
    stop: jest.fn(),
    pause: jest.fn(),
    isPlaying: jest.fn().mockReturnValue(false),
    volume: 1,
    setVolume: jest.fn(),
    muted: false,
    setMuted: jest.fn(),
  }),
}));

// Mock framer-motion to prevent animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Create mock functions for component interactions
const mockOnPlaceShip = jest.fn();
const mockOnShuffle = jest.fn();
const mockOnReady = jest.fn();
const mockHandleShoot = jest.fn();

// Mock components
jest.mock("../components/LoadingOverlay", () => ({
  LoadingOverlay: ({ loading, loadingMessages }: any) => (
    <div
      data-testid="loading-overlay"
      data-loading={loading ? "true" : "false"}
    >
      {loadingMessages?.map((msg: string, i: number) => (
        <div key={i}>{msg}</div>
      ))}
    </div>
  ),
}));

jest.mock("../components/GameHeader", () => ({
  GameHeader: (props: any) => (
    <div data-testid="game-header">{JSON.stringify(props)}</div>
  ),
}));

jest.mock("../components/SetupPanel", () => ({
  SetupPanel: ({ onPlaceShip, onShuffle, onReady, ...rest }: any) => {
    // Capture the callbacks
    mockOnPlaceShip.mockImplementation(onPlaceShip);
    mockOnShuffle.mockImplementation(onShuffle);
    mockOnReady.mockImplementation(onReady);
    return <div data-testid="setup-panel">{JSON.stringify(rest)}</div>;
  },
}));

jest.mock("../components/GameBoardContainer", () => ({
  __esModule: true,
  default: ({ handleShoot, ...rest }: any) => {
    // Capture the handleShoot callback
    mockHandleShoot.mockImplementation(handleShoot);
    return <div data-testid="game-board-container">{JSON.stringify(rest)}</div>;
  },
}));

jest.mock("../components/GameFooter", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="game-footer">{JSON.stringify(props)}</div>
  ),
}));

jest.mock("../components/VictoryStatus", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="victory-status">{JSON.stringify(props)}</div>
  ),
}));

describe("GameSession Component", () => {
  // Mock implementation setup
  const mockMakeShot = jest.fn().mockImplementation((shot, callback) => {
    if (callback?.onSuccess) callback.onSuccess();
    return Promise.resolve();
  });
  const mockFetchGameSessionInformation = jest
    .fn()
    .mockImplementation(() => Promise.resolve());
  const mockSubmitBoardCommitment = jest
    .fn()
    .mockImplementation((data, callbacks) => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
      return Promise.resolve();
    });
  const mockForfeitGame = jest.fn().mockImplementation(() => Promise.resolve());
  const mockNavigatePush = jest.fn();
  const mockHandlers: Record<string, Function> = {};

  // Setup mock event registration - captures the handler functions
  const mockWsOn = {
    message: jest.fn().mockImplementation((event, handler) => {
      mockHandlers[`message:${event}`] = handler;
    }),
    session_state: jest.fn().mockImplementation((handler) => {
      mockHandlers["session_state"] = handler;
    }),
    player_joined: jest.fn().mockImplementation((handler) => {
      mockHandlers["player_joined"] = handler;
    }),
    board_submitted: jest.fn().mockImplementation((handler) => {
      mockHandlers["board_submitted"] = handler;
    }),
    game_started: jest.fn().mockImplementation((handler) => {
      mockHandlers["game_started"] = handler;
    }),
    shot_fired: jest.fn().mockImplementation((handler) => {
      mockHandlers["shot_fired"] = handler;
    }),
    turn_timeout: jest.fn().mockImplementation((handler) => {
      mockHandlers["turn_timeout"] = handler;
    }),
    game_over: jest.fn().mockImplementation((handler) => {
      mockHandlers["game_over"] = handler;
    }),
    error: jest.fn().mockImplementation((handler) => {
      mockHandlers["error"] = handler;
    }),
  };

  const mockWsOff = {
    session_state: jest.fn(),
    player_joined: jest.fn(),
    board_submitted: jest.fn(),
    game_started: jest.fn(),
    shot_fired: jest.fn(),
    game_over: jest.fn(),
    error: jest.fn(),
    turn_timeout: jest.fn(),
    message: jest.fn(),
  };

  // Player information
  const PLAYER_ADDRESS = "0x1234567890";
  const OPPONENT_ADDRESS = "0x0987654321";

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockHandlers).forEach((key) => delete mockHandlers[key]);

    // Mock WebSocket hook
    (useGameWebSocket as jest.Mock).mockReturnValue({
      isConnected: true,
      connectionError: null,
      on: mockWsOn,
      off: mockWsOff,
    });

    // Mock Privy linked accounts
    (usePrivyLinkedAccounts as jest.Mock).mockReturnValue({
      evmWallet: { address: PLAYER_ADDRESS },
    });

    // Mock system functions
    (useSystemFunctions as jest.Mock).mockReturnValue({
      gameState: {
        gameSessionInfo: {
          sessionId: "test-session-id",
          status: "CREATED",
          players: [PLAYER_ADDRESS],
          currentTurn: null,
        },
      },
      navigate: {
        push: mockNavigatePush,
      },
    });

    // Mock game actions
    (useGameActions as jest.Mock).mockReturnValue({
      makeShot: mockMakeShot,
      fetchGameSessionInformation: mockFetchGameSessionInformation,
      submitBoardCommitment: mockSubmitBoardCommitment,
      forfeitGame: mockForfeitGame,
    });

    // Mock loading sequence
    (useLoadingSequence as jest.Mock).mockReturnValue({
      messages: ["Loading..."],
      loadingDone: true,
    });

    // Mock toggle info
    (useToggleInfo as jest.Mock).mockReturnValue({
      infoShow: false,
      userDismissedInfo: false,
      setUserDismissedInfo: jest.fn(),
    });

    // Mock audio has been moved to the top level mock

    // Mock setInterval/clearInterval
    jest.useFakeTimers();

    // Mock console methods to reduce noise
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders the game session with initial setup screen", async () => {
    render(<GameSession />);

    // Verify loading overlay renders and is not active
    expect(screen.getByTestId("loading-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("loading-overlay")).toHaveAttribute(
      "data-loading",
      "false"
    );

    // Verify game components render
    expect(screen.getByTestId("game-header")).toBeInTheDocument();
    expect(screen.getByTestId("setup-panel")).toBeInTheDocument();
    expect(screen.getByTestId("game-board-container")).toBeInTheDocument();
    expect(screen.getByTestId("game-footer")).toBeInTheDocument();

    // Verify initial game session fetch
    expect(mockFetchGameSessionInformation).toHaveBeenCalledWith(
      "test-session-id"
    );

    // WebSocket event handlers should be registered
    expect(mockWsOn.session_state).toHaveBeenCalled();
    expect(mockWsOn.player_joined).toHaveBeenCalled();
    expect(mockWsOn.board_submitted).toHaveBeenCalled();
    expect(mockWsOn.game_started).toHaveBeenCalled();
    expect(mockWsOn.shot_fired).toHaveBeenCalled();
    expect(mockWsOn.turn_timeout).toHaveBeenCalled();
    expect(mockWsOn.game_over).toHaveBeenCalled();
  });

  it("handles session_state event", async () => {
    render(<GameSession />);

    // Simulate receiving session state event
    act(() => {
      mockHandlers["session_state"]({
        sessionId: "test-session-id",
        status: "WAITING",
        players: [PLAYER_ADDRESS, OPPONENT_ADDRESS],
        currentTurn: null,
      });
    });

    // Check that the component updates properly
    const gameBoardProps = JSON.parse(
      screen.getByTestId("game-board-container").textContent || "{}"
    );
    expect(gameBoardProps.mode).toBe("setup");

    const footerProps = JSON.parse(
      screen.getByTestId("game-footer").textContent || "{}"
    );
    expect(footerProps.playerAddress).toBe(PLAYER_ADDRESS);
    expect(footerProps.opponentAddress).toBe(OPPONENT_ADDRESS);
  });

  it("handles player_joined event", async () => {
    render(<GameSession />);

    // Simulate receiving player joined event
    act(() => {
      mockHandlers["player_joined"]({
        players: [PLAYER_ADDRESS, OPPONENT_ADDRESS],
        status: "WAITING",
      });
    });

    // Check that the game state is updated correctly
    const footerProps = JSON.parse(
      screen.getByTestId("game-footer").textContent || "{}"
    );
    expect(footerProps.playerAddress).toBe(PLAYER_ADDRESS);
    expect(footerProps.opponentAddress).toBe(OPPONENT_ADDRESS);
  });

  it("handles board_submitted event", async () => {
    render(<GameSession />);

    // Simulate receiving board submitted event where all boards are submitted
    act(() => {
      mockHandlers["board_submitted"]({
        player: PLAYER_ADDRESS,
        allBoardsSubmitted: true,
        gameStatus: "SETUP",
        players: [PLAYER_ADDRESS, OPPONENT_ADDRESS],
      });
    });

    // Check that the setup panel is updated
    const setupPanelProps = JSON.parse(
      screen.getByTestId("setup-panel").textContent || "{}"
    );
    expect(setupPanelProps.mode).toBe("setup");
  });

  it("handles game_started event", async () => {
    render(<GameSession />);

    // Simulate receiving game started event
    act(() => {
      mockHandlers["game_started"]({
        status: "ACTIVE",
        currentTurn: PLAYER_ADDRESS,
        turnStartedAt: Date.now(),
      });
    });

    // Check that the game header is updated with turn information
    const headerProps = JSON.parse(
      screen.getByTestId("game-header").textContent || "{}"
    );
    expect(headerProps.mode).toBe("game");
    expect(headerProps.yourTurn).toBe(true);

    // Game board should switch to game mode
    const boardProps = JSON.parse(
      screen.getByTestId("game-board-container").textContent || "{}"
    );
    expect(boardProps.mode).toBe("game");
    expect(boardProps.currentTurn.isMyTurn).toBe(true);
  });

  it("handles shot_fired event when player fires", async () => {
    render(<GameSession />);

    // First set the game to active status
    act(() => {
      mockHandlers["game_started"]({
        status: "ACTIVE",
        currentTurn: PLAYER_ADDRESS,
        turnStartedAt: Date.now(),
      });
    });

    // Simulate shot fired event from player
    act(() => {
      mockHandlers["shot_fired"]({
        player: PLAYER_ADDRESS,
        x: 3,
        y: 7,
        isHit: true,
        nextTurn: OPPONENT_ADDRESS,
        turnStartedAt: Date.now(),
        sunkShips: { [PLAYER_ADDRESS]: 0, [OPPONENT_ADDRESS]: 0 },
      });
    });

    // Check that enemy board is updated with hit
    const boardProps = JSON.parse(
      screen.getByTestId("game-board-container").textContent || "{}"
    );
    expect(boardProps.opponentBoard).toHaveProperty("3-7", "hit");

    // Turn should now be opponent's
    const headerProps = JSON.parse(
      screen.getByTestId("game-header").textContent || "{}"
    );
    expect(headerProps.yourTurn).toBe(false);
  });

  it("handles shot_fired event when opponent fires", async () => {
    render(<GameSession />);

    // First set the game to active status
    act(() => {
      mockHandlers["game_started"]({
        status: "ACTIVE",
        currentTurn: OPPONENT_ADDRESS,
        turnStartedAt: Date.now(),
      });
    });

    // Simulate shot fired event from opponent
    act(() => {
      mockHandlers["shot_fired"]({
        player: OPPONENT_ADDRESS,
        x: 5,
        y: 2,
        isHit: false,
        nextTurn: PLAYER_ADDRESS,
        turnStartedAt: Date.now(),
        sunkShips: { [PLAYER_ADDRESS]: 0, [OPPONENT_ADDRESS]: 0 },
      });
    });

    // Check that player board is updated with miss
    const boardProps = JSON.parse(
      screen.getByTestId("game-board-container").textContent || "{}"
    );
    expect(boardProps.playerBoard).toHaveProperty("5-2", "miss");

    // Turn should now be player's
    const headerProps = JSON.parse(
      screen.getByTestId("game-header").textContent || "{}"
    );
    expect(headerProps.yourTurn).toBe(true);
  });

  it("handles turn_timeout event", async () => {
    render(<GameSession />);

    // First set the game to active status
    act(() => {
      mockHandlers["game_started"]({
        status: "ACTIVE",
        currentTurn: PLAYER_ADDRESS,
        turnStartedAt: Date.now(),
      });
    });

    // Simulate turn timeout event
    act(() => {
      mockHandlers["turn_timeout"]({
        previousPlayer: PLAYER_ADDRESS,
        nextTurn: OPPONENT_ADDRESS,
        turnStartedAt: Date.now(),
        message: "Turn timed out",
      });
    });

    // Turn should now be opponent's
    const headerProps = JSON.parse(
      screen.getByTestId("game-header").textContent || "{}"
    );
    expect(headerProps.yourTurn).toBe(false);
  });

  it("handles game_over event with player winning", async () => {
    render(<GameSession />);

    // Simulate game over event where player wins
    act(() => {
      mockHandlers["game_over"]({
        status: "COMPLETED",
        winner: PLAYER_ADDRESS,
        reason: "COMPLETED",
      });
    });

    // Victory status should be displayed
    const victoryProps = JSON.parse(
      screen.getByTestId("victory-status").textContent || "{}"
    );
    expect(victoryProps.show).toBe(true);
    expect(victoryProps.status).toBe("win");
  });

  it("handles game_over event with player losing", async () => {
    render(<GameSession />);

    // Simulate game over event where opponent wins
    act(() => {
      mockHandlers["game_over"]({
        status: "COMPLETED",
        winner: OPPONENT_ADDRESS,
        reason: "COMPLETED",
      });
    });

    // Victory status should be displayed
    const victoryProps = JSON.parse(
      screen.getByTestId("victory-status").textContent || "{}"
    );
    expect(victoryProps.show).toBe(true);
    expect(victoryProps.status).toBe("loss");
  });

  it("can place ships during setup phase", async () => {
    render(<GameSession />);

    // Call the onPlaceShip function captured by our mock
    act(() => {
      mockOnPlaceShip("Carrier");
    });

    // Board props should now contain a Carrier ship
    const boardProps = JSON.parse(
      screen.getByTestId("game-board-container").textContent || "{}"
    );
    expect(
      boardProps.placedShips.some((ship: any) => ship.variant === "Carrier")
    ).toBe(true);
  });

  it("can submit board during setup phase", async () => {
    render(<GameSession />);

    // Place ships first
    act(() => {
      mockOnPlaceShip("Carrier");
      mockOnPlaceShip("Battleship");
      mockOnPlaceShip("Cruiser");
      mockOnPlaceShip("Submarine");
      mockOnPlaceShip("Destroyer");
    });

    // Submit the board
    act(() => {
      mockOnReady();
    });

    // Check that submitBoardCommitment was called with board commitment only (no sessionId)
    expect(mockSubmitBoardCommitment).toHaveBeenCalled();
    const boardCommitment = mockSubmitBoardCommitment.mock.calls[0][0];
    expect(boardCommitment.address).toBe(PLAYER_ADDRESS);
    expect(boardCommitment.ships.length).toBe(5);
  });

  it("can fire a shot during game phase", async () => {
    render(<GameSession />);

    // Set game to active state
    act(() => {
      mockHandlers["game_started"]({
        status: "ACTIVE",
        currentTurn: PLAYER_ADDRESS,
        turnStartedAt: Date.now(),
      });
    });

    // Fire a shot
    act(() => {
      mockHandleShoot(3, 7);
    });

    // Check that makeShot was called with the correct parameters
    expect(mockMakeShot).toHaveBeenCalledWith({
      x: 3,
      y: 7,
      address: PLAYER_ADDRESS,
    });
  });

  it("prevents firing a shot when it's not player's turn", async () => {
    render(<GameSession />);

    // Set game to active state with opponent's turn
    act(() => {
      mockHandlers["game_started"]({
        status: "ACTIVE",
        currentTurn: OPPONENT_ADDRESS,
        turnStartedAt: Date.now(),
      });
    });

    // Try to fire a shot
    act(() => {
      mockHandleShoot(3, 7);
    });

    // Check that makeShot was not called
    expect(mockMakeShot).not.toHaveBeenCalled();
  });
});
