import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
});

export const MemberSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.date(),
  user: UserSchema,
});

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullable(),
  logo: z.string().nullable(),
  createdAt: z.date(),
  metadata: z.string().nullable(),
  members: z.array(MemberSchema),
});

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
  boardId: z.string(),
});

export const BoardSchema = z.object({
  id: z.string(),
  title: z.string(),
  columns: z.array(ColumnSchema),
  userId: z.string().nullable(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  createdAt: z.date(),
  organizationId: z.string().nullable(),
  organization: OrganizationSchema.nullable(),
});

export type User = z.infer<typeof UserSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Board = z.infer<typeof BoardSchema>;
