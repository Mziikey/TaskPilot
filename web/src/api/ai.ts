import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJson, getRes } from "./lib/fetch";
import type { TaskType } from "./task";

type AiTaskListsType = {
  type: string;
  data: TaskType[];
  text: string;
};

export const useAiTasks = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (question: string) => {
      const res: AiTaskListsType = await getJson("/api/ai/tasks", "POST", question);
      return res;
    },
    onSuccess: async (res, Variables) => {
      if (res.type === "listTasks") {
        qc.setQueryData(["ai-assistant", "listTasks", Variables], () => res);
      }
    },
  });
};
