import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJson, getRes } from "./lib/fetch";

export type SessionsType = {
  id: number;
  userId: number;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export type MessagesType = {
  id: number;
  sessionId: number;
  role: "user" | "assistant";
  content: "string";
  createdAt: number;
};

export const useSessions = () => {
  return useQuery<SessionsType[]>({
    queryKey: ["sessions"],
    queryFn: () => getJson("/api/chat/sessions", "GET"),
  });
};

export const useNewSession = () => {
  const qc = useQueryClient();

  return useMutation<SessionsType, Error, { title: string }>({
    mutationFn: (value) => getJson("/api/chat/sessions", "POST", value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
};

export const useDeleteSession = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => getJson(`/api/chat/sessions/${sessionId}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
};

export const useMesssages = (sessionId: string) => {
  return useQuery<MessagesType[]>({
    queryKey: ["messages", sessionId],
    queryFn: () => getJson(`/api/chat/sessions/${sessionId}/messages`, "GET"),
  });
};

type StreamType =
  | {
      type: "info";
      userMessage: MessagesType;
      aiReplyInfo: MessagesType;
    }
  | {
      type: "reply";
      reply: string;
    };

export const useNewStream = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (value: { role: "user"; content: string; sessionId: string }) => {
      const sessionId = value.sessionId;
      const data = { role: "user", content: value.content };
      const res = await getRes(`/api/chat/sessions/${sessionId}/stream`, "POST", data);
      const stream = res.body;
      return stream;
    },
    onSuccess: async (data, variables) => {
      const reader = data?.getReader();
      if (!reader) return;
      let replyId: number;
      let aiReplyTime: number;

      const olded = qc.getQueryData(["messages", variables.sessionId]);
      console.log("olded", olded);

      while (1) {
        const d = await reader.read();
        if (d.done) break;

        const text = new TextDecoder().decode(d.value);

        const value: StreamType = JSON.parse(text);

        if (value.type === "info") {
          qc.setQueryData(["messages", variables.sessionId], (oldData: MessagesType[]) => {
            const data = oldData.filter(
              (d) => d.id !== value.userMessage.id && d.id !== value.aiReplyInfo.id,
            );
            return [...data, value.userMessage, value.aiReplyInfo];
          });
          replyId = value.aiReplyInfo.id;
          aiReplyTime = value.aiReplyInfo.createdAt;
        }

        if (value.type === "reply") {
          qc.setQueryData(["messages", variables.sessionId], (oldData: MessagesType[]) => {
            const old = oldData.filter((s) => s.id !== replyId);
            return [
              ...old,
              {
                id: replyId,
                sessionId: variables.sessionId,
                role: "assistant",
                content: value.reply,
                createdAt: aiReplyTime,
              },
            ];
          });
        }
      }
    },
  });
};
