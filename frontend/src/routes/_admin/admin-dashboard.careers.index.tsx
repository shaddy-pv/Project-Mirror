import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Plus, Loader2, Trash2, Edit2 } from "lucide-react";
import { adminListCareers, adminDeleteCareer } from "@/lib/admin.functions";
import { useState } from "react";

export const Route = createFileRoute("/_admin/admin-dashboard/careers/")({
  loader: () => adminListCareers(),
  component: AdminCareers,
});

type CareerRow = {
  id: string;
  title: string;
  domain: string;
  isOpen: boolean;
};

function AdminCareers() {
  const initial = Route.useLoaderData() as unknown as CareerRow[];
  const [careers, setCareers] = useState<CareerRow[]>(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this career listing?")) return;
    setDeletingId(id);
    try {
      await adminDeleteCareer({ data: { id } });
      setCareers((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Careers</h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">{careers.length} listing{careers.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          to="/admin-dashboard/careers/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-paper hover:bg-ink/90"
        >
          <Plus className="h-4 w-4" />
          New Career
        </Link>
      </div>

      <div className="mt-8">
        {careers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline py-16 text-center">
            <p className="font-medium">No careers yet</p>
            <p className="mt-1 text-[13px] text-ink-soft">Click "New Career" to create your first job listing.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border hairline">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b hairline bg-secondary/40">
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Domain</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-ink-soft">Actions</th>
                </tr>
              </thead>
              <tbody>
                {careers.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b hairline last:border-0 hover:bg-secondary/20"
                  >
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3 text-ink-soft">{item.domain}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${item.isOpen ? "bg-emerald-50 text-emerald-700" : "bg-secondary text-ink-mute"}`}>
                        {item.isOpen ? "Open" : "Closed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to="/admin-dashboard/careers/$id"
                          params={{ id: item.id }}
                          className="rounded-md p-1.5 text-ink-mute hover:bg-secondary hover:text-ink"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="rounded-md p-1.5 text-ink-mute hover:bg-destructive/10 hover:text-destructive"
                        >
                          {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
