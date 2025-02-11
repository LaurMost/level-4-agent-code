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

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupPage from '@/app/signup/page';

describe('SignupPage Component', () => {
  beforeEach(() => {
    mockSignUpCreate.mockClear();
    mockSetActive.mockClear();
    mockRouterPush.mockClear();
  });

  it('renders the signup form', () => {
    render(<SignupPage />);
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles successful signup and redirects to dashboard', async () => {
    mockSignUpCreate.mockResolvedValueOnce({ status: 'complete', createdSessionId: 'session123' });
    render(<SignupPage />);

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const passwordInput = screen.getByPlaceholderText('Your Password');
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'signup@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'signupPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'signupPass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({
        emailAddress: 'signup@example.com',
        password: 'signupPass123'
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: 'session123' });
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects to verification page if signup is not complete', async () => {
    mockSignUpCreate.mockResolvedValueOnce({ status: 'pending' });
    render(<SignupPage />);

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const passwordInput = screen.getByPlaceholderText('Your Password');
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'signup2@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'signupPass456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'signupPass456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({
        emailAddress: 'signup2@example.com',
        password: 'signupPass456'
      });
      expect(mockRouterPush).toHaveBeenCalledWith('/verify-email');
    });
  });

  it('displays error message when signup fails', async () => {
    mockSignUpCreate.mockRejectedValueOnce({ errors: [{ message: 'Signup error occurred' }] });
    render(<SignupPage />);

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const passwordInput = screen.getByPlaceholderText('Your Password');
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'error@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'errorPass' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'errorPass' } });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText(/signup error occurred/i);
    expect(errorMessage).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('shows validation error for password mismatch', async () => {
    render(<SignupPage />);

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const passwordInput = screen.getByPlaceholderText('Your Password');
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(emailInput, { target: { value: 'mismatch@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password1' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password2' } });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText(/passwords do not match/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
