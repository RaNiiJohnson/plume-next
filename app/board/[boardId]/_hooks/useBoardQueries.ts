"use client";

import { Board, Column, Task } from "@/lib/types/type";
import { Task as PrismaTask, Column as PrismaColumn } from "@/generated/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addColumnSafeAction,
  deleteColumnSafeAction,
} from "../(column)/column.action";
import {
  addTaskSafeAction,
  addtagsToTaskSafeAction,
  deleteTaskSafeAction,
  reorderTasksAndColumnsSafeAction,
  updateTaskSafeAction,
} from "../(task)/task.action";

// Helper function to transform Prisma Task to frontend Task
const transformPrismaTask = (prismaTask: PrismaTask): Task => ({
  id: prismaTask.id,
  content: prismaTask.content,
  description: prismaTask.description || undefined,
  position: prismaTask.position,
  columnId: prismaTask.columnId,
  tags: prismaTask.tags.length > 0 ? prismaTask.tags : undefined,
});

// Helper function to transform Prisma Column to frontend Column
const transformPrismaColumn = (
  prismaColumn: PrismaColumn & { tasks: PrismaTask[] }
): Column => ({
  id: prismaColumn.id,
  title: prismaColumn.title,
  position: prismaColumn.position,
  tasks: prismaColumn.tasks.map(transformPrismaTask),
  boardId: prismaColumn.boardId,
});

// Query Keys
export const boardKeys = {
  all: ["boards"] as const,
  board: (boardId: string) => [...boardKeys.all, boardId] as const,
};

// Hook pour récupérer un board
export const useBoardQuery = (boardId: string, initialData?: Board) => {
  return useQuery({
    queryKey: boardKeys.board(boardId),
    queryFn: async () => {
      // API pour fetch le board, sinon initialData
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
    onSuccess: (newColumn, _variables, _context) => {
      // Replace temp column with real one
      const currentBoard = queryClient.getQueryData<Board>(
        boardKeys.board(boardId)
      );
      if (currentBoard) {
        // Transform the Prisma column to frontend format if needed
        const transformedColumn: Column = newColumn.tasks
          ? transformPrismaColumn(newColumn as any)
          : {
              id: newColumn.id,
              title: newColumn.title,
              position: newColumn.position,
              tasks: [],
              boardId: newColumn.boardId,
            };

        queryClient.setQueryData<Board>(boardKeys.board(boardId), {
          ...currentBoard,
          columns: currentBoard.columns.map((col) =>
            col.id.startsWith("temp-") ? transformedColumn : col
          ),
        });
      }
    },
    onError: (_err, _variables, context) => {
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
            .map((col, index) => ({
              ...col,
              position: index + 1,
              // Ensure tasks remain in the correct format
              tasks: col.tasks || [],
            })),
        });
      }

      return { previousBoard };
    },
    onError: (_err, _variables, context) => {
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
    onSuccess: (newTask, variables, _context) => {
      const currentBoard = queryClient.getQueryData<Board>(
        boardKeys.board(boardId)
      );
      if (currentBoard) {
        // Transform the Prisma task to frontend format
        const transformedTask = transformPrismaTask(newTask as PrismaTask);

        queryClient.setQueryData<Board>(boardKeys.board(boardId), {
          ...currentBoard,
          columns: currentBoard.columns.map((col) =>
            col.id === variables.columnId
              ? {
                  ...col,
                  tasks: col.tasks.map((task) =>
                    task.id.startsWith("temp-") ? transformedTask : task
                  ),
                }
              : col
          ),
        });
      }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.board(boardId),
          context.previousBoard
        );
      }
    },
  });
};

