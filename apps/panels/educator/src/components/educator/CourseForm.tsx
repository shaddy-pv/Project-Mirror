import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "./ImageUploader";
import { RepeatableLinkNotes } from "./RepeatableLinkNotes";
import { ModuleBuilder } from "./ModuleBuilder";
import { api } from "@/lib/api";
import type { Category, Course, CourseBadge, PricingType } from "@/lib/mock/types";

const categories: Category[] = ["AI", "Development", "Data Science", "Electronics", "Core Engineering"];

export function CourseForm({
  kind,
  course,
}: {
  kind: Course["kind"];
  course?: Course;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const noun = kind === "training" ? "training program" : "course";

  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [category, setCategory] = useState<Category>(course?.category ?? "AI");
  const [pricing, setPricing] = useState<PricingType>(course?.pricing ?? "free");
  const [badges, setBadges] = useState<CourseBadge[]>(course?.badges ?? []);
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(course?.bannerUrl);
  const [videos, setVideos] = useState(course?.videos ?? []);
  const [modules, setModules] = useState(course?.modules ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: (status: "draft" | "pending") =>
      api.saveCourse({
        id: course?.id,
        kind,
        title: title.trim(),
        description: description.trim(),
        category,
        pricing,
        badges,
        bannerUrl,
        videos: videos.filter((v) => v.url.trim()),
        modules: modules.filter((m) => m.title.trim()),
        status,
        rejectionReason: undefined,
      }),
    onSuccess: (saved, status) => {
      qc.invalidateQueries();
      if (status === "pending") toast.success(`${noun === "course" ? "Course" : "Training program"} submitted for approval`);
      else toast.success("Draft saved");
      navigate({ to: "/courses/$courseId", params: { courseId: saved.id } });
    },
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (title.trim().length < 4) e["title"] = "Give this a title of at least 4 characters.";
    if (description.trim().length < 20) e["description"] = "Write at least a sentence or two so learners know what they get.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (status: "draft" | "pending") => {
    if (!validate()) {
      toast.error("A couple of fields still need your attention");
      return;
    }
    save.mutate(status);
  };

  const toggleBadge = (b: CourseBadge) =>
    setBadges((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));

  return (
    <div className="max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">The basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={kind === "training" ? "e.g. 6-Week AI Internship Training" : "e.g. Machine Learning Foundations"}
            />
            {errors["title"] && <p className="text-sm text-destructive">{errors["title"]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will learners be able to do after finishing this?"
            />
            {errors["description"] && <p className="text-sm text-destructive">{errors["description"]}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pricing</Label>
              <Select value={pricing} onValueChange={(v) => setPricing(v as PricingType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Badges shown to learners</Label>
            <div className="flex gap-6 pt-1">
              {(["new", "popular"] as CourseBadge[]).map((b) => (
                <label key={b} className="flex items-center gap-2 text-sm capitalize">
                  <Checkbox checked={badges.includes(b)} onCheckedChange={() => toggleBadge(b)} />
                  {b}
                </label>
              ))}
            </div>
          </div>

          <ImageUploader value={bannerUrl} onChange={setBannerUrl} optional />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <RepeatableLinkNotes value={videos} onChange={setVideos} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <ModuleBuilder value={modules} onChange={setModules} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button disabled={save.isPending} onClick={() => submit("pending")}>
          Submit {noun} for approval
        </Button>
        <Button variant="outline" disabled={save.isPending} onClick={() => submit("draft")}>
          Save draft
        </Button>
        <Button variant="ghost" onClick={() => navigate({ to: "/courses" })}>
          Cancel
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Submitting sends this {noun} to Admin. It stays in your list with a “Pending approval” badge until they review
        it.
      </p>
    </div>
  );
}
