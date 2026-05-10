import { useGetTasks } from "#/api/task";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, Progress, Spin } from "antd";

export const DashboardPage = () => {
  const { isPending, data } = useGetTasks();
  if (isPending) {
    return <Spin size="large" />;
  }
  if (!data || data.length === 0) {
    return <Empty />;
  }

  const today = new Date(Date.now()).toDateString();
  const todayTasks = data.filter((task) => new Date(task.startAt).toDateString() === today);
  const todayDue = data.filter((task) => new Date(task.dueAt).toDateString() === today);
  const overDue = data.filter((task) => task.dueAt < Date.now());
  const remain = todayTasks.filter((task) => task.status !== "done");
  const done = todayTasks.filter((task) => task.status === "done");

  return (
    <div className="flex-1 flex-col">
      <div className="flex justify-between m-6 gap-4">
        <div className="bg-white rounded-2xl min-h-40 w-1/3">
          <p className="m-4 pl-2 text-xl font-extralight">Today's tasks</p>
          <p className="m-4 pl-4 text-3xl font-medium">{todayTasks.length}</p>
          <div className="m-4 pl-2 pr-2">
            <Progress percent={(done.length / todayTasks.length) * 100} showInfo={false} />
          </div>
          <p className="m-4 pl-2 text-lg font-thin">
            {done.length} completed, {remain.length} remaining
          </p>
        </div>
        <div className="bg-white rounded-2xl h-40 w-1/3">
          <p className="m-4 pl-2 text-xl font-extralight">Due Soon</p>
          <p className="m-4 pl-4 text-3xl font-medium">{todayDue.length}</p>
          <p className="m-4 pl-2 text-lg font-thin">
            {overDue.length} overdue, {todayDue.length} due today
          </p>
        </div>
        <div className="bg-white rounded-2xl h-40 w-1/3">
          <p className="m-4 pl-2 text-xl font-extralight">Focus Time</p>
          <p className="m-4 pl-4 text-3xl font-medium">
            待添加专注时长
            <span className="pl-1">h</span>
          </p>
          <p className="m-4 pl-2 text-lg font-thin">Planned for today</p>
        </div>
      </div>
      <div className="flex justify-between m-6 gap-4">
        <div className="bg-white rounded-2xl h-40 w-1/2">
          <p className="m-4 pl-2 text-xl font-medium">Today's tasks</p>
          <hr />
          <p className="m-4 pl-4 text-3xl font-medium">
            待添加专注时长
            <span className="pl-1">h</span>
          </p>
          <p className="m-4 pl-2 text-lg font-thin">Planned for today</p>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});
