import { generateText, stepCountIs, streamText, tool } from "ai";
import { createAlibaba, type AlibabaLanguageModelOptions } from "@ai-sdk/alibaba";
import { Hono } from "hono";
import type { UserInfo } from "./auth.js";
import type { dbType } from "../index.js";
import z, { number } from "zod";
import { tasksTable } from "../db/schema/task.js";
import { between, and, eq } from "drizzle-orm";

const aiApp = new Hono<{ Variables: { user: UserInfo | undefined; db: dbType } }>();

const alibaba = createAlibaba({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

aiApp.post("stream", async (c) => {
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  try {
    const stream = await streamText({
      model: alibaba("qwen3.6-plus"),
      messages: [
        {
          role: "user",
          content: "推荐一部电影",
        },
      ],
    });

    return stream.toTextStreamResponse();
  } catch (e) {
    return new Response(JSON.stringify({ error: e }));
  }
});

aiApp.post("text", async (c) => {
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  try {
    const { text } = await generateText({
      model: alibaba.chatModel("qwen3.6-plus"),
      prompt: "介绍一部电影",
    });

    return c.text(text);
  } catch (e) {
    return new Response(JSON.stringify({ error: e }));
  }
});

aiApp.post("tasks", async (c) => {
  const db = c.get("db");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const question = await c.req.text();

  try {
    const result = await generateText({
      model: alibaba.languageModel("qwen3.6-flash"),
      providerOptions: {
        alibaba: {
          enableThinking: true,
          // thinkingBudget: 2048,
        } satisfies AlibabaLanguageModelOptions,
      },
      stopWhen: stepCountIs(12),
      system: `
你是一个任务管理助手,所有提到的时间，都是北京时间。
当前时间是：${new Date().toISOString()}。

当用户询问任务、待办、日程时，需要调用 listTasks 工具。
如果用户表达的是相对时间，例如“今天”“明天”“未来三天”“下周三”，你需要根据当前时间换算成毫秒时间戳。
如果用户没有明确时间范围，默认查询今天。
`,
      tools: {
        // TODO:
        //   getTaskDetail
        //   summarizeTodayTasks
        //   summarizeOverdueTasks

        listTasks: tool({
          description:
            "根据用户指定的任意时间范围，列出该时间范围内需要完成的任务、任务、待办、日程",
          inputSchema: z.object({
            startAt: z.number().int().describe("用户指定的开始时间，毫秒时间戳"),
            endAt: z.number().int().describe("用户指定的结束时间，毫秒时间戳"),
          }),
          execute: async ({ startAt, endAt }) => {
            const taskLists = await db
              .select()
              .from(tasksTable)
              .where(and(eq(tasksTable.userId, userId), between(tasksTable.dueAt, startAt, endAt)));
            return taskLists;
          },
        }),
      },

      prompt: question,
    });

    console.log(JSON.stringify(result.steps, null, 2));

    const allToolResults = result.steps.flatMap((step) => step.toolResults ?? []);

    const listTasksResult = allToolResults.find((item) => item.toolName === "listTasks");

    if (listTasksResult) {
      return c.json({
        type: "listTasks",
        data: listTasksResult.output,
        text: result.text,
      });
    }
    return c.json(result.text);
  } catch (e) {
    return new Response(JSON.stringify({ error: e }));
  }
});

export default aiApp;
