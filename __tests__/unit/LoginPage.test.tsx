import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "@/app/login/page";

const mockSignInCreate = jest.fn();
const mockRouterPush = jest.fn();

jest.mock("@clerk/nextjs", () => ({
  useSignIn: () => ({
    signIn: {
      create: mockSignInCreate
    }
  })
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush
  })
}));

describe("LoginPage Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the login form correctly", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("submits the login form and redirects on successful sign in", async () => {
    mockSignInCreate.mockResolvedValueOnce({ status: "complete" });
    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText("Your Email"), {
      target: { value: "test@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Your Password"), {
      target: { value: "password123" }
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    
    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: "test@example.com",
        password: "password123"
      });
      expect(mockRouterPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("displays error message when sign in fails", async () => {
    const errorResponse = { errors: [{ message: "Invalid credentials" }] };
    mockSignInCreate.mockRejectedValueOnce(errorResponse);
    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText("Your Email"), {
      target: { value: "fail@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Your Password"), {
      target: { value: "wrongpassword" }
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    
    const errorMsg = await screen.findByText(/invalid credentials/i);
    expect(errorMsg).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
