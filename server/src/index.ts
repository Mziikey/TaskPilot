import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { logger } from "./middleware/log.js";
import { getUser } from "./middleware/getuser.js";
import authApp from "./routes/auth.js";
import tasksApp from "./routes/task.js";
import aiApp from "./routes/ai.js";
import { createMiddleware } from "hono/factory";
import { streamSSE, streamText } from "hono/streaming";
import chatApp from "./routes/chat.js";

const db = drizzle(process.env.DB_FILE_NAME!);
export type dbType = typeof db;

const useDb = createMiddleware(async (c, next) => {
  c.set("db", db);

  await next();
});

const app = new Hono();

app.use(useDb);
app.use(logger);
app.use(getUser);

app.route("/auth", authApp);
app.route("/tasks", tasksApp);
app.route("/ai", aiApp);
app.route("/chat", chatApp);

app.get("/sse", (c) => {
  const text = "Hello world";
  return streamText(c, async (stream) => {
    for (let i = 0; i < text.length; i++) {
      await stream.writeln(text.slice(0, i + 1));
      await stream.sleep(300);
    }
  });
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
