import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupPage from '@/app/signup/page';

// Create mocks for Clerk sign up and Next router
const mockSignUpCreate = jest.fn();
const mockSetActive = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useSignUp: () => ({
    create: mockSignUpCreate,
    setActive: mockSetActive
  })
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush
  })
}));

describe('SignupPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the signup form', () => {
    render(<SignupPage />);
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('successfully signs up and redirects to dashboard when status is complete', async () => {
    // Mock a successful signup response with complete status
    mockSignUpCreate.mockResolvedValueOnce({
      status: 'complete',
      createdSessionId: 'session-123'
    });

    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({
        emailAddress: 'user@example.com',
        password: 'password123'
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: 'session-123' });
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects to verify-email if signup status is incomplete', async () => {
    // Mock a signup response with incomplete status
    mockSignUpCreate.mockResolvedValueOnce({
      status: 'incomplete'
    });

    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'user2@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/verify-email');
    });
  });

  it('shows validation error when passwords do not match', async () => {
    render(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'user3@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentPassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });
});
