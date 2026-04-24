export const minifetch = (url: string) => {
  return new Promise<{ status: number; ok: boolean; json: () => Promise<object> }>((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = () => {
      const status = xhr.status;
      if (status >= 200 && status < 300) {
        res({
          status,
          ok: true,
          json: () => Promise.resolve(JSON.parse(xhr.responseText)),
        });
      } else {
        rej(new Error(`HTTP Error: ${status}`));
      }
    };
    xhr.send();
  });
};

export const useReq = async () => {
  const res: { status: number; ok: boolean; json: () => Promise<object> } =
    await minifetch("/api/auth/me");
  console.log(res);
  const resjson: object = await res.json();
  console.log(resjson);
};
