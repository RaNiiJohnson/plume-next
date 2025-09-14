import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BackButton } from "@/components/BackButton";

// Mock Next.js router
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe("BackButton", () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it("renders back button", () => {
    render(<BackButton />);

    const button = screen.getByRole("button", { name: "Back" });
    expect(button).toBeInTheDocument();
  });

  it("calls router.back() when clicked", () => {
    render(<BackButton />);

    const button = screen.getByRole("button", { name: "Back" });
    fireEvent.click(button);

    expect(mockBack).toHaveBeenCalledOnce();
  });

  it("has correct styling", () => {
    render(<BackButton />);

    const button = screen.getByRole("button", { name: "Back" });
    expect(button).toHaveClass("border");
  });
});
