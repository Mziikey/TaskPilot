import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import { Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { tasksTable } from "../db/schema/task.js";
import type { UserInfo } from "./auth.js";

const db = drizzle(process.env.DB_FILE_NAME!);
const mcpApp = new Hono<{ Variables: { mcpUser: UserInfo } }>();

// Create server instance

const createMcpServer = (userId: number) => {
  const mcpServer = new McpServer({
    name: "hello-world",
    version: "1.0.0",
  });

  mcpServer.registerTool(
    "simple-hello",
    {
      inputSchema: {
        name: z.string().default("world"),
      },
    },
    ({ name }) => {
      return {
        content: [
          {
            type: "text",
            text: `hello, ${name}`,
          },
        ],
      };
    },
  );

  mcpServer.registerTool(
    "get-all-tasks",
    {
      description: "List TaskPilot tasks for the demo user",
    },
    async () => {
      const tasks = await db.select().from(tasksTable).where(eq(tasksTable.userId, userId));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ tasks }),
          },
        ],
      };
    },
  );

  mcpServer.registerTool(
    "create task",
    {
      description: "Create a new TaskPilot task for user",
      inputSchema: {
        title: z.string().min(1).max(100),
        description: z.string().max(1000).optional(),
        status: z.enum(["todo", "doing", "done"]).default("todo"),
        priority: z.enum(["medium", "low", "high"]).default("medium"),
        startAt: z.iso
          .datetime()
          .transform((val) => new Date(val).getTime())
          .default(Date.now()),
        dueAt: z.iso
          .datetime()
          .transform((val) => new Date(val).getTime())
          .default(Date.now() + 1000 * 60 * 60 * 24),
      },
    },
    async (param) => {
      const task = { ...param, userId: userId };
      const [res] = await db.insert(tasksTable).values(task).returning();
      console.log("task inserted");
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(res),
          },
        ],
      };
    },
  );

  return mcpServer;
};

mcpApp.all("/", async (c) => {
  const mcpUser = c.get("mcpUser");
  const mcpServer = createMcpServer(mcpUser.id);
  const transport = new StreamableHTTPTransport({ sessionIdGenerator: undefined });

  await mcpServer.connect(transport);
  return transport.handleRequest(c);
});

export default mcpApp;
