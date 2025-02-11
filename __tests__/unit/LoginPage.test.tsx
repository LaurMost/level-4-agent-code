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

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '@/app/login/page';

describe('LoginPage Component', () => {
  beforeEach(() => {
    mockSignInCreate.mockClear();
    mockRouterPush.mockClear();
  });

  it('renders the login form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    mockSignInCreate.mockResolvedValueOnce({ status: 'complete' });
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
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

  it('displays error message for incomplete login', async () => {
    mockSignInCreate.mockResolvedValueOnce({ status: 'incomplete' });
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText(/sign in not complete. please check your email for further instructions./i);
    expect(errorMessage).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('displays error message when sign in fails', async () => {
    mockSignInCreate.mockRejectedValueOnce({ errors: [{ message: 'Invalid credentials' }] });
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    const errorMessage = await screen.findByText(/invalid credentials/i);
    expect(errorMessage).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
