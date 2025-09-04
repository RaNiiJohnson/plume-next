import { useCallback } from "react";
import { Column, Task } from "@/lib/types/type";
import { BoardOperations } from "../services/boardOperations";

interface BoardState {
  board: any;
  findColumn: (id: string | null) => Column | undefined;
  addColumnOptimistic: (column: Column) => void;
  updateColumnFromAPI: (tempId: string, realColumn: Column) => void;
  removeColumn: (columnId: string) => void;
  addTaskOptimistic: (columnId: string, task: Task) => void;
  updateTaskFromAPI: (tempId: string, realTask: Task) => void;
  removeTask: (taskId: string) => void;
  updateTaskContent: (taskId: string, content: string) => void;
  moveTaskBetweenColumns: (
    sourceId: string,
    destId: string,
    sourceTasks: Task[],
    destTasks: Task[]
  ) => void;
}

export const useBoardActions = (
  boardState: BoardState,
  boardOperations: BoardOperations
) => {
  const handleAddColumn = useCallback(
    async (title: string) => {
      const tempColumnId = `temp-${Date.now()}`;
      const tempColumn: Column = {
        id: tempColumnId,
        title,
        position: boardState.board.columns.length + 1,
        tasks: [],
        boardId: boardState.board.id,
      };

      // Optimistic update
      boardState.addColumnOptimistic(tempColumn);

      // API call
      const result = await boardOperations.addColumn(
        title,
        boardState.board.id
      );

      if (result.success) {
        boardState.updateColumnFromAPI(tempColumnId, result.column!);
      } else {
        alert("Erreur lors de l'ajout de la colonne");
        boardState.removeColumn(tempColumnId);
      }
    },
    [boardState, boardOperations]
  );

  const handleColumnDelete = useCallback(
    async (columnId: string) => {
      // Optimistic update
      boardState.removeColumn(columnId);

      // API call
      const result = await boardOperations.deleteColumn(columnId);

      if (!result.success) {
        alert("Erreur lors de la suppression de la colonne.");
        window.location.reload(); // Rollback brutal mais efficace
      }
    },
    [boardState, boardOperations]
  );

  const handleAddTask = useCallback(
    async (columnId: string, content: string, boardId: string) => {
      const tempTaskId = `temp-${Date.now()}`;
      const column = boardState.findColumn(columnId);

      if (!column) return;

      const newPosition =
        column.tasks.length > 0
          ? Math.max(...column.tasks.map((t) => t.position)) + 1
          : 1;

      const tempTask: Task = {
        id: tempTaskId,
        content,
        position: newPosition,
        columnId,
      };

      // Optimistic update
      boardState.addTaskOptimistic(columnId, tempTask);

      // API call
      const result = await boardOperations.addTask(
        boardId,
        columnId,
        content,
        newPosition
      );

      if (result.success) {
        boardState.updateTaskFromAPI(tempTaskId, result.task!);
      } else {
        alert("Erreur lors de l'ajout de la tâche");
        boardState.removeTask(tempTaskId);
      }
    },
    [boardState, boardOperations]
  );

  const handleTaskDelete = useCallback(
    async (taskId: string) => {
      // Optimistic update
      boardState.removeTask(taskId);

      // API call
      const result = await boardOperations.deleteTask(
        taskId,
        boardState.board.id
      );

      if (!result.success) {
        alert("Erreur lors de la suppression. La page va être rechargée.");
        window.location.reload();
      }
    },
    [boardState, boardOperations]
  );

  const handleTaskUpdate = useCallback(
    (taskId: string, newContent: string) => {
      boardState.updateTaskContent(taskId, newContent);
    },
    [boardState]
  );

  const handleMoveTaskToColumn = useCallback(
    async (taskId: string, currentColumnId: string, targetColumnId: string) => {
      const currentColumn = boardState.findColumn(currentColumnId);
      const targetColumn = boardState.findColumn(targetColumnId);

      if (!currentColumn || !targetColumn) return;

      const taskToMove = currentColumn.tasks.find((t) => t.id === taskId);
      if (!taskToMove) return;

      // Prepare new task arrays
      const sourceTasks = currentColumn.tasks
        .filter((t) => t.id !== taskId)
        .map((t, i) => ({ ...t, position: i + 1 }));

      const targetTasks = [
        ...targetColumn.tasks,
        { ...taskToMove, columnId: targetColumnId },
      ].map((t, i) => ({ ...t, position: i + 1 }));

      // Optimistic update
      boardState.moveTaskBetweenColumns(
        currentColumnId,
        targetColumnId,
        sourceTasks,
        targetTasks
      );

      // API call
      const result = await boardOperations.moveTaskBetweenColumns(
        boardState.board.id,
        taskId,
        targetColumnId,
        sourceTasks.map((t) => ({ id: t.id, position: t.position })),
        targetTasks.map((t) => ({ id: t.id, position: t.position }))
      );

      if (!result.success) {
        console.error("Move failed:", result.error);
        // Could implement a more sophisticated rollback here
      }
    },
    [boardState, boardOperations]
  );

  return {
    handleAddColumn,
    handleColumnDelete,
    handleAddTask,
    handleTaskDelete,
    handleTaskUpdate,
    handleMoveTaskToColumn,
  };
};
