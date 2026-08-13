import { useState, useMemo } from "react";
import { ArrowUpRight, CircleCheck, CircleDashed, CircleDot, Download, Eye, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { ASSESSMENTS, ESAP_ACTIONS, fmtDate, entityById } from "@/lib/esg-data";
import { A, DocChip, EmptyState, PanelCard, useEsg } from "../primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const PARAM_ICON = {
  ok: { Icon: CircleCheck, color: "var(--color-success)", label: "Adequate" },
  gap: { Icon: TriangleAlert, color: "var(--color-warning)", label: "Gap found" },
  pending: { Icon: CircleDashed, color: "var(--color-muted-foreground)", label: "Pending" },
} as const;

/* ------------------------------------------------------------------ */

function DocumentViewerDialog({
  file,
  project,
  onClose,
}: {
  file: string;
  project: string;
  onClose: () => void;
}) {
  const ext = file.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = ext === "pdf";
  const isDocx = ext === "docx" || ext === "doc";

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[640px] gap-0 overflow-hidden rounded-2xl border-border/60 p-0">
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle className="text-[16px] tracking-tight">
            Document Viewer
          </DialogTitle>
          <DialogDescription className="text-[12px]">
            {project} · {file}
          </DialogDescription>
        </DialogHeader>
        <div className="p-5 space-y-4">
          {/* File metadata */}
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Eye className="h-4 w-4 text-primary" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold truncate">{file}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {isPdf ? "PDF Document" : isDocx ? "Word Document" : "Assessment Report"}
                {" · "}
                {project}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                toast.success(`Downloading ${file}...`, {
                  description: "Document download initiated. (UI stub)",
                });
              }}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/16 transition-colors shrink-0"
            >
              <Download className="h-3 w-3" aria-hidden /> Download
            </button>
          </div>
          {/* Viewer placeholder */}
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <Eye className="h-10 w-10 text-muted-foreground/30 mb-3" aria-hidden />
            <div className="text-[13px] font-medium text-foreground">
              Document preview
            </div>
            <p className="mt-1.5 max-w-[320px] text-[12px] text-muted-foreground leading-relaxed">
              In the production system this area renders the document inline via the backend document store.
              The file <span className="font-medium text-foreground">{file}</span> is attached to this assessment.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** ESDD / ESIA assessment cards. `kind` selects which study type this panel shows. */
