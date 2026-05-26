import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { logger } from "./middleware/log.js";
import { getUser } from "./middleware/getuser.js";
import authApp from "./routes/auth.js";
import tasksApp from "./routes/task.js";
import { createMiddleware } from "hono/factory";
import chatApp from "./routes/chat.js";
import aiApp from "./routes/ai.js";
import mcpApp from "./routes/mcp.js";
import { mcpAuth } from "./middleware/mcp.js";

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
app.route("/chat", chatApp);
app.route("/ai", aiApp);

app.use("/mcp/*", mcpAuth);
app.route("/mcp", mcpApp);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
