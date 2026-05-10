import { useMesssages, useNewStream, type MessagesType } from "#/api/chat";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import clsx from "clsx";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export const Route = createFileRoute("/_app/chat/$sessionId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sessionId } = Route.useParams();
  const [chatInput, setChatInput] = useState("");
  const [textState, setTextState] = useState(false);

  const { data: messages } = useMesssages(sessionId);
  const { mutate } = useNewStream();

  const handleSend = () => {
    mutate({ role: "user", content: chatInput, sessionId });
    setChatInput("");
    setTextState(true);
    setTimeout(() => {
      setTextState(false);
    }, 2000);
  };

  return (
    <div className="flex flex-1 flex-col items-center p-8">
      <div className="grow w-full h-[82vh] flex flex-col gap-2 items-end overflow-y-auto pb-8">
        {(messages ?? []).map((d) =>
          d ? (
            <div
              key={d.id}
              className={clsx(
                "max-w-3xl text-lg border border-gray-50 rounded-xl p-4",
                d.role === "assistant" ? "self-start" : "self-end",
                d.role === "assistant" ? "bg-slate-100" : "bg-sky-100",
              )}
            >
              {d.content.length > 0 ? (
                <div className="prose prose-lg max-w-none prose-pre:bg-gray-100 prose-pre:text-black prose-code:before:content-none prose-code:after:content-none">
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
                    {d.content}
                  </Markdown>
                </div>
              ) : (
                <Spin size="small" />
              )}
            </div>
          ) : null,
        )}
      </div>

      <div className="w-full flex-1 rounded-xl flex items-center justify-center gap-4 pt-4">
        <TextArea
          value={chatInput}
          placeholder="new message"
          style={{ width: "50%", resize: "none" }}
          autoSize={{ minRows: 1, maxRows: 6 }}
          size="large"
          disabled={textState}
          allowClear
          onChange={(e) => setChatInput(e.target.value)}
          onPressEnter={handleSend}
        />
        <Button size="large" type="primary" onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  );
}
