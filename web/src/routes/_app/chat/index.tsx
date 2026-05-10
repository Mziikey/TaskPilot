import { useNewSession, useNewStream, type SessionsType } from "#/api/chat";
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

  const navigate = useNavigate({ from: "/chat" });
  const handleSend = async () => {
    await mutateAsync(
      { title: chatInput },
      {
        onSuccess: (data) => {
          setChatInput("");
          const sessionId = String(data.id);
          navigate({ to: sessionId });
          newStream({ role: "user", content: chatInput, sessionId });
        },
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="h-[82vh]" />
      <div className="h-1/10 w-full rounded-xl flex items-center justify-center gap-4">
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
