// Mock for useGameWebSocket hook

const mockEventHandlers: { [key: string]: (() => void)[] } = {};

export const useGameWebSocket = jest.fn(() => ({
  isConnected: true,
  connectionError: null,
  on: {
    session_state: jest.fn(),
    player_joined: jest.fn(),
    board_submitted: jest.fn(),
    game_started: jest.fn(),
    shot_fired: jest.fn(),
    shot_result: jest.fn(),
    turn_timeout: jest.fn(),
    game_end_completed: jest.fn(),
    game_end_processing: jest.fn(),
    draw_rematch: jest.fn(),
    rematch_ready: jest.fn(),
    points_awarded: jest.fn(),
    points_summary: jest.fn(),
    error: jest.fn(),
    pong: jest.fn(),
    message: jest.fn(),
  },
  off: {
    session_state: jest.fn(),
    player_joined: jest.fn(),
    board_submitted: jest.fn(),
    game_started: jest.fn(),
    shot_fired: jest.fn(),
    shot_result: jest.fn(),
    turn_timeout: jest.fn(),
    game_end_completed: jest.fn(),
    game_end_processing: jest.fn(),
    draw_rematch: jest.fn(),
    rematch_ready: jest.fn(),
    points_awarded: jest.fn(),
    points_summary: jest.fn(),
    error: jest.fn(),
    pong: jest.fn(),
    message: jest.fn(),
  },
  send: jest.fn(),
  reconnect: jest.fn(),
}));

export default useGameWebSocket;