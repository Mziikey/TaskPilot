import { useAiTaskStream, type AiAgentStreamEvent } from "#/api/ai";
import { MarkdownRenderer } from "#/components/MarkdownRenderer";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Spin, Tag } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import { useState } from "react";

export const Route = createFileRoute("/_app/assistant")({
  component: RouteComponent,
});

const assistantStorageKey = "ai-assistant";

type AssistantHistoryItem = {
  title: string;
  reply: string;
  timestamp: number;
};

const readAssistantHistory = () => {
  const rawHistory = sessionStorage.getItem(assistantStorageKey);
  if (!rawHistory) return [];

  try {
    const history = JSON.parse(rawHistory);
    if (!Array.isArray(history)) return [];

    return history
      .filter((item): item is AssistantHistoryItem => {
        return (
          typeof item?.title === "string" &&
          typeof item?.reply === "string" &&
          typeof item?.timestamp === "number"
        );
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
};

function RouteComponent() {
  const [assistant, setAssistant] = useState<string | null>("需要我帮您做什么");
  const [assistanInput, setAssistantInput] = useState("");
  const [currentReply, setCurrentReply] = useState("");
  const [agentEvents, setAgentEvents] = useState<AiAgentStreamEvent[]>([]);
  const [textLists, setTextLists] = useState<AssistantHistoryItem[]>(readAssistantHistory);
  const { mutate, isPending } = useAiTaskStream();

  const handleSend = () => {
    const question = assistanInput.trim();
    if (!question || isPending) return;

    setAssistant(null);
    setAssistantInput("");
    setCurrentReply("");
    setAgentEvents([]);

    mutate(
      {
        question,
        onEvent: (event) => {
          if (event.type === "text-delta") {
            setCurrentReply((reply) => reply + event.text);
            return;
          }

          if (event.type === "final") return;

          setAgentEvents((events) => [...events, event]);
        },
      },
      {
        onSuccess: (res) => {
          setAssistant(null);
          setCurrentReply("");
          setTextLists((items) => {
            const nextItems = [
              { title: question, reply: res.text, timestamp: Date.now() },
              ...items,
            ];
            sessionStorage.setItem(assistantStorageKey, JSON.stringify(nextItems));
            return nextItems;
          });
        },
      },
    );
  };

  return (
    <div className="bg-white m-4 w-full rounded-2xl max-h-[91vh] overflow-hidden">
      <div className="flex flex-1 flex-col items-center min-h-0 gap-4 h-full">
        {assistant ? (
          <p className="text-2xl pt-8">{assistant}</p>
        ) : (
          <p className="pt-4">AI生成，仅供参考</p>
        )}
        <div className="w-full rounded-xl flex items-center justify-center gap-4">
          <TextArea
            value={assistanInput}
            placeholder="Input your need"
            style={{ width: "50%", resize: "none" }}
            autoSize={{ minRows: 1, maxRows: 2 }}
            size="large"
            disabled={isPending}
            onChange={(e) => setAssistantInput(e.target.value)}
            onPressEnter={handleSend}
          />
          <Button size="large" type="primary" loading={isPending} onClick={handleSend}>
            {isPending ? "Running" : "Send"}
          </Button>
        </div>
        <div className="flex flex-1 gap-2 w-full h-full p-4 min-h-0">
          <div className=" max-h-full w-2/3 pl-4 pb-4 pr-4 flex flex-col gap-4 text-base overflow-auto">
            {currentReply ? (
              <div className="p-4 shadow-lg rounded-2xl bg-gray-50">
                <div className="mb-4 text-lg font-medium">当前回复</div>
                <MarkdownRenderer>{currentReply}</MarkdownRenderer>
              </div>
            ) : null}
            {textLists.map((t) => (
              <div className="p-4 shadow-lg rounded-2xl bg-gray-50" key={t.timestamp}>
                <div className="flex justify-between italic">
                  <div className="text-lg font-medium  mb-4">{t.title}</div>
                  <div className="font-light text-gray-400">
                    {dayjs(t.timestamp).format("MM月DD日 HH:mm")}
                  </div>
                </div>
                <MarkdownRenderer>{t.reply}</MarkdownRenderer>
              </div>
            ))}
          </div>
          <div className=" max-h-full w-1/3 rounded-2xl overflow-auto min-h-0">
            {isPending || agentEvents.length > 0 ? (
              <div className="mb-4 rounded-2xl bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-base font-medium">Agent progress</span>
                  {isPending ? <Spin size="small" /> : null}
                </div>
                <div className="flex flex-col gap-2">
                  {agentEvents.map((event, index) => (
                    <div className="rounded-xl bg-white p-3 text-sm" key={`${event.type}-${index}`}>
                      {event.type === "status" ? (
                        <div className="flex items-center gap-2">
                          <Tag className="m-0" color={event.phase === "done" ? "success" : "blue"}>
                            {event.phase}
                          </Tag>
                          <span>{event.message}</span>
                        </div>
                      ) : event.type === "tool-call" ? (
                        <div>
                          <Tag className="m-0 mb-2" color="processing">
                            tool call
                          </Tag>
                          <div>{event.toolName}</div>
                          <div className="mt-1 text-xs text-gray-500">{event.inputSummary}</div>
                        </div>
                      ) : event.type === "tool-result" ? (
                        <div>
                          <Tag className="m-0 mb-2" color="success">
                            tool done
                          </Tag>
                          <div>{event.toolName}</div>
                          <div className="mt-1 text-xs text-gray-500">{event.outputSummary}</div>
                        </div>
                      ) : event.type === "error" ? (
                        <div className="text-red-500">{event.message}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className=" h-full p-4">
                <p className="w-fit mx-auto text-xl text-gray-400">等待 Agent 运行</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
