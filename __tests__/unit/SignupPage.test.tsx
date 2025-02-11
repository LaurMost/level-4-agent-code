import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SignupPage from "@/app/signup/page";

const mockSignUpCreate = jest.fn();
const mockSetActive = jest.fn();
const mockRouterPush = jest.fn();

jest.mock("@clerk/nextjs", () => ({
  useSignUp: () => ({
    signUp: {
      create: mockSignUpCreate
    },
    setActive: mockSetActive
  })
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush
  })
}));

describe("SignupPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the signup form correctly", () => {
    render(<SignupPage />);
    expect(screen.getByRole("heading", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Your Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("submits the signup form and redirects to dashboard when status is complete", async () => {
    mockSignUpCreate.mockResolvedValueOnce({
      status: "complete",
      createdSessionId: "session123"
    });
    render(<SignupPage />);
    
    fireEvent.change(screen.getByPlaceholderText("Your Email"), {
      target: { value: "new@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Your Password"), {
      target: { value: "password123" }
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Your Password"), {
      target: { value: "password123" }
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    
    await waitFor(() => {
      expect(mockSignUpCreate).toHaveBeenCalledWith({
        emailAddress: "new@example.com",
        password: "password123"
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: "session123" });
      expect(mockRouterPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("submits the signup form and redirects to verify-email when status is not complete", async () => {
    mockSignUpCreate.mockResolvedValueOnce({ status: "pending" });
    render(<SignupPage />);
    
    fireEvent.change(screen.getByPlaceholderText("Your Email"), {
      target: { value: "pending@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Your Password"), {
      target: { value: "password123" }
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Your Password"), {
      target: { value: "password123" }
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/verify-email");
      expect(mockSetActive).not.toHaveBeenCalled();
    });
  });

  it("displays error message when signup fails", async () => {
    const errorResponse = { errors: [{ message: "Signup error occurred" }] };
    mockSignUpCreate.mockRejectedValueOnce(errorResponse);
    render(<SignupPage />);
    
    fireEvent.change(screen.getByPlaceholderText("Your Email"), {
      target: { value: "fail@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Your Password"), {
      target: { value: "password123" }
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Your Password"), {
      target: { value: "password123" }
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    
    const errorMsg = await screen.findByText(/signup error occurred/i);
    expect(errorMsg).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("displays error message when passwords do not match", async () => {
    render(<SignupPage />);
    
    fireEvent.change(screen.getByPlaceholderText("Your Email"), {
      target: { value: "fail@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Your Password"), {
      target: { value: "password123" }
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Your Password"), {
      target: { value: "differentpassword" }
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    
    const errorMsg = await screen.findByText(/passwords do not match/i);
    expect(errorMsg).toBeInTheDocument();
  });
});
