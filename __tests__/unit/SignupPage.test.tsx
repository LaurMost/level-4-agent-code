import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupPage from '@/app/signup/page';

// Mock next/navigation to capture router.push
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

// Mock @clerk/nextjs to provide a fake useSignUp hook
const mockSignUpCreate = jest.fn();
const mockSetActive = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useSignUp: () => ({
    signUp: {
      create: mockSignUpCreate
    },
    setActive: mockSetActive
  })
}));


describe('SignupPage Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSignUpCreate.mockClear();
    mockSetActive.mockClear();
  });

  it('renders the signup form and handles complete signup', async () => {
    // Simulate signUp.create returning a complete status
    mockSignUpCreate.mockResolvedValueOnce({ status: 'complete', createdSessionId: 'session456' });

    render(<SignupPage />);

    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    // Using a regex to exactly match the password field label
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    // Fill in the form
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for the sign up function to be called with correct data
    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({
        emailAddress: 'user@example.com',
        password: 'password123'
      });
    });

    // Verify that upon complete signup, setActive is called and user is redirected to dashboard
    await waitFor(() => {
      expect(mockSetActive).toHaveBeenCalledWith({ session: 'session456' });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles signup when additional verification is required', async () => {
    // Simulate signUp.create returning a status that is not complete
    mockSignUpCreate.mockResolvedValueOnce({ status: 'pending' });

    render(<SignupPage />);

    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    // Fill in the form
    fireEvent.change(emailInput, { target: { value: 'user2@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Wait for the sign up function to be called
    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({
        emailAddress: 'user2@example.com',
        password: 'password456'
      });
    });

    // Verify that if signup is not complete, user is redirected to verify-email
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/verify-email');
    });
  });
});
