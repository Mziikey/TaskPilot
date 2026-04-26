import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJson } from "./lib/fetch";

export type AddTaskType = {
  title: string;
  description?: string;
  status: "todo" | "doing" | "done";
  priority: "low" | "medium" | "high";
  startAt: number;
  dueAt: number;
};

export type TaskType = {
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
    mutationFn: (values: AddTaskType) => getJson("/api/tasks/add", "POST", values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
};
