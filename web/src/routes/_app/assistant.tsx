import { useAiTasks } from "#/api/ai";
import { TaskCard } from "#/components/TaskCard";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
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
  const { mutate, data, isSuccess, isPending } = useAiTasks();

  const handleSend = async () => {
    await mutate(assistanInput, {
      onSuccess: () => {
        setAssistantInput("");
        setAssistant(null);
      },
    });
  };

  console.log("ai", data);

  return (
    <div className="bg-white m-4 w-full rounded-2xl">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
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
            autoSize={{ minRows: 1, maxRows: 6 }}
            size="large"
            onChange={(e) => setAssistantInput(e.target.value)}
            onPressEnter={handleSend}
          />
          <Button size="large" type="primary" onClick={handleSend}>
            Send
          </Button>
        </div>
        {isSuccess ? (
          <div className="flex flex-col gap-2">
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
              {data.text}
            </Markdown>
            <div className="flex flex-col gap-4">
              {data.data.map((task) => (
                <TaskCard task={task} key={task.id} />
              ))}
            </div>
          </div>
        ) : isPending ? (
          <Spin />
        ) : null}
      </div>
    </div>
  );
}
