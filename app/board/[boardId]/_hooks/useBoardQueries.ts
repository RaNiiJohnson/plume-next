"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Board, Column, Task } from "@/lib/types/type";
import {
  addColumnSafeAction,
  deleteColumnSafeAction,
} from "../(column)/column.action";
import {
  addTaskSafeAction,
  deleteTaskSafeAction,
  updateTaskSafeAction,
  reorderTasksAndColumnsSafeAction,
} from "../(task)/task.action";

// Query Keys
export const boardKeys = {
  all: ["boards"] as const,
  board: (boardId: string) => [...boardKeys.all, boardId] as const,
};

// Hook pour récupérer un board (si tu as une API pour ça)
export const useBoardQuery = (boardId: string, initialData?: Board) => {
  return useQuery({
    queryKey: boardKeys.board(boardId),
    queryFn: async () => {
      // Si tu as une API pour fetch le board, sinon utilise initialData
      throw new Error("Board fetch API not implemented yet");
    },
    initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations pour les colonnes
export const useAddColumnMutation = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title }: { title: string }) => {
      const response = await addColumnSafeAction({ title, boardId });
      if (!response.data?.success) {
        throw new Error("Failed to add column");
      }
      return response.data.column;
    },
    onMutate: async ({ title }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: boardKeys.board(boardId) });

      // Snapshot previous value
      const previousBoard = queryClient.getQueryData<Board>(
        boardKeys.board(boardId)
      );

      // Optimistically update
      if (previousBoard) {
        const tempColumn: Column = {
          id: `temp-${Date.now()}`,
          title,
          position: previousBoard.columns.length + 1,
          tasks: [],
          boardId,
        };

        queryClient.setQueryData<Board>(boardKeys.board(boardId), {
          ...previousBoard,
          columns: [...previousBoard.columns, tempColumn],
        });
      }

      return { previousBoard };
    },
    onSuccess: (newColumn, variables, context) => {
      // Replace temp column with real one
      const currentBoard = queryClient.getQueryData<Board>(
        boardKeys.board(boardId)
      );
      if (currentBoard) {
        queryClient.setQueryData<Board>(boardKeys.board(boardId), {
          ...currentBoard,
          columns: currentBoard.columns.map((col) =>
            col.id.startsWith("temp-") ? newColumn : col
          ),
        });
      }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.board(boardId),
          context.previousBoard
        );
      }
    },
  });
};

export const useDeleteColumnMutation = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ columnId }: { columnId: string }) => {
      const response = await deleteColumnSafeAction({ columnId });
      if (!response.data?.success) {
        throw new Error("Failed to delete column");
      }
      return columnId;
    },
    onMutate: async ({ columnId }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.board(boardId) });
      const previousBoard = queryClient.getQueryData<Board>(
        boardKeys.board(boardId)
      );

      if (previousBoard) {
        queryClient.setQueryData<Board>(boardKeys.board(boardId), {
          ...previousBoard,
          columns: previousBoard.columns
            .filter((col) => col.id !== columnId)
            .map((col, index) => ({ ...col, position: index + 1 })),
        });
      }

      return { previousBoard };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.board(boardId),
          context.previousBoard
        );
      }
    },
  });
};

// Mutations pour les tâches
export const useAddTaskMutation = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      columnId,
      content,
      position,
    }: {
      columnId: string;
      content: string;
      position: number;
    }) => {
      const response = await addTaskSafeAction({
        boardId,
        columnId,
        content,
        position,
      });
      if (!response.data?.success) {
        throw new Error("Failed to add task");
      }
      return response.data.task;
    },
    onMutate: async ({ columnId, content, position }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.board(boardId) });
      const previousBoard = queryClient.getQueryData<Board>(
        boardKeys.board(boardId)
      );

      if (previousBoard) {
        const tempTask: Task = {
          id: `temp-${Date.now()}`,
          content,
          position,
          columnId,
        };

        queryClient.setQueryData<Board>(boardKeys.board(boardId), {
          ...previousBoard,
          columns: previousBoard.columns.map((col) =>
            col.id === columnId
              ? { ...col, tasks: [...col.tasks, tempTask] }
              : col
          ),
        });
      }

      return { previousBoard };
    },
    onSuccess: (newTask, variables, context) => {
      const currentBoard = queryClient.getQueryData<Board>(
        boardKeys.board(boardId)
      );
      if (currentBoard) {
        queryClient.setQueryData<Board>(boardKeys.board(boardId), {
          ...currentBoard,
          columns: currentBoard.columns.map((col) =>
            col.id === variables.columnId
              ? {
                  ...col,
                  tasks: col.tasks.map((task) =>
                    task.id.startsWith("temp-") ? newTask : task
                  ),
                }
              : col
          ),
        });
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.board(boardId),
          context.previousBoard
        );
      }
    },
  });
};

export const useUpdateTaskMutation = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      content,
    }: {
      taskId: string;
      content: string;
    }) => {
      const response = await updateTaskSafeAction({ taskId, content, boardId });
      if (!response.data?.success) {
        throw new Error("Failed to update task");
      }
      return response.data.task;
    },
    onMutate: async ({ taskId, content }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.board(boardId) });
      const previousBoard = queryClient.getQueryData<Board>(
        boardKeys.board(boardId)
      );

      if (previousBoard) {
        queryClient.setQueryData<Board>(boardKeys.board(boardId), {
          ...previousBoard,
          columns: previousBoard.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((task) =>
              task.id === taskId ? { ...task, content } : task
            ),
          })),
        });
      }

      return { previousBoard };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.board(boardId),
          context.previousBoard
        );
      }
    },
  });
};

export const useDeleteTaskMutation = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId }: { taskId: string }) => {
      const response = await deleteTaskSafeAction({ taskId, boardId });
      if (!response.data?.success) {
        throw new Error("Failed to delete task");
      }
      return taskId;
    },
    onMutate: async ({ taskId }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.board(boardId) });
      const previousBoard = queryClient.getQueryData<Board>(
        boardKeys.board(boardId)
      );

      if (previousBoard) {
        queryClient.setQueryData<Board>(boardKeys.board(boardId), {
          ...previousBoard,
          columns: previousBoard.columns.map((col) => ({
            ...col,
            tasks: col.tasks.filter((task) => task.id !== taskId),
          })),
        });
      }

      return { previousBoard };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.board(boardId),
          context.previousBoard
        );
      }
    },
  });
};

// Mutation pour le drag & drop
export const useReorderMutation = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await reorderTasksAndColumnsSafeAction(payload);
      if (!response.data?.success) {
        throw new Error(response.data?.error || "Failed to reorder");
      }
      return response.data;
    },
    onError: (err) => {
      // En cas d'erreur, on peut soit rollback soit refetch
      queryClient.invalidateQueries({ queryKey: boardKeys.board(boardId) });
    },
  });
};
