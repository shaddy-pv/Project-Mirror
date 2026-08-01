import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Loader2, Search } from "lucide-react";
import { adminListUsers, adminSetUserRole } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin-dashboard/users")({
  component: AdminUsers,
});

type UserRow = {
  _id: string;
  fullName?: string;
  collegeName?: string;
  course?: string;
  specialization?: string;
  referralCode?: string;
  createdAt?: string;
  roles?: string[];
};

function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    adminListUsers().then((data) => {
      setUsers(data as unknown as UserRow[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    !query ||
    u.fullName?.toLowerCase().includes(query.toLowerCase()) ||
    u.collegeName?.toLowerCase().includes(query.toLowerCase()) ||
    u._id.toLowerCase().includes(query.toLowerCase())
  );

  async function handleRoleChange(userId: string, newRole: "learner" | "educator" | "hr" | "sales" | "admin") {
    try {
      await adminSetUserRole({ data: { targetUserId: userId, role: newRole } });
      setUsers(users.map(u => {
        if (u._id === userId) {
          if (newRole === "learner") {
             return { ...u, roles: [] };
          }
          return { ...u, roles: [newRole] };
        }
        return u;
      }));
    } catch (e) {
      console.error(e);
      alert("Failed to update role");
    }
  }

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="rounded-md border border-input bg-paper pl-8 pr-3 py-2 text-[13.5px] outline-none focus:ring-1 focus:ring-ring w-52"
          />
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-[13px] text-ink-mute">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed hairline py-16 text-center">
            <p className="font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border hairline">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b hairline bg-secondary/40">
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">College</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Course / Branch</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Referral Code</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Roles</th>
                  <th className="px-4 py-3 text-left font-medium text-ink-soft">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b hairline last:border-0 hover:bg-secondary/20"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.fullName ?? "—"}</p>
                      <p className="mono text-[11px] text-ink-mute">{u._id.slice(0, 12)}…</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{u.collegeName ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {u.course ? `${u.course}${u.specialization ? ` / ${u.specialization}` : ""}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="mono text-[12px] bg-secondary px-2 py-0.5 rounded">
                        {u.referralCode ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        value={u.roles && u.roles.length > 0 ? u.roles[0] : "learner"}
                        onChange={(e) => handleRoleChange(u._id, e.target.value as any)}
                        className="rounded-md border hairline bg-paper px-2 py-1 text-[12px] text-ink outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="learner">Learner</option>
                        <option value="educator">Educator</option>
                        <option value="hr">HR</option>
                        <option value="sales">Sales</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
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
