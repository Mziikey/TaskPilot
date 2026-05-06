import { Hono } from "hono";
import OpenAI from "openai";
import type { UserInfo } from "./auth.js";
import type { dbType } from "../index.js";
import { streamSSE, streamText } from "hono/streaming";

const aiApp = new Hono<{ Variables: { user: UserInfo | undefined; db: dbType } }>();

aiApp.get("/", async (c) => {
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

    return streamText(c, async (s) => {
      for await (const event of stream) {
        if (event.choices && event.choices.length > 0 && event.choices[0].delta.content) {
          reply = reply + event.choices[0].delta.content;
          await s.writeln(reply);
        }
      }
    });
  } catch (e) {
    console.log(`错误信息：${e}`);
    console.log("请参考文档：https://help.aliyun.com/model-studio/developer-reference/error-code");
    return new Response(JSON.stringify({ error: e }));
  }
});

export default aiApp;
