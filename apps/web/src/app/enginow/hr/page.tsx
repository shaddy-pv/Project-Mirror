"use client";

import React, { useState, useEffect } from "react";
import PortalLoginGate from "@/components/portals/PortalLoginGate";
import {
  staffGetInternships,
  staffCreateInternship,
  staffUpdateInternship,
  staffGetCareers,
  staffCreateCareer,
  staffUpdateCareer,
  staffGetInternshipApps,
  staffUpdateInternshipAppStatus,
  staffIssueCertificate,
  staffGetCareerApps,
  staffUpdateCareerAppStatus,
  staffCreateAssessment,
  staffGetInquiries,
  staffUpdateInquiryStatus,
} from "@/lib/staff.functions";
import {
  Briefcase,
  Building2,
  Users,
  Award,
  FileCheck,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Send,
  Loader2,
  ExternalLink,
  Filter,
  Check,
  X,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function HrPortalPage() {
  return (
    <PortalLoginGate
      portal="hr"
      title="Enginow Talent & HR Portal"
      subtitle="Recruitment pipelines, candidate screenings, internships, and certificate issuance"
    >
      {(user) => <HrDashboardContent user={user} />}
    </PortalLoginGate>
  );
}

function HrDashboardContent({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"internships" | "careers" | "internApps" | "careerApps" | "assessments" | "inquiries">("internships");
  const [loading, setLoading] = useState(true);

  const [internships, setInternships] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [internApps, setInternApps] = useState<any[]>([]);
  const [careerApps, setCareerApps] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // Create/Edit Internship Modal
  const [internshipModal, setInternshipModal] = useState(false);
  const [internshipForm, setInternshipForm] = useState({
    id: "",
    title: "",
    type: "Summer",
    domain: "Software Engineering",
    stipend: "₹10,000 / month",
    duration: "2 Months",
    location: "Remote",
    perks: "Certificate, LOR, Flexible Hours",
    responsibilities: "",
    requirements: "React, Node.js, Git",
    tags: "Full-Stack, Web Development",
    status: "open",
  });

  // Create/Edit Career Modal
  const [careerModal, setCareerModal] = useState(false);
  const [careerForm, setCareerForm] = useState({
    id: "",
    title: "",
    type: "Full-time",
    domain: "Engineering",
    salary: "₹6 - 10 LPA",
    location: "Bengaluru (Hybrid)",
    perks: "Health Insurance, Learning Allowance",
    responsibilities: "",
    requirements: "TypeScript, PostgreSQL, AWS",
    tags: "Backend, Systems",
    status: "open",
  });

  // Certificate Issuance Modal
  const [certModal, setCertModal] = useState<{ open: boolean; app: any; type: string }>({
    open: false,
    app: null,
    type: "completion",
  });

  // Assessment Creation Modal
  const [assessmentModal, setAssessmentModal] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    title: "",
    listingId: "",
    questions: [
      { question: "What is your primary tech stack?", type: "text" },
      { question: "Describe a project you built using modern web frameworks.", type: "text" },
    ],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [i, cr, ia, ca, inq] = await Promise.all([
        staffGetInternships("hr").catch(() => []),
        staffGetCareers("hr").catch(() => []),
        staffGetInternshipApps("hr").catch(() => []),
        staffGetCareerApps("hr").catch(() => []),
        staffGetInquiries("hr", "career").catch(() => []),
      ]);
      setInternships(Array.isArray(i) ? i : []);
      setCareers(Array.isArray(cr) ? cr : []);
      setInternApps(Array.isArray(ia) ? ia : []);
      setCareerApps(Array.isArray(ca) ? ca : []);
      setInquiries(Array.isArray(inq) ? inq : []);
    } catch (err: any) {
      toast.error("Failed to load HR records: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: internshipForm.title,
        type: internshipForm.type,
        domain: internshipForm.domain,
        stipend: internshipForm.stipend,
        duration: internshipForm.duration,
        location: internshipForm.location,
        perks: internshipForm.perks.split(",").map((p) => p.trim()).filter(Boolean),
        responsibilities: internshipForm.responsibilities,
        requirements: internshipForm.requirements.split(",").map((r) => r.trim()).filter(Boolean),
        tags: internshipForm.tags,
        status: internshipForm.status,
      };

      if (internshipForm.id) {
        await staffUpdateInternship("hr", internshipForm.id, payload);
        toast.success("Internship updated!");
      } else {
        await staffCreateInternship("hr", payload);
        toast.success("Internship submitted!");
      }
      setInternshipModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save internship");
    }
  };

  const handleSaveCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: careerForm.title,
        type: careerForm.type,
        domain: careerForm.domain,
        salary: careerForm.salary,
        location: careerForm.location,
        perks: careerForm.perks.split(",").map((p) => p.trim()).filter(Boolean),
        responsibilities: careerForm.responsibilities,
        requirements: careerForm.requirements.split(",").map((r) => r.trim()).filter(Boolean),
        tags: careerForm.tags,
        status: careerForm.status,
      };

      if (careerForm.id) {
        await staffUpdateCareer("hr", careerForm.id, payload);
        toast.success("Career updated!");
      } else {
        await staffCreateCareer("hr", payload);
        toast.success("Career submitted!");
      }
      setCareerModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save career");
    }
  };

  const handleUpdateAppStatus = async (type: "internship" | "career", id: string, status: string) => {
    try {
      if (type === "internship") {
        await staffUpdateInternshipAppStatus("hr", id, status);
      } else {
        await staffUpdateCareerAppStatus("hr", id, status);
      }
      toast.success(`Candidate status updated to ${status}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update candidate status");
    }
  };

  const handleIssueCertConfirm = async () => {
    if (!certModal.app) return;
    try {
      const res = await staffIssueCertificate("hr", certModal.app.id, {
        type: certModal.type,
      });
      toast.success(`Official ${certModal.type.toUpperCase()} issued! ID: ${res.certificateId}`);
      setCertModal({ open: false, app: null, type: "completion" });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to issue certificate");
    }
  };

  const handleCreateAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentForm.title || !assessmentForm.listingId) {
      toast.error("Please provide assessment title and select a listing");
      return;
    }
    try {
      await staffCreateAssessment("hr", assessmentForm);
      toast.success("Candidate assessment created!");
      setAssessmentModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create assessment");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Open Internships</p>
            <p className="text-xl font-bold text-white">{internships.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Career Openings</p>
            <p className="text-xl font-bold text-white">{careers.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Applicants</p>
            <p className="text-xl font-bold text-white">{internApps.length + careerApps.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Selected / Hired</p>
            <p className="text-xl font-bold text-emerald-400">
              {internApps.filter((a) => a.status === "selected").length + careerApps.filter((a) => a.status === "selected").length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "internships", label: "Internships", count: internships.length },
            { id: "careers", label: "Career Jobs", count: careers.length },
            { id: "internApps", label: "Intern Applications", count: internApps.length },
            { id: "careerApps", label: "Job Applications", count: careerApps.length },
            { id: "assessments", label: "Screening Assessments" },
            { id: "inquiries", label: "Careers Inquiries", count: inquiries.length },
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
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-slate-800 text-slate-300 font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "internships" && (
          <Button
            size="sm"
            onClick={() => {
              setInternshipForm({
                id: "",
                title: "",
                type: "Summer",
                domain: "Software Engineering",
                stipend: "₹10,000 / month",
                duration: "2 Months",
                location: "Remote",
                perks: "Certificate, LOR, Flexible Hours",
                responsibilities: "Build responsive frontend features, connect API endpoints",
                requirements: "React, TypeScript, CSS",
                tags: "Web, Frontend",
                status: "open",
              });
              setInternshipModal(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Internship
          </Button>
        )}

        {activeTab === "careers" && (
          <Button
            size="sm"
            onClick={() => {
              setCareerForm({
                id: "",
                title: "",
                type: "Full-time",
                domain: "Engineering",
                salary: "₹8 - 14 LPA",
                location: "Bengaluru (Hybrid)",
                perks: "Health Insurance, Annual Retreat, Stock Options",
                responsibilities: "Design distributed backend systems and high throughput microservices",
                requirements: "Node.js, MongoDB, Kubernetes, TypeScript",
                tags: "Senior Backend, Cloud",
                status: "open",
              });
              setCareerModal(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Post Career Role
          </Button>
        )}

        {activeTab === "assessments" && (
          <Button
            size="sm"
            onClick={() => setAssessmentModal(true)}
            className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Assessment
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-xs">Loading talent records...</p>
        </div>
      ) : (
        <>
          {/* INTERNSHIPS TAB */}
          {activeTab === "internships" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {internships.map((i) => (
                <div key={i.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        i.status === "open" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {i.status} &bull; {i.type}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{i.title}</h4>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{i.domain}</p>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>&bull; Stipend: <span className="text-slate-200">{i.stipend}</span></p>
                    <p>&bull; Location: <span className="text-slate-200">{i.location}</span></p>
                    <p>&bull; Duration: <span className="text-slate-200">{i.duration}</span></p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-primary font-semibold">{i.applicantsCount ?? 0} Applicants</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setInternshipForm({
                          id: i.id,
                          title: i.title,
                          type: i.type || "Summer",
                          domain: i.domain || "",
                          stipend: i.stipend || "",
                          duration: i.duration || "",
                          location: i.location || "",
                          perks: Array.isArray(i.perks) ? i.perks.join(", ") : i.perks || "",
                          responsibilities: i.responsibilities || "",
                          requirements: Array.isArray(i.requirements) ? i.requirements.join(", ") : i.requirements || "",
                          tags: i.tags || "",
                          status: i.status || "open",
                        });
                        setInternshipModal(true);
                      }}
                      className="border-slate-700 text-xs h-7"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CAREERS TAB */}
          {activeTab === "careers" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {careers.map((cr) => (
                <div key={cr.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        cr.status === "open" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {cr.status} &bull; {cr.type}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{cr.title}</h4>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{cr.domain}</p>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>&bull; Salary: <span className="text-slate-200">{cr.salary}</span></p>
                    <p>&bull; Location: <span className="text-slate-200">{cr.location}</span></p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-primary font-semibold">{cr.applicantsCount ?? 0} Applicants</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCareerForm({
                          id: cr.id,
                          title: cr.title,
                          type: cr.type || "Full-time",
                          domain: cr.domain || "",
                          salary: cr.salary || "",
                          location: cr.location || "",
                          perks: Array.isArray(cr.perks) ? cr.perks.join(", ") : cr.perks || "",
                          responsibilities: cr.responsibilities || "",
                          requirements: Array.isArray(cr.requirements) ? cr.requirements.join(", ") : cr.requirements || "",
                          tags: cr.tags || "",
                          status: cr.status || "open",
                        });
                        setCareerModal(true);
                      }}
                      className="border-slate-700 text-xs h-7"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* INTERN APPS */}
          {activeTab === "internApps" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Candidate</th>
                    <th className="p-3.5">Internship Program</th>
                    <th className="p-3.5">Contact / Resume</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Workflow Action</th>
                    <th className="p-3.5">Certificates</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {internApps.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5">
                        <p className="font-semibold text-white">{a.fullName || "Candidate"}</p>
                        <p className="text-[11px] text-slate-400">{a.email}</p>
                      </td>
                      <td className="p-3.5 font-medium text-slate-200">
                        {a.internshipTitle || "Internship"}
                      </td>
                      <td className="p-3.5 space-y-1">
                        <p className="text-slate-400">{a.phone || "No phone"}</p>
                        {a.resumeUrl && (
                          <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            View Resume <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          a.status === "selected"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : a.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : a.status === "shortlisted"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {a.status || "pending"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={a.status || "pending"}
                          onChange={(e) => handleUpdateAppStatus("internship", a.id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded p-1 text-[11px] text-slate-200"
                        >
                          <option value="pending">Pending</option>
                          <option value="shortlisted">Shortlist (Send OA)</option>
                          <option value="oa">OA In Progress</option>
                          <option value="selected">Selected / Hire</option>
                          <option value="rejected">Reject</option>
                        </select>
                      </td>
                      <td className="p-3.5">
                        {a.status === "selected" ? (
                          <Button
                            size="sm"
                            onClick={() => setCertModal({ open: true, app: a, type: "completion" })}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7 gap-1"
                          >
                            <Award className="h-3.5 w-3.5" />
                            Issue Document
                          </Button>
                        ) : (
                          <span className="text-slate-600">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CAREER APPS */}
          {activeTab === "careerApps" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Candidate</th>
                    <th className="p-3.5">Job Title</th>
                    <th className="p-3.5">Contact / Resume</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {careerApps.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5">
                        <p className="font-semibold text-white">{a.userFullName || a.fullName || "Candidate"}</p>
                        <p className="text-[11px] text-slate-400">{a.email}</p>
                      </td>
                      <td className="p-3.5 font-medium text-slate-200">{a.careerTitle || "Career Role"}</td>
                      <td className="p-3.5 space-y-1">
                        <p className="text-slate-400">{a.phone || "No phone"}</p>
                        {a.resumeUrl && (
                          <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            View Resume <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          a.status === "selected"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : a.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : a.status === "shortlisted"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {a.status || "pending"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={a.status || "pending"}
                          onChange={(e) => handleUpdateAppStatus("career", a.id, e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded p-1 text-[11px] text-slate-200"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="shortlisted">Shortlist for OA</option>
                          <option value="oa">OA Stage</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Reject</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ASSESSMENTS */}
          {activeTab === "assessments" && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-white mb-2">Automated Candidate Screening Tests</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Assessments are automatically unlocked for candidates who reach the "Shortlisted" stage for a specific internship or career opening.
                </p>
                <div className="flex gap-3">
                  <Button size="sm" onClick={() => setAssessmentModal(true)} className="bg-primary text-white text-xs">
                    Create New Screening Test
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* INQUIRIES */}
          {activeTab === "inquiries" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Applicant / Inquirer</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Message / Question</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-semibold text-white">{inq.name}</td>
                      <td className="p-3.5 text-slate-400">{inq.email}</td>
                      <td className="p-3.5 text-slate-300 max-w-sm">{inq.message}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          inq.status === "resolved" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {inq.status || "new"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await staffUpdateInquiryStatus("hr", inq.id, inq.status === "resolved" ? "new" : "resolved");
                            toast.success("Inquiry updated!");
                            loadData();
                          }}
                          className="border-slate-700 text-xs h-7"
                        >
                          {inq.status === "resolved" ? "Mark New" : "Resolve"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Create / Edit Internship Modal */}
      <Dialog open={internshipModal} onOpenChange={setInternshipModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{internshipForm.id ? "Edit Internship Program" : "Create Internship Program"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveInternship} className="space-y-3 py-2 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Internship Title</label>
              <Input
                value={internshipForm.title}
                onChange={(e) => setInternshipForm({ ...internshipForm, title: e.target.value })}
                placeholder="e.g. Full-Stack Web Developer Intern"
                className="bg-slate-950 border-slate-700 text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Type / Cohort</label>
                <select
                  value={internshipForm.type}
                  onChange={(e) => setInternshipForm({ ...internshipForm, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-100"
                >
                  <option value="Summer">Summer (May - Aug)</option>
                  <option value="Winter">Winter (Dec - Mar)</option>
                  <option value="Spring">Spring (Feb - May)</option>
                  <option value="Monsoon">Monsoon (Jul - Oct)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Domain</label>
                <Input
                  value={internshipForm.domain}
                  onChange={(e) => setInternshipForm({ ...internshipForm, domain: e.target.value })}
                  placeholder="e.g. Software Engineering"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Stipend</label>
                <Input
                  value={internshipForm.stipend}
                  onChange={(e) => setInternshipForm({ ...internshipForm, stipend: e.target.value })}
                  placeholder="e.g. ₹10,000 / month"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Duration</label>
                <Input
                  value={internshipForm.duration}
                  onChange={(e) => setInternshipForm({ ...internshipForm, duration: e.target.value })}
                  placeholder="e.g. 2 Months"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Perks (comma-separated)</label>
              <Input
                value={internshipForm.perks}
                onChange={(e) => setInternshipForm({ ...internshipForm, perks: e.target.value })}
                placeholder="Certificate, LOR, Flexible Timings, Mentorship"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Responsibilities</label>
              <Textarea
                value={internshipForm.responsibilities}
                onChange={(e) => setInternshipForm({ ...internshipForm, responsibilities: e.target.value })}
                placeholder="Key duties and tasks expected..."
                className="bg-slate-950 border-slate-700 text-slate-100"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Requirements (comma-separated)</label>
              <Input
                value={internshipForm.requirements}
                onChange={(e) => setInternshipForm({ ...internshipForm, requirements: e.target.value })}
                placeholder="React, JavaScript, Git, Problem Solving"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="ghost" onClick={() => setInternshipModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Internship</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Career Modal */}
      <Dialog open={careerModal} onOpenChange={setCareerModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{careerForm.id ? "Edit Career Opportunity" : "Post Career Opportunity"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCareer} className="space-y-3 py-2 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Job Title</label>
              <Input
                value={careerForm.title}
                onChange={(e) => setCareerForm({ ...careerForm, title: e.target.value })}
                placeholder="e.g. Senior Backend Engineer"
                className="bg-slate-950 border-slate-700 text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Type</label>
                <select
                  value={careerForm.type}
                  onChange={(e) => setCareerForm({ ...careerForm, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-100"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Salary / Compensation</label>
                <Input
                  value={careerForm.salary}
                  onChange={(e) => setCareerForm({ ...careerForm, salary: e.target.value })}
                  placeholder="e.g. ₹8 - 14 LPA"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Location</label>
              <Input
                value={careerForm.location}
                onChange={(e) => setCareerForm({ ...careerForm, location: e.target.value })}
                placeholder="e.g. Remote / Bengaluru, India"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Perks (comma-separated)</label>
              <Input
                value={careerForm.perks}
                onChange={(e) => setCareerForm({ ...careerForm, perks: e.target.value })}
                placeholder="Health Insurance, Stock Options, Remote Setup"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Responsibilities</label>
              <Textarea
                value={careerForm.responsibilities}
                onChange={(e) => setCareerForm({ ...careerForm, responsibilities: e.target.value })}
                placeholder="Core role duties..."
                className="bg-slate-950 border-slate-700 text-slate-100"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Requirements (comma-separated)</label>
              <Input
                value={careerForm.requirements}
                onChange={(e) => setCareerForm({ ...careerForm, requirements: e.target.value })}
                placeholder="TypeScript, PostgreSQL, Docker, AWS"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="ghost" onClick={() => setCareerModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Publish Job</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Certificate Issuance Modal */}
      <Dialog open={certModal.open} onOpenChange={(open) => setCertModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Official Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3 text-xs">
            <p className="text-slate-300">
              Issuing for candidate: <span className="text-white font-bold">{certModal.app?.fullName}</span>
            </p>
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Document Type</label>
              <select
                value={certModal.type}
                onChange={(e) => setCertModal((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-slate-100"
              >
                <option value="completion">Certificate of Completion</option>
                <option value="lor">Letter of Recommendation (LOR)</option>
                <option value="loe">Letter of Experience (LOE)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500">
              Generates a cryptographic Certificate ID and makes it verifiable on <span className="font-mono text-primary">enginow.com/verify</span>.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCertModal({ open: false, app: null, type: "completion" })}>
              Cancel
            </Button>
            <Button onClick={handleIssueCertConfirm} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Issue & Sign Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
