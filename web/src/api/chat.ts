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

  return useMutation({
    mutationFn: (value: { title: string }) => getJson("/api/chat/sessions", "POST", value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
};

export const useMesssages = (sessionId: string) => {
  return useQuery<MessagesType[]>({
    queryKey: ["messages"],
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

export const useNewStream = (sessionId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (value: { role: "user"; content: string }) => {
      const res = await getRes(`/api/chat/sessions/${sessionId}/stream`, "POST", value);
      const stream = res.body;
      return stream;
    },
    onSuccess: async (data) => {
      const reader = data?.getReader();
      if (!reader) return;
      let replyId: number;
      let aiReplyTime: number;

      while (1) {
        const d = await reader.read();
        if (d.done) break;

        const text = new TextDecoder().decode(d.value);

        const value: StreamType = JSON.parse(text);

        if (value.type === "info") {
          qc.setQueryData(["messages"], (oldData: MessagesType[]) => [
            ...oldData,
            value.userMessage,
            value.aiReplyInfo,
          ]);
          replyId = value.aiReplyInfo.id;
          aiReplyTime = value.aiReplyInfo.createdAt;
        }

        if (value.type === "reply") {
          qc.setQueryData(["messages"], (oldData: MessagesType[]) => {
            const old = oldData.filter((s) => s.id !== replyId);
            return [
              ...old,
              {
                id: replyId,
                sessionId: sessionId,
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
