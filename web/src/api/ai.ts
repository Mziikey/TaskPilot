import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJson } from "./lib/fetch";
import type { TaskType } from "./task";

type AiTaskListsType = {
  type: string;
  data: TaskType[];
  text: string;
};

export const useAiTasks = () => {
  return useMutation({
    mutationFn: async (question: string) => {
      const res: AiTaskListsType = await getJson("/api/ai/tasks", "POST", question);
      return res;
    },
  });
};
