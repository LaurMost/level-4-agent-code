import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '@/app/login/page';

// Create mocks for Clerk and Next router
const mockSignInCreate = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useSignIn: () => ({
    create: mockSignInCreate
  })
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush
  })
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('submits the form successfully and redirects to dashboard when sign in is complete', async () => {
    // Mock successful sign in response
    mockSignInCreate.mockResolvedValueOnce({ status: 'complete' });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: 'test@example.com',
        password: 'password123'
      });
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays an error message if sign in fails', async () => {
    // Simulate sign in failure
    const errorMessage = "Sign in failed. Please try again.";
    mockSignInCreate.mockRejectedValueOnce({ errors: [{ message: errorMessage }] });

    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'fail@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