export function AssessmentsPanel({
  kind,
  onOpenEsap,
}: {
  kind: "ESDD" | "ESIA";
  onOpenEsap: () => void;
}) {
  const { scope, projectId } = useEsg();
  const [uploads, setUploads] = useState<Record<string, string>>({});
  const [viewingDoc, setViewingDoc] = useState<{ file: string; project: string } | null>(null);

  const assessments = useMemo(() => {
    const items = ASSESSMENTS.filter((a) => {
      if (projectId) {
        if (projectId === "pl-mbmt")
          return a.id === "a-esdd-mbmt" || a.id === "a-esia-mbmt-expansion";
        if (projectId === "pl-silvassa") return a.id === "a-esia-silv";
        if (projectId === "pl-noida") return a.id === "a-esdd-noida";
        return false;
      }
      return !scope.entityId || a.entityId === scope.entityId;
    }).filter((a) => a.kind === kind);
    // Sort: Report pending first, then complete
    return [...items].sort((x, y) => {
      const xPending = !(uploads[x.id] ?? x.reportDoc);
      const yPending = !(uploads[y.id] ?? y.reportDoc);
      if (xPending && !yPending) return -1;
      if (!xPending && yPending) return 1;
      return 0;
    });
  }, [scope.entityId, projectId, kind, uploads]);

  const handleUpload = (assessmentId: string, fileName: string) => {
    setUploads((prev) => ({ ...prev, [assessmentId]: fileName }));
    toast.success("Document uploaded successfully", {
      description: `${fileName} has been attached to the assessment.`,
    });
  };

  const hasAssessments = assessments.length > 0;

  return (
    <>
      {viewingDoc && (
        <DocumentViewerDialog
          file={viewingDoc.file}
          project={viewingDoc.project}
          onClose={() => setViewingDoc(null)}
        />
      )}
      <div className="grid gap-4 md:grid-cols-2">
      {!hasAssessments && (
        <PanelCard className="lg:col-span-2">
          <EmptyState
            title={`No ${kind} assessments in this scope`}
            hint={
              kind === "ESIA"
                ? "ESIA covers greenfield builds."
                : "ESDD covers brownfield acquisitions."
            }
          />
        </PanelCard>
      )}

      {hasAssessments &&
        assessments.map((a) => {
          const findings = ESAP_ACTIONS.filter(
            (x) => x.source.kind === "assessment" && x.source.id === a.id,
          );
          const open = findings.filter((x) => x.status !== "closed").length;
          const reportFile = uploads[a.id] ?? a.reportDoc;

          return (
            <PanelCard
              key={a.id}
              className={cn(
                "flex flex-col justify-between transition-all",
                !reportFile && "border-warning/45 bg-warning/[0.015] shadow-sm",
              )}
            >
              <div>
                <div className="border-b border-border/60 px-5 py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        <A t={a.kind} />
                      </span>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {a.projectType}
                      </span>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {entityById(a.entityId)?.short}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-semibold",
                        a.status === "complete" ? "text-success" : "text-warning",
                      )}
                    >
                      {a.status === "complete" ? (
                        <CircleCheck className="h-3 w-3" aria-hidden />
                      ) : (
                        <CircleDot className="h-3 w-3" aria-hidden />
                      )}
                      {a.status === "complete"
                        ? `Complete · ${fmtDate(a.completedOn!)}`
                        : "In progress"}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-[14px] font-semibold leading-snug tracking-tight">
                    {a.project}
                  </h3>
                </div>
                <div className="space-y-1.5 px-5 py-3.5">
                  <div className="section-label mb-2">
                    Assessment parameters — configurable by project type
                  </div>
                  {a.params.map((p) => {
                    const m = PARAM_ICON[p.result];
                    return (
                      <div
                        key={p.name}
                        className="flex items-center justify-between gap-3 text-[12.5px]"
                      >
                        <span className="text-foreground">{p.name}</span>
                        <span
                          className="inline-flex shrink-0 items-center gap-1 font-medium"
                          style={{ color: m.color }}
                        >
                          <m.Icon className="h-3.5 w-3.5" aria-hidden />
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 px-5 py-3">
                {reportFile ? (
                  <div className="flex items-center gap-3">
                    <DocChip name={reportFile} />
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
                      <span
                        onClick={() => setViewingDoc({ file: reportFile, project: a.project })}
                        className="font-semibold text-primary hover:underline cursor-pointer transition-colors"
                      >
                        View
                      </span>
                      <span className="text-muted-foreground/30" aria-hidden>·</span>
                      <span
                        onClick={() => {
                          toast.success(`Downloading ${reportFile}...`, {
                            description: "Document download initiated successfully.",
                          });
                        }}
                        className="font-semibold text-primary hover:underline cursor-pointer transition-colors"
                      >
                        Download
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-warning">
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse"
                        aria-hidden
                      />
                      Report pending
                    </span>
                    <input
                      type="file"
                      id={`upload-assess-${a.id}`}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUpload(a.id, file.name);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById(`upload-assess-${a.id}`)?.click()}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/16 transition-colors"
                    >
                      Upload Report
                    </button>
                  </div>
                )}
                {findings.length > 0 && (
                  <button
                    type="button"
                    onClick={onOpenEsap}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11.5px] font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    {open} open of {findings.length} findings{" "}
                    <ArrowUpRight className="h-3 w-3" aria-hidden />
                  </button>
                )}
              </div>
            </PanelCard>
          );
        })}
      </div>
    </>
  );
}
