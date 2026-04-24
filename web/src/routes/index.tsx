import { useMe } from "#/api/auth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "antd";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { isPending, isError, data: meInfo, error } = useMe();

  if (isPending) return <div>Pending...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  console.log("me", meInfo);

  return (
    <div>
      <Link to="/login">
        <Button>Login</Button>
      </Link>
    </div>
  );
}
