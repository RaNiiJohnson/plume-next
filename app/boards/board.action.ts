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

export const addBoardSafeAction = actionUser
  .inputSchema(BoardFormSchema)
  .action(async ({ parsedInput: Input, ctx }) => {
    const newBoard = await prisma.board.create({
      data: {
        title: Input.title,
        userId: ctx.user.id,
        columns: {
          create: [
            { title: "To Do", position: 1 },
            { title: "Doing", position: 2 },
            { title: "Done", position: 3 },
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

const ReorderPayloadSchema = z.discriminatedUnion("type", [
  // Cas 1: Réordonner les tâches dans la même colonne
  z.object({
    type: z.literal("reorderSameColumn"),
    boardId: z.string(),
    columnId: z.string(),
    tasks: z.array(z.object({ id: z.string(), position: z.number() })),
  }),
  // Cas 2: Déplacer une tâche entre colonnes
  z.object({
    type: z.literal("moveBetweenColumns"),
    boardId: z.string(),
    taskId: z.string(),
    newColumnId: z.string(),
    sourceColumnTasks: z.array(
      z.object({ id: z.string(), position: z.number() })
    ),
    destinationColumnTasks: z.array(
      z.object({ id: z.string(), position: z.number() })
    ),
  }),
  // NOUVEAU CAS 3: Réordonner les colonnes elles-mêmes
  z.object({
    type: z.literal("reorderColumns"), // <-- Nouveau type pour les colonnes
    boardId: z.string(),
    columns: z.array(z.object({ id: z.string(), position: z.number() })), // Les données que tu envoies pour les colonnes
  }),
]);

export const reorderTasksAndColumnsSafeAction = actionUser
  .inputSchema(ReorderPayloadSchema)
  .action(async ({ parsedInput, ctx }) => {
    console.log("📥 Received reorder request:", parsedInput);

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
          console.log("🔄 Processing moveBetweenColumns...");
          // Étape 1: Mettre à jour la TÂCHE DÉPLACÉE :
          // Elle doit changer de colonne ET sa position dans la NOUVELLE colonne.
          await tx.task.update({
            where: { id: parsedInput.taskId },
            data: {
              columnId: parsedInput.newColumnId,
              // Utilise la position CALCULÉE et envoyée par le frontend.
              // C'est crucial que cette position soit la bonne dans la nouvelle colonne.
              position: parsedInput.destinationColumnTasks.find(
                (t) => t.id === parsedInput.taskId
              )?.position, // Supprimez le `|| 1` si vous êtes sûr que la position sera toujours trouvée.
            },
          });

          // Étape 2: Mettre à jour les POSITIONS des TÂCHES RESTANTES dans l'ANCIENNE colonne :
          // Ces tâches ont vu leur position changer car une tâche a été retirée.
          for (const task of parsedInput.sourceColumnTasks) {
            // S'assurer de ne PAS mettre à jour la tâche qui vient d'être déplacée
            // (elle a déjà été gérée à l'étape 1). Ton frontend devrait déjà avoir filtré cette tâche.
            if (task.id !== parsedInput.taskId) {
              // Cette condition est une bonne sécurité
              await tx.task.update({
                where: { id: task.id },
                data: { position: task.position },
              });
            }
          }

          // Étape 3: Mettre à jour les POSITIONS des TÂCHES RESTANTES dans la NOUVELLE colonne :
          // Ces tâches ont vu leur position changer car une nouvelle tâche a été insérée.
          for (const task of parsedInput.destinationColumnTasks) {
            // On s'assure de NE PAS mettre à jour la tâche qui a été déplacée ici.
            // Elle a déjà été gérée à l'étape 1 (changement de columnId et position initiale dans la nouvelle colonne).
            if (task.id !== parsedInput.taskId) {
              await tx.task.update({
                where: { id: task.id },
                data: { position: task.position },
              });
            }
          }
        } else if (parsedInput.type === "reorderColumns") {
          for (const column of parsedInput.columns) {
            await tx.column.update({
              where: { id: column.id },
              data: { position: column.position },
            });
          }
        }
      });
      console.log("✅ Transaction completed successfully");
      // Le chemin doit correspondre EXACTEMENT au chemin de la page que tu veux revalider.
      // Par exemple, si ta page est dans app/boards/[boardId]/page.tsx, le chemin est correct.
      revalidatePath(`/boards/${parsedInput.boardId}`);
      console.log(
        `Successfully revalidated path /boards/${parsedInput.boardId}`
      ); // Ajoute un log pour le débogage
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
