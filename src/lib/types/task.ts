import z from "zod";

export const AddTaskSchema = z.object({
  boardId: z.string(),
  columnId: z.string(),
  content: z.string().min(1, { message: "Task content cannot be empty." }),
  position: z.number().int().positive(),
});

export const updateTaskSchema = z.object({
  taskId: z.string(),
  boardId: z.string(),
  // Rendre tous les champs optionnels sauf taskId et boardId
  content: z
    .string()
    .min(1, { message: "Task content cannot be empty." })
    .optional(),
  description: z.string().optional(),
  dueDate: z.date().nullable().optional(),
});

export const TaskUpdtateZod = z.object({
  id: z.string(),
  position: z.number().int().positive(),
});

export type TaskUpdate = z.infer<typeof TaskUpdtateZod>;
