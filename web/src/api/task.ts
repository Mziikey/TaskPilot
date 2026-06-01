import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJson } from "./lib/fetch";

export type SubmitTaskType = {
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  startAt: number;
  dueAt: number;
};

export type TaskType = {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  startAt: number;
  dueAt: number;
  createdAt: number;
  userId: number;
};

export const useGetTasks = () => {
  return useQuery<TaskType[]>({
    queryKey: ["tasks"],
    queryFn: () => getJson("/api/tasks", "GET"),
  });
};

export const useAddTask = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (values: SubmitTaskType) => getJson("/api/tasks/add", "POST", values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
};

export const useEditTask = (taskId: number) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (values: SubmitTaskType) => getJson(`/api/tasks/edit/${taskId}`, "POST", values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
};

export const useCompleteTask = (taskId: number) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () =>
      getJson<{ taskId: number; status: TaskType["status"] }>(
        `/api/tasks/complete/${taskId}`,
        "POST",
      ),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["tasks"] });

      const previousTasks = qc.getQueryData<TaskType[]>(["tasks"]);

      qc.setQueryData<TaskType[]>(["tasks"], (oldTasks) =>
        oldTasks?.map((task) => (task.id === taskId ? { ...task, status: "done" } : task)),
      );

      return { previousTasks };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        qc.setQueryData(["tasks"], context.previousTasks);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
};

export const useDeleteTask = (taskId: number) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => getJson(`/api/tasks/delete/${taskId}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
};
