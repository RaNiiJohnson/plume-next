import { describe, it, expect } from "vitest";
import { Board, Column, Task } from "@/lib/types/type";

// Fonctions utilitaires pour les tests (exemples de fonctions complexes)
export const boardUtils = {
  // Calculer les statistiques du board
  getBoardStats: (board: Board) => {
    const totalTasks = board.columns.reduce(
      (acc, col) => acc + col.tasks.length,
      0
    );
    const completedTasks =
      board.columns.find(
        (col) =>
          col.title.toLowerCase().includes("terminé") ||
          col.title.toLowerCase().includes("done")
      )?.tasks.length || 0;

    return {
      totalColumns: board.columns.length,
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  },

  // Réorganiser les positions après suppression
  reorderPositions: (items: Array<{ id: string; position: number }>) => {
    return items
      .sort((a, b) => a.position - b.position)
      .map((item, index) => ({ ...item, position: index + 1 }));
  },

  // Trouver la prochaine position disponible
  getNextPosition: (items: Array<{ position: number }>) => {
    if (items.length === 0) return 1;
    return Math.max(...items.map((item) => item.position)) + 1;
  },

  // Valider la structure du board
  validateBoard: (board: Board) => {
    const errors: string[] = [];

    // Vérifier que le board a un titre
    if (!board.title || board.title.trim() === "") {
      errors.push("Le board doit avoir un titre");
    }

    // Vérifier les positions des colonnes
    const columnPositions = board.columns.map((col) => col.position);
    const uniquePositions = new Set(columnPositions);
    if (columnPositions.length !== uniquePositions.size) {
      errors.push("Les colonnes doivent avoir des positions uniques");
    }

    // Vérifier les tâches dans chaque colonne
    board.columns.forEach((column) => {
      const taskPositions = column.tasks.map((task) => task.position);
      const uniqueTaskPositions = new Set(taskPositions);
      if (taskPositions.length !== uniqueTaskPositions.size) {
        errors.push(
          `La colonne "${column.title}" a des tâches avec des positions dupliquées`
        );
      }

      // Vérifier que les tâches appartiennent à la bonne colonne
      column.tasks.forEach((task) => {
        if (task.columnId !== column.id) {
          errors.push(
            `La tâche "${task.content}" n'appartient pas à la colonne "${column.title}"`
          );
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Déplacer une tâche entre colonnes
  moveTaskBetweenColumns: (
    board: Board,
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetPosition?: number
  ) => {
    const sourceColumn = board.columns.find((col) => col.id === sourceColumnId);
    const targetColumn = board.columns.find((col) => col.id === targetColumnId);

    if (!sourceColumn || !targetColumn) {
      throw new Error("Colonne source ou cible introuvable");
    }

    const taskIndex = sourceColumn.tasks.findIndex(
      (task) => task.id === taskId
    );
    if (taskIndex === -1) {
      throw new Error("Tâche introuvable dans la colonne source");
    }

    const task = sourceColumn.tasks[taskIndex];
    const newPosition =
      targetPosition || boardUtils.getNextPosition(targetColumn.tasks);

    // Créer le nouveau board
    const newBoard: Board = {
      ...board,
      columns: board.columns.map((column) => {
        if (column.id === sourceColumnId) {
          // Retirer la tâche de la colonne source et réorganiser
          const remainingTasks = column.tasks.filter((t) => t.id !== taskId);
          return {
            ...column,
            tasks: boardUtils.reorderPositions(remainingTasks),
          };
        }

        if (column.id === targetColumnId) {
          // Ajouter la tâche à la colonne cible
          const updatedTask = {
            ...task,
            columnId: targetColumnId,
            position: newPosition,
          };
          const newTasks = [...column.tasks, updatedTask];
          return {
            ...column,
            tasks: boardUtils.reorderPositions(newTasks),
          };
        }

        return column;
      }),
    };

    return newBoard;
  },
};

describe("Board Utils", () => {
  const mockBoard: Board = {
    id: "board-1",
    title: "Mon Board",
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
        title: "Terminé",
        position: 2,
        boardId: "board-1",
        tasks: [
          {
            id: "task-3",
            content: "Tâche terminée",
            position: 1,
            columnId: "col-2",
          },
        ],
      },
    ],
    userId: "user-1",
    description: null,
    isPublic: false,
    createdAt: new Date(),
    organizationId: null,
    organization: null,
  };

  describe("getBoardStats", () => {
    it("should calculate correct board statistics", () => {
      const stats = boardUtils.getBoardStats(mockBoard);

      expect(stats.totalColumns).toBe(2);
      expect(stats.totalTasks).toBe(3);
      expect(stats.completedTasks).toBe(1);
      expect(stats.completionRate).toBeCloseTo(33.33, 2);
    });

    it("should handle empty board", () => {
      const emptyBoard: Board = { ...mockBoard, columns: [] };
      const stats = boardUtils.getBoardStats(emptyBoard);

      expect(stats.totalColumns).toBe(0);
      expect(stats.totalTasks).toBe(0);
      expect(stats.completedTasks).toBe(0);
      expect(stats.completionRate).toBe(0);
    });
  });

  describe("reorderPositions", () => {
    it("should reorder positions correctly", () => {
      const items = [
        { id: "a", position: 3 },
        { id: "b", position: 1 },
        { id: "c", position: 5 },
      ];

      const reordered = boardUtils.reorderPositions(items);

      expect(reordered).toEqual([
        { id: "b", position: 1 },
        { id: "a", position: 2 },
        { id: "c", position: 3 },
      ]);
    });
  });

  describe("getNextPosition", () => {
    it("should return 1 for empty array", () => {
      expect(boardUtils.getNextPosition([])).toBe(1);
    });

    it("should return next position", () => {
      const items = [{ position: 1 }, { position: 3 }, { position: 2 }];
      expect(boardUtils.getNextPosition(items)).toBe(4);
    });
  });

  describe("validateBoard", () => {
    it("should validate correct board", () => {
      const result = boardUtils.validateBoard(mockBoard);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing title", () => {
      const invalidBoard = { ...mockBoard, title: "" };
      const result = boardUtils.validateBoard(invalidBoard);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Le board doit avoir un titre");
    });

    it("should detect duplicate column positions", () => {
      const invalidBoard: Board = {
        ...mockBoard,
        columns: [
          { ...mockBoard.columns[0], position: 1 },
          { ...mockBoard.columns[1], position: 1 }, // Position dupliquée
        ],
      };

      const result = boardUtils.validateBoard(invalidBoard);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Les colonnes doivent avoir des positions uniques"
      );
    });
  });

  describe("moveTaskBetweenColumns", () => {
    it("should move task between columns", () => {
      const newBoard = boardUtils.moveTaskBetweenColumns(
        mockBoard,
        "task-1",
        "col-1",
        "col-2"
      );

      // Vérifier que la tâche a été déplacée
      const sourceColumn = newBoard.columns.find((col) => col.id === "col-1");
      const targetColumn = newBoard.columns.find((col) => col.id === "col-2");

      expect(sourceColumn?.tasks).toHaveLength(1);
      expect(targetColumn?.tasks).toHaveLength(2);

      const movedTask = targetColumn?.tasks.find(
        (task) => task.id === "task-1"
      );
      expect(movedTask?.columnId).toBe("col-2");
    });

    it("should throw error for invalid task", () => {
      expect(() => {
        boardUtils.moveTaskBetweenColumns(
          mockBoard,
          "invalid-task",
          "col-1",
          "col-2"
        );
      }).toThrow("Tâche introuvable dans la colonne source");
    });

    it("should throw error for invalid column", () => {
      expect(() => {
        boardUtils.moveTaskBetweenColumns(
          mockBoard,
          "task-1",
          "invalid-column",
          "col-2"
        );
      }).toThrow("Colonne source ou cible introuvable");
    });
  });
});
