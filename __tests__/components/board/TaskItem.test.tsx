import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaskItem from "@app/board/[boardId]/TaskItem";
import { Task } from "@/lib/types/type";

// Mock data pour les tests
const mockTask: Task = {
  id: "task-1",
  content: "Tâche de test",
  position: 1,
  columnId: "column-1",
};

describe("TaskItem", () => {
  it("renders task content correctly", () => {
    render(<TaskItem task={mockTask} />);

    expect(screen.getByText("Tâche de test")).toBeInTheDocument();
  });

  it("has correct styling classes", () => {
    const { container } = render(<TaskItem task={mockTask} />);

    const taskElement = container.firstChild as HTMLElement;
    expect(taskElement).toHaveClass(
      "bg-accent",
      "border",
      "border-muted",
      "p-3",
      "rounded-lg"
    );
  });

  it("has cursor-grab for drag and drop", () => {
    const { container } = render(<TaskItem task={mockTask} />);

    const taskElement = container.firstChild as HTMLElement;
    expect(taskElement).toHaveClass("cursor-grab");
  });

  it("renders with different content", () => {
    const differentTask: Task = {
      ...mockTask,
      content: "Une autre tâche",
    };

    render(<TaskItem task={differentTask} />);
    expect(screen.getByText("Une autre tâche")).toBeInTheDocument();
  });
});
