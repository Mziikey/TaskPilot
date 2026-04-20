import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tasksTable = sqliteTable("tasks", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  description: text(),
});

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  username: text().notNull().unique(),
  passwordHash: text().notNull(),
});
