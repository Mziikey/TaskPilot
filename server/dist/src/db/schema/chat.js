import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const sessionsTable = sqliteTable("sessions", {
    id: int().primaryKey({ autoIncrement: true }),
    userId: int().notNull(),
    title: text().notNull().default("新对话"),
    createdAt: int()
        .notNull()
        .$defaultFn(() => Date.now()),
    updatedAt: int()
        .notNull()
        .$defaultFn(() => Date.now()),
});
export const messagesTable = sqliteTable("messages", {
    id: int().primaryKey({ autoIncrement: true }),
    sessionId: int().notNull(),
    role: text({ enum: ["user", "assistant"] }).notNull(),
    content: text().notNull(),
    createdAt: int()
        .notNull()
        .$defaultFn(() => Date.now()),
});
