import { generateText, stepCountIs, streamText as aiStreamText, tool } from "ai";
import { createAlibaba, type AlibabaLanguageModelOptions } from "@ai-sdk/alibaba";
import { Hono, type Context } from "hono";
import type { UserInfo } from "./auth.js";
import type { dbType } from "../index.js";
import z from "zod";
import { tasksTable } from "../db/schema/task.js";
import { between, and, eq } from "drizzle-orm";
import {
  MarkdownTaskListBlockSchema,
  MarkdownTaskSchema,
  type MarkdownTask,
} from "../schemas/markdownTask.js";

const aiApp = new Hono<{ Variables: { user: UserInfo | undefined; db: dbType } }>();
type AgentStreamEvent =
  | {
      type: "status";
      phase: "thinking" | "tool_calling" | "tool_done" | "drafting" | "done";
      message: string;
    }
  | { type: "text-delta"; text: string }
  | { type: "tool-call"; toolCallId: string; toolName: string; inputSummary: string }
  | { type: "tool-result"; toolCallId: string; toolName: string; outputSummary: string }
  | { type: "final"; text: string; data: unknown[] }
  | { type: "error"; message: string };

const alibaba = createAlibaba({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

const taskAgentSystem = () => `
你是一个任务管理助手,所有提到的时间，都是北京时间。
当前时间是：${new Date().toISOString()}。

当用户询问任务、待办、日程时，需要调用 listTasks 工具。
如果用户表达的是相对时间，例如“今天”“明天”“未来三天”“下周三”，你需要根据当前时间换算成毫秒时间戳。
如果用户没有明确时间范围，默认查询今天。
你可以用自然语言总结任务，但不要自行输出 task-card 或 task-list 代码块，系统会追加结构化任务卡片。
`;

const summarize = (value: unknown, fallback: string) => {
  if (Array.isArray(value)) return `${value.length} items`;

  try {
    const text = JSON.stringify(value);
    if (!text) return fallback;
    return text.length > 140 ? `${text.slice(0, 140)}...` : text;
  } catch {
    return fallback;
  }
};

const readPromptText = async (c: Context) => {
  const body = await c.req.text();

  try {
    const parsed = JSON.parse(body);
    if (typeof parsed === "string") return parsed;
  } catch {}

  return body;
};

const toMarkdownTask = (task: unknown): MarkdownTask => {
  const item = task as Record<string, unknown>;

  return MarkdownTaskSchema.parse({
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status,
    priority: item.priority,
    startAt: item.startAt,
    dueAt: item.dueAt,
  });
};

const createMarkdownTaskListBlock = (tasks: unknown[]) => {
  const block = MarkdownTaskListBlockSchema.parse({
    type: "task-list",
    schemaVersion: 1,
    tasks: tasks.map(toMarkdownTask),
  });

  return `\n\n\`\`\`\`task-list\n${JSON.stringify(block, null, 2)}\n\`\`\`\`\n`;
};

const createTaskAgentTools = (
  db: dbType,
  userId: number,
  emit?: (event: AgentStreamEvent) => void,
  onListTasks?: (tasks: unknown[]) => void,
) => ({
  // TODO:
  //   getTaskDetail
  //   summarizeTodayTasks
  //   summarizeOverdueTasks

  listTasks: tool({
    description: "根据用户指定的任意时间范围，列出该时间范围内需要完成的任务、任务、待办、日程",
    inputSchema: z.object({
      startAt: z.number().int().describe("用户指定的开始时间，毫秒时间戳"),
      endAt: z.number().int().describe("用户指定的结束时间，毫秒时间戳"),
    }),
    execute: async ({ startAt, endAt }) => {
      emit?.({
        type: "status",
        phase: "tool_calling",
        message: "正在查询匹配时间范围内的任务",
      });

      const taskLists = await db
        .select()
        .from(tasksTable)
        .where(and(eq(tasksTable.userId, userId), between(tasksTable.dueAt, startAt, endAt)));

      onListTasks?.(taskLists);

      emit?.({
        type: "status",
        phase: "tool_done",
        message: `已查询到 ${taskLists.length} 个任务`,
      });

      return taskLists;
    },
  }),
});

aiApp.post("stream", async (c) => {
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  try {
    const stream = await aiStreamText({
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

aiApp.post("tasks/stream", async (c) => {
  const db = c.get("db");
  const userId = c.get("user")?.id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const question = await readPromptText(c);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;
      let replyText = "";
      let taskData: unknown[] = [];

      const emit = (event: AgentStreamEvent) => {
        if (isClosed) return;
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      const heartbeat = setInterval(() => {
        emit({ type: "status", phase: "thinking", message: "仍在分析中" });
      }, 10000);

      try {
        emit({ type: "status", phase: "thinking", message: "正在理解你的需求" });

        const result = aiStreamText({
          model: alibaba.languageModel("qwen3.6-flash"),
          providerOptions: {
            alibaba: {
              enableThinking: true,
              // thinkingBudget: 2048,
            } satisfies AlibabaLanguageModelOptions,
          },
          stopWhen: stepCountIs(12),
          system: taskAgentSystem(),
          tools: createTaskAgentTools(db, userId, emit, (tasks) => {
            taskData = tasks;
          }),
          prompt: question,
        });

        for await (const part of result.fullStream) {
          if (part.type === "start-step") {
            emit({ type: "status", phase: "thinking", message: "正在规划下一步" });
          }

          if (part.type === "reasoning-start") {
            emit({ type: "status", phase: "thinking", message: "正在分析任务上下文" });
          }

          if (part.type === "tool-call") {
            emit({
              type: "tool-call",
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              inputSummary: summarize(part.input, "准备调用工具"),
            });
          }

          if (part.type === "tool-result") {
            if (
              taskData.length === 0 &&
              part.toolName === "listTasks" &&
              Array.isArray(part.output)
            ) {
              taskData = part.output;
            }

            emit({
              type: "tool-result",
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              outputSummary: summarize(part.output, "工具调用完成"),
            });
          }

          if (part.type === "text-delta") {
            replyText += part.text;
            emit({ type: "text-delta", text: part.text });
          }

          if (part.type === "finish-step") {
            emit({ type: "status", phase: "drafting", message: "正在整理回复" });
          }
        }

        if (taskData.length > 0) {
          const taskBlock = createMarkdownTaskListBlock(taskData);
          replyText += taskBlock;
          emit({ type: "text-delta", text: taskBlock });
        }

        emit({ type: "final", text: replyText, data: taskData });
        emit({ type: "status", phase: "done", message: "已完成" });
      } catch (e) {
        emit({ type: "error", message: e instanceof Error ? e.message : "AI 请求失败" });
      } finally {
        clearInterval(heartbeat);
        isClosed = true;
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
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

  const question = await readPromptText(c);

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
      system: taskAgentSystem(),
      tools: createTaskAgentTools(db, userId),

      prompt: question,
    });

    console.log(JSON.stringify(result.steps, null, 2));

    const allToolResults = result.steps.flatMap((step) => step.toolResults ?? []);

    const listTasksResult = allToolResults.find((item) => item.toolName === "listTasks");

    if (listTasksResult) {
      const taskBlock = Array.isArray(listTasksResult.output)
        ? createMarkdownTaskListBlock(listTasksResult.output)
        : "";

      return c.json({
        type: "listTasks",
        data: listTasksResult.output,
        text: `${result.text}${taskBlock}`,
      });
    }
    return c.json(result.text);
  } catch (e) {
    return new Response(JSON.stringify({ error: e }));
  }
});

export default aiApp;
