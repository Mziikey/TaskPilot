import { Hono } from "hono";
import { tasksTable } from "../db/schema/task.js";
import { eq } from "drizzle-orm";
import type { dbType } from "../index.js";
import type { UserInfo } from "./auth.js";
import { usersTable } from "../db/schema/user.js";

export type TaskInfo = {
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  startAt: number;
  dueAt: number;
};

const tasksApp = new Hono<{ Variables: { user: UserInfo | undefined; db: dbType } }>();

tasksApp.get("/", async (c) => {
  const db = c.get("db");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }
  const response = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));
  console.log(response);
  return c.json(response);
});

tasksApp.post("/add", async (c) => {
  const db = c.get("db");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }
  const body: TaskInfo = await c.req.json();

  const task = { ...body, userId: userId };

  await db.insert(tasksTable).values(task);
  console.log("task inserted");
  return c.json({ task: body.title });
});

tasksApp.delete("/delete/:id", async (c) => {
  const db = c.get("db");
  const taskId = c.req.param("id");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }
  await db.delete(tasksTable).where(eq(tasksTable.id, Number(taskId)));
  return c.json({ taskId: taskId });
});

tasksApp.post("/edit/:id", async (c) => {
  const db = c.get("db");
  const taskId = c.req.param("id");
  const userId = c.get("user")?.id;
  const body: TaskInfo = await c.req.json();
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }
  await db
    .update(tasksTable)
    .set({
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      startAt: body.startAt,
      dueAt: body.dueAt,
    })
    .where(eq(tasksTable.id, Number(taskId)));
  return c.json({ task: body.title, taskId: taskId });
});

export default tasksApp;
