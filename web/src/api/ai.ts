import { useMutation } from "@tanstack/react-query";
import { getJson, getRes } from "./lib/fetch";
import type { TaskType } from "./task";

type AiTaskListsType = {
  type: string;
  data: TaskType[];
  text: string;
};

export type AiAgentStreamEvent =
  | {
      type: "status";
      phase: "thinking" | "tool_calling" | "tool_done" | "drafting" | "done";
      message: string;
    }
  | {
      type: "text-delta";
      text: string;
    }
  | {
      type: "tool-call";
      toolCallId: string;
      toolName: string;
      inputSummary: string;
    }
  | {
      type: "tool-result";
      toolCallId: string;
      toolName: string;
      outputSummary: string;
    }
  | {
      type: "final";
      text: string;
      data: TaskType[];
    }
  | {
      type: "error";
      message: string;
    };

export const useAiTasks = () => {
  return useMutation({
    mutationFn: async (question: string) => {
      const res: AiTaskListsType = await getJson("/api/ai/tasks", "POST", question);
      return res;
    },
  });
};

export const useAiTaskStream = () => {
  return useMutation({
    mutationFn: async ({
      question,
      onEvent,
    }: {
      question: string;
      onEvent: (event: AiAgentStreamEvent) => void;
    }) => {
      const res = await getRes("/api/ai/tasks/stream", "POST", question);
      const reader = res.body?.getReader();

      if (!reader) {
        throw new Error("No response stream");
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let finalResult: { text: string; data: TaskType[] } = { text: "", data: [] };

      while (true) {
        const data = await reader.read();
        if (data.done) break;

        buffer += decoder.decode(data.value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;

          let event: AiAgentStreamEvent;
          try {
            event = JSON.parse(line);
          } catch (e) {
            continue;
          }

          if (event.type === "final") {
            finalResult = { text: event.text, data: event.data };
          }

          onEvent(event);
        }
      }

      return finalResult;
    },
  });
};
