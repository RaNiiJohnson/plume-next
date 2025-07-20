"use server";

import { getUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { actionUser } from "@/lib/safe-ation";
import { revalidatePath } from "next/cache";
import z from "zod";

const BoardFormSchema = z.object({
  title: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
});

const UpdateBoardSchema = z.object({
  title: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
  boardId: z.string(),
});

export const addBoardSafeAction = actionUser
  .inputSchema(BoardFormSchema)
  .action(async ({ parsedInput: Input, ctx }) => {
    const user = await getUser();
    if (!user) {
      throw new Error("Vous devez être connecté pour créer une tableau");
    }

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
  .action(async ({ parsedInput: input, ctx }) => {
    await prisma.board.update({
      where: {
        id: input.boardId,
        userId: ctx.user.id,
      },
      data: {
        title: input.title,
      },
    });
  });

export const deleteBoardAction = actionUser
  .inputSchema(
    z.object({
      boardId: z.string(),
    })
  )
  .action(async ({ parsedInput: Input, ctx }) => {
    await prisma.board.delete({
      where: {
        id: Input.boardId,
        userId: ctx.user.id,
      },
    });
  });
