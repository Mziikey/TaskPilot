import { useSessions } from "#/api/chat";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { createFileRoute, Link, Outlet, useParams } from "@tanstack/react-router";
import { Breadcrumb, Button, Input, Layout, Menu, Spin, theme } from "antd";
import Sider from "antd/es/layout/Sider";
import { useEffect, useState, type ReactNode } from "react";

export const Route = createFileRoute("/_app/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { data: sessions } = useSessions();

  const items: { key: string; label: ReactNode }[] = (sessions ?? [])
    .map((s) => ({
      key: String(s.id),
      label: (
        <Link to="/chat/$sessionId" params={{ sessionId: String(s.id) }}>
          {s.id} {s.title}
        </Link>
      ),
    }))
    .concat({
      key: "0",
      label: <Link to="/chat">new session</Link>,
    });

  const { sessionId } = useParams({ strict: false });

  return (
    <Layout className="m-10">
      <Layout
        style={{
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <Sider
          className="h-full"
          style={{
            background: colorBgContainer,
            overflow: "scroll",
          }}
          width={300}
          trigger={null}
          collapsible
          collapsed={collapsed}
        >
          <div className="flex bg-blue-500 flex-col gap-4 items-center h-full overflow-auto">
            {!sessions ? (
              <Spin />
            ) : (
              <Menu
                mode="inline"
                defaultSelectedKeys={[sessionId ?? "0"]}
                defaultOpenKeys={["sub1"]}
                style={{ height: "100%" }}
                items={items}
              />
            )}
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </div>
        </Sider>

        <Outlet />
      </Layout>
    </Layout>
  );
}
