import LoginForm from "#/components/loginForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return (
    <div>
      <LoginForm />
    </div>
  );
}
