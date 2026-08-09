import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";

import { StageDropdown } from "@/components/hr/StageDropdown";
import { StatusBadge } from "@/components/hr/StatusBadge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { api, qk } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";

export function ApplicantDrawer({
  applicantId,
  onClose,
}: {
  applicantId: string | null;
  onClose: () => void;
}) {
  const { data: applicants = [] } = useQuery({
    queryKey: qk.applicants(),
    queryFn: () => api.applicants(),
  });
  const { data: listings = [] } = useQuery({ queryKey: qk.listings, queryFn: api.listings });

  const applicant = applicants.find((a) => a.id === applicantId);
  const listing = listings.find((l) => l.id === applicant?.listingId);

  return (
    <Sheet open={Boolean(applicantId)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {applicant ? (
          <>
            <SheetHeader>
              <SheetTitle>{applicant.name}</SheetTitle>
              <SheetDescription>
                Applied {formatDate(applicant.appliedAt)} for {listing?.title ?? "a closed listing"}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-8">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={applicant.stage} />
                <StageDropdown applicantId={applicant.id} stage={applicant.stage} kind={applicant.kind} />
              </div>

              <div className="grid gap-3 rounded-xl border bg-card p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p>{applicant.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p>{applicant.phone}</p>
                </div>
                {applicant.season && (
                  <div>
                    <p className="text-xs text-muted-foreground">Internship season</p>
                    <p>{applicant.season}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Resume</p>
                  {applicant.resumeUrl ? (
                    <a
                      href={applicant.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-sm text-brand underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                      aria-label="Open applicant's resume in a new tab"
                    >
                      <FileText className="size-3.5" aria-hidden="true" /> Open resume
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </div>
              </div>

              <section>
                <h3 className="text-sm font-semibold">Their answers</h3>
                <div className="mt-2 space-y-3">
                  {(applicant.answers ?? []).map((a) => (
                    <div key={a.question} className="rounded-xl border bg-card p-3 text-sm">
                      <p className="text-xs text-muted-foreground">{a.question}</p>
                      <p className="mt-1">{a.answer}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold">Stage history</h3>
                <ol className="mt-2 space-y-2 border-l pl-4 text-sm">
                  {(applicant.history ?? []).map((h, i) => (
                    <li key={`${h.stage}-${i}`} className="relative">
                      <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-brand" />
                      <p className="font-medium">{h.stage}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(h.at)} · {h.by}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">Loading applicant…</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
