import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Input, Layout, theme } from "antd";
import TextArea from "antd/es/input/TextArea";
import { Content, Footer } from "antd/es/layout/layout";
import { useState } from "react";

export const Route = createFileRoute("/_app/chat/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [chatInput, setChatInput] = useState("");

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="h-9/10">content</div>
      <div className="h-1/10 w-full rounded-xl flex items-center justify-center gap-4">
        <TextArea
          placeholder="new session"
          style={{ width: "50%", resize: "none" }}
          autoSize={{ minRows: 1, maxRows: 6 }}
          size="large"
          onChange={(e) => setChatInput(e.target.value)}
        />
        <Button size="large" type="primary">
          Send
        </Button>
      </div>
    </div>
  );
}
