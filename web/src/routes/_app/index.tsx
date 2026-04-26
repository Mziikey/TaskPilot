import { useGetTasks } from "#/api/task";
import { EditOutlined, EllipsisOutlined, SettingOutlined } from "@ant-design/icons";
import { createFileRoute } from "@tanstack/react-router";
import { Avatar, Card } from "antd";
import { Meta } from "antd/es/list/Item";

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isPending, data: allTasks } = useGetTasks();
  if (isPending || !allTasks || allTasks?.length === 0) {
    return <div>Pending...</div>;
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-2 m-4">
      {allTasks.map((task) => (
        <Card
          style={{ width: 600 }}
          title={task.title}
          actions={[
            <SettingOutlined key="setting" />,
            <EditOutlined key="edit" />,
            <EllipsisOutlined key="ellipsis" />,
          ]}
        >
          <Meta title={task.userId} description={task.description} />
        </Card>
      ))}
    </div>
  );
}
