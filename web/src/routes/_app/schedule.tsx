import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/schedule")({
  component: RouteComponent,
});

function RouteComponent() {
  const [data, setData] = useState("uuu");

  useEffect(() => {
    const printer = async () => {
      const res = await fetch("/api/sse");
      const stream = res.body;

      const reader = stream?.getReader();
      if (!reader) return;

      while (1) {
        const data = await reader.read();
        if (data.done) break;

        const decoder = new TextDecoder();
        const value = decoder.decode(data.value);
        const buffer = value.split("\n")[1].slice(5);
        setData(buffer);
      }
    };

    printer();
    // const eventSource = new EventSource("/api/sse");
    // eventSource.addEventListener("my_counter", (event) => {
    //   console.log(event);
    // });
  }, []);

  return <div>{data}</div>;
}
