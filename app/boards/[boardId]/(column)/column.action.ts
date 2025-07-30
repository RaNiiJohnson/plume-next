"use server";

import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { actionUser } from "@/lib/safe-ation";
import { revalidatePath } from "next/cache";
import z, { success } from "zod";

const ColumnFormSchema = z.object({
  title: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
  boardId: z.string(),
});

export const addColumnSafeAction = actionUser
  .inputSchema(ColumnFormSchema)
  .action(async ({ parsedInput }) => {
    const user = await getUser();
    if (!user) {
      throw new Error("Vous devez être connecté pour créer une liste");
    }

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
