import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tasksTable = sqliteTable("tasks", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text(),
  status: text().notNull().default("todo"),
  priority: text().notNull().default("medium"),
  startAt: int()
    .notNull()
    .$defaultFn(() => Date.now()),
  dueAt: int().notNull(),
  createdAt: int()
    .notNull()
    .$defaultFn(() => Date.now()),
  userId: int().notNull(),
});
