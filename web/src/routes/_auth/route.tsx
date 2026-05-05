import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AuthIndexPage,
});

import { Outlet } from "@tanstack/react-router";

function AuthIndexPage() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
