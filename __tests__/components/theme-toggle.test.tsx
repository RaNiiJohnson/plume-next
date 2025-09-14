import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";

// Mock next-themes
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

const ThemeToggleWrapper = () => (
  <ThemeProvider>
    <ThemeToggle />
  </ThemeProvider>
);

describe("ThemeToggle", () => {
  it("renders theme toggle button", () => {
    render(<ThemeToggleWrapper />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("has accessible label", () => {
    render(<ThemeToggleWrapper />);

    const button = screen.getByRole("button");
    const srText = button.querySelector(".sr-only");
    expect(srText).toHaveTextContent("Toggle theme");
  });
});
