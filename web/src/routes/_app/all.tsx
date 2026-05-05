import { useGetTasks } from "#/api/task";
import { TaskCard } from "#/components/TaskCard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/all")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isPending, data: allTasks } = useGetTasks();
  if (isPending || !allTasks) {
    return <div>Pending...</div>;
  }
  if (allTasks.length === 0) {
    return <div>no tasks</div>;
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-2 m-4">
      {allTasks.map((task) => (
        <TaskCard task={task} key={task.id} />
      ))}
    </div>
  );
}
