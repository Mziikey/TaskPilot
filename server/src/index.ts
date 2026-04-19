import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { tasks } from "./db/schema.js";
import { eq, lt, gte, ne } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

const db = drizzle(process.env.DB_FILE_NAME!);

const app = new Hono();

const logger = createMiddleware(async (c, next) => {
  console.log(`start its ${c.req.url} and ${c.req.method}`);
  const start = Date.now();
  await next();
  const end = Date.now();
  console.log(`its ${c.req.url} and ${c.req.method} time ${end - start}ms`);
});

app.use(logger);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/tasks", async (c) => {
  const tt = await db.select().from(tasks);
  return c.json(tt);
});

app.get("/tasks/:taskId", async (c) => {
  const taskId = Number(c.req.param("taskId"));
  const task = await db.select().from(tasks).where(eq(tasks.id, taskId));
  return c.json(task);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
