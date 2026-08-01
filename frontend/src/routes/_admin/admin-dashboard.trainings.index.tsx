import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Plus, Loader2, Trash2, Pencil } from "lucide-react";
import { adminListTrainings, adminDeleteTraining } from "@/lib/admin.functions";
import { useState } from "react";

export const Route = createFileRoute("/_admin/admin-dashboard/trainings/")({
  loader: () => adminListTrainings(),
  component: AdminTrainings,
});

type TrainingRow = {
  id: string;
  title: string;
  originalPrice: number;
  discountedPrice: number;
  status: string;
};

function AdminTrainings() {
  const initial = Route.useLoaderData() as unknown as TrainingRow[];
  const [trainings, setTrainings] = useState<TrainingRow[]>(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this training?")) return;
    setDeletingId(id);
    try {
      await adminDeleteTraining(id);
      setTrainings((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trainings</h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">{trainings.length} training{trainings.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link
          to="/admin-dashboard/trainings/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-paper hover:bg-ink/90"
        >
          <Plus className="h-4 w-4" />
          New Training
        </Link>
      </div>

      <div className="mt-8">
        {trainings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline py-16 text-center">
            <p className="font-medium">No trainings yet</p>
            <p className="mt-1 text-[13px] text-ink-soft">Click "New Training" to create your first program.</p>
          </div>
        ) : (
          <div className="rounded-xl border hairline bg-card overflow-hidden">
            <table className="w-full text-left text-[13.5px]">
              <thead className="bg-secondary/50 text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y hairline">
                {trainings.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-4 py-3 font-medium text-ink">
                      {t.title}
                    </td>
                    <td className="px-4 py-3">
                      ₹{t.discountedPrice} <span className="line-through text-ink-mute opacity-70">₹{t.originalPrice}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${t.status === "published" ? "bg-moss/10 text-moss" : "bg-amber/10 text-amber"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          to="/admin-dashboard/trainings/$id"
                          params={{ id: t.id }}
                          className="p-1.5 text-ink-mute hover:text-ink transition-colors rounded-md hover:bg-secondary/60"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="p-1.5 text-ink-mute hover:text-destructive disabled:opacity-50 transition-colors rounded-md hover:bg-destructive/10"
                        >
                          {deletingId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
