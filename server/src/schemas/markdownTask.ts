import { z } from "zod";

export const MarkdownTaskSchema = z
  .object({
    id: z.number().int().optional(),
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    status: z.enum(["todo", "doing", "done"]),
    priority: z.enum(["low", "medium", "high"]),
    startAt: z.number().int(),
    dueAt: z.number().int(),
  })
  .strict();

export const MarkdownTaskCardBlockSchema = z
  .object({
    type: z.literal("task-card"),
    schemaVersion: z.literal(1),
    task: MarkdownTaskSchema,
  })
  .strict();

export const MarkdownTaskListBlockSchema = z
  .object({
    type: z.literal("task-list"),
    schemaVersion: z.literal(1),
    tasks: z.array(MarkdownTaskSchema),
  })
  .strict();

export type MarkdownTask = z.infer<typeof MarkdownTaskSchema>;
export type MarkdownTaskListBlock = z.infer<typeof MarkdownTaskListBlockSchema>;
