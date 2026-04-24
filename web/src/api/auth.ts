import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJson, getRes } from "./lib/fetch";

export type LoginCredentials = {
  username: string;
  password: string;
};

export type UserInfo = {
  id: number;
  username: string;
};

export const useLogin = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => getJson("/api/auth/login", "POST", credentials),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auth"] }),
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => getRes("/api/auth/logout", "POST"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auth"] }),
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => getJson("/api/auth/me"),
  });
};
