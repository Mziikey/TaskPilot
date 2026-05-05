import { Hono } from "hono";
import OpenAI from "openai";
import type { UserInfo } from "./auth.js";
import type { dbType } from "../index.js";
import { eq } from "drizzle-orm";
import { streamSSE } from "hono/streaming";
import { messagesTable, sessionsTable } from "../db/schema/chat.js";

const chatApp = new Hono<{ Variables: { user: UserInfo | undefined; db: dbType } }>();

export type SessionsType = {
  title: string;
  userId: number;
  createdAt: number;
  updatedAt: number;
};

export type MessagesType = {
  sessionId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

chatApp.get("/sessions", async (c) => {
  const db = c.get("db");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.userId, userId));
  return c.json(sessions);
});

chatApp.post("/sessions", async (c) => {
  const db = c.get("db");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const body = await c.req.json();
  const newSession: SessionsType = {
    title: body.title,
    userId: userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const [session] = await db.insert(sessionsTable).values(newSession).returning();

  return c.json({ session });
});

chatApp.get("/sessions/:sessionId/messages", async (c) => {
  const sessionId = Number(c.req.param("sessionId"));
  const db = c.get("db");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId));
  return c.json(messages);
});

chatApp.post("/sessions/:sessionId/messages", async (c) => {
  const db = c.get("db");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const body: { role: "user" | "assistant"; content: string } = await c.req.json();
  const sessionId = Number(c.req.param("sessionId"));

  const newMessage: MessagesType = {
    sessionId: sessionId,
    role: body.role,
    content: body.content,
    createdAt: Date.now(),
  };

  const [message] = await db.insert(messagesTable).values(newMessage).returning();

  return c.json({ message });
});

chatApp.post("sessions/:sessionId/stream", async (c) => {});

chatApp.get("/", async (c) => {
  try {
    console.log("start");
    console.log(process.env.DASHSCOPE_API_KEY);
    const openai = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });

    const stream = await openai.chat.completions.create({
      model: "qwen3.6-plus",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.仅回复不带任何格式的纯文本内容",
        },
        {
          role: "user",
          content: "请介绍一下自己",
        },
      ],
      stream: true,
      stream_options: { include_usage: true },
    });

    let reply = "";

    return streamSSE(c, async (s) => {
      for await (const event of stream) {
        if (event.choices && event.choices.length > 0 && event.choices[0].delta.content) {
          reply = reply + event.choices[0].delta.content;
          await s.writeSSE({
            data: reply,
            event: "ai-reply",
          });
        }
      }
    });
  } catch (e) {
    console.log(`错误信息：${e}`);
    console.log("请参考文档：https://help.aliyun.com/model-studio/developer-reference/error-code");
    return new Response(JSON.stringify({ error: e }));
  }
});

export default chatApp;
