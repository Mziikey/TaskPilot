import { Hono } from "hono";
import { tasksTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { dbType } from "../index.js";

const tasksApp = new Hono<{ Variables: { db: dbType } }>();

tasksApp.get("/", async (c) => {
  const db = c.get("db");
  const tt = await db.select().from(tasksTable);
  return c.json(tt);
});

tasksApp.get("/:taskId", async (c) => {
  const db = c.get("db");
  const taskId = Number(c.req.param("taskId"));
  const task = await db.select().from(tasksTable).where(eq(tasksTable.id, taskId));
  return c.json(task);
});

export default tasksApp;
