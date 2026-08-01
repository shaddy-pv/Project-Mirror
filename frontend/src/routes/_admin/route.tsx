import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { firebaseAuth } from "@/integrations/firebase/client";
import { isUserAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin")({
  ssr: false,
  beforeLoad: async () => {
    await firebaseAuth.authStateReady();
    const user = firebaseAuth.currentUser;
    if (!user) {
      throw redirect({ to: "/auth" });
    }
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      throw redirect({ to: "/" });
    }
    return { user };
  },
  component: () => <Outlet />,
});
