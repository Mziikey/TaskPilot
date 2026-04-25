import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tasksTable = sqliteTable("tasks", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text(),
  status: text().notNull().default("todo"),
  priority: text().notNull().default("medium"),
  startAt: int({ mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  dueAt: int({ mode: "timestamp_ms" }).notNull(),
  createdAt: int("created_at", { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  userId: int().notNull(),
});
