import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with default variant", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary");
  });

  it("renders with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByRole("button", { name: "Secondary" });
    expect(button).toHaveClass("bg-secondary");
  });

  it("renders with different sizes", () => {
    render(<Button size="sm">Small</Button>);

    const button = screen.getByRole("button", { name: "Small" });
    expect(button).toHaveClass("h-8");
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
  });
});
