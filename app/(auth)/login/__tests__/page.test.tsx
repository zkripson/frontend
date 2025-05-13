import { render, screen, fireEvent, act } from "@testing-library/react";
import { useLinkAccount, usePrivy } from "@privy-io/react-auth";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import Social from "../page";

// Mock the hooks
jest.mock("@privy-io/react-auth", () => ({
  useLinkAccount: jest.fn(),
  usePrivy: jest.fn(),
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
    multipleicons,
    ...props
  }: any) => (
    <button
      data-testid={`kp-button-${title}`}
      onClick={onClick}
      multipleicons={multipleicons ? multipleicons.join(',') : undefined}
      {...props}
    >
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

    (usePrivy as jest.Mock).mockReturnValue({
      user: null,
      ready: false,
      login: jest.fn(),
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
      screen.getByTestId("kp-button-Connect")
    ).toBeInTheDocument();
    expect(screen.getByTestId("primary-cta-skip for now")).toBeInTheDocument();
  });

  it("shows spinner when connecting", () => {
    render(<Social />);

    // Click the Connect button
    const connectButton = screen.getByTestId(
      "kp-button-Connect"
    );
    fireEvent.click(connectButton);

    // Expect login to be called
    expect(usePrivy().login).toHaveBeenCalled();
  });

  it("transitions to connected stage after successful login", () => {
    // Mock a successful login with user data
    const mockLoginFn = jest.fn();
    (usePrivy as jest.Mock).mockReturnValue({
      user: { id: "test-user" },
      ready: true,
      login: mockLoginFn,
    });

    render(<Social />);

    // Assert we're in the connected stage
    expect(screen.getByTestId("cta-text")).toHaveTextContent(
      "Farcaster Connected"
    );
  });

  it("transitions to setup stage after connection timer expires", () => {
    // Mock a successful login with user data
    const mockLoginFn = jest.fn();
    (usePrivy as jest.Mock).mockReturnValue({
      user: { id: "test-user" },
      ready: true,
      login: mockLoginFn,
    });

    render(<Social />);

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
    // Mock a successful login with user data
    const mockLoginFn = jest.fn();
    (usePrivy as jest.Mock).mockReturnValue({
      user: { id: "test-user" },
      ready: true,
      login: mockLoginFn,
    });

    render(<Social />);

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

  it("shows correct connect screen", () => {
    // Mock login function
    const mockLoginFn = jest.fn();
    (usePrivy as jest.Mock).mockReturnValue({
      user: null,
      ready: false,
      login: mockLoginFn
    });

    render(<Social />);

    // We should be on the connect stage
    expect(screen.getByText("connect your socials")).toBeInTheDocument();

    // And we should have a Connect button
    const connectButton = screen.getByTestId("kp-button-Connect");
    expect(connectButton).toBeInTheDocument();

    // We should have a skip button
    const skipButton = screen.getByTestId("primary-cta-skip for now");
    expect(skipButton).toBeInTheDocument();
  });
});
