"use server";

import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { actionUser } from "@/lib/safe-ation";
import { revalidatePath } from "next/cache";
import z from "zod";

const TaskFormSchema = z.object({
  content: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
  columnId: z.string(),
});

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
    revalidatePath(`/boards/`);

    return newTask;
  });
