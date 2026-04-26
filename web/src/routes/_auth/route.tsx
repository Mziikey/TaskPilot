import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AuthIndexPage,
});

import { Outlet } from "@tanstack/react-router";

function AuthIndexPage() {
  return (
    <div>
      <p>fdj</p>
      <Outlet />
    </div>
  );
}
