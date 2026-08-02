import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";
import { api } from "@/lib/api";
import type { Blog } from "@/lib/mock/types";

export function BlogForm({ blog }: { blog?: Blog }) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [title, setTitle] = useState(blog?.title ?? "");
  const [excerpt, setExcerpt] = useState(blog?.excerpt ?? "");
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(blog?.bannerUrl);
  const [body, setBody] = useState(blog?.body ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: (status: "draft" | "pending") =>
      api.saveBlog({
        id: blog?.id,
        title: title.trim(),
        excerpt: excerpt.trim(),
        bannerUrl,
        body,
        status,
        rejectionReason: undefined,
      }),
    onSuccess: (saved, status) => {
      qc.invalidateQueries();
      toast.success(status === "pending" ? "Blog submitted for approval" : "Draft saved");
      navigate({ to: "/blogs/$blogId", params: { blogId: saved.id } });
    },
  });

  const submit = (status: "draft" | "pending") => {
    const e: Record<string, string> = {};
    if (title.trim().length < 4) e["title"] = "Give this post a title of at least 4 characters.";
    if (excerpt.trim().length < 15) e["excerpt"] = "Write a one-line summary readers see in the blog list.";
    if (body.replace(/<[^>]*>/g, "").trim().length < 40) e["body"] = "Write at least a short paragraph before submitting.";
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("A couple of fields still need your attention");
      return;
    }
    save.mutate(status);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">The basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="blog-title">Title</Label>
            <Input
              id="blog-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to actually finish an online course"
            />
            {errors["title"] && <p className="text-sm text-destructive">{errors["title"]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog-excerpt">Short excerpt</Label>
            <Textarea
              id="blog-excerpt"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="One or two lines readers see before opening the post"
            />
            {errors["excerpt"] && <p className="text-sm text-destructive">{errors["excerpt"]}</p>}
          </div>
          <ImageUploader value={bannerUrl} onChange={setBannerUrl} optional />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <RichTextEditor value={body} onChange={setBody} />
          {errors["body"] && <p className="text-sm text-destructive">{errors["body"]}</p>}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button disabled={save.isPending} onClick={() => submit("pending")}>
          Submit blog for approval
        </Button>
        <Button variant="outline" disabled={save.isPending} onClick={() => submit("draft")}>
          Save draft
        </Button>
        <Button variant="ghost" onClick={() => navigate({ to: "/blogs" })}>
          Cancel
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Submitting sends this post to Admin. If they send it back, their reason shows on this post in plain language.
      </p>
    </div>
  );
}
