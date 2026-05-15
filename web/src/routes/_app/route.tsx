import { useMe } from "#/api/auth";
import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  CheckSquareOutlined,
  DesktopOutlined,
  FieldTimeOutlined,
  PieChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme } from "antd";
import { ListTodo } from "lucide-react";
import { Me } from "#/components/Me";
import MenuItem from "antd/es/menu/MenuItem";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem(<Link to="/dashboard">DashBoard</Link>, "dashboard", <PieChartOutlined />),
  getItem(<Link to="/all">my tasks</Link>, "all", <CheckSquareOutlined />),
  getItem(<Link to="/new">new task</Link>, "new", <DesktopOutlined />),
  getItem(<Link to="/chat">chat</Link>, "chat", <FieldTimeOutlined />),
  getItem(<Link to="/assistant">AI assistant</Link>, "assistant", <UserOutlined />),
];

function RouteComponent() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const location = useLocation();
  const path = location.pathname.split("/")[1];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{ background: colorBgContainer }}
        width={240}
        collapsedWidth={80}
      >
        <div className="bg-white text-2xl m-4 flex gap-2 items-center justify-center">
          {" "}
          <ListTodo />
          {!collapsed && <span>Task Pilot</span>}
        </div>
        <Menu selectedKeys={[path]} mode="inline" items={items} style={{ height: 100 }} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="flex justify-between pr-4 items-center">
            <h1 className="text-2xl font-semibold m-4">Dashboard</h1>
            <Me />
          </div>
        </Header>
        <Content className="flex flex-1">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
