import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Bold, Code, Italic, Link2, Quote } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, qk } from "@/lib/api";
import type { Blog } from "@/lib/mock/db";

const schema = z.object({
  title: z.string().min(4, "Give the post a title."),
  excerpt: z.string().min(10, "Write a one-line summary readers will see first."),
  bannerUrl: z.string().optional(),
  body: z.string().min(30, "Write at least a paragraph before sending this for approval."),
});

type FormValues = z.infer<typeof schema>;

export function BlogForm({ blog }: { blog?: Blog }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: blog?.title ?? "",
      excerpt: blog?.excerpt ?? "",
      bannerUrl: blog?.bannerUrl ?? "",
      body: blog?.body ?? "",
    },
  });

  const save = useMutation({
    mutationFn: async (vars: { values: FormValues; status: "Draft" | "Pending" }) => {
      const payload = {
        title: vars.values.title,
        excerpt: vars.values.excerpt,
        body: vars.values.body,
        status: vars.status,
        ...(vars.values.bannerUrl ? { bannerUrl: vars.values.bannerUrl } : {}),
      };
      if (blog) return api.updateBlog(blog.id, payload);
      return api.createBlog(payload);
    },
    onSuccess: (saved, vars) => {
      queryClient.invalidateQueries({ queryKey: qk.blogs });
      queryClient.invalidateQueries({ queryKey: qk.blog(saved.id) });
      toast.success(vars.status === "Draft" ? "Draft saved" : "Blog post sent for approval");
      navigate({ to: "/blogs/$id", params: { id: saved.id } });
    },
    onError: () => toast.error("Couldn't save this post. Please try again."),
  });

  const wrap = (before: string, after: string) => {
    const el = bodyRef.current;
    const value = form.getValues("body");
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "text";
    form.setValue("body", `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`);
  };

  const errors = form.formState.errors;

  return (
    <form className="space-y-5" noValidate onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register("title")} placeholder="What is this post about?" />
        {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="excerpt">Short summary</Label>
        <Input id="excerpt" {...form.register("excerpt")} placeholder="One line readers see first" />
        {errors.excerpt && <p className="text-xs text-danger">{errors.excerpt.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="banner">Banner image link (optional)</Label>
        <Input id="banner" {...form.register("bannerUrl")} placeholder="1920×1080 image link" />
        <p className="text-xs text-muted-foreground">Best results at 1920×1080.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Post</Label>
        <div className="flex flex-wrap gap-1 rounded-t-md border border-b-0 bg-muted px-2 py-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={() => wrap("<strong>", "</strong>")}>
            <Bold /> Bold
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => wrap("<em>", "</em>")}>
            <Italic /> Italic
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => wrap('<a href="#">', "</a>")}>
            <Link2 /> Link
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => wrap("<code>", "</code>")}>
            <Code /> Code
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => wrap("<blockquote>", "</blockquote>")}
          >
            <Quote /> Quote
          </Button>
        </div>
        <Textarea
          id="body"
          rows={12}
          className="rounded-t-none"
          {...form.register("body")}
          ref={(el) => {
            form.register("body").ref(el);
            bodyRef.current = el;
          }}
        />
        {errors.body && <p className="text-xs text-danger">{errors.body.message}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={save.isPending}
          onClick={form.handleSubmit((values) => save.mutate({ values, status: "Pending" }))}
        >
          Send for approval
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={save.isPending}
          onClick={form.handleSubmit((values) => save.mutate({ values, status: "Draft" }))}
        >
          Save draft
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate({ to: "/blogs" })}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
