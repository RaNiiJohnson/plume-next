"use server";

import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { actionUser } from "@/lib/safe-ation";
import { revalidatePath } from "next/cache";
import z from "zod";

const TaskFormSchema = z.object({
  boardId: z.string(), // Ajoute le boardId ici
  columnId: z.string(),
  content: z.string().min(1, { message: "Task content cannot be empty." }),
  position: z.number().int().positive(),
});
interface TaskUpdate {
  id: string;
  position: number;
}

export const addTaskSafeAction = actionUser
  .inputSchema(TaskFormSchema)
  .action(async ({ parsedInput: Input }) => {
    const user = await getUser();
    if (!user) {
      throw new Error("Vous devez être connecté pour créer une carte");
    }

    const taskCount = await prisma.task.count({
      where: { columnId: Input.columnId },
    });

    const newTask = await prisma.task.create({
      data: {
        content: Input.content,
        columnId: Input.columnId,
        position: taskCount + 1,
      },
    });
    revalidatePath(`/boards/${Input.boardId}`);

    return newTask;
  });

export async function reorderTasks(tasks: TaskUpdate[]) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { error: "Invalid input: tasks must be a non-empty array." };
  }

  try {
    // Utiliser une transaction pour s'assurer que toutes les mises à jour réussissent ou échouent ensemble
    await prisma.$transaction(
      tasks.map((task: TaskUpdate) =>
        prisma.task.update({
          where: { id: task.id },
          data: { position: task.position },
        })
      )
    );

    revalidatePath(`/boards/`);

    return { success: true, message: "Tasks reordered successfully!" };
  } catch (error) {
    console.error("Error reordering tasks:", error);
    return {
      error: "Failed to reorder tasks.",
      details: (error as Error).message,
    };
  } finally {
    await prisma.$disconnect();
  }
}
