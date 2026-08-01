import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Plus, Loader2, Trash2, Edit2 } from "lucide-react";
import { adminListInternships, adminDeleteInternship } from "@/lib/admin.functions";
import { useState } from "react";

export const Route = createFileRoute("/_admin/admin-dashboard/internships/")({
  loader: () => adminListInternships(),
  component: AdminInternships,
});

type InternshipRow = {
  id: string;
  title: string;
  type: string;
  domain: string;
  duration: string;
  isOpen: boolean;
};

const TYPE_COLORS: Record<string, string> = {
  Summer: "bg-orange-50 text-orange-700",
  Monsoon: "bg-blue-50 text-blue-700",
  Winter: "bg-indigo-50 text-indigo-700",
  Spring: "bg-emerald-50 text-emerald-700",
};

function AdminInternships() {
  const initial = Route.useLoaderData() as unknown as InternshipRow[];
  const [internships, setInternships] = useState<InternshipRow[]>(initial);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this internship listing?")) return;
    setDeletingId(id);
    try {
      await adminDeleteInternship({ data: { id } });
      setInternships((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Internships</h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">{internships.length} listing{internships.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          to="/admin-dashboard/internships/new"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium text-paper hover:bg-ink/90"
        >
          <Plus className="h-4 w-4" />
          New Internship
        </Link>
      </div>

      <div className="mt-8">
        {internships.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline py-16 text-center">
            <p className="font-medium">No internships yet</p>
            <p className="mt-1 text-[13px] text-ink-soft">Click "New Internship" to create your first listing.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border hairline">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b hairline bg-secondary/40">
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Domain</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Duration</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-ink-soft">Actions</th>
                </tr>
              </thead>
              <tbody>
                {internships.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b hairline last:border-0 hover:bg-secondary/20"
                  >
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${TYPE_COLORS[item.type] ?? "bg-secondary text-ink-soft"}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{item.domain}</td>
                    <td className="px-4 py-3 text-ink-soft">{item.duration}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${item.isOpen ? "bg-emerald-50 text-emerald-700" : "bg-secondary text-ink-mute"}`}>
                        {item.isOpen ? "Open" : "Closed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to="/admin-dashboard/internships/$id"
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
