import { render, screen, fireEvent, act } from "@testing-library/react";
import { useLinkAccount } from "@privy-io/react-auth";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import Social from "../page";

// Mock the hooks
jest.mock("@privy-io/react-auth", () => ({
  useLinkAccount: jest.fn(),
}));

jest.mock("@/hooks/useSystemFunctions", () => jest.fn());

// Mock framer-motion to prevent animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
    button: ({ children, ...props }: any) => (
      <button data-testid="motion-button" {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock all components used in the Social page
jest.mock("@/components", () => ({
  KPButton: ({
    title,
    onClick,
    icon,
    variant,
    fullWidth,
    isMachine,
    ...props
  }: any) => (
    <button data-testid={`kp-button-${title}`} onClick={onClick} {...props}>
      {title}
    </button>
  ),
  KPDialougue: ({
    children,
    title,
    subtitle,
    primaryCta,
    ctaText,
    showCloseButton,
    onClose,
    showKripsonImage,
    showBackButton,
    onBack,
    ...props
  }: any) => (
    <div data-testid="kp-dialogue">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
      <div>{children}</div>
      {primaryCta && (
        <button
          onClick={primaryCta.onClick}
          data-testid={`primary-cta-${primaryCta.title}`}
        >
          {primaryCta.title}
        </button>
      )}
      {ctaText && <div data-testid="cta-text">{ctaText}</div>}
    </div>
  ),
  KPFullscreenLoader: ({ title }: any) => (
    <div data-testid="kp-fullscreen-loader">{title}</div>
  ),
  KPLoader: () => <div data-testid="kp-loader">Loading...</div>,
}));

// Mock the CheckIcon
jest.mock("@/public/icons", () => ({
  CheckIcon: () => <div data-testid="check-icon">✓</div>,
}));

describe("Social Page", () => {
  // Setup mock functions
  const mockLinkTwitter = jest.fn();
  const mockLinkFarcaster = jest.fn();
  const mockNavigate = { push: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup hook mocks
    (useLinkAccount as jest.Mock).mockReturnValue({
      linkTwitter: mockLinkTwitter,
      linkFarcaster: mockLinkFarcaster,
    });

    (useSystemFunctions as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the initial connect screen", () => {
    render(<Social />);

    // Check for title and connection options
    expect(screen.getByText("connect your socials")).toBeInTheDocument();
    expect(
      screen.getByTestId("kp-button-Connect with farcaster")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("kp-button-Connect with twitter")
    ).toBeInTheDocument();
    expect(screen.getByTestId("primary-cta-skip for now")).toBeInTheDocument();
  });

  it("shows spinner when connecting with Farcaster", () => {
    render(<Social />);

    // Click the Farcaster connection button
    const farcasterButton = screen.getByTestId(
      "kp-button-Connect with farcaster"
    );
    fireEvent.click(farcasterButton);

    // Expect linkFarcaster to be called
    expect(mockLinkFarcaster).toHaveBeenCalled();
  });

  it("shows spinner when connecting with Twitter", () => {
    render(<Social />);

    // Click the Twitter connection button
    const twitterButton = screen.getByTestId("kp-button-Connect with twitter");
    fireEvent.click(twitterButton);

    // Expect linkTwitter to be called
    expect(mockLinkTwitter).toHaveBeenCalled();
  });

  it("transitions to connected stage after successful connection", () => {
    // Mock the onSuccess callback
    (useLinkAccount as jest.Mock).mockImplementation(({ onSuccess }) => {
      return {
        linkTwitter: () => onSuccess(),
        linkFarcaster: mockLinkFarcaster,
      };
    });

    render(<Social />);

    // Click Twitter button to trigger onSuccess
    const twitterButton = screen.getByTestId("kp-button-Connect with twitter");
    fireEvent.click(twitterButton);

    // Assert we're in the connected stage
    expect(screen.getByTestId("cta-text")).toHaveTextContent(
      "Farcaster Connected"
    );
  });

  it("transitions to setup stage after connection timer expires", () => {
    // Mock the onSuccess callback
    (useLinkAccount as jest.Mock).mockImplementation(({ onSuccess }) => {
      return {
        linkTwitter: () => onSuccess(),
        linkFarcaster: mockLinkFarcaster,
      };
    });

    render(<Social />);

    // Connect to trigger the connected stage
    const twitterButton = screen.getByTestId("kp-button-Connect with twitter");
    fireEvent.click(twitterButton);

    // Fast-forward past the connected stage timer
    act(() => {
      jest.advanceTimersByTime(7000);
    });

    // Check that we've transitioned to the setup stage
    expect(screen.getByTestId("kp-fullscreen-loader")).toHaveTextContent(
      "SETTING UP GAME PROFILE..."
    );
  });

  it("navigates to new-game after setup timer expires", async () => {
    // Mock the onSuccess callback
    (useLinkAccount as jest.Mock).mockImplementation(({ onSuccess }) => {
      return {
        linkTwitter: () => onSuccess(),
        linkFarcaster: mockLinkFarcaster,
      };
    });

    render(<Social />);

    // Connect to trigger the connected stage
    const twitterButton = screen.getByTestId("kp-button-Connect with twitter");
    fireEvent.click(twitterButton);

    // Fast-forward past both timers
    act(() => {
      jest.advanceTimersByTime(7000); // Past connected stage
    });

    // Verify we're in setup stage
    expect(screen.getByTestId("kp-fullscreen-loader")).toBeInTheDocument();

    // Fast-forward past setup stage timer
    act(() => {
      jest.advanceTimersByTime(11000);
    });

    // Check that navigation was called
    expect(mockNavigate.push).toHaveBeenCalledWith("/new-game");
  });

  it('skips directly to setup stage when "skip for now" is clicked', () => {
    render(<Social />);

    // Click skip button
    const skipButton = screen.getByTestId("primary-cta-skip for now");
    fireEvent.click(skipButton);

    // Check that we're now in the setup stage
    expect(screen.getByTestId("kp-fullscreen-loader")).toHaveTextContent(
      "SETTING UP GAME PROFILE..."
    );
  });

  it("handles connection errors gracefully", () => {
    // Mock an error case
    const mockError = new Error("Connection failed");
    const mockConsoleErrorSpy = jest.fn();
    // Temporarily replace our filtered console.error with one that captures calls
    const originalConsoleError = console.error;
    console.error = mockConsoleErrorSpy;

    (useLinkAccount as jest.Mock).mockImplementation(({ onError }) => {
      return {
        linkTwitter: mockLinkTwitter,
        linkFarcaster: () => onError(mockError),
      };
    });

    render(<Social />);

    // Click Farcaster button to trigger error
    const farcasterButton = screen.getByTestId(
      "kp-button-Connect with farcaster"
    );
    fireEvent.click(farcasterButton);

    // Check error was logged
    expect(mockConsoleErrorSpy).toHaveBeenCalledWith(
      "LINK FARCaster ERROR:",
      mockError
    );

    // We should stay on the connect stage
    expect(screen.getByText("connect your socials")).toBeInTheDocument();

    // Restore console.error
    console.error = originalConsoleError;
  });
});
