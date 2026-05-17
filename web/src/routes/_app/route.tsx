import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
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

const { Header, Content, Sider } = Layout;

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

const navItems = [
  {
    key: "dashboard",
    title: "Dashboard",
    label: <Link to="/dashboard">DashBoard</Link>,
    icon: <PieChartOutlined />,
  },
  {
    key: "all",
    title: "My Tasks",
    label: <Link to="/all">my tasks</Link>,
    icon: <CheckSquareOutlined />,
  },
  {
    key: "new",
    title: "Add Task",
    label: <Link to="/new">new task</Link>,
    icon: <DesktopOutlined />,
  },
  {
    key: "chat",
    title: "Chat With AI",
    label: <Link to="/chat">chat</Link>,
    icon: <FieldTimeOutlined />,
  },
  {
    key: "assistant",
    title: "AI Assistant",
    label: <Link to="/assistant">AI assistant</Link>,
    icon: <UserOutlined />,
  },
];

const items: MenuItem[] = navItems.map((item) => getItem(item.label, item.key, item.icon));

// const items: MenuItem[] = [
//   getItem(<Link to="/dashboard">DashBoard</Link>, "dashboard", <PieChartOutlined />),
//   getItem(<Link to="/all">my tasks</Link>, "all", <CheckSquareOutlined />),
//   getItem(<Link to="/new">new task</Link>, "new", <DesktopOutlined />),
//   getItem(<Link to="/chat">chat</Link>, "chat", <FieldTimeOutlined />),
//   getItem(<Link to="/assistant">AI assistant</Link>, "assistant", <UserOutlined />),
// ];

function RouteComponent() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const title = navItems.find((item) => item.key === path)?.title ?? "Dashboard";

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
            <h1 className="text-2xl font-semibold m-4">{title}</h1>
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
