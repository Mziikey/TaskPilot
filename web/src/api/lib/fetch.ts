export type AppError = {
  error: "NetworkError" | "InvalidJson" | "UnknownError" | "Unauthorized";
};

export const fetchWithError = async (input: RequestInfo | URL, init?: RequestInit) => {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    throw { error: "NetworkError" };
  }

  if (res.ok) {
    return res;
  }

  if (res.status === 401) {
    throw { error: "Unauthorized" };
  }

  let error: any;
  try {
    error = await res.json();
  } catch {}
  if (error !== undefined) throw error;

  throw { error: "UnknownError" };
};

export const getRes = async (
  input: RequestInfo | URL,
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<Response> => {
  const init: RequestInit = {
    method,
    credentials: "include",
  };

  if (body) {
    init.body = JSON.stringify(body);
    init.headers = [["Content-Type", "application/json"]];
  }

  const res = await fetchWithError(input, init);

  return res;
};

export const getJson = async <T>(
  input: RequestInfo | URL,
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> => {
  const res = await getRes(input, method, body);

  try {
    return await res.json();
  } catch {
    throw { error: "InvalidJson" };
  }
};
