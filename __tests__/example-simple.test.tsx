import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

// Composant simple pour démonstration
const SimpleComponent = ({
  title,
  onClick,
}: {
  title: string;
  onClick?: () => void;
}) => (
  <div>
    <h1>{title}</h1>
    {onClick && <button onClick={onClick}>Click me</button>}
  </div>
);

describe("SimpleComponent", () => {
  it("renders title correctly", () => {
    render(<SimpleComponent title="Hello World" />);

    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders button when onClick is provided", () => {
    const mockClick = () => {};
    render(<SimpleComponent title="Test" onClick={mockClick} />);

    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
  });

  it("does not render button when onClick is not provided", () => {
    render(<SimpleComponent title="Test" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
