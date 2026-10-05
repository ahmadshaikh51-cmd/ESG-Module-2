import { useMemo, useState } from "react";
import { FileSearch, FileSpreadsheet, Link2, PencilLine, Layers, Activity } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { exportToXlsx } from "@/lib/export-xlsx";
import {
  daysUntil,
  ESAP_ACTIONS,
  esapActionEntityId,
  esapSourceLabel,
  esapState,
  fmtDate,
  isEsmsSubAvailable,
  personById,
  type EsapAction,
} from "@/lib/esg-data";
import { A, EmptyState, PanelCard, useEsg } from "../primitives";
import { Segmented } from "../Segmented";
import { EsapMonitoringDashboard } from "../monitoring/esap/EsapMonitoringDashboard";
import { EsapDetailDrawer } from "../monitoring/esap/EsapDetailDrawer";

type EsapFilter = "all" | "open" | "overdue" | "closed" | "status";

/**
 * The ESAP action register — a living worklist of corrective actions converging
 * from assessments, audits, and policies. Integrates the Status tab containing
 * all Monitor & Review dashboard intelligence.
 */
export function EsapPanel({ onOpenSource }: { onOpenSource: (sub: string) => void }) {
  const { scope, audience, policy, audit } = useEsg();
  const [actionOverrides, setActionOverrides] = useState<Record<string, EsapAction["status"]>>({});
  const [filter, setFilter] = useState<EsapFilter>("all");
  const [selectedDrawerAction, setSelectedDrawerAction] = useState<EsapAction | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allScopedActions = useMemo(() => {
    const base = [...ESAP_ACTIONS, ...policy.policyEsapActions(), ...audit.auditEsapActions()];
    const withStatus = base.map((a) => ({ ...a, status: actionOverrides[a.id] ?? a.status }));
    return withStatus.filter((a) => {
      if (!scope.entityId) return true;
      return esapActionEntityId(a) === scope.entityId;
    });
  }, [scope.entityId, actionOverrides, policy, audit]);

  const actions = useMemo(() => {
    if (filter === "all" || filter === "status") return allScopedActions;
    if (filter === "closed") return allScopedActions.filter((a) => a.status === "closed");
    if (filter === "overdue")
      return allScopedActions.filter((a) => a.status !== "closed" && daysUntil(a.due) < 0);
    return allScopedActions.filter((a) => a.status !== "closed");
  }, [allScopedActions, filter]);

  const advance = (a: EsapAction) => {
    const next = a.status === "open" ? "in-progress" : "closed";
    setActionOverrides((o) => ({ ...o, [a.id]: next }));
    toast.success(next === "closed" ? "Action closed" : "Action moved to in-progress", {
      description: `${a.action}`,
    });
  };

  const handleOpenDrawer = (action: EsapAction) => {
    setSelectedDrawerAction(action);
    setDrawerOpen(true);
  };

  const filterTabs: { key: EsapFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "overdue", label: "Overdue" },
    { key: "closed", label: "Closed" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="space-y-1">
          <h2 className="text-[20px] font-bold tracking-tight text-foreground flex items-center gap-2">
            <A t="ESAP" />/<A t="ESMP" /> Register
          </h2>
          <p className="text-[12.5px] text-muted-foreground">
            Environmental & Social Action Plan tracking, audit NC resolutions, and policy rollout compliance.
          </p>
        </div>
      </div>

      {/* Navigation Pills Bar (All | Open | Overdue | Closed | Status | Export) */}
      {filter === "status" ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-foreground">View Filter:</span>
              <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/20 p-1">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    aria-pressed={filter === tab.key}
                    className={cn(
                      "rounded-full px-3.5 py-1 text-[12px] font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 cursor-pointer",
                      filter === tab.key
                        ? "bg-teal-500/25 text-teal-800 dark:text-teal-200 font-bold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (allScopedActions.length === 0) {
                  toast("Nothing to export", { description: "No ESAP actions available to export." });
                  return;
                }
                exportToXlsx(
                  "esap-register",
                  [
                    { key: "Action", header: "Action" },
                    { key: "Finding", header: "Finding" },
                    { key: "Source", header: "Source" },
                    { key: "Owner", header: "Owner" },
                    { key: "Due", header: "Due Date" },
                    { key: "Status", header: "Status" },
                    { key: "NC Ref", header: "NC Ref" },
                  ],
                  allScopedActions.map((a) => ({
                    Action: a.action,
                    Finding: a.finding,
                    Source: esapSourceLabel(a.source).label,
                    Owner: personById(a.ownerId)?.name ?? a.ownerId,
                    Due: a.due,
                    Status: a.status === 'closed' ? 'Closed' : esapState(a) === 'overdue' ? 'Overdue' : a.status === 'in-progress' ? 'In Progress' : 'Open',
                    "NC Ref": a.ncRef ?? "",
                  })),
                  "ESAP Register",
                );
                toast.success("ESAP Register exported", {
                  description: `${allScopedActions.length} action${allScopedActions.length === 1 ? "" : "s"} exported to Excel.`,
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-[12px] font-semibold text-foreground shadow-xs transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-primary" aria-hidden /> Export
            </button>
          </div>

          <EsapMonitoringDashboard onOpenSource={onOpenSource} />
        </div>
      ) : (
        <PanelCard>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
            <div>
              <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
                <FileSearch className="h-4 w-4 text-primary" aria-hidden />
                <A t="ESAP" />/<A t="ESMP" /> — action register worklist
              </h3>
              <p className="text-[12px] text-muted-foreground">
                A living worklist converging from <A t="ESDD" /> / <A t="ESIA" /> findings, audit{" "}
                <A t="NC" />s, and approved policies.
              </p>
            </div>

            {/* Status Pills & Export (All | Open | Overdue | Closed | Status | Export) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/20 p-1">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    aria-pressed={filter === tab.key}
                    className={cn(
                      "rounded-full px-3.5 py-1 text-[12px] font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 cursor-pointer",
                      filter === tab.key
                        ? "bg-teal-500/25 text-teal-800 dark:text-teal-200 font-bold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (actions.length === 0) {
                    toast("Nothing to export", { description: "No ESAP actions match the current filter." });
                    return;
                  }
                  exportToXlsx(
                    "esap-register",
                    [
                      { key: "Action", header: "Action" },
                      { key: "Finding", header: "Finding" },
                      { key: "Source", header: "Source" },
                      { key: "Owner", header: "Owner" },
                      { key: "Due", header: "Due Date" },
                      { key: "Status", header: "Status" },
                      { key: "NC Ref", header: "NC Ref" },
                    ],
                    actions.map((a) => ({
                      Action: a.action,
                      Finding: a.finding,
                      Source: esapSourceLabel(a.source).label,
                      Owner: personById(a.ownerId)?.name ?? a.ownerId,
                      Due: a.due,
                      Status: a.status === 'closed' ? 'Closed' : esapState(a) === 'overdue' ? 'Overdue' : a.status === 'in-progress' ? 'In Progress' : 'Open',
                      "NC Ref": a.ncRef ?? "",
                    })),
                    "ESAP Register",
                  );
                  toast.success("ESAP Register exported", {
                    description: `${actions.length} action${actions.length === 1 ? "" : "s"} exported to Excel.`,
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-[12px] font-semibold text-foreground shadow-xs transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-primary" aria-hidden /> Export
              </button>
            </div>
          </div>

          {actions.length === 0 ? (
            <EmptyState title="No actions match" hint="Change the filter or scope." />
          ) : (
            <div className="divide-y divide-border/40">
              {actions.map((a) => {
                const st = esapState(a);
                const owner = personById(a.ownerId);
                const src = esapSourceLabel(a.source);
                const linkable = isEsmsSubAvailable(src.sub);
                const closed = a.status === "closed";

                return (
                  <div
                    key={a.id}
                    className={cn(
                      "flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/15 cursor-pointer",
                      closed && "opacity-60",
                    )}
                    onClick={() => handleOpenDrawer(a)}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-[13px] font-medium leading-snug text-foreground">{a.action}</div>
                        {a.ncRef && (
                          <span className="num shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {a.ncRef}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (linkable) onOpenSource(src.sub);
                        }}
                        disabled={!linkable}
                        className={cn(
                          "mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-[11.5px] text-muted-foreground underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                          linkable ? "hover:text-primary hover:underline" : "cursor-default",
                        )}
                        title={linkable ? "Open the source" : "Source view lands in a later phase"}
                      >
                        <Link2 className="h-3 w-3 shrink-0" aria-hidden />
                        {a.finding} · from {src.label}
                      </button>
                    </div>

                    <div className="flex shrink-0 items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <div className="text-right">
                        <div className="text-[11px] text-muted-foreground">{owner?.name}</div>
                        <div
                          className={cn(
                            "num text-[12px] font-semibold",
                            st === "overdue" ? "text-destructive" : "text-muted-foreground",
                          )}
                        >
                          {closed ? `closed ${fmtDate(a.closedOn!)}` : `due ${fmtDate(a.due)}`}
                        </div>
                      </div>

                      <span
                        className={cn(
                          "inline-flex w-[86px] items-center justify-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                          closed
                            ? "bg-success/12 text-success"
                            : st === "overdue"
                              ? "bg-destructive/12 text-destructive"
                              : a.status === "in-progress"
                                ? "bg-warning/14 text-warning"
                                : "bg-muted text-muted-foreground",
                        )}
                      >
                        {closed
                          ? "Closed"
                          : st === "overdue"
                            ? "Overdue"
                            : a.status === "in-progress"
                              ? "In progress"
                              : "Open"}
                      </span>

                      {!closed && audience === "internal" && (
                        <button
                          type="button"
                          onClick={() => advance(a)}
                          className="rounded-lg border border-border/60 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                        >
                          {a.status === "open" ? "Start" : "Close"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PanelCard>
      )}

      {/* Drawer */}
      <EsapDetailDrawer
        action={selectedDrawerAction}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAdvanceStatus={advance}
        onOpenSource={onOpenSource}
      />
    </div>
  );
}
