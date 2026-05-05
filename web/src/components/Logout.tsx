import { useLogout } from "#/api/auth";
import { Button } from "antd";

export const Logout = () => {
  const logout = useLogout();
  return (
    <Button type="primary" onClick={() => logout.mutate()}>
      Logout
    </Button>
  );
};
