import { render, screen, fireEvent, waitFor } from "../utils/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Board } from "@/lib/types/type";

// Test d'intégration pour les opérations complexes du board
describe("Board Operations Integration", () => {
  // Mock des fonctions complexes
  const mockBoardOperations = {
    addColumn: vi.fn(),
    deleteColumn: vi.fn(),
    moveTask: vi.fn(),
    reorderColumns: vi.fn(),
  };

  beforeEach(() => {
    // Reset tous les mocks avant chaque test
    vi.clearAllMocks();
  });

  // Composant de test qui simule les opérations complexes
  const TestBoardOperations = ({ board }: { board: Board }) => {
    const handleAddColumn = async () => {
      await mockBoardOperations.addColumn("Nouvelle colonne");
    };

    const handleDeleteColumn = async (columnId: string) => {
      await mockBoardOperations.deleteColumn(columnId);
    };

    const handleMoveTask = async (
      taskId: string,
      fromColumn: string,
      toColumn: string
    ) => {
      await mockBoardOperations.moveTask(taskId, fromColumn, toColumn);
    };

    return (
      <div>
        <h1>{board.title}</h1>
        <div data-testid="columns">
          {board.columns.map((column) => (
            <div key={column.id} data-testid={`column-${column.id}`}>
              <h2>{column.title}</h2>
              <button
                onClick={() => handleDeleteColumn(column.id)}
                data-testid={`delete-column-${column.id}`}
              >
                Supprimer
              </button>
              <div data-testid={`tasks-${column.id}`}>
                {column.tasks.map((task) => (
                  <div key={task.id} data-testid={`task-${task.id}`}>
                    {task.content}
                    <button
                      onClick={() =>
                        handleMoveTask(task.id, column.id, "other-column")
                      }
                      data-testid={`move-task-${task.id}`}
                    >
                      Déplacer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleAddColumn} data-testid="add-column">
          Ajouter colonne
        </button>
      </div>
    );
  };

  const mockBoard: Board = {
    id: "board-1",
    title: "Board de test",
    columns: [
      {
        id: "col-1",
        title: "À faire",
        position: 1,
        boardId: "board-1",
        tasks: [
          { id: "task-1", content: "Tâche 1", position: 1, columnId: "col-1" },
          { id: "task-2", content: "Tâche 2", position: 2, columnId: "col-1" },
        ],
      },
      {
        id: "col-2",
        title: "En cours",
        position: 2,
        boardId: "board-1",
        tasks: [],
      },
    ],
    userId: "user-1",
    description: null,
    isPublic: false,
    createdAt: new Date(),
    organizationId: null,
    organization: null,
  };

  it("should handle complex board operations", async () => {
    render(<TestBoardOperations board={mockBoard} />);

    // Vérifier le rendu initial
    expect(screen.getByText("Board de test")).toBeInTheDocument();
    expect(screen.getByText("À faire")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Tâche 1")).toBeInTheDocument();
    expect(screen.getByText("Tâche 2")).toBeInTheDocument();

    // Test d'ajout de colonne
    fireEvent.click(screen.getByTestId("add-column"));
    await waitFor(() => {
      expect(mockBoardOperations.addColumn).toHaveBeenCalledWith(
        "Nouvelle colonne"
      );
    });

    // Test de suppression de colonne
    fireEvent.click(screen.getByTestId("delete-column-col-1"));
    await waitFor(() => {
      expect(mockBoardOperations.deleteColumn).toHaveBeenCalledWith("col-1");
    });

    // Test de déplacement de tâche
    fireEvent.click(screen.getByTestId("move-task-task-1"));
    await waitFor(() => {
      expect(mockBoardOperations.moveTask).toHaveBeenCalledWith(
        "task-1",
        "col-1",
        "other-column"
      );
    });
  });

  it("should handle multiple operations in sequence", async () => {
    render(<TestBoardOperations board={mockBoard} />);

    // Séquence d'opérations
    fireEvent.click(screen.getByTestId("add-column"));
    fireEvent.click(screen.getByTestId("move-task-task-1"));
    fireEvent.click(screen.getByTestId("move-task-task-2"));

    await waitFor(() => {
      expect(mockBoardOperations.addColumn).toHaveBeenCalledTimes(1);
      expect(mockBoardOperations.moveTask).toHaveBeenCalledTimes(2);
    });
  });

  it("should display correct task counts per column", () => {
    render(<TestBoardOperations board={mockBoard} />);

    const col1Tasks = screen.getByTestId("tasks-col-1");
    const col2Tasks = screen.getByTestId("tasks-col-2");

    // Colonne 1 devrait avoir 2 tâches
    expect(col1Tasks.children).toHaveLength(2);
    // Colonne 2 devrait être vide
    expect(col2Tasks.children).toHaveLength(0);
  });
});
