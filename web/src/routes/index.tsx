import LoginForm from "#/components/loginForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <div>
      <LoginForm />
    </div>
  );
}
