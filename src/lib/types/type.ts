import { z } from "zod";

export const TaskSchema = z.object({
  id: z.string(),
  content: z.string(),
  position: z.number(),
  columnId: z.string(),
});

export const ColumnSchema = z.object({
  id: z.string(),
  title: z.string(),
  position: z.number(),
  tasks: z.array(TaskSchema),
});

export const BoardSchema = z.object({
  id: z.string(),
  title: z.string(),
  columns: z.array(ColumnSchema),
});

export type Task = z.infer<typeof TaskSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Board = z.infer<typeof BoardSchema>;
