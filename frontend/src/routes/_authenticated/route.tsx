import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { firebaseAuth } from "@/integrations/firebase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // Wait for Firebase to resolve the persisted session from localStorage
    await firebaseAuth.authStateReady();
    const user = firebaseAuth.currentUser;
    if (!user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    return { user };
  },
  component: () => <Outlet />,
});
