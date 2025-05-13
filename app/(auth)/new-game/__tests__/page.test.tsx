import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import useInviteActions from "@/store/invite/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import usePrivyLinkedAccounts from "@/hooks/usePrivyLinkedAccounts";
import useCopy from "@/hooks/useCopy";
import useAppActions from "@/store/app/actions";
import { useAudio } from "@/providers/AudioProvider";
import NewGame from "../page";

// Mock the hooks
jest.mock("react-hook-form", () => ({
  useForm: jest.fn(),
}));

jest.mock("@/store/invite/actions", () => jest.fn());
jest.mock("@/hooks/useSystemFunctions", () => jest.fn());
jest.mock("@/hooks/usePrivyLinkedAccounts", () => jest.fn());
jest.mock("@/hooks/useCopy", () => jest.fn());
jest.mock("@/store/app/actions", () => jest.fn());
jest.mock("@/providers/AudioProvider", () => ({
  useAudio: jest.fn(),
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

// Mock all components used in the NewGame page
jest.mock("@/components", () => ({
  KPButton: ({
    title,
    onClick,
    disabled,
    isMachine,
    fullWidth,
    ...props
  }: any) => (
    <button
      data-testid={`kp-button-${title}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {title}
    </button>
  ),
  KPDialougue: ({
    title,
    children,
    primaryCta,
    showCloseButton,
    showBackButton,
    onBack,
    className,
  }: any) => (
    <div data-testid="kp-dialogue">
      <h2>{title}</h2>
      {children}
      {showBackButton && (
        <button onClick={onBack} data-testid="back-button">
          Back
        </button>
      )}
      {primaryCta && (
        <button
          onClick={primaryCta.onClick}
          data-testid={`primary-cta-${primaryCta.title}`}
          disabled={primaryCta.disabled}
        >
          {primaryCta.title}
          {primaryCta.loading && <span data-testid="loading-indicator">...</span>}
        </button>
      )}
    </div>
  ),
  KPGameTypeCard: ({
    id,
    name,
    description,
    status,
    className,
    action,
    ...props
  }: any) => (
    <div
      data-testid={`game-type-${id}`}
      className={className}
      onClick={action}
      {...props}
    >
      <h3>{name}</h3>
      <p>{description}</p>
      {status && <span data-testid="status-badge">{status}</span>}
    </div>
  ),
  KPInput: ({
    name,
    placeholder,
    register,
    error,
    className,
    type,
    ...props
  }: any) => (
    <input
      data-testid={`input-${name}`}
      placeholder={placeholder}
      {...register}
      {...props}
    />
  ),
  KPProfileBadge: ({ avatarUrl, username, ...props }: any) => (
    <div data-testid="profile-badge" {...props}>
      {username}
    </div>
  ),
}));

describe("NewGame Page", () => {
  // Mock implementation setup
  const mockCreateInvite = jest.fn();
  const mockAcceptInvite = jest.fn();
  const mockNavigatePush = jest.fn();
  const mockHandleCopy = jest.fn();
  const mockShowToast = jest.fn();
  const mockRegister = jest.fn();
  const mockHandleSubmit = jest.fn();
  const mockWatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock form functionality
    mockWatch.mockReturnValue("ABCD1234");
    mockHandleSubmit.mockImplementation((callback) => () => callback());
    
    (useForm as jest.Mock).mockReturnValue({
      register: mockRegister,
      handleSubmit: mockHandleSubmit,
      formState: { errors: {} },
      watch: mockWatch,
    });

    // Mock invite actions
    (useInviteActions as jest.Mock).mockReturnValue({
      acceptInvite: mockAcceptInvite,
      createInvite: mockCreateInvite,
    });

    // Mock system functions
    (useSystemFunctions as jest.Mock).mockReturnValue({
      inviteState: {
        loadingInviteAcceptance: false,
        loadingInviteCreation: false,
        inviteCreation: {
          code: "ABCD1234",
          sessionId: "session-123",
          expiresAt: Date.now() + 3600000, // 1 hour from now
        },
      },
      navigate: {
        push: mockNavigatePush,
      },
    });

    // Mock Privy linked accounts
    (usePrivyLinkedAccounts as jest.Mock).mockReturnValue({
      linkedFarcaster: { username: "farcaster_user", pfp: "/images/farcaster.png" },
      linkedTwitter: null,
    });

    // Mock copy hook
    (useCopy as jest.Mock).mockReturnValue({
      handleCopy: mockHandleCopy,
    });

    // Mock app actions
    (useAppActions as jest.Mock).mockReturnValue({
      showToast: mockShowToast,
    });

    // Mock audio context
    (useAudio as jest.Mock).mockReturnValue({
      playSoundEffect: jest.fn(),
    });

    // Mock window.navigator.share
    global.navigator.share = jest.fn().mockResolvedValue(undefined);
  });

  it("renders the initial join game screen", () => {
    render(<NewGame />);

    expect(screen.getByText("welcome")).toBeInTheDocument();
    expect(screen.getByText("choose new game:")).toBeInTheDocument();
    expect(screen.getByText("Join match:")).toBeInTheDocument();
    expect(screen.getByTestId("game-type-fm")).toBeInTheDocument();
    expect(screen.getByTestId("game-type-qm")).toBeInTheDocument();
    expect(screen.getByTestId("input-code")).toBeInTheDocument();
    expect(screen.getByTestId("primary-cta-Next")).toBeInTheDocument();
  });

  it("displays the profile badge with correct username", () => {
    render(<NewGame />);
    expect(screen.getByTestId("profile-badge")).toHaveTextContent("farcaster_user");
  });

  it("transitions to create game screen when friend's match is selected", async () => {
    render(<NewGame />);
    
    // Click on Friend's Match game type
    const friendsMatch = screen.getByTestId("game-type-fm");
    fireEvent.click(friendsMatch);
    
    await waitFor(() => {
      expect(screen.getByText("add opponent")).toBeInTheDocument();
      expect(screen.getByText("ABCD1234")).toBeInTheDocument();
    });
  });

  it("doesn't transition when clicking on a 'coming soon' game type", () => {
    render(<NewGame />);
    
    // Click on Quick Match game type (which has 'coming soon' status)
    const quickMatch = screen.getByTestId("game-type-qm");
    fireEvent.click(quickMatch);
    
    // Should still be on the welcome screen
    expect(screen.getByText("welcome")).toBeInTheDocument();
    expect(screen.queryByText("add opponent")).not.toBeInTheDocument();
  });

  it("attempts to accept an invite when code is submitted", () => {
    render(<NewGame />);
    
    // Click the Next button to submit the form
    const nextButton = screen.getByTestId("primary-cta-Next");
    fireEvent.click(nextButton);
    
    expect(mockAcceptInvite).toHaveBeenCalledWith("ABCD1234");
  });

  it("creates a new invite when needed", async () => {
    // Mock expired or missing invite
    (useSystemFunctions as jest.Mock).mockReturnValue({
      inviteState: {
        loadingInviteAcceptance: false,
        loadingInviteCreation: false,
        inviteCreation: null,
      },
      navigate: {
        push: mockNavigatePush,
      },
    });

    render(<NewGame />);
    
    // Click on Friend's Match game type
    const friendsMatch = screen.getByTestId("game-type-fm");
    fireEvent.click(friendsMatch);
    
    expect(mockCreateInvite).toHaveBeenCalled();
  });

  it("navigates to the game session when Next is clicked on the create game screen", async () => {
    render(<NewGame />);
    
    // First go to create game screen
    const friendsMatch = screen.getByTestId("game-type-fm");
    fireEvent.click(friendsMatch);
    
    await waitFor(() => {
      expect(screen.getByText("add opponent")).toBeInTheDocument();
    });
    
    // Click the Next button
    const nextButton = screen.getByTestId("primary-cta-Next");
    fireEvent.click(nextButton);
    
    expect(mockNavigatePush).toHaveBeenCalledWith("/session-123");
  });

  it("allows copying the invite code", async () => {
    render(<NewGame />);
    
    // Go to create game screen
    const friendsMatch = screen.getByTestId("game-type-fm");
    fireEvent.click(friendsMatch);
    
    await waitFor(() => {
      expect(screen.getByText("add opponent")).toBeInTheDocument();
    });
    
    // Click the copy code button
    const copyButton = screen.getByTestId("kp-button-copy code instead");
    fireEvent.click(copyButton);
    
    expect(mockHandleCopy).toHaveBeenCalledWith("ABCD1234");
  });

  it("allows sharing the invite link when available", async () => {
    render(<NewGame />);
    
    // Go to create game screen
    const friendsMatch = screen.getByTestId("game-type-fm");
    fireEvent.click(friendsMatch);
    
    await waitFor(() => {
      expect(screen.getByText("add opponent")).toBeInTheDocument();
    });
    
    // Click the share invite button
    const shareButton = screen.getByTestId("kp-button-send invite");
    fireEvent.click(shareButton);
    
    expect(navigator.share).toHaveBeenCalledWith({
      title: "Join My Game!",
      text: "I'd like to invite you to play with me! Click the link to join.",
      url: expect.stringContaining("ABCD1234"),
    });
  });

  it("shows an error toast when share is cancelled", async () => {
    // Mock share failure
    global.navigator.share = jest.fn().mockRejectedValue(new Error("User cancelled"));
    
    render(<NewGame />);
    
    // Go to create game screen
    const friendsMatch = screen.getByTestId("game-type-fm");
    fireEvent.click(friendsMatch);
    
    await waitFor(() => {
      expect(screen.getByText("add opponent")).toBeInTheDocument();
    });
    
    // Click the share invite button
    const shareButton = screen.getByTestId("kp-button-send invite");
    fireEvent.click(shareButton);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Share Cancelled", "error");
    });
  });

  it("can navigate back from create game to join game screen", async () => {
    render(<NewGame />);
    
    // Go to create game screen
    const friendsMatch = screen.getByTestId("game-type-fm");
    fireEvent.click(friendsMatch);
    
    await waitFor(() => {
      expect(screen.getByText("add opponent")).toBeInTheDocument();
    });
    
    // Click the back button
    const backButton = screen.getByTestId("back-button");
    fireEvent.click(backButton);
    
    // Should be back on join game screen
    expect(screen.getByText("welcome")).toBeInTheDocument();
  });
});