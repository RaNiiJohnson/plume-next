"use client";

import { useState, useCallback } from "react";
import { Board, Column, Task } from "@/lib/types/type";

export const useBoardState = (initialBoard: Board) => {
  const [board, setBoard] = useState<Board>(() => ({
    ...initialBoard,
    columns: initialBoard.columns
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((col) => ({
        ...col,
        tasks: col.tasks.slice().sort((a, b) => a.position - b.position),
      })),
  }));

  // Utilitaires pour trouver des éléments
  const findColumn = useCallback(
    (id: string | null): Column | undefined => {
      if (!id) return undefined;
      return board.columns.find((col) => col.id === id);
    },
    [board]
  );

  const findTask = useCallback(
    (taskId: string): { task: Task; column: Column } | null => {
      for (const column of board.columns) {
        const task = column.tasks.find((t) => t.id === taskId);
        if (task) {
          return { task, column };
        }
      }
      return null;
    },
    [board]
  );

  // Actions de mutation d'état
  const addColumnOptimistic = useCallback((tempColumn: Column) => {
    setBoard((prev) => ({
      ...prev,
      columns: [...prev.columns, tempColumn],
    }));
  }, []);

  const updateColumnFromAPI = useCallback(
    (tempId: string, realColumn: Column) => {
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) =>
          col.id === tempId
            ? { ...realColumn, tasks: realColumn.tasks ?? [] }
            : col
        ),
      }));
    },
    []
  );

  const removeColumn = useCallback((columnId: string) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns
        .filter((col) => col.id !== columnId)
        .map((col, index) => ({ ...col, position: index + 1 })),
    }));
  }, []);

  const addTaskOptimistic = useCallback((columnId: string, tempTask: Task) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, tempTask] } : col
      ),
    }));
  }, []);

  const updateTaskFromAPI = useCallback((tempId: string, realTask: Task) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) => (task.id === tempId ? realTask : task)),
      })),
    }));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((task) => task.id !== taskId),
      })),
    }));
  }, []);

  const updateTaskContent = useCallback(
    (taskId: string, newContent: string) => {
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((task) =>
            task.id === taskId ? { ...task, content: newContent } : task
          ),
        })),
      }));
    },
    []
  );

  const reorderColumns = useCallback((newColumns: Column[]) => {
    setBoard((prev) => ({ ...prev, columns: newColumns }));
  }, []);

  const reorderTasksInColumn = useCallback(
    (columnId: string, newTasks: Task[]) => {
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) =>
          col.id === columnId ? { ...col, tasks: newTasks } : col
        ),
      }));
    },
    []
  );

  const moveTaskBetweenColumns = useCallback(
    (
      sourceColumnId: string,
      destinationColumnId: string,
      sourceTasks: Task[],
      destinationTasks: Task[]
    ) => {
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id === sourceColumnId) return { ...col, tasks: sourceTasks };
          if (col.id === destinationColumnId)
            return { ...col, tasks: destinationTasks };
          return col;
        }),
      }));
    },
    []
  );

  const rollbackColumn = useCallback((originalColumns: Column[]) => {
    setBoard((prev) => ({ ...prev, columns: originalColumns }));
  }, []);

  return {
    board,
    findColumn,
    findTask,
    // Mutations
    addColumnOptimistic,
    updateColumnFromAPI,
    removeColumn,
    addTaskOptimistic,
    updateTaskFromAPI,
    removeTask,
    updateTaskContent,
    reorderColumns,
    reorderTasksInColumn,
    moveTaskBetweenColumns,
    rollbackColumn,
  };
};
