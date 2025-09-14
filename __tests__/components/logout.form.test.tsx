import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LogOutForm } from "@/components/logout.form";

// Mock the auth action
vi.mock("@/lib/actions/auth", () => ({
  signOutAction: vi.fn(),
}));

describe("LogOutForm", () => {
  it("renders logout button with icon", () => {
    render(<LogOutForm />);

    const button = screen.getByRole("button", { name: /logout/i });
    expect(button).toBeInTheDocument();

    // Check if the LogOut icon is present
    const icon = button.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("submits form when button is clicked", () => {
    render(<LogOutForm />);

    const form = screen.getByRole("button").closest("form");
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute("action");
  });

  it("has correct styling classes", () => {
    render(<LogOutForm />);

    const form = screen.getByRole("button").closest("form");
    const button = screen.getByRole("button");

    expect(form).toHaveClass("w-full");
    expect(button).toHaveClass("flex", "items-center", "gap-2", "w-full");
  });
});
