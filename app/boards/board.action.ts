"use server";

import { authClient } from "@/lib/auth-client";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { actionUser } from "@/lib/safe-ation";
import { revalidatePath } from "next/cache";
import z from "zod";

const BoardFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
});

const UpdateBoardSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  boardId: z.string(),
});

export const addBoardSafeAction = actionUser
  .inputSchema(BoardFormSchema)
  .action(async ({ parsedInput: Input, ctx }) => {
    const session = await getSession();

    const newBoard = await prisma.board.create({
      data: {
        title: Input.title,
        userId: ctx.user.id,
        organizationId: session?.session.activeOrganizationId,
        columns: {
          create: [
            { title: "To Do 📌", position: 1 },
            { title: "Doing 🛠️", position: 2 },
            { title: "Done 🏁", position: 3 },
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
