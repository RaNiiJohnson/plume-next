"use server";

import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { actionUser } from "@/lib/safe-ation";
import { revalidatePath } from "next/cache";
import z from "zod";

// --- Schemas ---
const BoardFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
});

const UpdateBoardSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  boardId: z.string(),
});

const AddTaskSchema = z.object({
  boardId: z.string(),
  columnId: z.string(),
  content: z.string().min(1, { message: "Task content cannot be empty." }),
  position: z.number().int().positive(),
});

const ReorderSameColumnSchema = z.object({
  type: z.literal("reorderSameColumn"),
  boardId: z.string(),
  columnId: z.string(),
  tasks: z.array(
    z.object({ id: z.string(), position: z.number().int().positive() })
  ),
});

const MoveBetweenColumnsSchema = z.object({
  type: z.literal("moveBetweenColumns"),
  boardId: z.string(),
  taskId: z.string(),
  newColumnId: z.string(),
  sourceColumnTasks: z.array(
    z.object({ id: z.string(), position: z.number().int().positive() })
  ),
  destinationColumnTasks: z.array(
    z.object({ id: z.string(), position: z.number().int().positive() })
  ),
});

const ReorderPayloadSchema = z.discriminatedUnion("type", [
  ReorderSameColumnSchema,
  MoveBetweenColumnsSchema,
]);

// --- Actions ---

export const addBoardSafeAction = actionUser
  .inputSchema(BoardFormSchema)
  .action(async ({ parsedInput: Input, ctx }) => {
    const newBoard = await prisma.board.create({
      data: {
        title: Input.title,
        userId: ctx.user.id,
        columns: {
          create: [
            { title: "À faire", position: 1 },
            { title: "En cours", position: 2 },
            { title: "Terminé", position: 3 },
          ],
        },
      },
      include: { columns: true },
    });
    revalidatePath("/");
    return newBoard;
  });

export const updateBoardAction = actionUser
  .inputSchema(UpdateBoardSchema)
  .action(async ({ parsedInput, ctx }) => {
    await prisma.board.update({
      where: {
        id: parsedInput.boardId,
        userId: ctx.user.id,
      },
      data: {
        title: parsedInput.title,
      },
    });
    revalidatePath(`/boards/${parsedInput.boardId}`);
    return { success: true };
  });

export const deleteBoardAction = actionUser
  .inputSchema(z.object({ boardId: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    await prisma.board.delete({
      where: {
        id: parsedInput.boardId,
        userId: ctx.user.id,
      },
    });
    revalidatePath("/");
    return { success: true };
  });

export const addTaskSafeAction = actionUser
  .inputSchema(AddTaskSchema)
  .action(async ({ parsedInput }) => {
    const user = await getUser();
    if (!user) {
      throw new Error("Vous devez être connecté pour ajouter une carte.");
    }

    const newTask = await prisma.task.create({
      data: {
        columnId: parsedInput.columnId,
        content: parsedInput.content,
        position: parsedInput.position,
      },
    });
    revalidatePath(`/boards/${parsedInput.boardId}`);
    return { success: true, task: newTask };
  });

export const reorderTasksAndColumnsSafeAction = actionUser
  .inputSchema(ReorderPayloadSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      await prisma.$transaction(async (tx) => {
        if (parsedInput.type === "reorderSameColumn") {
          for (const task of parsedInput.tasks) {
            await tx.task.update({
              where: { id: task.id },
              data: { position: task.position },
            });
          }
        } else if (parsedInput.type === "moveBetweenColumns") {
          await tx.task.update({
            where: { id: parsedInput.taskId },
            data: {
              columnId: parsedInput.newColumnId,
              position:
                parsedInput.destinationColumnTasks.find(
                  (t) => t.id === parsedInput.taskId
                )?.position || 1,
            },
          });

          for (const task of parsedInput.sourceColumnTasks) {
            await tx.task.update({
              where: { id: task.id },
              data: { position: task.position },
            });
          }

          for (const task of parsedInput.destinationColumnTasks) {
            if (task.id !== parsedInput.taskId) {
              await tx.task.update({
                where: { id: task.id },
                data: { position: task.position },
              });
            }
          }
        }
      });

      revalidatePath(`/boards/${parsedInput.boardId}`);
      return { success: true, message: "Board data updated successfully!" };
    } catch (error) {
      console.error("Error reordering board data:", error);
      return {
        success: false,
        error: "Failed to reorder board data.",
        details: (error as Error).message,
      };
    }
  });
