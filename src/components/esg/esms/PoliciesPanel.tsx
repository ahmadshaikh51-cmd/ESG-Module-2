import { useState } from "react";
import { BookOpen, CalendarClock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  entityById,
  personById,
  policiesDueForReview,
  POLICIES,
  fmtDate,
  type Policy,
  type PolicyVersion,
} from "@/lib/esg-data";
import {
  currentApprovedVersion,
  latestVersion,
  policyReviewState,
  reviewCountdownLabel,
} from "@/lib/esg-policy";
import { EmptyState, PanelCard, StatePill, useEsg } from "../primitives";
import { DocStatusPill } from "./DocStatus";
import { PolicyDrawer } from "./PolicyDrawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColors(name?: string): string {
  if (!name) return "bg-primary/10 text-primary border-primary/20";
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const presets = [
    "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20",
    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
    "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-500/20",
    "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border-violet-500/20",
    "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
    "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20",
    "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 border-cyan-500/20",
  ];
  return presets[hash % presets.length];
}

/** Maps a policy version status onto the document-workflow pill vocabulary. */
const VERSION_TO_DOC_STATUS: Record<string, string> = {
  approved: "approved",
  submitted: "under-review",
  draft: "draft",
  rejected: "draft",
};

export function PoliciesPanel({ onOpenEsap }: { onOpenEsap: () => void }) {
  const { scope, policy: wf } = useEsg();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const policies = POLICIES;
  const dueForReview = policiesDueForReview(scope);
  const selected = selectedId ? (POLICIES.find((p) => p.id === selectedId) ?? null) : null;

  return (
    <div className="space-y-4">
      {/* Annual review banner */}
      {dueForReview.length > 0 && (
        <PanelCard accent="var(--color-warning)">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 py-3.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-warning/14 text-warning">
              <CalendarClock className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-foreground/90">
                {dueForReview.length}{" "}
                {dueForReview.length === 1 ? "compliance item needs" : "compliance items need"}{" "}
                annual review
              </div>
              <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-[11.5px] text-muted-foreground">
                {dueForReview.map((p) => {
                  const state = policyReviewState(p);
                  const isOverdue = state === "overdue";
                  return (
                    <li key={p.id} className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                          isOverdue ? "bg-destructive animate-pulse" : "bg-warning",
                        )}
                        aria-hidden
                      />
                      <span>
                        <span className="font-medium text-foreground">{p.name}</span>
                        {" · "}
                        <span
                          className={cn(
                            "num font-semibold",
                            isOverdue ? "text-destructive" : "text-warning",
                          )}
                        >
                          {reviewCountdownLabel(p)}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </PanelCard>
      )}

      <PanelCard>
        <div className="border-b border-border/60 px-5 py-3.5">
          <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden /> Policies
          </h3>
          <p className="text-[12px] text-muted-foreground">
            Versioned and annually reviewed. Approval gates a policy's entry into the ESAP/ESMP
            Register — open a row to upload, submit, and approve.
          </p>
        </div>
        {policies.length === 0 ? (
          <EmptyState
            title="No policies in this scope"
            hint="Corporate policies live under the Corporate (HQ) entity."
          />
        ) : (
          <div className="divide-y divide-border/40">
            {policies.map((p) => (
              <PolicyRow
                key={p.id}
                policy={p}
                versionsFor={wf.policyVersions}
                onOpen={() => setSelectedId(p.id)}
              />
            ))}
          </div>
        )}
      </PanelCard>

      {selected && (
        <PolicyDrawer
          policy={selected}
          onClose={() => setSelectedId(null)}
          onOpenEsap={onOpenEsap}
        />
      )}
    </div>
  );
}

function PolicyRow({
  policy,
  versionsFor,
  onOpen,
}: {
  policy: Policy;
  versionsFor: (id: string) => PolicyVersion[];
  onOpen: () => void;
}) {
  const versions = versionsFor(policy.id);
  const latest = latestVersion(versions);
  const approved = currentApprovedVersion(versions);
  const reviewState = policyReviewState(policy);
  const owner = personById(policy.ownerId);

  const colors = getAvatarColors(owner?.name);

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    if (action === "download") {
      if (latest?.doc) {
        toast.success(`Downloading ${latest.doc.name}...`, {
          description: `Size: ${latest.doc.size} · Document download initiated.`,
        });
      } else {
        toast.error("No document available to download");
      }
    } else if (action === "upload") {
      toast.info("Upload initiated", {
        description: "Opening policy details to select and upload a new version.",
      });
      onOpen();
    } else {
      onOpen();
    }
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/60"
    >
      <Avatar
        className={cn(
          "h-9 w-9 shrink-0 rounded-full border text-[11px] font-semibold tracking-wider",
          colors,
        )}
      >
        <AvatarFallback className="bg-transparent uppercase">
          {getInitials(owner?.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-y-2 gap-x-6 items-center">
        {/* Title & Owner Info */}
        <div className="lg:col-span-6 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[13.5px] font-semibold text-foreground/90">
              {policy.name}
            </span>
            <span className="num rounded-md bg-muted px-1.5 py-0.5 text-[9.5px] font-bold text-muted-foreground uppercase">
              {approved ?? "no approved version"}
            </span>
            {latest && <DocStatusPill status={VERSION_TO_DOC_STATUS[latest.status] ?? "draft"} />}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
            <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/90">
              {entityById(policy.entityId)?.short}
            </span>
            <span className="text-muted-foreground/30" aria-hidden>
              ·
            </span>
            <span className="truncate">
              owner <span className="font-semibold text-foreground/80">{owner?.name}</span>{" "}
              {owner?.role && (
                <span className="text-[10px] font-normal text-muted-foreground/60">
                  ({owner.role})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="lg:col-span-3 min-w-0 text-[11px] text-muted-foreground/80 lg:pl-2">
          <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground/45 mb-0.5">
            Last Updated
          </div>
          <div className="font-medium text-foreground/80 num">{fmtDate(policy.updated)}</div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-3 min-w-0 text-[11px] text-muted-foreground/80">
          <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground/45 mb-0.5">
            Quick Actions
          </div>
          <div className="flex items-center gap-2">
            <span
              onClick={(e) => handleAction(e, "view")}
              className="font-semibold text-primary hover:underline cursor-pointer transition-colors"
            >
              View
            </span>
            <span className="text-muted-foreground/30" aria-hidden>
              ·
            </span>
            <span
              onClick={(e) => handleAction(e, "upload")}
              className="font-semibold text-primary hover:underline cursor-pointer transition-colors"
            >
              Upload
            </span>
            {latest && (
              <>
                <span className="text-muted-foreground/30" aria-hidden>
                  ·
                </span>
                <span
                  onClick={(e) => handleAction(e, "download")}
                  className="font-semibold text-primary hover:underline cursor-pointer transition-colors"
                >
                  Download
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Due Date & Review Status */}
      <div className="flex shrink-0 items-center gap-4 lg:pl-2">
        <div className="text-right">
          <div className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground/45 mb-0.5">
            Annual Review
          </div>
          <div
            className={cn(
              "num text-[12px] font-semibold",
              reviewState === "overdue"
                ? "text-destructive"
                : reviewState === "expiring"
                  ? "text-warning"
                  : "text-muted-foreground",
            )}
          >
            {reviewCountdownLabel(policy)}
          </div>
        </div>
        <div className="w-[74px] flex justify-end shrink-0">
          {reviewState !== "valid" ? <StatePill state={reviewState} /> : <div className="h-5" />}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" aria-hidden />
      </div>
    </button>
  );
}
