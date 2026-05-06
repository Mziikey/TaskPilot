import { useMesssages, useNewStream, type MessagesType } from "#/api/chat";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import clsx from "clsx";
import { useState } from "react";

export const Route = createFileRoute("/_app/chat/$sessionId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { sessionId } = Route.useParams();
  const [chatInput, setChatInput] = useState("");

  const { data: messages } = useMesssages(sessionId);
  const { mutate } = useNewStream(sessionId);
  const handleSend = () => {
    mutate({ role: "user", content: chatInput });
  };

  return (
    <div className="flex flex-1 flex-col items-center p-8">
      <div className="grow w-full max-h-[82vh] flex flex-col gap-2 items-end overflow-y-auto pb-8">
        {(messages ?? []).map((d) =>
          d ? (
            <div
              className={clsx(
                "max-w-xl text-lg border border-gray-50 rounded-xl p-3",
                d.role === "assistant" ? "self-start" : "self-end",
                d.role === "assistant" ? "bg-slate-100" : "bg-sky-100",
              )}
            >
              {d.content.length > 0 ? d.content : <Spin size="small" />}
            </div>
          ) : null,
        )}
      </div>

      <div className="w-full rounded-xl flex items-center justify-center gap-4 pt-4">
        <TextArea
          placeholder="new session"
          style={{ width: "50%", resize: "none" }}
          autoSize={{ minRows: 1, maxRows: 6 }}
          size="large"
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
