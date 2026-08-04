"use client";

import React, { useState, useEffect } from "react";
import PortalLoginGate from "@/components/portals/PortalLoginGate";
import {
  staffGetCourses,
  staffCreateCourse,
  staffUpdateCourse,
  staffGetTrainings,
  staffCreateTraining,
  staffUpdateTraining,
} from "@/lib/staff.functions";
import {
  BookOpen,
  GraduationCap,
  Users,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function EducatorPortalPage() {
  return (
    <PortalLoginGate
      portal="educator"
      title="Enginow Academic & Curriculum Studio"
      subtitle="Course syllabus design, live training cohorts, roadmaps, and learner progress"
    >
      {(user) => <EducatorDashboardContent user={user} />}
    </PortalLoginGate>
  );
}

function EducatorDashboardContent({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"courses" | "trainings" | "learners">("courses");
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);

  // Course Create/Edit Modal
  const [courseModal, setCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    id: "",
    title: "",
    category: "Full Stack Development",
    level: "Beginner to Advanced",
    duration: "8 Weeks",
    price: "4999",
    description: "",
    prerequisites: "Basic programming fundamentals",
    syllabus: "Module 1: JavaScript & TypeScript Essentials\nModule 2: React & Next.js Architecture\nModule 3: Node.js & Database Systems\nModule 4: Deployment & CI/CD",
    instructor: "Enginow Faculty",
  });

  // Training Create/Edit Modal
  const [trainingModal, setTrainingModal] = useState(false);
  const [trainingForm, setTrainingForm] = useState({
    id: "",
    title: "",
    mode: "Live Online & Mentorship",
    duration: "4 Weeks Cohort",
    price: "7999",
    description: "",
    prerequisites: "HTML, CSS, JS basics",
    whatYouWillLearn: "Production API Design, Cloud Deployment, Real-world Capstone",
  });

  // Enrolled learners view modal
  const [learnerViewModal, setLearnerViewModal] = useState<{ open: boolean; title: string; learners: any[] }>({
    open: false,
    title: "",
    learners: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, t] = await Promise.all([
        staffGetCourses("educator").catch(() => []),
        staffGetTrainings("educator").catch(() => []),
      ]);
      setCourses(Array.isArray(c) ? c : []);
      setTrainings(Array.isArray(t) ? t : []);
    } catch (err: any) {
      toast.error("Failed to load academic records: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: courseForm.title,
        category: courseForm.category,
        level: courseForm.level,
        duration: courseForm.duration,
        price: Number(courseForm.price) || 0,
        description: courseForm.description,
        prerequisites: courseForm.prerequisites.split(",").map((p) => p.trim()).filter(Boolean),
        syllabus: courseForm.syllabus.split("\n").map((s) => s.trim()).filter(Boolean),
        instructor: courseForm.instructor,
      };

      if (courseForm.id) {
        await staffUpdateCourse("educator", courseForm.id, payload);
        toast.success("Course updated and submitted for approval!");
      } else {
        await staffCreateCourse("educator", payload);
        toast.success("New course submitted for admin approval!");
      }
      setCourseModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save course");
    }
  };

  const handleSaveTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: trainingForm.title,
        mode: trainingForm.mode,
        duration: trainingForm.duration,
        price: Number(trainingForm.price) || 0,
        description: trainingForm.description,
        prerequisites: trainingForm.prerequisites.split(",").map((p) => p.trim()).filter(Boolean),
        whatYouWillLearn: trainingForm.whatYouWillLearn.split(",").map((w) => w.trim()).filter(Boolean),
      };

      if (trainingForm.id) {
        await staffUpdateTraining("educator", trainingForm.id, payload);
        toast.success("Training program updated!");
      } else {
        await staffCreateTraining("educator", payload);
        toast.success("New training program submitted for approval!");
      }
      setTrainingModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save training program");
    }
  };

  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollments || 0), 0) + trainings.reduce((sum, t) => sum + (t.enrollments || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Courses</p>
            <p className="text-xl font-bold text-white">{courses.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Training Cohorts</p>
            <p className="text-xl font-bold text-white">{trainings.length}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Enrolled Learners</p>
            <p className="text-xl font-bold text-emerald-400">{totalEnrollments}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: "courses", label: "Self-Paced Courses", count: courses.length },
            { id: "trainings", label: "Cohort Training Programs", count: trainings.length },
            { id: "learners", label: "Learner Directory" },
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

        {activeTab === "courses" && (
          <Button
            size="sm"
            onClick={() => {
              setCourseForm({
                id: "",
                title: "",
                category: "Full Stack Development",
                level: "Beginner to Advanced",
                duration: "8 Weeks",
                price: "4999",
                description: "",
                prerequisites: "Basic programming fundamentals",
                syllabus: "Module 1: Foundations & Architecture\nModule 2: Real-world Applications\nModule 3: Capstone Project",
                instructor: user.name || "Enginow Educator",
              });
              setCourseModal(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Course
          </Button>
        )}

        {activeTab === "trainings" && (
          <Button
            size="sm"
            onClick={() => {
              setTrainingForm({
                id: "",
                title: "",
                mode: "Live Online & Mentorship",
                duration: "4 Weeks Cohort",
                price: "7999",
                description: "",
                prerequisites: "HTML, CSS, JS basics",
                whatYouWillLearn: "Production System Architecture, Industry Mentorship, Capstone Review",
              });
              setTrainingModal(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Training Program
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-xs">Loading course studio...</p>
        </div>
      ) : (
        <>
          {/* COURSES TAB */}
          {activeTab === "courses" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => (
                <div key={c.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        c.status === "live" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {c.status}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{c.title}</h4>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>&bull; Level: <span className="text-slate-200">{c.level}</span></p>
                    <p>&bull; Duration: <span className="text-slate-200">{c.duration}</span></p>
                    <p>&bull; Price: <span className="text-slate-200">₹{c.price}</span></p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setLearnerViewModal({ open: true, title: c.title, learners: c.learners || [] })}
                      className="text-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Users className="h-3 w-3" />
                      {c.enrollments ?? 0} Learners
                    </button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCourseForm({
                          id: c.id,
                          title: c.title,
                          category: c.category || "",
                          level: c.level || "",
                          duration: c.duration || "",
                          price: String(c.price || 0),
                          description: c.description || "",
                          prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites.join(", ") : c.prerequisites || "",
                          syllabus: Array.isArray(c.syllabus) ? c.syllabus.join("\n") : c.syllabus || "",
                          instructor: c.instructor || "",
                        });
                        setCourseModal(true);
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

          {/* TRAININGS TAB */}
          {activeTab === "trainings" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trainings.map((t) => (
                <div key={t.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        t.status === "live" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {t.status}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{t.title}</h4>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{t.description}</p>
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>&bull; Mode: <span className="text-slate-200">{t.mode}</span></p>
                    <p>&bull; Duration: <span className="text-slate-200">{t.duration}</span></p>
                    <p>&bull; Price: <span className="text-slate-200">₹{t.price}</span></p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setLearnerViewModal({ open: true, title: t.title, learners: t.learners || [] })}
                      className="text-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Users className="h-3 w-3" />
                      {t.enrollments ?? 0} Enrolled
                    </button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTrainingForm({
                          id: t.id,
                          title: t.title,
                          mode: t.mode || "",
                          duration: t.duration || "",
                          price: String(t.price || 0),
                          description: t.description || "",
                          prerequisites: Array.isArray(t.prerequisites) ? t.prerequisites.join(", ") : t.prerequisites || "",
                          whatYouWillLearn: Array.isArray(t.whatYouWillLearn) ? t.whatYouWillLearn.join(", ") : t.whatYouWillLearn || "",
                        });
                        setTrainingModal(true);
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

          {/* LEARNERS OVERVIEW TAB */}
          {activeTab === "learners" && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-2">Learner Course Completion & Progress</h3>
              <p className="text-xs text-slate-400 mb-4">
                Click "Learners" on any course or training card to view the breakdown of enrolled students, progress percentage, and timestamps.
              </p>
            </div>
          )}
        </>
      )}

      {/* Course Modal */}
      <Dialog open={courseModal} onOpenChange={setCourseModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{courseForm.id ? "Edit Course Syllabus" : "Design New Course"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCourse} className="space-y-3 py-2 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Course Title</label>
              <Input
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="e.g. Master Modern Web Architecture"
                className="bg-slate-950 border-slate-700 text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Category</label>
                <Input
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  placeholder="e.g. Web Development"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Difficulty Level</label>
                <Input
                  value={courseForm.level}
                  onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  placeholder="e.g. Beginner to Intermediate"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Duration</label>
                <Input
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  placeholder="e.g. 6 Weeks"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Price (₹ INR)</label>
                <Input
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                  placeholder="e.g. 4999"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Course Description</label>
              <Textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Overview of curriculum and objectives..."
                className="bg-slate-950 border-slate-700 text-slate-100"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Prerequisites (comma-separated)</label>
              <Input
                value={courseForm.prerequisites}
                onChange={(e) => setCourseForm({ ...courseForm, prerequisites: e.target.value })}
                placeholder="Basic JavaScript, HTML"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Curriculum Syllabus (one module per line)</label>
              <Textarea
                value={courseForm.syllabus}
                onChange={(e) => setCourseForm({ ...courseForm, syllabus: e.target.value })}
                placeholder="Module 1: Fundamentals&#10;Module 2: Practical Projects&#10;Module 3: Deployment"
                className="bg-slate-950 border-slate-700 text-slate-100"
                rows={4}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="ghost" onClick={() => setCourseModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Course</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Training Modal */}
      <Dialog open={trainingModal} onOpenChange={setTrainingModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{trainingForm.id ? "Edit Training Program" : "Create Training Cohort"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTraining} className="space-y-3 py-2 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Training Title</label>
              <Input
                value={trainingForm.title}
                onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                placeholder="e.g. Full-Stack Mastery Bootcamp"
                className="bg-slate-950 border-slate-700 text-slate-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Mode</label>
                <Input
                  value={trainingForm.mode}
                  onChange={(e) => setTrainingForm({ ...trainingForm, mode: e.target.value })}
                  placeholder="e.g. Live Online Sessions"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Duration</label>
                <Input
                  value={trainingForm.duration}
                  onChange={(e) => setTrainingForm({ ...trainingForm, duration: e.target.value })}
                  placeholder="e.g. 4 Weeks"
                  className="bg-slate-950 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Price (₹ INR)</label>
              <Input
                value={trainingForm.price}
                onChange={(e) => setTrainingForm({ ...trainingForm, price: e.target.value })}
                placeholder="e.g. 7999"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Program Description</label>
              <Textarea
                value={trainingForm.description}
                onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                placeholder="Comprehensive details regarding the training cohort..."
                className="bg-slate-950 border-slate-700 text-slate-100"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">What You Will Learn (comma-separated)</label>
              <Input
                value={trainingForm.whatYouWillLearn}
                onChange={(e) => setTrainingForm({ ...trainingForm, whatYouWillLearn: e.target.value })}
                placeholder="Microservices, Containerization, Live Mentorship"
                className="bg-slate-950 border-slate-700 text-slate-100"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="ghost" onClick={() => setTrainingModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Cohort</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enrolled Learners Modal */}
      <Dialog open={learnerViewModal.open} onOpenChange={(open) => setLearnerViewModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Enrolled Learners &bull; {learnerViewModal.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
            {learnerViewModal.learners.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No learners enrolled yet in this program.</p>
            ) : (
              learnerViewModal.learners.map((lr, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-white">{lr.name}</p>
                    <p className="text-[11px] text-slate-400">{lr.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">{lr.progress}% Completed</span>
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
