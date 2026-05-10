import { useMe } from "#/api/auth";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Button } from "antd";
import { Logout } from "./Logout";

export const Me = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPending, isError, data } = useMe();

  if (isError && location.pathname === "/") {
    navigate({ to: "/login" });
    return null;
  }

  if (isPending) {
    return <p>loading...</p>;
  }

  if (isError)
    return (
      <div>
        <Link to="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );

  return (
    <div className="flex justify-center items-center gap-3">
      <Logout />
      <div className="text-lg font-light">{data.username}</div>
    </div>
  );
};
