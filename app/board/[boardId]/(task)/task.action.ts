"use server";

import prisma from "@/lib/prisma";
import { actionUser } from "@/lib/safe-ation";
import { AddTaskSchema, TaskUpdate, updateTaskSchema } from "@/lib/types/task";
import { revalidatePath } from "next/cache";
import z from "zod";

export const addTaskSafeAction = actionUser
  .inputSchema(AddTaskSchema)
  .action(async ({ parsedInput }) => {
    const newTask = await prisma.task.create({
      data: {
        columnId: parsedInput.columnId,
        content: parsedInput.content,
        position: parsedInput.position,
      },
    });
    revalidatePath(`/board/${parsedInput.boardId}`);
    return { success: true, task: newTask };
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

    revalidatePath(`/board/`);

    return { success: true, message: "Tasks reordered successfully!" };
  } catch (error) {
    console.error("Error reordering tasks:", error);
    return {
      error: "Failed to reorder tasks.",
      details: (error as Error).message,
    };
  }
}

export const addtagsToTaskSafeAction = actionUser
  .inputSchema(
    z.object({
      taskId: z.string(),
      boardId: z.string(),
      tags: z.array(z.string()),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      const updatedTask = await prisma.task.update({
        where: { id: parsedInput.taskId },
        data: { tags: parsedInput.tags },
      });
      revalidatePath(`/board/${parsedInput.boardId}`);
      return { success: true, task: updatedTask };
    } catch (error) {
      console.error("Error updating task tags:", error);
      return {
        error: "Failed to update task tags.",
        details: (error as Error).message,
      };
    }
  });

export const deleteTaskSafeAction = actionUser
  .inputSchema(
    z.object({
      taskId: z.string(),
      boardId: z.string(),
    })
  )
  .action(async ({ parsedInput }) => {
    await prisma.task.delete({
      where: { id: parsedInput.taskId },
    });
    revalidatePath(`/board/${parsedInput.boardId}`);
    return { success: true, message: "Task deleted successfully." };
  });

export const updateTaskSafeAction = actionUser
  .inputSchema(updateTaskSchema)
  .action(async ({ parsedInput }) => {
    // Construire l'objet de données dynamiquement
    const updateData: any = {};

    if (parsedInput.content !== undefined) {
      updateData.content = parsedInput.content;
    }
    if (parsedInput.description !== undefined) {
      updateData.description = parsedInput.description;
    }
    if (parsedInput.dueDate !== undefined) {
      updateData.dueDate = parsedInput.dueDate;
    }

    const updatedTask = await prisma.task.update({
      where: { id: parsedInput.taskId },
      data: updateData,
    });

    revalidatePath(`/board/${parsedInput.boardId}`);
    return { success: true, task: updatedTask };
  });

export const addCommentToTaskSafeAction = actionUser
  .inputSchema(
    z.object({
      taskId: z.string(),
      boardId: z.string(),
      authorId: z.string(),
      content: z.string().min(1, "Comment cannot be empty"),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      const newComment = await prisma.comment.create({
        data: {
          content: parsedInput.content,
          taskId: parsedInput.taskId,
          authorId: parsedInput.authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      revalidatePath(`/board/${parsedInput.boardId}`);
      return { success: true, comment: newComment };
    } catch (error) {
      console.error("Error adding comment to task:", error);
      return {
        error: "Failed to add comment to task.",
        details: (error as Error).message,
      };
    }
  });

// Schéma Zod pour valider le payload de réordonnancement
// Utilisation de z.discriminatedUnion pour gérer plusieurs types d'actions de réordonnancement

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
    columns: z.array(z.object({ id: z.string(), position: z.number() })), // Les données qu'on envoie pour les colonnes
  }),
]);

export const reorderTasksAndColumnsSafeAction = actionUser
  .inputSchema(ReorderPayloadSchema)
  .action(async ({ parsedInput }) => {
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
      // Par exemple, si ta page est dans app/workspace/[boardId]/page.tsx, le chemin est correct.
      revalidatePath(`/workspace/${parsedInput.boardId}`);
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
