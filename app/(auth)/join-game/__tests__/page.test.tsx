import { render, screen, act, waitFor } from "@testing-library/react";
import { usePrivy } from "@privy-io/react-auth";
import { useSearchParams } from "next/navigation";
import useInviteActions from "@/store/invite/actions";
import useSystemFunctions from "@/hooks/useSystemFunctions";
import JoinGame from "../page";

// Mock hooks
jest.mock("@privy-io/react-auth", () => ({
  usePrivy: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

jest.mock("@/store/invite/actions", () => jest.fn());

jest.mock("@/hooks/useSystemFunctions", () => jest.fn());

// Mock the components used in JoinGame
jest.mock("@/components", () => ({
  KPDialougue: ({
    title,
    children,
    primaryCta,
    showCloseButton,
    className,
  }: any) => (
    <div data-testid="kp-dialogue">
      <h2>{title}</h2>
      {children}
      {primaryCta && (
        <button
          data-testid={`primary-cta-${primaryCta.title}`}
          onClick={primaryCta.onClick}
          disabled={primaryCta.disabled}
        >
          {primaryCta.title}
          {primaryCta.loading && <span data-testid="loading-indicator">...</span>}
        </button>
      )}
    </div>
  ),
}));

describe("JoinGame Page", () => {
  // Mock implementation setup
  const mockAcceptInvite = jest.fn();
  const mockGet = jest.fn();
  const mockNavigatePush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup search params mock
    mockGet.mockReturnValue("ABCD1234");
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
    });

    // Setup usePrivy mock
    (usePrivy as jest.Mock).mockReturnValue({
      user: { id: "user-123" },
      ready: true,
    });

    // Setup invite actions mock
    (useInviteActions as jest.Mock).mockReturnValue({
      acceptInvite: mockAcceptInvite,
    });

    // Setup system functions mock
    (useSystemFunctions as jest.Mock).mockReturnValue({
      inviteState: {
        loadingInviteAcceptance: false,
      },
      navigate: {
        push: mockNavigatePush,
      },
    });
  });

  it("doesn't render content when not ready", () => {
    // Set ready to false
    (usePrivy as jest.Mock).mockReturnValue({
      user: null,
      ready: false,
    });

    render(<JoinGame />);
    // The component just returns undefined when not ready, so we should not see any content
    expect(screen.queryByTestId("kp-dialogue")).not.toBeInTheDocument();
  });

  it("redirects to login when not logged in but has code", () => {
    // Set user to null to simulate not logged in
    (usePrivy as jest.Mock).mockReturnValue({
      user: null,
      ready: true,
    });

    render(<JoinGame />);
    
    // Should redirect to login
    expect(mockNavigatePush).toHaveBeenCalledWith("/login");
    expect(global.sessionStorage.getItem("redirectToJoin")).toBe("ABCD1234");
  });

  it("attempts to join a game with the code from URL when logged in", async () => {
    render(<JoinGame />);

    // Should attempt to join the game
    await waitFor(() => {
      expect(mockAcceptInvite).toHaveBeenCalledWith("ABCD1234");
    });
  });

  it("displays error message when join fails", async () => {
    // Mock the acceptInvite to throw an error
    mockAcceptInvite.mockRejectedValueOnce(new Error("Failed to join"));

    render(<JoinGame />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText("Failed to join the game. Please try again later.")).toBeInTheDocument();
    });
  });

  it("shows loading state during invitation acceptance", () => {
    // Mock loading state
    (useSystemFunctions as jest.Mock).mockReturnValue({
      inviteState: {
        loadingInviteAcceptance: true,
      },
      navigate: {
        push: mockNavigatePush,
      },
    });

    render(<JoinGame />);
    
    expect(screen.getByTestId("primary-cta-Joining...")).toBeInTheDocument();
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  it("displays the invite code when available", () => {
    render(<JoinGame />);
    
    expect(screen.getByText("ABCD1234")).toBeInTheDocument();
  });
});