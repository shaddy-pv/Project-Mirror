"use client";

import React, { useState, useEffect } from "react";
import PortalLoginGate from "@/components/portals/PortalLoginGate";
import {
  staffGetStats,
  staffGetUsers,
  staffGetCourses,
  staffGetTrainings,
  staffGetInternships,
  staffGetCareers,
  staffGetOrders,
  staffApproveCourse,
  staffRejectCourse,
  staffApproveTraining,
  staffRejectTraining,
  staffApproveInternship,
  staffRejectInternship,
  staffApproveCareer,
  staffRejectCareer,
  staffDeleteCourse,
  staffDeleteTraining,
  staffDeleteInternship,
  staffDeleteCareer,
  staffUpdateOrderTracking,
} from "@/lib/staff.functions";
import {
  Users,
  BookOpen,
  Briefcase,
  Building2,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Search,
  ExternalLink,
  ShieldCheck,
  Award,
  Layers,
  Truck,
  Eye,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AdminPortalPage() {
  return (
    <PortalLoginGate
      portal="admin"
      title="Enginow Master Command"
      subtitle="Centralized management of courses, talent pipelines, commerce, and platform users"
    >
      {(user) => <AdminDashboardContent />}
    </PortalLoginGate>
  );
}

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState<"approvals" | "learners" | "courses" | "careers" | "orders" | "staff">("approvals");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Search filter
  const [search, setSearch] = useState("");

  // Reject dialog state
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; type: string; id: string; reason: string }>({
    open: false,
    type: "",
    id: "",
    reason: "",
  });

  // Tracking update dialog
  const [trackingDialog, setTrackingDialog] = useState<{ open: boolean; orderId: string; trackingId: string; trackingSite: string; status: string }>({
    open: false,
    orderId: "",
    trackingId: "",
    trackingSite: "",
    status: "shipped",
  });

  // Learners modal for a specific course
  const [learnersModal, setLearnersModal] = useState<{ open: boolean; title: string; learners: any[] }>({
    open: false,
    title: "",
    learners: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [st, u, c, t, i, cr, ord] = await Promise.all([
        staffGetStats("admin").catch(() => ({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0 })),
        staffGetUsers("admin").catch(() => []),
        staffGetCourses("admin").catch(() => []),
        staffGetTrainings("admin").catch(() => []),
        staffGetInternships("admin").catch(() => []),
        staffGetCareers("admin").catch(() => []),
        staffGetOrders("admin").catch(() => []),
      ]);
      setStats(st);
      setUsers(Array.isArray(u) ? u : []);
      setCourses(Array.isArray(c) ? c : []);
      setTrainings(Array.isArray(t) ? t : []);
      setInternships(Array.isArray(i) ? i : []);
      setCareers(Array.isArray(cr) ? cr : []);
      setOrders(Array.isArray(ord) ? ord : []);
    } catch (e: any) {
      toast.error("Failed to load admin dataset: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingCourses = courses.filter((c) => c.status === "pending_approval");
  const pendingTrainings = trainings.filter((t) => t.status === "pending_approval");
  const pendingInternships = internships.filter((i) => i.status === "pending_approval");
  const pendingCareers = careers.filter((c) => c.status === "pending_approval");
  const totalPending = pendingCourses.length + pendingTrainings.length + pendingInternships.length + pendingCareers.length;

  const handleApprove = async (type: "course" | "training" | "internship" | "career", id: string) => {
    try {
      if (type === "course") await staffApproveCourse("admin", id);
      else if (type === "training") await staffApproveTraining("admin", id);
      else if (type === "internship") await staffApproveInternship("admin", id);
      else if (type === "career") await staffApproveCareer("admin", id);
      toast.success(`Approved ${type} successfully!`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    }
  };

  const handleRejectConfirm = async () => {
    try {
      const { type, id, reason } = rejectDialog;
      if (type === "course") await staffRejectCourse("admin", id, reason);
      else if (type === "training") await staffRejectTraining("admin", id, reason);
      else if (type === "internship") await staffRejectInternship("admin", id, reason);
      else if (type === "career") await staffRejectCareer("admin", id, reason);
      toast.success(`Rejected ${type}`);
      setRejectDialog({ open: false, type: "", id: "", reason: "" });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Rejection failed");
    }
  };

  const handleDelete = async (type: "course" | "training" | "internship" | "career", id: string) => {
    if (!confirm(`Are you sure you want to permanently delete this ${type}?`)) return;
    try {
      if (type === "course") await staffDeleteCourse("admin", id);
      else if (type === "training") await staffDeleteTraining("admin", id);
      else if (type === "internship") await staffDeleteInternship("admin", id);
      else if (type === "career") await staffDeleteCareer("admin", id);
      toast.success(`Deleted ${type}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handleUpdateTracking = async () => {
    try {
      await staffUpdateOrderTracking("admin", trackingDialog.orderId, {
        trackingId: trackingDialog.trackingId,
        trackingSite: trackingDialog.trackingSite,
        status: trackingDialog.status,
      });
      toast.success("Order tracking updated!");
      setTrackingDialog({ open: false, orderId: "", trackingId: "", trackingSite: "", status: "shipped" });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update tracking");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Learners</p>
            <p className="text-xl font-bold text-white">{stats.totalUsers ?? users.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Courses</p>
            <p className="text-xl font-bold text-white">{courses.length + trainings.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Pending Approvals</p>
            <p className="text-xl font-bold text-amber-400">{totalPending}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Orders</p>
            <p className="text-xl font-bold text-white">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: "approvals", label: "Approvals Inbox", count: totalPending },
          { id: "learners", label: "Learners & User Base", count: users.length },
          { id: "courses", label: "Courses & Trainings", count: courses.length + trainings.length },
          { id: "careers", label: "Internships & Careers", count: internships.length + careers.length },
          { id: "orders", label: "Shop Orders & Logistics", count: orders.length },
          { id: "staff", label: "Staff Access Directory", count: 4 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "bg-slate-900/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-xs">Fetching records from database...</p>
        </div>
      ) : (
        <>
          {/* 1. APPROVALS INBOX */}
          {activeTab === "approvals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Items Awaiting Editorial / HR Approval</h3>
                <span className="text-xs text-slate-400">{totalPending} pending items</span>
              </div>

              {totalPending === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                  <h4 className="text-base font-semibold text-slate-200">Inbox All Clear!</h4>
                  <p className="text-xs text-slate-400 mt-1">No items currently awaiting admin approval.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {/* Pending Courses */}
                  {pendingCourses.map((c) => (
                    <div key={c.id} className="bg-slate-900/70 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">COURSE</span>
                          <h4 className="text-sm font-semibold text-white">{c.title}</h4>
                        </div>
                        <p className="text-xs text-slate-400">{c.description?.slice(0, 100)}...</p>
                        <p className="text-[11px] text-slate-500">Instructor: {c.instructor} &bull; Price: ₹{c.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleApprove("course", c.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                          Approve Live
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRejectDialog({ open: true, type: "course", id: c.id, reason: "" })} className="border-red-800 text-red-400 hover:bg-red-950 text-xs">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Pending Trainings */}
                  {pendingTrainings.map((t) => (
                    <div key={t.id} className="bg-slate-900/70 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">TRAINING</span>
                          <h4 className="text-sm font-semibold text-white">{t.title}</h4>
                        </div>
                        <p className="text-xs text-slate-400">{t.description?.slice(0, 100)}...</p>
                        <p className="text-[11px] text-slate-500">Duration: {t.duration} &bull; Mode: {t.mode}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleApprove("training", t.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                          Approve Live
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRejectDialog({ open: true, type: "training", id: t.id, reason: "" })} className="border-red-800 text-red-400 hover:bg-red-950 text-xs">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Pending Internships */}
                  {pendingInternships.map((i) => (
                    <div key={i.id} className="bg-slate-900/70 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">INTERNSHIP</span>
                          <h4 className="text-sm font-semibold text-white">{i.title} ({i.type})</h4>
                        </div>
                        <p className="text-xs text-slate-400">Stipend: {i.stipend} &bull; Location: {i.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleApprove("internship", i.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                          Approve Open
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRejectDialog({ open: true, type: "internship", id: i.id, reason: "" })} className="border-red-800 text-red-400 hover:bg-red-950 text-xs">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Pending Careers */}
                  {pendingCareers.map((cr) => (
                    <div key={cr.id} className="bg-slate-900/70 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">CAREER</span>
                          <h4 className="text-sm font-semibold text-white">{cr.title} ({cr.type})</h4>
                        </div>
                        <p className="text-xs text-slate-400">Salary: {cr.salary} &bull; Domain: {cr.domain}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleApprove("career", cr.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs">
                          Approve Live
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setRejectDialog({ open: true, type: "career", id: cr.id, reason: "" })} className="border-red-800 text-red-400 hover:bg-red-950 text-xs">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. LEARNERS & USERS */}
          {activeTab === "learners" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">Registered Learners & Activities</h3>
                  <p className="text-xs text-slate-400">All public users are registered learners with their enrolled modules & orders.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search by name, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-xs pl-9 text-slate-100"
                  />
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Learner</th>
                      <th className="p-3.5">Referral Code</th>
                      <th className="p-3.5">Enrolled Courses</th>
                      <th className="p-3.5">Applications</th>
                      <th className="p-3.5">Certificates</th>
                      <th className="p-3.5">Shop Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users
                      .filter(
                        (u) =>
                          u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                          u._id?.toLowerCase().includes(search.toLowerCase()) ||
                          u.referralCode?.toLowerCase().includes(search.toLowerCase())
                      )
                      .map((u) => (
                        <tr key={u._id} className="hover:bg-slate-800/40">
                          <td className="p-3.5">
                            <p className="font-semibold text-white">{u.fullName || "Learner"}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{u._id}</p>
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-primary">
                              {u.referralCode || "NONE"}
                            </span>
                          </td>
                          <td className="p-3.5 max-w-[200px]">
                            {u.courses?.length > 0 ? (
                              <div className="space-y-1">
                                {u.courses.map((crs: string, idx: number) => (
                                  <span key={idx} className="block text-[11px] text-emerald-400 truncate">
                                    &bull; {crs}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-500">None</span>
                            )}
                          </td>
                          <td className="p-3.5 max-w-[200px]">
                            {u.applications?.length > 0 ? (
                              <div className="space-y-1">
                                {u.applications.map((app: string, idx: number) => (
                                  <span key={idx} className="block text-[11px] text-blue-400 truncate">
                                    &bull; {app}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-500">None</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {u.certificates?.length > 0 ? (
                              <span className="text-[11px] text-amber-400 font-medium">
                                {u.certificates.length} Issued
                              </span>
                            ) : (
                              <span className="text-slate-500">0</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {u.orders?.length > 0 ? (
                              <span className="text-[11px] text-purple-400 font-medium">
                                {u.orders.length} orders
                              </span>
                            ) : (
                              <span className="text-slate-500">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. COURSES & TRAININGS */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">All Courses ({courses.length})</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((c) => (
                    <div key={c.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            c.status === "live" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {c.status}
                          </span>
                          <h4 className="font-semibold text-white text-sm mt-1">{c.title}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete("course", c.id)}
                          className="text-slate-500 hover:text-red-400 h-7 w-7"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                        <span className="text-slate-400">₹{c.price}</span>
                        <button
                          onClick={() => setLearnersModal({ open: true, title: c.title, learners: c.learners || [] })}
                          className="text-primary hover:underline flex items-center gap-1 font-medium"
                        >
                          <Users className="h-3 w-3" />
                          {c.enrollments ?? 0} Learners
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">All Training Cohorts ({trainings.length})</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {trainings.map((t) => (
                    <div key={t.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            t.status === "live" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {t.status}
                          </span>
                          <h4 className="font-semibold text-white text-sm mt-1">{t.title}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete("training", t.id)}
                          className="text-slate-500 hover:text-red-400 h-7 w-7"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                        <span className="text-slate-400">{t.duration}</span>
                        <button
                          onClick={() => setLearnersModal({ open: true, title: t.title, learners: t.learners || [] })}
                          className="text-primary hover:underline flex items-center gap-1 font-medium"
                        >
                          <Users className="h-3 w-3" />
                          {t.enrollments ?? 0} Enrolled
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. INTERNSHIPS & CAREERS */}
          {activeTab === "careers" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Internship Programs ({internships.length})</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {internships.map((i) => (
                    <div key={i.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            i.status === "open" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {i.status} &bull; {i.type}
                          </span>
                          <h4 className="font-semibold text-white text-sm mt-1">{i.title}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete("internship", i.id)}
                          className="text-slate-500 hover:text-red-400 h-7 w-7"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-400">{i.location} &bull; {i.duration} &bull; {i.stipend}</p>
                      <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                        Applicants: <span className="text-white font-semibold">{i.applicantsCount ?? 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-3">Full-time Careers ({careers.length})</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {careers.map((cr) => (
                    <div key={cr.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            cr.status === "open" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {cr.status} &bull; {cr.type}
                          </span>
                          <h4 className="font-semibold text-white text-sm mt-1">{cr.title}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete("career", cr.id)}
                          className="text-slate-500 hover:text-red-400 h-7 w-7"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-400">{cr.location} &bull; {cr.salary}</p>
                      <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                        Applicants: <span className="text-white font-semibold">{cr.applicantsCount ?? 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. SHOP ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Merchandise Customer Orders</h3>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Tracking Number</th>
                      <th className="p-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-800/40">
                        <td className="p-3.5 font-mono text-[11px]">{o.id?.slice(-8)}</td>
                        <td className="p-3.5">
                          <p className="font-semibold text-white">{o.userFullName}</p>
                          <p className="text-[11px] text-slate-400">{o.userEmail}</p>
                        </td>
                        <td className="p-3.5 font-medium text-slate-200">{o.productName}</td>
                        <td className="p-3.5 font-bold text-white">₹{o.amount}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                            o.status === "delivered" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {o.status || "Processing"}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-400">
                          {o.trackingId ? (
                            <a href={o.trackingSite || "#"} target="_blank" rel="noreferrer" className="text-primary underline flex items-center gap-1">
                              {o.trackingId}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-slate-600">Pending</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setTrackingDialog({
                                open: true,
                                orderId: o.id,
                                trackingId: o.trackingId || "",
                                trackingSite: o.trackingSite || "https://www.delhivery.com/",
                                status: o.status || "shipped",
                              })
                            }
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] gap-1"
                          >
                            <Truck className="h-3 w-3" />
                            Update
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. STAFF DIRECTORY */}
          {activeTab === "staff" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Dedicated Staff Roles & Isolated Portals</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { role: "Admin", email: "admin@enginow.in", portal: "/enginow/admin", desc: "Master approvals, full system visibility, database operations" },
                  { role: "HR", email: "hr@enginow.in", portal: "/enginow/hr", desc: "Talent acquisition, internship management, certificate issuance, screenings" },
                  { role: "Educator", email: "educator@enginow.in", portal: "/enginow/educator", desc: "Course syllabus design, live training programs, curriculum roadmaps" },
                  { role: "Sales", email: "sales@enginow.in", portal: "/enginow/sales", desc: "Merchandise shop inventory, order dispatch tracking, revenue metrics" },
                ].map((s) => (
                  <div key={s.role} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-primary/20 text-primary border border-primary/30">
                        {s.role}
                      </span>
                      <a href={s.portal} className="text-xs text-slate-400 hover:text-primary flex items-center gap-1">
                        Portal Link <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="text-sm font-semibold text-white">{s.email}</p>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <label className="text-xs text-slate-300 block mb-1.5">Reason for rejection (sent to creator)</label>
            <Input
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Please clarify curriculum duration..."
              className="bg-slate-950 border-slate-700 text-slate-100"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectDialog({ open: false, type: "", id: "", reason: "" })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Tracking Dialog */}
      <Dialog open={trackingDialog.open} onOpenChange={(open) => setTrackingDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Update Shipment Tracking</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Tracking ID / AWB</label>
              <Input
                value={trackingDialog.trackingId}
                onChange={(e) => setTrackingDialog((prev) => ({ ...prev, trackingId: e.target.value }))}
                placeholder="e.g. DELH19827346"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Tracking Website URL</label>
              <Input
                value={trackingDialog.trackingSite}
                onChange={(e) => setTrackingDialog((prev) => ({ ...prev, trackingSite: e.target.value }))}
                placeholder="https://www.delhivery.com/track"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Status</label>
              <select
                value={trackingDialog.status}
                onChange={(e) => setTrackingDialog((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-xs text-slate-100"
              >
                <option value="processing">Processing</option>
                <option value="shipped">Shipped / In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTrackingDialog({ open: false, orderId: "", trackingId: "", trackingSite: "", status: "shipped" })}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTracking}>Save Tracking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enrolled Learners Modal */}
      <Dialog open={learnersModal.open} onOpenChange={(open) => setLearnersModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Enrolled Learners &bull; {learnersModal.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
            {learnersModal.learners.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No learners enrolled yet.</p>
            ) : (
              learnersModal.learners.map((lr, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">{lr.name}</p>
                    <p className="text-[11px] text-slate-400">{lr.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">{lr.progress}%</span>
                    <p className="text-[10px] text-slate-500">{lr.enrolledOn}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
