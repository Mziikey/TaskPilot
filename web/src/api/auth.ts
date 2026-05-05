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

export type RegisterInfo = {
  username: string;
  nickname: string;
  password: string;
};

export const useLogin = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => getJson("/api/auth/login", "POST", credentials),
    onSuccess: () => qc.resetQueries({ queryKey: ["auth"] }),
  });
};

export const useRegister = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (register: RegisterInfo) => {
      console.log(register);
      return getJson("/api/auth/register", "POST", register);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auth", "me"] }),
  });
};

export const useLogout = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => getRes("/api/auth/logout", "POST"),
    onSuccess: qc.clear,
  });
};

export const useMe = () => {
  return useQuery<LoginCredentials>({
    queryKey: ["auth", "me"],
    queryFn: () => getJson("/api/auth/me"),
    retry: 1,
  });
};
