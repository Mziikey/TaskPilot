export type LoginCredentials = {
  username: string;
  password: string;
};

export const useLogin = async (values: LoginCredentials) => {
  const response = await fetch("/api/auth/login", {
    body: JSON.stringify(values),
    method: "POST",
  });
  const resp = await response.json();

  console.log(resp);
};

export const useLogout = async () => {
  const response = await fetch("/api/auth/logout", {
    body: null,
    method: "POST",
  });
  const resp = await response.json();

  console.log(resp);
};
