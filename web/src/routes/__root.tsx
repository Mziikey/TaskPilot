import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import "../styles.css";
import { Layout, Menu } from "antd";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Layout style={{ minHeight: "100vh" }}>
        <Layout.Sider>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={[
              {
                key: "1",
                label: "nav 1",
              },
              {
                key: "2",
                label: "nav 2",
              },
              {
                key: "3",
                label: "nav 3",
              },
              {
                key: "4",
                label: "nav 4",
              },
            ]}
          />
        </Layout.Sider>
        <Outlet />
      </Layout>
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
