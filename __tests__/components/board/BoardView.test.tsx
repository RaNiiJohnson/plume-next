import { render, screen } from "../../utils/test-utils";
import { describe, it, expect, vi } from "vitest";
import BoardView from "@app/board/[boardId]/BoardView";
import { Board, Column, Task } from "@/lib/types/type";

// Mock des hooks personnalisés
vi.mock("@app/board/[boardId]/_hooks/useBoardStore", () => ({
  useBoardStore: vi.fn(() => ({
    board: mockBoard,
    findColumn: vi.fn(),
    reorderColumns: vi.fn(),
    reorderTasksInColumn: vi.fn(),
    moveTaskBetweenColumns: vi.fn(),
    rollbackColumn: vi.fn(),
    reorderMutation: { isPending: false },
    handleAddColumn: vi.fn(),
  })),
}));

vi.mock("@app/board/[boardId]/_hooks/useDragAndDrop", () => ({
  useDragAndDrop: vi.fn(() => ({
    sensors: [],
    activeItem: null,
    draggedItemWidth: null,
    handleDragStart: vi.fn(),
    handleDragEnd: vi.fn(),
    handleDragCancel: vi.fn(),
  })),
}));

// Mock des composants enfants
vi.mock("@app/board/[boardId]/(column)/ColumnView", () => ({
  default: ({ column }: { column: Column }) => (
    <div data-testid={`column-${column.id}`}>
      <h3>{column.title}</h3>
      <div>{column.tasks.length} tâches</div>
    </div>
  ),
}));

vi.mock("@app/board/[boardId]/(column)/addColumnButton", () => ({
  AddColumnButton: ({ boardId }: { boardId: string }) => (
    <button data-testid="add-column">Ajouter colonne</button>
  ),
}));

// Mock data
const mockTasks: Task[] = [
  { id: "task-1", content: "Tâche 1", position: 1, columnId: "col-1" },
  { id: "task-2", content: "Tâche 2", position: 2, columnId: "col-1" },
];

const mockColumns: Column[] = [
  {
    id: "col-1",
    title: "À faire",
    position: 1,
    tasks: mockTasks,
    boardId: "board-1",
  },
  {
    id: "col-2",
    title: "En cours",
    position: 2,
    tasks: [],
    boardId: "board-1",
  },
];

const mockBoard: Board = {
  id: "board-1",
  title: "Mon Board de Test",
  columns: mockColumns,
  userId: "user-1",
  description: "Description du board",
  isPublic: false,
  createdAt: new Date(),
  organizationId: null,
  organization: null,
};

describe("BoardView", () => {
  it("renders board title correctly", () => {
    render(<BoardView board={mockBoard} />);

    expect(screen.getByText("Mon Board de Test")).toBeInTheDocument();
  });

  it("displays correct statistics", () => {
    render(<BoardView board={mockBoard} />);

    expect(screen.getByText("2 colonnes • 2 tâches")).toBeInTheDocument();
  });

  it("renders all columns", () => {
    render(<BoardView board={mockBoard} />);

    expect(screen.getByTestId("column-col-1")).toBeInTheDocument();
    expect(screen.getByTestId("column-col-2")).toBeInTheDocument();
  });

  it("renders add column button", () => {
    render(<BoardView board={mockBoard} />);

    expect(screen.getByTestId("add-column")).toBeInTheDocument();
  });

  it("handles empty board", () => {
    const emptyBoard: Board = {
      ...mockBoard,
      columns: [],
    };

    render(<BoardView board={emptyBoard} />);

    expect(screen.getByText("0 colonnes • 0 tâches")).toBeInTheDocument();
  });
});
