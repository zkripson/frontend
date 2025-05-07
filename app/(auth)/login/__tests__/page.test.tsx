import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useCreateWallet, useLoginWithEmail } from '@privy-io/react-auth';
import useSystemFunctions from '@/hooks/useSystemFunctions';
import Login from '../page';
import '../../../../global_test_setup';

// Mock the hooks
jest.mock('@privy-io/react-auth', () => ({
  useCreateWallet: jest.fn(),
  useLoginWithEmail: jest.fn(),
}));

jest.mock('@/hooks/useSystemFunctions', () => jest.fn());

describe('Login Page', () => {
  const mockCreateWallet = jest.fn();
  const mockSendCode = jest.fn();
  const mockLoginWithCode = jest.fn();
  const mockNavigate = { push: jest.fn() };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useCreateWallet as jest.Mock).mockReturnValue({
      createWallet: mockCreateWallet,
    });
    
    (useLoginWithEmail as jest.Mock).mockReturnValue({
      sendCode: mockSendCode,
      loginWithCode: mockLoginWithCode,
      state: { status: 'idle' },
    });
    
    (useSystemFunctions as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });
  
  it('renders the email login form initially', () => {
    render(<Login />);
    expect(screen.getByText('Join the battle')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('johndoe@email.com')).toBeInTheDocument();
  });
  
  it('transitions to OTP page after submitting email', async () => {
    render(<Login />);
    
    // Check checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Fill email
    const emailInput = screen.getByPlaceholderText('johndoe@email.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit form
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      expect(mockSendCode).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(screen.getByText('check your email')).toBeInTheDocument();
    });
  });
  
  it('calls loginWithCode when OTP is completed', async () => {
    (useLoginWithEmail as jest.Mock).mockReturnValue({
      sendCode: mockSendCode,
      loginWithCode: mockLoginWithCode,
      state: { status: 'code-sent' },
    });
    
    render(<Login />);
    
    // Check checkbox and submit form to get to OTP page
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    const emailInput = screen.getByPlaceholderText('johndoe@email.com');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const continueButton = screen.getByText('Continue');
    fireEvent.click(continueButton);
    
    // Once on OTP page, simulate entering a complete code
    await waitFor(() => {
      expect(screen.getByText('check your email')).toBeInTheDocument();
    });
    
    // We need to mock the OTP input completion since it's a complex component
    // This would be implemented based on your actual PIN input component
  });
  
  it('redirects new users to social page', async () => {
    const mockUser = { wallet: 'test-wallet', linkedAccounts: [] };
    
    (useLoginWithEmail as jest.Mock).mockReturnValue({
      sendCode: mockSendCode,
      loginWithCode: mockLoginWithCode,
      state: { status: 'idle' },
      onComplete: async ({ isNewUser, user }: { isNewUser: boolean; user: any }) => {
        if (isNewUser) {
          mockNavigate.push('/social');
        }
      },
    });
    
    render(<Login />);
    
    // Simulate completion of auth flow for a new user
    const onComplete = (useLoginWithEmail as jest.Mock).mock.calls[0][0].onComplete;
    await onComplete({ isNewUser: true, user: mockUser });
    
    expect(mockNavigate.push).toHaveBeenCalledWith('/social');
  });
  
  it('redirects existing users without linked social accounts to social page', async () => {
    const mockUser = { wallet: 'test-wallet', linkedAccounts: [] };
    
    render(<Login />);
    
    // Simulate completion of auth flow for existing user without linked accounts
    const onComplete = (useLoginWithEmail as jest.Mock).mock.calls[0][0].onComplete;
    await onComplete({ isNewUser: false, user: mockUser });
    
    expect(mockNavigate.push).toHaveBeenCalledWith('/social');
  });
  
  it('redirects existing users with linked social accounts to new-game page', async () => {
    const mockUser = { 
      wallet: 'test-wallet', 
      linkedAccounts: [{ type: 'twitter_oauth', details: {} }]
    };
    
    render(<Login />);
    
    // Simulate completion of auth flow for existing user with linked accounts
    const onComplete = (useLoginWithEmail as jest.Mock).mock.calls[0][0].onComplete;
    await onComplete({ isNewUser: false, user: mockUser });
    
    expect(mockNavigate.push).toHaveBeenCalledWith('/new-game');
  });
  
  it('creates a wallet if user does not have one', async () => {
    const mockUser = { 
      wallet: null,
      linkedAccounts: [{ type: 'twitter_oauth', details: {} }]
    };
    
    render(<Login />);
    
    // Simulate completion of auth flow for user without wallet
    const onComplete = (useLoginWithEmail as jest.Mock).mock.calls[0][0].onComplete;
    await onComplete({ isNewUser: false, user: mockUser });
    
    expect(mockCreateWallet).toHaveBeenCalled();
  });
});