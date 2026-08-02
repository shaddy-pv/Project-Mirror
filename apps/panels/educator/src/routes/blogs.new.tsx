import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/educator/AppShell";
import { BlogForm } from "@/components/educator/BlogForm";
import { RoleGuard } from "@/lib/role";

export const Route = createFileRoute("/blogs/new")({
  head: () => ({
    meta: [
      { title: "Write a blog post — Enginow Educator" },
      { name: "description", content: "Write an Enginow blog post with a title, excerpt, banner and rich-text body." },
      { property: "og:title", content: "Write a blog post — Enginow Educator" },
      { property: "og:description", content: "Draft a post and submit it to Admin for approval." },
    ],
  }),
  component: () => (
    <RoleGuard allow={["educator"]}>
      <AppShell
        title="Write blog post"
        description="Save it as a draft, or submit it to Admin for approval."
        help={{
          title: "Writing a post",
          lines: [
            "Use the toolbar for bold, italics, links, code blocks and quotes.",
            "Banners are optional, but must be 1920×1080 if you add one.",
          ],
        }}
      >
        <BlogForm />
      </AppShell>
    </RoleGuard>
  ),
});
