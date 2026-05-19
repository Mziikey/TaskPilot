import { Hono } from "hono";
import OpenAI from "openai";
import type { UserInfo } from "./auth.js";
import type { dbType } from "../index.js";
import { eq, and } from "drizzle-orm";
import { streamSSE, streamText } from "hono/streaming";
import { messagesTable, sessionsTable } from "../db/schema/chat.js";
import type { ChatCompletionCreateParamsStreaming } from "openai/resources";

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

  return c.json(session);
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

chatApp.delete("/sessions/:sessionId", async (c) => {
  const db = c.get("db");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }
  const sessionId = Number(c.req.param("sessionId"));

  const deleteSessionMessages = await db
    .delete(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .returning();

  const [deleteSession] = await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.id, sessionId))
    .returning();

  return c.json({ deleteSession, deleteSessionMessages });
});

chatApp.delete("messages/:messageId", async (c) => {
  const db = c.get("db");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }
  const messageId = Number(c.req.param("messageId"));

  const deleteMessage = await db
    .delete(messagesTable)
    .where(eq(messagesTable.id, messageId))
    .returning();

  return c.json({ deleteMessage });
});

chatApp.post("sessions/:sessionId/stream", async (c) => {
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

  const rawMessages = await db
    .select({ role: messagesTable.role, content: messagesTable.content })
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId));

  const [userMessage] = await db.insert(messagesTable).values(newMessage).returning();

  try {
    const openai = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });

    // @ts-expect-error enable_thinking is for qwen
    const stream = await openai.chat.completions.create({
      stream: true,
      model: "qwen3.6-flash",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        ...rawMessages,
        {
          role: "user",
          content: newMessage.content,
        },
      ],
      enable_thinking: false,
    });

    let aiReply = "";

    const replyMessage: MessagesType = {
      sessionId: sessionId,
      role: "assistant",
      content: aiReply,
      createdAt: Date.now(),
    };

    const [aiReplyInfo] = await db.insert(messagesTable).values(replyMessage).returning();

    return streamText(c, async (s) => {
      s.writeln(JSON.stringify({ type: "info", userMessage, aiReplyInfo }));
      for await (const event of stream) {
        if (event.choices && event.choices.length > 0 && event.choices[0].delta.content) {
          aiReply = aiReply + event.choices[0].delta.content;
          await s.writeln(JSON.stringify({ type: "reply", reply: aiReply }));
        }
      }

      await db
        .update(messagesTable)
        .set({ content: aiReply })
        .where(eq(messagesTable.id, aiReplyInfo.id));
    });
  } catch (e) {
    console.log(`错误信息：${e}`);
    console.log("请参考文档：https://help.aliyun.com/model-studio/developer-reference/error-code");
    return new Response(JSON.stringify({ error: e }));
  }
});

chatApp.post("/sessions/:sessionId/generate-title", async (c) => {
  const db = c.get("db");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }
  const sessionId = Number(c.req.param("sessionId"));

  const [sessionInfo] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));

  if (sessionInfo.title === "新对话") {
    const [firstQuestion] = await db
      .select({ question: messagesTable.content })
      .from(messagesTable)
      .where(and(eq(messagesTable.sessionId, sessionId), eq(messagesTable.role, "user")));
    try {
      const openai = new OpenAI({
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      });

      const aiReply = await openai.chat.completions.create({
        model: "qwen3.6-flash",
        messages: [
          {
            role: "system",
            content:
              "你是一个非常善于总结ai对话标题的助手，下面是用户提的第一个问题，请你根据这个问题总结一个严格在12字以内的对话标题",
          },
          {
            role: "user",
            content: firstQuestion.question,
          },
        ],
        // @ts-expect-error enable_thinking is for qwen
        enable_thinking: false,
      });

      const aiTitle = aiReply.choices[0].message.content;

      await db
        .update(sessionsTable)
        .set({ title: aiTitle ? aiTitle : "新对话" })
        .where(eq(sessionsTable.id, sessionId));

      return c.json({ title: aiTitle });
    } catch (e) {
      console.log(`错误信息：${e}`);
      console.log(
        "请参考文档：https://help.aliyun.com/model-studio/developer-reference/error-code",
      );
    }
  }
});

export default chatApp;
