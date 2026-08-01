import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Plus, Loader2, Trash2, Eye } from "lucide-react";
import { adminListCourses, adminDeleteCourse } from "@/lib/admin.functions";
import { useState } from "react";

export const Route = createFileRoute("/_admin/admin-dashboard/courses/")({
  loader: () => adminListCourses(),
  component: AdminCourses,
});

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  status: string;
  isFree: boolean;
  price: number;
};

function AdminCourses() {
  const initial = Route.useLoaderData() as unknown as CourseRow[];
  const [courses, setCourses] = useState<CourseRow[]>(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    setDeletingId(id);
    try {
      await adminDeleteCourse({ data: { id } });
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">{courses.length} course{courses.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link
          to="/admin-dashboard/courses/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-paper hover:bg-ink/90"
        >
          <Plus className="h-4 w-4" />
          New Course
        </Link>
      </div>

      <div className="mt-8">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline py-16 text-center">
            <p className="font-medium">No courses yet</p>
            <p className="mt-1 text-[13px] text-ink-soft">Click "New Course" to create your first course.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border hairline">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b hairline bg-secondary/40">
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Level</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Price</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-ink-soft">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b hairline last:border-0 hover:bg-secondary/20"
                  >
                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3 text-ink-soft">{c.category}</td>
                    <td className="px-4 py-3 text-ink-soft">{c.level}</td>
                    <td className="px-4 py-3">{c.isFree ? <span className="text-emerald-600 font-medium">Free</span> : `₹${c.price}`}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${c.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/courses/${c.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md p-1.5 text-ink-mute hover:bg-secondary hover:text-ink"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <Link
                          to={`/admin-dashboard/courses/${c.id}` as any}
                          className="rounded-md p-1.5 text-ink-mute hover:bg-secondary hover:text-ink"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          className="rounded-md p-1.5 text-ink-mute hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
                        >
                          {deletingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
