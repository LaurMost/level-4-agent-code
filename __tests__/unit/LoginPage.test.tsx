import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '@/app/login/page';

// Mock next/navigation to capture router.push
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

// Mock @clerk/nextjs to provide a fake useSignIn hook
const mockSignInCreate = jest.fn();
jest.mock('@clerk/nextjs', () => ({
  useSignIn: () => ({
    create: mockSignInCreate
  })
}));


describe('LoginPage Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSignInCreate.mockClear();
  });

  it('renders the login form and handles successful login', async () => {
    // Simulate a successful sign in response
    mockSignInCreate.mockResolvedValueOnce({ status: 'complete', createdSessionId: 'session123' });

    render(<LoginPage />);

    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Fill in form fields
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for the sign in function to be called with correct credentials
    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: 'test@example.com',
        password: 'password123'
      });
    });

    // Expect redirection to dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
