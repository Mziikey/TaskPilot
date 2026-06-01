import { useGetTasks } from "#/api/task";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarOutlined, ClockCircleOutlined, FlagOutlined } from "@ant-design/icons";
import { Card, Empty, List, Progress, Spin, Statistic, Tag, Timeline, Typography } from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";

const { Paragraph, Text } = Typography;

const statusMeta = {
  todo: { label: "Todo", color: "default" },
  doing: { label: "Doing", color: "processing" },
  done: { label: "Done", color: "success" },
};

const priorityMeta = {
  low: { label: "Low", color: "blue" },
  medium: { label: "Medium", color: "gold" },
  high: { label: "High", color: "red" },
};

export const DashboardPage = () => {
  const { isPending, data } = useGetTasks();

  const dashboard = useMemo(() => {
    const tasks = data ?? [];
    const now = dayjs();
    const todayTasks = tasks
      .filter(
        (task) => dayjs(task.startAt).isSame(now, "day") || dayjs(task.dueAt).isSame(now, "day"),
      )
      .sort((a, b) => a.startAt - b.startAt);
    const done = todayTasks.filter((task) => task.status === "done");
    const doing = todayTasks.filter((task) => task.status === "doing");
    const overdue = tasks.filter((task) => task.status !== "done" && task.dueAt < Date.now());
    const nextSevenDays = tasks
      .filter((task) => {
        const dueAt = dayjs(task.dueAt);
        return task.status !== "done" && dueAt.isAfter(now) && dueAt.isBefore(now.add(7, "day"));
      })
      .sort((a, b) => a.dueAt - b.dueAt)
      .slice(0, 5);

    const plannedHours = todayTasks.reduce((total, task) => {
      const duration = Math.max(task.dueAt - task.startAt, 0);
      return total + duration / 1000 / 60 / 60;
    }, 0);

    const completionPercent =
      todayTasks.length === 0 ? 0 : Math.round((done.length / todayTasks.length) * 100);

    return {
      todayTasks,
      done,
      doing,
      overdue,
      nextSevenDays,
      plannedHours,
      completionPercent,
    };
  }, [data]);

  if (isPending) {
    return (
      <div className="grid flex-1 place-items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <Statistic title="Today's tasks" value={dashboard.todayTasks.length} />
          <Progress
            percent={dashboard.completionPercent}
            size="small"
            className="mt-4"
            showInfo={false}
          />
          <Text type="secondary">
            {dashboard.done.length} completed, {dashboard.todayTasks.length - dashboard.done.length}{" "}
            remaining
          </Text>
        </Card>

        <Card className="rounded-2xl">
          <Statistic title="In progress" value={dashboard.doing.length} />
          <Text type="secondary">Tasks currently being worked on</Text>
        </Card>

        <Card className="rounded-2xl">
          <Statistic title="Overdue" value={dashboard.overdue.length} />
          <Text type={dashboard.overdue.length > 0 ? "danger" : "secondary"}>
            {dashboard.overdue.length > 0 ? "Needs attention" : "No overdue tasks"}
          </Text>
        </Card>

        <Card className="rounded-2xl">
          <Statistic title="Planned time" value={dashboard.plannedHours.toFixed(1)} suffix="h" />
          <Text type="secondary">Estimated from today's task range</Text>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card title="Today's tasks" className="rounded-2xl">
          {dashboard.todayTasks.length === 0 ? (
            <Empty description="No tasks scheduled for today" />
          ) : (
            <List
              itemLayout="vertical"
              dataSource={dashboard.todayTasks}
              renderItem={(task) => {
                const status = statusMeta[task.status] ?? statusMeta.todo;
                const priority = priorityMeta[task.priority] ?? priorityMeta.medium;

                return (
                  <List.Item>
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <Paragraph className="mb-2 text-base font-medium" ellipsis={{ rows: 1 }}>
                          {task.title}
                        </Paragraph>
                        {task.description ? (
                          <Paragraph type="secondary" ellipsis={{ rows: 2 }} className="mb-3">
                            {task.description}
                          </Paragraph>
                        ) : null}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                          <span>
                            <CalendarOutlined /> {dayjs(task.startAt).format("HH:mm")}
                          </span>
                          <span>
                            <ClockCircleOutlined /> Due {dayjs(task.dueAt).format("HH:mm")}
                          </span>
                          <span>
                            <FlagOutlined /> {priority.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <Tag color={status.color} className="m-0">
                          {status.label}
                        </Tag>
                        <Tag color={priority.color} className="m-0">
                          {priority.label}
                        </Tag>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Today timeline" className="rounded-2xl">
            {dashboard.todayTasks.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No timeline yet" />
            ) : (
              <Timeline
                items={dashboard.todayTasks.map((task) => ({
                  color:
                    task.status === "done" ? "green" : task.priority === "high" ? "red" : "blue",
                  content: (
                    <div className="min-w-0">
                      <Text className="block font-medium" ellipsis>
                        {task.title}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        {dayjs(task.startAt).format("HH:mm")} - {dayjs(task.dueAt).format("HH:mm")}
                      </Text>
                    </div>
                  ),
                }))}
              />
            )}
          </Card>

          <Card title="Next 7 days" className="rounded-2xl">
            {dashboard.nextSevenDays.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No upcoming tasks" />
            ) : (
              <List
                size="small"
                dataSource={dashboard.nextSevenDays}
                renderItem={(task) => (
                  <List.Item>
                    <div className="flex w-full min-w-0 items-center justify-between gap-3">
                      <Text ellipsis className="min-w-0 flex-1">
                        {task.title}
                      </Text>
                      <Text type="secondary" className="shrink-0 text-xs">
                        {dayjs(task.dueAt).format("MM-DD HH:mm")}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});