// Mutation générique pour mettre à jour une tâche
export const useUpdateTaskMutation = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: {
      taskId: string;
      content?: string;
      description?: string;
      dueDate?: Date | null;
    }) => {
      const response = await updateTaskSafeAction({
        boardId,
        ...updateData,
      });
      if (!response.data?.success) {
        throw new Error("Failed to update task");
      }
      return response.data.task;
    },
    onMutate: async (updateData) => {
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
              task.id === updateData.taskId
                ? {
                    ...task,
                    ...(updateData.content !== undefined && {
                      content: updateData.content,
                    }),
                    ...(updateData.description !== undefined && {
                      description: updateData.description,
                    }),
                    ...(updateData.dueDate !== undefined && {
                      dueDate: updateData.dueDate,
                    }),
                  }
                : task
            ),
          })),
        });
      }

      return { previousBoard };
    },
    onSuccess: (updatedTask) => {
      // Mettre à jour avec la réponse du serveur
      const currentBoard = queryClient.getQueryData<Board>(
        boardKeys.board(boardId)
      );
      if (currentBoard && updatedTask) {
        const transformedTask = transformPrismaTask(updatedTask as PrismaTask);

        queryClient.setQueryData<Board>(boardKeys.board(boardId), {
          ...currentBoard,
          columns: currentBoard.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((task) =>
              task.id === transformedTask.id ? transformedTask : task
            ),
          })),
        });
      }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.board(boardId),
          context.previousBoard
        );
      }
    },
  });
};

// Mutations spécialisées pour plus de facilité d'utilisation
export const useUpdateTaskContentMutation = (boardId: string) => {
  const updateTaskMutation = useUpdateTaskMutation(boardId);

  return useMutation({
    mutationFn: async ({
      taskId,
      content,
    }: {
      taskId: string;
      content: string;
    }) => {
      return updateTaskMutation.mutateAsync({ taskId, content });
    },
  });
};

export const useUpdateTaskDescriptionMutation = (boardId: string) => {
  const updateTaskMutation = useUpdateTaskMutation(boardId);

  return useMutation({
    mutationFn: async ({
      taskId,
      description,
    }: {
      taskId: string;
      description: string;
    }) => {
      return updateTaskMutation.mutateAsync({ taskId, description });
    },
  });
};

export const useUpdateTaskDueDateMutation = (boardId: string) => {
  const updateTaskMutation = useUpdateTaskMutation(boardId);

  return useMutation({
    mutationFn: async ({
      taskId,
      dueDate,
    }: {
      taskId: string;
      dueDate: Date;
    }) => {
      return updateTaskMutation.mutateAsync({ taskId, dueDate });
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
    onError: (_err, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(
          boardKeys.board(boardId),
          context.previousBoard
        );
      }
    },
  });
};

// Mutation pour les tags
export const useUpdateTaskTagsMutation = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      tags,
    }: {
      taskId: string;
      tags: string[];
    }) => {
      const response = await addtagsToTaskSafeAction({ taskId, boardId, tags });
      if (!response.data?.success) {
        throw new Error("Failed to update task tags");
      }
      return response.data.task;
    },
    onMutate: async ({ taskId, tags }) => {
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
              task.id === taskId
                ? { ...task, tags: tags.length > 0 ? tags : undefined }
                : task
            ),
          })),
        });
      }

      return { previousBoard };
    },
    onSuccess: (updatedTask) => {
      // Update with the actual response from server
      const currentBoard = queryClient.getQueryData<Board>(
        boardKeys.board(boardId)
      );
      if (currentBoard && updatedTask) {
        const transformedTask = transformPrismaTask(updatedTask as PrismaTask);

        queryClient.setQueryData<Board>(boardKeys.board(boardId), {
          ...currentBoard,
          columns: currentBoard.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((task) =>
              task.id === transformedTask.id ? transformedTask : task
            ),
          })),
        });
      }
    },
    onError: (_err, _variables, context) => {
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
    onError: (_err) => {
      // En cas d'erreur, on peut soit rollback soit refetch
      queryClient.invalidateQueries({ queryKey: boardKeys.board(boardId) });
    },
  });
};
