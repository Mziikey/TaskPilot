import { useGenerateTitle, useNewSession, useNewStream, type SessionsType } from "#/api/chat";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";

export const Route = createFileRoute("/_app/chat/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [chatInput, setChatInput] = useState("");
  const { mutateAsync } = useNewSession();
  const { mutate: newStream } = useNewStream();
  const { mutate: generateTitle } = useGenerateTitle();

  const navigate = useNavigate({ from: "/chat" });
  const handleSend = async () => {
    await mutateAsync(
      { title: "新对话" },
      {
        onSuccess: (data) => {
          setChatInput("");
          const sessionId = String(data.id);
          navigate({ to: sessionId });
          newStream({ role: "user", content: chatInput, sessionId });
          generateTitle(Number(sessionId));
        },
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <p className="font-medium text-3xl pb-8">你在忙什么</p>
      <div className="w-full rounded-xl flex items-center justify-center gap-4">
        <TextArea
          value={chatInput}
          placeholder="new session"
          style={{ width: "50%", resize: "none" }}
          autoSize={{ minRows: 1, maxRows: 6 }}
          size="large"
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
