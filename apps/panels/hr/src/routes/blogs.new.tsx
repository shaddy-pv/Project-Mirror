import { createFileRoute } from "@tanstack/react-router";

import { BlogForm } from "@/components/hr/BlogForm";
import { PageHeader } from "@/components/hr/PageHeader";

export const Route = createFileRoute("/blogs/new")({
  head: () => ({
    meta: [
      { title: "Write a blog post — Enginow HR" },
      {
        name: "description",
        content: "Write a careers blog post with a summary, banner and formatted body text.",
      },
      { property: "og:title", content: "Write a blog post — Enginow HR" },
      { property: "og:description", content: "Write a careers blog post for Admin approval." },
    ],
  }),
  component: NewBlogPage,
});

function NewBlogPage() {
  return (
    <>
      <PageHeader
        title="Write blog post"
        subtitle="Save it as a draft, or send it to Admin for approval."
        help={[
          "Drafts stay private to you. Sending for approval passes it to an Admin to publish.",
          "Use the formatting buttons for bold, italics, links, code and quotes.",
        ]}
      />
      <div className="max-w-3xl px-6 py-6">
        <BlogForm />
      </div>
    </>
  );
}
