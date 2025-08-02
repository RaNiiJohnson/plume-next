import z from "zod";

export const ColumnFormSchema = z.object({
  title: z.string().min(2, {
    message: "title must be at least 2 characters.",
  }),
  boardId: z.string(),
});
