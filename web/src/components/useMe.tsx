import { useMe } from "#/api/auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "antd";

export const UseMe = () => {
  const navigate = useNavigate({ from: "/" });
  const { isPending, isError, data } = useMe();
  if (isPending)
    return (
      <div>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  if (isError) {
    navigate({ to: "/login" });
    return null;
  }

  return <div className="text-lg font-light">{data.username}</div>;
};
