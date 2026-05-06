import { useDeleteSession, useSessions } from "#/api/chat";
import {
  CloseOutlined,
  ExclamationCircleFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { Breadcrumb, Button, Input, Layout, Menu, Modal, Spin, theme } from "antd";
import Sider from "antd/es/layout/Sider";
import { useEffect, useState, type ReactNode } from "react";

export const Route = createFileRoute("/_app/chat")({
  component: RouteComponent,
});

const { confirm } = Modal;

function RouteComponent() {
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { mutate } = useDeleteSession();
  const navigate = useNavigate({ from: "/chat/$sessionId" });

  const showDeleteConfirm = (deleteSessionId: number) => {
    confirm({
      title: "Are you sure delete this session?",
      icon: <ExclamationCircleFilled />,
      content: "一旦删除不可撤销",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        mutate(deleteSessionId);
        navigate({ to: "/chat" });
      },
    });
  };

  const { data: sessions } = useSessions();

  const items: { key: string; label: ReactNode; extra: ReactNode }[] = (sessions ?? [])
    .map((s) => ({
      key: String(s.id),
      label: (
        <Link to="/chat/$sessionId" params={{ sessionId: String(s.id) }}>
          {s.id} {s.title}
        </Link>
      ),
      extra: (
        <Button type="text" onClick={() => showDeleteConfirm(s.id)} className="mt-1">
          <CloseOutlined />
        </Button>
      ),
    }))
    .concat({
      key: "0",
      label: <Link to="/chat">new session</Link>,
      extra: <div />,
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
                selectedKeys={[sessionId ?? "0"]}
                style={{ height: "100%", overflow: "auto" }}
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
