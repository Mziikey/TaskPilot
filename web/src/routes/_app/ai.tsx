import { PlusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Input, Layout, Spin } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/ai")({
  component: RouteComponent,
});

function RouteComponent() {
  const [data, setData] = useState("pending");
  const [chatInput, setChatInput] = useState("");

  // useEffect(() => {
  //   const printer = async () => {
  //     const res = await fetch("/api/ai");
  //     const stream = res.body;

  //     const reader = stream?.getReader();
  //     if (!reader) return;

  //     while (1) {
  //       const data = await reader.read();
  //       if (data.done) break;

  //       const decoder = new TextDecoder();
  //       const value = decoder.decode(data.value);
  //       const buffer = value.split("\n")[1].slice(5);
  //       setData(buffer);
  //     }
  //   };

  //   printer();
  // }, []);

  // if (data === "pending") {
  //   return <Spin />;
  // }

  const contentStyle: React.CSSProperties = {
    textAlign: "center",
    minHeight: 120,
    lineHeight: "120px",
    color: "#fff",
    backgroundColor: "#fff",
  };

  const siderStyle: React.CSSProperties = {
    textAlign: "center",
    lineHeight: "120px",
    color: "#fff",
    backgroundColor: "#1677ff",
  };

  const footerStyle: React.CSSProperties = {
    textAlign: "center",
    color: "#fff",
    backgroundColor: "#4096ff",
    height: "10%",
  };

  const layoutStyle = {
    borderRadius: 8,
    overflow: "hidden",
    width: "calc(100% - 8px)",
    maxWidth: "calc(100% - 8px)",
  };

  return (
    <div className="flex flex-1 m-10">
      <Layout style={layoutStyle}>
        <Sider width="15%" style={siderStyle} className="bg-green">
          Sider
        </Sider>
        <Layout>
          <Content style={contentStyle}>Content</Content>
          <Footer style={footerStyle} className="flex justify-center">
            <div className="flex items-center justify-between w-3/4 border-2 gap-4">
              <Input
                placeholder="有问题，尽管问"
                size="large"
                onChange={(e) => setChatInput(e.target.value)}
              />
              <Button shape="circle" size="large">
                <PlusOutlined />
              </Button>
            </div>
          </Footer>
        </Layout>
      </Layout>
      {/* {data} */}
    </div>
  );
}
