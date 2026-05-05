import { useAddTask, type SubmitTaskType } from "#/api/task";
import { TaskForm } from "#/components/TaskForm";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { message } from "antd";

export const Route = createFileRoute("/_app/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const { mutateAsync: addTask } = useAddTask();
  const navigate = useNavigate({ from: "/new" });
  const onSubmit = async (newTask: SubmitTaskType) => {
    try {
      await addTask(newTask, {
        onSuccess: () => {
          message.success("创建任务成功！", 3);
          setTimeout(() => navigate({ to: "/" }), 5000);
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl">
        <TaskForm initialTask={undefined} onSubmit={onSubmit} />
      </div>
    </div>
  );
}
