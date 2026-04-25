import { useMe } from "#/api/auth";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Button } from "antd";
import { Logout } from "./useLogout";

export const UseMe = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPending, isError, data } = useMe();
  if (isError && location.pathname === "/") {
    navigate({ to: "/auth/login" });
    return null;
  }
  if (isPending || isError)
    return (
      <div>
        <Link to="/auth/login">
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
