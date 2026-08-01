import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/trainings")({
  component: TrainingsLayout,
});

function TrainingsLayout() {
  return <Outlet />;
}
