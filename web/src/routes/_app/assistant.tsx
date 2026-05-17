import { useAiTasks } from "#/api/ai";
import { TaskSummaryCard } from "#/components/TaskSummaryCard";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import { useState } from "react";
import Markdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/_app/assistant")({
  component: RouteComponent,
});

function RouteComponent() {
  const [assistant, setAssistant] = useState<string | null>("需要我帮您做什么");
  const [assistanInput, setAssistantInput] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const { mutate, data, isSuccess, isPending } = useAiTasks();

  const assistanText = sessionStorage.getItem("ai-assistant");
  const textLists: { title: string; reply: string; timestamp: number }[] = JSON.parse(
    assistanText ? assistanText : "[]",
  ).reverse();

  const handleSend = () => {
    setIsDisabled(true);
    setTimeout(() => {
      setIsDisabled(false);
      setAssistantInput("");
    }, 2000);
    mutate(assistanInput, {
      onSuccess: (res) => {
        setAssistant(null);
        sessionStorage.setItem(
          "ai-assistant",
          JSON.stringify([
            ...textLists,
            { title: assistanInput, reply: res.text, timestamp: Date.now() },
          ]),
        );
      },
    });
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
            disabled={isDisabled}
            onChange={(e) => setAssistantInput(e.target.value)}
            onPressEnter={handleSend}
          />
          <Button size="large" type="primary" onClick={handleSend}>
            Send
          </Button>
        </div>
        <div className="flex flex-1 gap-2 w-full h-full p-4 min-h-0">
          <div className=" max-h-full w-2/3 pl-4 pr-4 flex flex-col gap-4 text-base overflow-auto">
            {textLists.map((t) => (
              <div className="p-4 shadow-lg rounded-2xl bg-gray-50">
                <div className="flex justify-between italic">
                  <div className="text-lg font-medium  mb-4">{t.title}</div>
                  <div className="font-light text-gray-400">
                    {dayjs(t.timestamp).format("MM月DD日 HH:mm")}
                  </div>
                </div>
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code(props) {
                      const { children, className } = props;
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <SyntaxHighlighter language={match[1]}>
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code>{children}</code>
                      );
                    },
                  }}
                >
                  {t.reply}
                </Markdown>
              </div>
            ))}
          </div>
          <div className=" max-h-full w-1/3 rounded-2xl overflow-auto min-h-0">
            {isSuccess ? (
              <div className="flex flex-col gap-4 p-2">
                {data.data.map((task) => (
                  <TaskSummaryCard task={task} key={task.id} />
                ))}
              </div>
            ) : isPending ? (
              <div className="grid bg-slate-50 h-full place-items-center">
                <Spin size="large" />
              </div>
            ) : (
              <div className=" h-full p-4">
                <p className="w-fit mx-auto text-xl text-gray-400">待加载示任务列表</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
