"use server";

import prisma from "@/lib/prisma";
import { actionUser } from "@/lib/safe-ation";
import { ColumnFormSchema } from "@/lib/types/column";
import { revalidatePath } from "next/cache";
import z from "zod";

export const addColumnSafeAction = actionUser
  .inputSchema(ColumnFormSchema)
  .action(async ({ parsedInput }) => {
    const columnCount = await prisma.column.count({
      where: { boardId: parsedInput.boardId },
    });

    const newColumn = await prisma.column.create({
      data: {
        title: parsedInput.title,
        position: columnCount + 1,
        boardId: parsedInput.boardId,
      },
      include: { tasks: true },
    });

    revalidatePath(`/boards/${parsedInput.boardId}`);

    return { success: true, column: newColumn };
  });

export const deleteColumnSafeAction = actionUser
  .inputSchema(z.object({ columnId: z.string() }))
  .action(async ({ parsedInput }) => {
    const column = await prisma.column.findUnique({
      where: { id: parsedInput.columnId },
      include: { tasks: true },
    });

    if (!column) {
      throw new Error("Column not found");
    }

    await prisma.task.deleteMany({
      where: { columnId: parsedInput.columnId },
    });

    await prisma.column.delete({
      where: { id: parsedInput.columnId },
    });

    revalidatePath(`/boards/${column.boardId}`);

    return { success: true };
  });
