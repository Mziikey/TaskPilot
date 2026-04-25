import React, { useState } from "react";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Layout, Menu, theme } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import "../styles.css";
import { ListTodo } from "lucide-react";
import { useMe } from "#/api/auth";
import { UseMe } from "#/components/useMe";
import { Logout } from "#/components/useLogout";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootComponent,
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
  getItem("Option 1", "1", <PieChartOutlined />),
  getItem("Option 2", "2", <DesktopOutlined />),
  getItem("User", "sub1", <UserOutlined />, [
    getItem("Tom", "3"),
    getItem("Bill", "4"),
    getItem("Alex", "5"),
  ]),
  getItem("Team", "sub2", <TeamOutlined />, [getItem("Team 1", "6"), getItem("Team 2", "8")]),
  getItem("Files", "9", <FileOutlined />),
];

function RootComponent() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const currentYear = new Date().getFullYear();

  return (
    <QueryClientProvider client={queryClient}>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{ background: colorBgContainer }}
        >
          <div className="bg-white text-2xl m-4 flex gap-2 items-center justify-center">
            {" "}
            <ListTodo />
            {!collapsed && <span>Task Pilot</span>}
          </div>
          <Menu defaultSelectedKeys={["1"]} mode="inline" items={items} style={{ height: 100 }} />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <div className="flex justify-between pr-4 items-center">
              <h1 className="text-2xl font-semibold m-4">Dashboard</h1>
              <div className="flex justify-center items-center gap-3">
                <Logout />
                <UseMe />
              </div>
            </div>
          </Header>

          <Content className="flex">
            <Outlet />
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Ant Design ©{currentYear} Created by Ant UED
          </Footer>
        </Layout>
      </Layout>
    </QueryClientProvider>
  );
}
