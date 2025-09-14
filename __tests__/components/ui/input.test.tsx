import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders input field", () => {
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText("Enter text");
    expect(input).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    const input = screen.getByPlaceholderText("Type here");
    await user.type(input, "Hello World");

    expect(input).toHaveValue("Hello World");
  });

  it("can be disabled", () => {
    render(<Input disabled placeholder="Disabled input" />);

    const input = screen.getByPlaceholderText("Disabled input");
    expect(input).toBeDisabled();
  });

  it("applies custom className", () => {
    const { container } = render(<Input className="custom-class" />);

    const input = container.querySelector("input");
    expect(input).toHaveClass("custom-class");
  });
});
