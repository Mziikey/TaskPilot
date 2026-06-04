import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const usersTable = sqliteTable("users", {
    id: int().primaryKey({ autoIncrement: true }),
    username: text().notNull().unique(),
    passwordHash: text().notNull(),
    nickname: text().notNull(),
    avatar: text(),
    createdAt: int("created_at", { mode: "timestamp_ms" }).default(sql `(unixepoch() * 1000)`),
});
