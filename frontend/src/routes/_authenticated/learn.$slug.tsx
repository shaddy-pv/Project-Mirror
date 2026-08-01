import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { ArrowLeft, Play, FileText, Download, CheckCircle, Menu, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { getCourseBySlug, getMyEnrollments, updateEnrollmentProgress } from "@/lib/courses.functions";
import { useAuthContext } from "@/routes/__root";

const courseQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["courses", "slug", slug],
    queryFn: () => getCourseBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/_authenticated/learn/$slug")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(courseQueryOptions(params.slug)),
  component: CoursePlayerPage,
  head: ({ params }) => ({
    meta: [
      { title: `Learning: ${params.slug} — Enginow` },
    ],
  }),
});

function CoursePlayerPage() {
  const { slug } = Route.useParams();
  const { data: course } = useSuspenseQuery(courseQueryOptions(slug));
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: myEnrollments, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => getMyEnrollments(),
    enabled: isAuthenticated && !isAuthLoading,
  });

  const isCheckingEnrollment = isAuthLoading || (isAuthenticated && isEnrollmentsLoading);
  const isEnrolled = (myEnrollments as Array<{ courseId: string }>)?.some((e) => e.courseId === course?.id) ?? false;

  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // Kick out if not enrolled (after checking finishes)
  if (!isCheckingEnrollment && !isEnrolled) {
    navigate({ to: `/courses/${slug}`, replace: true });
    return null;
  }

  if (!course) {
    throw notFound();
  }

  const roadmap = Array.isArray(course.roadmap) ? course.roadmap : [];
  const activeModule = roadmap[activeModuleIdx] as any; // Cast to access module fields

  async function handleFinishCourse() {
    setFinishing(true);
    try {
      await updateEnrollmentProgress({ data: { courseId: course.id, progress: 100 } });
      // Invalidate enrollments so the dashboard reflects the 100% completed state
      await queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      navigate({ to: "/learner-dashboard" });
    } catch (e) {
      console.error(e);
      setFinishing(false);
    }
  }

  return (
    <div className="flex h-screen bg-card overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[300px] border-r hairline bg-paper transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[60px] items-center justify-between border-b hairline px-4">
          <Link to="/learner-dashboard" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-ink-mute hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-4 border-b hairline bg-card">
          <span className="eyebrow line-clamp-1">{course.title}</span>
          <p className="mt-1 text-[12px] text-ink-soft">{roadmap.length} modules</p>
        </div>

        <div className="h-[calc(100vh-140px)] overflow-y-auto py-2">
          {roadmap.map((item: any, i: number) => {
            const isActive = i === activeModuleIdx;
            const title = typeof item === "string" ? item : item.title ?? "Module";
            
            return (
              <button
                key={i}
                onClick={() => {
                  setActiveModuleIdx(i);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 flex gap-3 transition-colors ${isActive ? "bg-secondary border-r-2 border-[color:var(--signal)]" : "hover:bg-secondary/50"}`}
              >
                <span className={`mono mt-0.5 shrink-0 text-[11px] ${isActive ? "text-[color:var(--signal)] font-medium" : "text-ink-mute"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`text-[13px] line-clamp-2 ${isActive ? "font-medium text-ink" : "text-ink-soft"}`}>
                  {title}
                </span>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-secondary/30 relative">
        {/* Header */}
        <header className="h-[60px] shrink-0 border-b hairline bg-paper flex items-center px-4 md:px-6">
          <button onClick={() => setSidebarOpen(true)} className="mr-4 lg:hidden p-2 text-ink-mute hover:text-ink -ml-2 rounded-md hover:bg-secondary">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-medium text-[14px] truncate flex-1">{activeModule?.title || "Module"}</h1>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto">
          {isCheckingEnrollment ? (
            <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-6">
              <div className="aspect-video w-full animate-pulse rounded-xl bg-ink/5" />
              <div className="h-8 w-1/3 animate-pulse rounded-md bg-ink/5" />
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-ink/5" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-ink/5" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-ink/5" />
              </div>
            </div>
          ) : (
            <div className="pb-24">
              
              {/* Media Section (Video or Image) */}
              {activeModule?.videoUrl ? (
                <div className="w-full bg-ink aspect-video max-h-[65vh] flex items-center justify-center">
                  <iframe 
                    src={getYouTubeEmbedUrl(activeModule.videoUrl)} 
                    className="w-full h-full max-w-[1200px] mx-auto"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : activeModule?.imageUrl ? (
                <div className="w-full bg-card aspect-video max-h-[60vh] flex flex-col items-center justify-center border-b hairline">
                   <img src={activeModule.imageUrl} alt={activeModule.title} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-full bg-card aspect-[21/9] max-h-[40vh] flex flex-col items-center justify-center border-b hairline text-ink-mute">
                  <Play className="h-12 w-12 opacity-20 mb-3" />
                  <p className="text-[13px] font-medium">Text-based module</p>
                </div>
              )}

              <div className="max-w-3xl mx-auto px-6 mt-10 md:px-10">
                <h2 className="text-3xl font-medium tracking-tight mb-2">{activeModule?.title}</h2>
                {activeModule?.description && (
                  <p className="text-[15px] text-ink-soft mb-8 leading-relaxed">{activeModule.description}</p>
                )}

                {/* Notes Section */}
                {activeModule?.notes && (
                  <div className="prose prose-sm md:prose-base prose-neutral max-w-none prose-headings:font-medium prose-a:text-[color:var(--signal)]">
                    <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-ink-mute" /> Study Notes
                    </h3>
                    <div className="bg-card border hairline rounded-xl p-6 md:p-8 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-soft">
                      {activeModule.notes}
                    </div>
                  </div>
                )}

                {/* Attached Document Section */}
                {activeModule?.documentUrl && (
                  <div className="mt-8">
                    <h3 className="text-[15px] font-medium mb-3">Attached Material</h3>
                    <a 
                      href={activeModule.documentUrl} 
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-3 bg-card border hairline rounded-xl p-4 hover:bg-secondary transition-colors group w-full sm:w-auto"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-[color:var(--signal)]/10 text-[color:var(--signal)]">
                        <Download className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium group-hover:underline">Download Material</p>
                        <p className="text-[11.5px] text-ink-mute">PDF / Doc File</p>
                      </div>
                    </a>
                  </div>
                )}
                
                {/* Navigation Buttons */}
                <div className="mt-16 flex items-center justify-between border-t hairline pt-6">
                   <button 
                     onClick={() => setActiveModuleIdx(Math.max(0, activeModuleIdx - 1))}
                     disabled={activeModuleIdx === 0}
                     className="px-4 py-2 text-[13px] font-medium text-ink-soft hover:text-ink disabled:opacity-30 transition-colors"
                   >
                     Previous Module
                   </button>
                   
                   <button 
                     onClick={() => {
                       if (activeModuleIdx === roadmap.length - 1) {
                         handleFinishCourse();
                       } else {
                         setActiveModuleIdx(activeModuleIdx + 1);
                       }
                     }}
                     disabled={finishing}
                     className="px-5 py-2.5 rounded-full bg-ink flex items-center gap-2 text-[13px] font-medium text-paper hover:bg-ink/90 disabled:opacity-70 transition-colors"
                   >
                     {finishing && <Loader2 className="h-4 w-4 animate-spin" />}
                     {activeModuleIdx === roadmap.length - 1 ? (finishing ? "Finishing..." : "Finish Course") : "Next Module"}
                   </button>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Utility to convert standard YouTube links to embed links
function getYouTubeEmbedUrl(url: string): string {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com")) {
      const videoId = urlObj.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (urlObj.hostname.includes("youtu.be")) {
      const videoId = urlObj.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    return url;
  } catch (e) {
    return url;
  }
}
