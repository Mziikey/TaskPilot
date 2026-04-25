import { UseMe } from "#/components/useMe";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Content } from "antd/es/layout/layout";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div>
      <UseMe />
      <Content className="flex flex-1">
        <Outlet />
      </Content>
    </div>
  );
}
