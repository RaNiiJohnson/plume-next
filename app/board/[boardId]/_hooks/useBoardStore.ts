"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Board, Column, Task } from "@/lib/types/type";
import {
  boardKeys,
  useBoardQuery,
  useAddColumnMutation,
  useDeleteColumnMutation,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskTagsMutation,
  useDeleteTaskMutation,
  useReorderMutation,
} from "./useBoardQueries";

export const useBoardStore = (boardId: string, initialBoard: Board) => {
  const queryClient = useQueryClient();

  // Initialize the query with initial data
  const { data: board } = useBoardQuery(boardId, initialBoard);

  // Mutations
  const addColumnMutation = useAddColumnMutation(boardId);
  const deleteColumnMutation = useDeleteColumnMutation(boardId);
  const addTaskMutation = useAddTaskMutation(boardId);
  const updateTaskMutation = useUpdateTaskMutation(boardId);
  const updateTaskTagsMutation = useUpdateTaskTagsMutation(boardId);
  const deleteTaskMutation = useDeleteTaskMutation(boardId);
  const reorderMutation = useReorderMutation(boardId);

  // Utility functions
  const findColumn = (id: string | null): Column | undefined => {
    if (!id || !board) return undefined;
    return board.columns.find((col) => col.id === id);
  };

  const findTask = (taskId: string): { task: Task; column: Column } | null => {
    if (!board) return null;
    for (const column of board.columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) {
        return { task, column };
      }
    }
    return null;
  };

  // Optimistic update functions for drag & drop
  const updateBoardOptimistically = (updater: (board: Board) => Board) => {
    if (!board) return;
    queryClient.setQueryData<Board>(boardKeys.board(boardId), updater(board));
  };

  const reorderColumns = (newColumns: Column[]) => {
    updateBoardOptimistically((board) => ({ ...board, columns: newColumns }));
  };

  const reorderTasksInColumn = (columnId: string, newTasks: Task[]) => {
    updateBoardOptimistically((board) => ({
      ...board,
      columns: board.columns.map((col) =>
        col.id === columnId ? { ...col, tasks: newTasks } : col
      ),
    }));
  };

  const moveTaskBetweenColumns = (
    sourceColumnId: string,
    destinationColumnId: string,
    sourceTasks: Task[],
    destinationTasks: Task[]
  ) => {
    updateBoardOptimistically((board) => ({
      ...board,
      columns: board.columns.map((col) => {
        if (col.id === sourceColumnId) return { ...col, tasks: sourceTasks };
        if (col.id === destinationColumnId)
          return { ...col, tasks: destinationTasks };
        return col;
      }),
    }));
  };

  const rollbackColumn = (originalColumns: Column[]) => {
    updateBoardOptimistically((board) => ({
      ...board,
      columns: originalColumns,
    }));
  };

  // Actions
  const handleAddColumn = async (title: string) => {
    await addColumnMutation.mutateAsync({ title });
  };

  const handleColumnDelete = async (columnId: string) => {
    await deleteColumnMutation.mutateAsync({ columnId });
  };

  const handleAddTask = async (content: string, columnId: string) => {
    const column = findColumn(columnId);
    if (!column) return;

    const newPosition =
      column.tasks.length > 0
        ? Math.max(...column.tasks.map((t) => t.position)) + 1
        : 1;

    await addTaskMutation.mutateAsync({
      columnId,
      content,
      position: newPosition,
    });
  };

  const handleTaskUpdate = async (taskId: string, newContent: string) => {
    await updateTaskMutation.mutateAsync({ taskId, content: newContent });
  };

  const handleTaskTagsUpdate = async (taskId: string, tags: string[]) => {
    await updateTaskTagsMutation.mutateAsync({ taskId, tags });
  };

  const handleTaskDelete = async (taskId: string) => {
    await deleteTaskMutation.mutateAsync({ taskId });
  };

  const handleMoveTaskToColumn = async (
    taskId: string,
    currentColumnId: string,
    targetColumnId: string
  ) => {
    const currentColumn = findColumn(currentColumnId);
    const targetColumn = findColumn(targetColumnId);

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
    moveTaskBetweenColumns(
      currentColumnId,
      targetColumnId,
      sourceTasks,
      targetTasks
    );

    // API call
    await reorderMutation.mutateAsync({
      type: "moveBetweenColumns",
      boardId,
      taskId,
      newColumnId: targetColumnId,
      sourceColumnTasks: sourceTasks.map((t) => ({
        id: t.id,
        position: t.position,
      })),
      destinationColumnTasks: targetTasks.map((t) => ({
        id: t.id,
        position: t.position,
      })),
    });
  };

  return {
    // Data
    board,

    // Utilities
    findColumn,
    findTask,

    // Drag & Drop optimistic updates
    reorderColumns,
    reorderTasksInColumn,
    moveTaskBetweenColumns,
    rollbackColumn,

    // Actions
    handleAddColumn,
    handleColumnDelete,
    handleAddTask,
    handleTaskUpdate,
    handleTaskTagsUpdate,
    handleTaskDelete,
    handleMoveTaskToColumn,

    // Mutation states for loading indicators
    isAddingColumn: addColumnMutation.isPending,
    isAddingTask: addTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isUpdatingTaskTags: updateTaskTagsMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
    isReordering: reorderMutation.isPending,

    // Reorder mutation for drag & drop
    reorderMutation,
  };
};
