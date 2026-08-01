import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/admin-dashboard/internships")({
  component: () => <Outlet />,
});
