import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarClock,
  CircleCheck,
  ClipboardList,
  FileText,
  Grid3X3,
  ShieldAlert,
  Waypoints,
  X,
  ListTodo,
  Undo,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Search,
  MapPin,
  HelpCircle,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Segmented } from "./Segmented";
import { getCurrentUser } from "@/lib/auth";
import { getRoleFromEmail, ESG_ROLES_CONFIG, type EsgRole, type EsgRoleConfig } from "@/lib/esg-roles";
import { INDICATORS, PROJECTS_MAPPING, type ReportType, ReportDataEntryForm } from "./projects/ReportDataEntryForm";
import { PERIODS } from "@/lib/esg-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { EscalationStatusIndicator } from "./EscalationStatusIndicator";
import { getActiveEscalationForSource } from "@/lib/esg-escalations";
import {
  cellStat,
  DOMAINS,
  ESAP_ACTIONS,
  ESG_GROUP,
  POLICIES,
  entityById,
  ESG_TODAY,
  esapState,
  headline,
  personById,
  RECORDS,
  recordState,
  STATE_META,
  typeByKey,
  worstOf,
  PROJECT_LIFECYCLES,
  lifecycleStageByKey,
  esapActionEntityId,
  type CellStat,
  type ComplianceRecord,
  type DomainKey,
  type EsgState,
} from "@/lib/esg-data";
import { fmtDate, inScope } from "@/lib/esg-data";
import {
  CriticalBeam,
  EmptyState,
  Gloss,
  LoadingRows,
  PanelCard,
  StatePill,
  useEsg,
  useStubLoad,
} from "./primitives";
import { WorkQueue } from "./WorkQueue";
import { buildNcRegister, ncItemPlace, NC_SOURCE_LABEL, type NcItem } from "@/lib/esg-nc";
import { LifecyclePanel } from "./esms/LifecyclePanel";

/* --------------------------------- tiles ---------------------------------- */

type PanelSel =
  | { kind: "state"; state: EsgState }
  | { kind: "actions" }
  | { kind: "openNc" }
  | { kind: "breaches" }
  | { kind: "domain"; entityId: string; domain: DomainKey }
  | null;

function RiskTile({
  label,
  value,
  hint,
  accent,
  active,
  onClick,
  curated,
  className,
}: {
  label: React.ReactNode;
  value: string;
  hint: string;
  accent: string;
  active?: boolean;
  onClick?: () => void;
  curated?: boolean;
  className?: string;
}) {
  if (curated) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border/70 bg-card/50 p-5",
          className,
        )}
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 5px, color-mix(in oklab, var(--muted-foreground) 5%, transparent) 5px, color-mix(in oklab, var(--muted-foreground) 5%, transparent) 6px)",
        }}
      >
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </div>
        <div className="mt-1.5 text-[15px] font-semibold text-muted-foreground">Withheld</div>
        <div className="mt-1 text-[11.5px] text-muted-foreground">
          Curated out of the external view
        </div>
      </div>
    );
  }
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "cursor-pointer rounded-2xl border bg-card p-5 shadow-elevated transition-[transform,border-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:border-primary/40 active:scale-[0.98]",
        active ? "" : "border-border/60",
        className,
      )}
      style={
        active
          ? {
              borderColor: accent,
              boxShadow: `0 0 0 1px ${accent}, 0 12px 32px -12px color-mix(in oklab, ${accent} 30%, transparent)`,
            }
          : undefined
      }
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="num text-[26px] font-semibold tracking-tight" style={{ color: accent }}>
          {value}
        </span>
      </div>
      <div className="mt-1 text-[11.5px] text-muted-foreground">{hint}</div>
    </div>
  );
}

/** Compact drill list for the Open NCs / Monitoring breaches tiles — same NcItem shape as the NC register. */
function NcItemList({ items, onOpen }: { items: NcItem[]; onOpen: (sub: string) => void }) {
  if (items.length === 0)
    return <EmptyState title="Nothing here" hint="No items match in this scope." />;
  return (
    <div className="max-h-[380px] overflow-auto">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onOpen(item.backlink.kind === "esms" ? item.backlink.sub : "esap")}
          className="flex w-full items-center justify-between gap-4 border-b border-border/40 px-5 py-3 text-left transition-colors last:border-0 hover:bg-muted/40"
        >
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-medium">{item.title}</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {NC_SOURCE_LABEL[item.source]} · {ncItemPlace(item)}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span
              className={cn(
                "num text-[12px] font-semibold",
                item.ageDays > 30 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {item.ageDays}d
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
          </div>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ matrix / graph ----------------------------- */

function CellChip({
  stat,
  onClick,
  curated,
}: {
  stat: CellStat;
  onClick?: () => void;
  curated?: boolean;
}) {
  const total = stat.valid + stat.expiring + stat.overdue;
  if (total === 0)
    return (
      <span className="inline-block rounded-md px-2 py-1 text-[11px] text-muted-foreground/60">
        —
      </span>
    );
  if (curated) {
    const pct = Math.round((stat.valid / total) * 100);
    const healthy = pct >= 95;
    return (
      <span
        className={cn(
          "num inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-semibold",
          healthy ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
        )}
      >
        {healthy && <CircleCheck className="h-3 w-3" aria-hidden />}
        {pct}%
      </span>
    );
  }
  const worst = worstOf(stat);
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-semibold transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      style={{
        background: `color-mix(in oklab, ${STATE_META[worst].color} 12%, transparent)`,
        color: STATE_META[worst].color,
      }}
      aria-label={`${stat.valid} valid, ${stat.expiring} expiring, ${stat.overdue} overdue — drill down`}
    >
      {worst === "valid" ? (
        <>
          <CircleCheck className="h-3 w-3" aria-hidden />
          <span className="num">{stat.valid}</span>
        </>
      ) : (
        <>
          {stat.overdue > 0 && (
            <span className="num inline-flex items-center gap-0.5">
              <ShieldAlert className="h-3 w-3" aria-hidden />
              {stat.overdue}
            </span>
          )}
          {stat.expiring > 0 && (
            <span className="num inline-flex items-center gap-0.5 opacity-90">
              <CalendarClock className="h-3 w-3" aria-hidden />
              {stat.expiring}
            </span>
          )}
        </>
      )}
    </button>
  );
}

function StackBar({ stat }: { stat: CellStat }) {
  const total = Math.max(1, stat.valid + stat.expiring + stat.overdue);
  const seg = (n: number, state: EsgState) =>
    n > 0 && (
      <div
        className="flex h-full items-center justify-center rounded-[3px] transition-all"
        style={{ width: `${(n / total) * 100}%`, background: STATE_META[state].color }}
        title={`${STATE_META[state].label}: ${n}`}
      >
        {n / total > 0.12 && <span className="num text-[10px] font-bold text-white/95">{n}</span>}
      </div>
    );
  return (
    <div className="flex h-5 w-full gap-[2px] overflow-hidden rounded-md bg-muted/40 p-[1px]">
      {seg(stat.valid, "valid")}
      {seg(stat.expiring, "expiring")}
      {seg(stat.overdue, "overdue")}
    </div>
  );
}

/* --------------------------- contributor workspace ------------------------- */

interface ContributorWorkspaceProps {
  esgRole: EsgRole;
  roleConfig: EsgRoleConfig;
  activePeriod: string;
  scope: any;
  onOpenForm: (
    reportType: any,
    recordId: string | null,
    project: string,
    siteId: string,
    period: string
  ) => void;
}

function ContributorWorkspace({
  esgRole,
  roleConfig,
  activePeriod,
  scope,
  onOpenForm,
}: ContributorWorkspaceProps) {
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState(activePeriod || "all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [returnTask, setReturnTask] = useState<any>(null);
  const [returnReason, setReturnReason] = useState("");

  const isReviewerOrApprover = esgRole === "reviewer" || esgRole === "approver";

  const savedRecords = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("voltline-report-records") || "[]");
    } catch {
      return [];
    }
  }, [refreshTrigger]);

  const updateRecordStatus = (task: any, newStatus: string, reason?: string) => {
    try {
      const records = JSON.parse(localStorage.getItem("voltline-report-records") || "[]");
      const recordId = task.recordId;
      
      let updated;
      if (recordId) {
        updated = records.map((r: any) => {
          if (r.id === recordId) {
            return { 
              ...r, 
              status: newStatus,
              returnReason: reason || r.returnReason || ""
            };
          }
          return r;
        });
      } else {
        const newRecord = {
          id: `rec_${Date.now()}`,
          project: task.project,
          site: task.siteId,
          reportingPeriod: task.period,
          reportType: task.reportType,
          status: newStatus,
          returnReason: reason || "",
          indicatorValues: {
            [task.indicator.id]: { actual: null, unit: task.indicator.unit }
          }
        };
        updated = [newRecord, ...records];
      }
      
      localStorage.setItem("voltline-report-records", JSON.stringify(updated));
      setRefreshTrigger(prev => prev + 1);
      toast.success(`Entry marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleApprove = (task: any) => {
    updateRecordStatus(task, "Approved");
  };

  const handleReview = (task: any) => {
    updateRecordStatus(task, "Reviewed");
  };

  const handleReturn = (task: any) => {
    setReturnTask(task);
    setReturnReason("");
  };

  const submitReturn = () => {
    if (!returnReason.trim()) {
      toast.error("Please enter a reason for returning the record");
      return;
    }
    updateRecordStatus(returnTask, "Returned", returnReason);
    setReturnTask(null);
    setReturnReason("");
  };

  const allTasks = useMemo(() => {
    const tasks: any[] = [];

    Object.entries(PROJECTS_MAPPING).forEach(([projName, projMeta]) => {
      projMeta.sites.forEach((siteMeta) => {
        projMeta.indicators.forEach((indId) => {
          if (!isReviewerOrApprover && !roleConfig.indicators.includes(indId)) return;

          const indMeta = INDICATORS.find(i => i.id === indId);
          if (!indMeta) return;

          PERIODS.forEach((periodMeta) => {
            const matchingRecord = savedRecords.find((r: any) =>
              r.project === projName &&
              r.site === siteMeta.id &&
              r.reportingPeriod === periodMeta.id &&
              r.indicatorValues?.[indId]?.actual !== undefined
            );

            let status = "Pending Entry";
            let value = null;
            let recordId = null;
            let reportType = indMeta.maps[0];
            let reasonText = "";

            if (matchingRecord) {
              status = matchingRecord.status || "Draft";
              value = matchingRecord.indicatorValues[indId].actual;
              recordId = matchingRecord.id;
              reportType = matchingRecord.reportType || reportType;
              reasonText = matchingRecord.returnReason || "";
            }

            if (isReviewerOrApprover && status === "Pending Entry") return;

            if (scope?.entityId && PROJECTS_MAPPING[projName]?.sites.every(s => s.id !== scope.entityId)) {
              // skip
            }

            tasks.push({
              project: projName,
              siteId: siteMeta.id,
              siteName: siteMeta.name,
              indicator: indMeta,
              period: periodMeta.id,
              periodLabel: periodMeta.label,
              responsible: projMeta.person,
              dept: projMeta.dept,
              status,
              value,
              recordId,
              reportType,
              returnReason: reasonText
            });
          });
        });
      });
    });
    return tasks;
  }, [savedRecords, esgRole, roleConfig.indicators, scope]);

  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      const matchesProj = selectedProject === "all" || t.project === selectedProject;
      const matchesSite = selectedSite === "all" || t.siteId === selectedSite;
      const matchesPeriod = selectedPeriod === "all" || t.period === selectedPeriod;
      const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.indicator.name.toLowerCase().includes(q) ||
        t.indicator.id.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q) ||
        t.siteName.toLowerCase().includes(q);

      return matchesProj && matchesSite && matchesPeriod && matchesStatus && matchesSearch;
    });
  }, [allTasks, selectedProject, selectedSite, selectedPeriod, selectedStatus, searchQuery]);

  const metrics = useMemo(() => {
    const total = filteredTasks.length;
    const pending = filteredTasks.filter(t => t.status === "Pending Entry").length;
    const draft = filteredTasks.filter(t => t.status === "Draft").length;
    const submitted = filteredTasks.filter(t => t.status === "Submitted").length;
    const reviewed = filteredTasks.filter(t => t.status === "Reviewed").length;
    const returned = filteredTasks.filter(t => t.status === "Returned").length;
    const approved = filteredTasks.filter(t => t.status === "Approved").length;

    const actioned = total - pending - draft - returned;
    
    return {
      total,
      pending,
      draft,
      submitted,
      reviewed,
      returned,
      approved,
      completionRate: total > 0 ? Math.round((actioned / total) * 100) : 0,
    };
  }, [filteredTasks]);

  const siteOptions = useMemo(() => {
    if (selectedProject === "all") return [];
    return PROJECTS_MAPPING[selectedProject]?.sites || [];
  }, [selectedProject]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div>
          <h2 className="text-[16px] font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-4.5 w-4.5 text-primary" /> 
            {esgRole === "approver" ? "Approvals Command Center" : esgRole === "reviewer" ? "Validation Queue" : "Departmental Workspace"} 
            <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              {roleConfig.label}
            </span>
          </h2>
          <p className="text-[11.5px] text-muted-foreground mt-0.5">
            {esgRole === "approver" 
              ? "Pending approvals for environmental, social and governance operational disclosures."
              : esgRole === "reviewer"
                ? "Validate, review, and query indicators entered by facility managers."
                : "Submit operational metrics and track approval status."
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-medium text-muted-foreground">
            Role Scoped Access
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <PanelCard className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Workspace Progress
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-foreground num">
              {metrics.completionRate}%
            </span>
            <span className="text-[11.5px] text-muted-foreground font-mono">
              ({metrics.total - metrics.pending - metrics.draft} / {metrics.total} items)
            </span>
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
        </PanelCard>

        {esgRole === "approver" || esgRole === "reviewer" ? (
          <>
            <PanelCard className="p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Pending Decisions
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className={cn("text-2xl font-extrabold num", (esgRole === "approver" ? metrics.reviewed : metrics.submitted) > 0 ? "text-primary" : "text-success")}>
                  {esgRole === "approver" ? metrics.reviewed : metrics.submitted}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Needs Action
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-3 block">
                {esgRole === "approver" ? "Awaiting your final approval signature" : "Awaiting validation checks"}
              </span>
            </PanelCard>

            <PanelCard className="p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Returned to Contributor
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className={cn("text-2xl font-extrabold num", metrics.returned > 0 ? "text-warning" : "text-muted-foreground")}>
                  {metrics.returned}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Discrepancies
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-3 block">
                Returned for correction notes
              </span>
            </PanelCard>
          </>
        ) : (
          <>
            <PanelCard className="p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Awaiting Data Entry
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className={cn("text-2xl font-extrabold num", metrics.pending > 0 ? "text-warning" : "text-success")}>
                  {metrics.pending}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Tasks
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-3 block">
                Please enter actuals for the current period
              </span>
            </PanelCard>

            <PanelCard className="p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Returned / Rejected
              </span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className={cn("text-2xl font-extrabold num", metrics.returned > 0 ? "text-destructive" : "text-muted-foreground")}>
                  {metrics.returned}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Needs Correction
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-3 block">
                Entries returned with auditor remarks
              </span>
            </PanelCard>
          </>
        )}

        <PanelCard className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Approved Entries
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-success num">
              {metrics.approved}
            </span>
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              Signed Off
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-3 block">
            Locked from editing
          </span>
        </PanelCard>
      </div>

      <PanelCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label className="text-[11.5px] font-semibold text-muted-foreground">Project</Label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full h-8 rounded-lg border border-border/80 bg-background px-2 text-[12px] focus:outline-none"
            >
              <option value="all">All Projects</option>
              {Object.keys(PROJECTS_MAPPING).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11.5px] font-semibold text-muted-foreground">Site / Facility</Label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              disabled={selectedProject === "all"}
              className="w-full h-8 rounded-lg border border-border/80 bg-background px-2 text-[12px] focus:outline-none disabled:opacity-50"
            >
              <option value="all">All Sites</option>
              {siteOptions.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11.5px] font-semibold text-muted-foreground">Reporting Period</Label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full h-8 rounded-lg border border-border/80 bg-background px-2 text-[12px] focus:outline-none"
            >
              <option value="all">All Periods</option>
              {PERIODS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11.5px] font-semibold text-muted-foreground">Status</Label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-8 rounded-lg border border-border/80 bg-background px-2 text-[12px] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Pending Entry">Pending Entry</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Returned">Returned</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11.5px] font-semibold text-muted-foreground">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search indicator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 rounded-lg border border-border/80 bg-background text-[12px] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </PanelCard>

      <PanelCard className="p-0 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <EmptyState
            title="No items found"
            hint="Your filters returned no records or there are no indicators assigned to this category."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5">Indicator Code & Description</th>
                  <th className="px-3 py-3.5">Project / Site</th>
                  <th className="px-3 py-3.5">Period</th>
                  <th className="px-3 py-3.5">Entered Value</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredTasks.map((t, idx) => {
                  const isPending = t.status === "Pending Entry";
                  const isDraft = t.status === "Draft";
                  const isSubmitted = t.status === "Submitted";
                  const isReviewed = t.status === "Reviewed";
                  const isReturned = t.status === "Returned";
                  const isApproved = t.status === "Approved";

                  return (
                    <tr
                      key={`${t.project}-${t.siteId}-${t.indicator.id}-${t.period}-${idx}`}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-3 max-w-[280px]">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-primary text-[10.5px] font-mono bg-primary/8 border border-primary/15 rounded px-1 py-0.5">
                              {t.indicator.id}
                            </span>
                            <span className="text-[12px] font-bold text-muted-foreground font-mono">
                              {t.indicator.scope}
                            </span>
                          </div>
                          <div className="font-semibold text-foreground text-[12.5px] truncate mt-1" title={t.indicator.name}>
                            {t.indicator.name}
                          </div>
                          {isReturned && t.returnReason && (
                            <div className="mt-1 text-[11px] text-warning bg-warning/5 border border-warning/15 rounded-lg p-2 leading-relaxed">
                              <span className="font-bold">Auditor remark:</span> {t.returnReason}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="font-semibold text-foreground text-[12.5px]">{t.project}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{t.siteName}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3 font-medium text-foreground num">
                        {t.periodLabel}
                      </td>

                      <td className="px-3 py-3 font-semibold num text-[13px]">
                        {t.value !== null && t.value !== undefined ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-foreground">{t.value}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">{t.indicator.unit}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 italic">—</span>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        <span className={cn(
                          "inline-flex h-5 items-center rounded-md border px-1.5 text-[10px] font-bold",
                          isPending && "bg-muted/80 text-muted-foreground border-border/60",
                          isDraft && "bg-warning/10 text-warning border-warning/20",
                          isSubmitted && "bg-primary/10 text-primary border-primary/20",
                          isReviewed && "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
                          isReturned && "bg-destructive/10 text-destructive border-destructive/20",
                          isApproved && "bg-success/10 text-success border-success/20"
                        )}>
                          {t.status}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {esgRole === "reviewer" && isSubmitted && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleReview(t)}
                                className="h-7 text-[11px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                              >
                                Mark Reviewed
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReturn(t)}
                                className="h-7 text-[11px] font-bold text-warning border-warning/30 hover:bg-warning/5 rounded-lg"
                              >
                                Return
                              </Button>
                            </>
                          )}

                          {esgRole === "approver" && (isSubmitted || isReviewed) && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(t)}
                                className="h-7 text-[11px] font-bold bg-success hover:bg-success/90 text-success-foreground rounded-lg"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReturn(t)}
                                className="h-7 text-[11px] font-bold text-warning border-warning/30 hover:bg-warning/5 rounded-lg"
                              >
                                Return
                              </Button>
                            </>
                          )}

                          {!isReviewerOrApprover && (isPending || isDraft || isReturned) && (
                            <Button
                              size="sm"
                              variant={isPending ? "default" : "outline"}
                              className={cn(
                                "h-7 text-[11px] font-semibold gap-1 rounded-lg cursor-pointer px-2.5",
                                isPending && "bg-primary hover:bg-primary/90 text-primary-foreground"
                              )}
                              onClick={() => {
                                onOpenForm(t.reportType, t.recordId, t.project, t.siteId, t.period);
                              }}
                            >
                              {isPending ? "Enter Data" : "Edit"}
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}

                          {(isApproved || (esgRole === "reviewer" && (isReviewed || isApproved))) && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] gap-1 rounded-lg px-2.5"
                              onClick={() => {
                                onOpenForm(t.reportType, t.recordId, t.project, t.siteId, t.period);
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      {returnTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-[4px]">
          <PanelCard className="w-full max-w-md p-6 border-warning/30 bg-card shadow-elevated">
            <div className="flex items-center gap-2 text-warning mb-3">
              <AlertCircle className="h-5 w-5" />
              <h4 className="text-[15px] font-extrabold text-foreground">Return for Correction</h4>
            </div>
            <p className="text-[12px] text-muted-foreground mb-4">
              Specify why the submitted value for <span className="font-semibold text-foreground">{returnTask.indicator.name}</span> at <span className="font-semibold text-foreground">{returnTask.siteName}</span> ({returnTask.periodLabel}) is being returned.
            </p>
            <div className="space-y-3">
              <Label htmlFor="reason" className="text-[11.5px] font-bold text-muted-foreground font-semibold">Correction Notes / Reason</Label>
              <textarea
                id="reason"
                rows={3}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="E.g., Please cross-reference with the attached utility bill; consumption seems unusually high."
                className="w-full rounded-xl border border-border bg-card/85 p-2.5 text-[12px] focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/45"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReturnTask(null);
                    setReturnReason("");
                  }}
                  className="text-[11.5px] font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={submitReturn}
                  className="text-[11.5px] font-bold bg-warning hover:bg-warning/95 text-warning-foreground cursor-pointer"
                >
                  Confirm Return
                </Button>
              </div>
            </div>
          </PanelCard>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- overview -------------------------------- */

export function OverviewTab({ deepLinkRecordId }: { deepLinkRecordId?: string }) {
  const {
    scope,
    setScope,
    audience,
    goto,
    period,
    audit,
    monitoring,
    policy,
    projectId: selectedProjectId,
    setProjectId: setSelectedProjectId,
  } = useEsg();
  const [panel, setPanel] = useState<PanelSel>(null);
  const [view, setView] = useState<"matrix" | "graph">("matrix");
  const loading = useStubLoad(JSON.stringify(scope) + audience + selectedProjectId);
  const reduce = useReducedMotion();

  const [activeForm, setActiveForm] = useState<any>(null);
  const [editRecordId, setEditRecordId] = useState<string | null>(null);
  const [initialProject, setInitialProject] = useState<string | undefined>(undefined);
  const [initialSite, setInitialSite] = useState<string | undefined>(undefined);
  const [initialPeriod, setInitialPeriod] = useState<string | undefined>(undefined);

  const currentUser = getCurrentUser();
  const esgRole = currentUser ? getRoleFromEmail(currentUser.email) : "esg_team";
  const roleConfig = ESG_ROLES_CONFIG[esgRole] || ESG_ROLES_CONFIG.esg_team;

  // New sub-tab state for managers/teams
  const [subTab, setSubTab] = useState<"dashboard" | "approvals" | "escalations">("dashboard");
  const [reviewItem, setReviewItem] = useState<any>(null);
  const [approvalFilter, setApprovalFilter] = useState<"all" | "pending" | "today" | "overdue" | "escalated">("all");
  const [returnTask, setReturnTask] = useState<any>(null);
  const [returnReason, setReturnReason] = useState("");
  const [refreshApprovalTrigger, setRefreshApprovalTrigger] = useState(0);

  // Load audit trail from localStorage
  const auditTrails = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("voltline-audit-trail") || "[]");
    } catch {
      return [];
    }
  }, [refreshApprovalTrigger]);

  const addAuditTrailEntry = (task: any, action: string, previousStatus: string, newStatus: string, reason = "") => {
    try {
      const logs = JSON.parse(localStorage.getItem("voltline-audit-trail") || "[]");
      const newLog = {
        id: `audit-${Date.now()}`,
        user: currentUser?.name || currentUser?.email || "ESG Team User",
        role: roleConfig.label,
        project: task.projectSite ? task.projectSite.split(" / ")[0] : "General",
        site: task.projectSite ? task.projectSite.split(" / ")[1] : "N/A",
        record: task.recordName,
        action,
        timestamp: new Date().toISOString(),
        previousStatus,
        newStatus,
        reason,
        escalationLevel: task.escalation,
        resolvedByMaster: task.type === "indicator" ? "Indicator Master / Projects Mapping" : task.type === "policy" ? "Policy Master" : "Compliance / Certificate Master"
      };
      localStorage.setItem("voltline-audit-trail", JSON.stringify([newLog, ...logs]));
    } catch {
      // ignore
    }
  };

  const approvalTasks = useMemo(() => {
    const list: any[] = [];
    let savedRecords: any[] = [];
    try {
      savedRecords = JSON.parse(localStorage.getItem("voltline-report-records") || "[]");
    } catch {
      savedRecords = [];
    }

    // A. Mapped Indicator submissions
    savedRecords.forEach((r: any) => {
      if (r.reportType !== "nc" && (r.status === "Submitted" || r.status === "Reviewed")) {
        const firstIndId = Object.keys(r.indicatorValues || {})[0];
        const ind = INDICATORS.find(i => i.id === firstIndId);
        if (!ind) return;

        const projMeta = PROJECTS_MAPPING[r.project] || { person: "Rohan Desai", dept: "Operations", regs: [] };
        const ownerName = personById(projMeta.person)?.name || projMeta.person;

        // Role-based visibility and scope filters
        if (esgRole !== "esg_team" && esgRole !== "admin") {
          if (esgRole === "reviewer" && r.status !== "Submitted") return;
          if (esgRole === "approver" && r.status !== "Reviewed" && r.status !== "Submitted") return;
        }

        const daysOverdue = r.dueDate ? Math.floor((ESG_TODAY.getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
        const esc = getActiveEscalationForSource(r.id);

        list.push({
          id: r.id,
          recordName: ind.name,
          module: "ESG Data Portal",
          projectSite: `${r.project} / ${r.site}`,
          period: r.reportingPeriod,
          submittedBy: `${ownerName} (${projMeta.dept})`,
          dueDate: r.dueDate || "10 Aug 2026",
          priority: daysOverdue > 5 ? "High" : "Medium",
          status: r.status,
          escalation: esc ? `Level ${esc.level}` : "Level 0",
          rawRecord: r,
          type: "indicator",
          indicator: ind,
          value: r.indicatorValues[firstIndId]?.actual,
          unit: ind.unit,
          ghgContext: ind.scope && ind.scope !== "N/A" ? {
            parameter: ind.name,
            scope: ind.scope,
            unit: ind.unit,
            factor: ind.factor,
            formula: ind.formula,
            source: "IPCC Emission Guidelines / Central Electricity Authority",
          } : null,
          acts: projMeta.regs || ["Electricity Act 2003"],
        });
      }
    });

    // B. Mapped Policies
    POLICIES.forEach((p) => {
      const pVersions = policy.policyVersions(p.id);
      const latest = pVersions[0];

      if (latest && latest.status === "submitted") {
        const ownerName = personById(p.ownerId)?.name || "Compliance Owner";
        list.push({
          id: p.id,
          recordName: `Policy Review: ${p.name}`,
          module: "ESMS",
          projectSite: `Corporate / ${entityById(p.entityId)?.short || "HQ"}`,
          period: p.reviewDue,
          submittedBy: ownerName,
          dueDate: p.reviewDue,
          priority: "Medium",
          status: "Submitted",
          escalation: "Level 0",
          type: "policy",
          policy: p,
          version: latest.version,
          acts: ["Companies Act 2013", "SEBI Listing Obligations"],
        });
      }
    });

    // C. Mapped Compliance Permits
    RECORDS.forEach((r) => {
      const type = typeByKey(r.typeKey);
      if (recordState(r) === "overdue" && r.expiryDate) {
        const ownerName = personById(r.ownerId)?.name || "Facility Owner";
        const esc = getActiveEscalationForSource(r.id);
        const daysOverdue = Math.floor((ESG_TODAY.getTime() - new Date(r.expiryDate).getTime()) / (1000 * 60 * 60 * 24));

        list.push({
          id: r.id,
          recordName: type?.label || r.typeKey,
          module: "Regulatory Compliance",
          projectSite: `${type?.category === "permit" ? "Permit" : "Site compliance"} / ${r.depotId || "HQ"}`,
          period: "Perpetual",
          submittedBy: ownerName,
          dueDate: r.expiryDate,
          priority: "High",
          status: "Pending",
          escalation: esc ? `Level ${esc.level}` : "Level 1",
          type: "permit",
          permit: r,
          acts: [type?.category === "permit" ? "Factories Act 1948" : "Environment Protection Act 1986"],
        });
      }
    });

    return list;
  }, [esgRole, policy, refreshApprovalTrigger]);

  const filteredApprovalTasks = useMemo(() => {
    return approvalTasks.filter((t) => {
      if (approvalFilter === "pending") return t.status === "Submitted" || t.status === "Pending";
      if (approvalFilter === "today") return t.dueDate === "2026-07-15" || t.dueDate === "2026-07-16"; // mock due today
      if (approvalFilter === "overdue") return t.escalation !== "Level 0";
      if (approvalFilter === "escalated") return t.escalation.startsWith("Level 2") || t.escalation.startsWith("Level 3");
      return true;
    });
  }, [approvalTasks, approvalFilter]);

  const approvalMetrics = useMemo(() => {
    return {
      pending: approvalTasks.filter(t => t.status === "Submitted" || t.status === "Pending").length,
      today: approvalTasks.filter(t => t.dueDate === "2026-07-15" || t.dueDate === "2026-07-16").length,
      overdue: approvalTasks.filter(t => t.escalation !== "Level 0").length,
      escalated: approvalTasks.filter(t => t.escalation.startsWith("Level 2") || t.escalation.startsWith("Level 3")).length,
    };
  }, [approvalTasks]);

  // SLA Action Handlers
  const handleApproveTask = (task: any) => {
    if (task.type === "indicator") {
      try {
        const records = JSON.parse(localStorage.getItem("voltline-report-records") || "[]");
        const nextStatus = esgRole === "reviewer" ? "Reviewed" : "Approved";
        const updated = records.map((r: any) => {
          if (r.id === task.id) {
            return { ...r, status: nextStatus };
          }
          return r;
        });
        localStorage.setItem("voltline-report-records", JSON.stringify(updated));
        addAuditTrailEntry(task, "Approve", task.status, nextStatus);
        setRefreshApprovalTrigger(prev => prev + 1);
        setReviewItem(null);
        toast.success(`Record marked as ${nextStatus}`);
      } catch {
        toast.error("Failed to approve");
      }
    } else if (task.type === "policy") {
      policy.decidePolicyVersion(task.id, "approved");
      addAuditTrailEntry(task, "Approve", "Submitted", "Approved");
      setRefreshApprovalTrigger(prev => prev + 1);
      setReviewItem(null);
      toast.success("Policy approved");
    } else if (task.type === "permit") {
      // Simulate permit renew approved
      toast.success("Compliance licence marked resolved");
      addAuditTrailEntry(task, "Resolve", "Overdue", "Valid");
      setRefreshApprovalTrigger(prev => prev + 1);
      setReviewItem(null);
    }
  };

  const handleReturnTask = (task: any, reason: string) => {
    if (!reason.trim()) {
      toast.error("Correction comment is required");
      return;
    }

    if (task.type === "indicator") {
      try {
        const records = JSON.parse(localStorage.getItem("voltline-report-records") || "[]");
        const updated = records.map((r: any) => {
          if (r.id === task.id) {
            return { ...r, status: "Returned", returnReason: reason };
          }
          return r;
        });
        localStorage.setItem("voltline-report-records", JSON.stringify(updated));
        addAuditTrailEntry(task, "Return for Correction", task.status, "Returned", reason);
        setRefreshApprovalTrigger(prev => prev + 1);
        setReviewItem(null);
        setReturnTask(null);
        setReturnReason("");
        toast.info("Record returned to contributor");
      } catch {
        toast.error("Failed to return record");
      }
    } else if (task.type === "policy") {
      policy.decidePolicyVersion(task.id, "rejected");
      addAuditTrailEntry(task, "Reject/Return", "Submitted", "Draft", reason);
      setRefreshApprovalTrigger(prev => prev + 1);
      setReviewItem(null);
      setReturnTask(null);
      setReturnReason("");
      toast.info("Policy rejected & returned to contributor");
    } else if (task.type === "permit") {
      toast.info("Compliance item queried");
      addAuditTrailEntry(task, "Return", "Overdue", "Overdue", reason);
      setRefreshApprovalTrigger(prev => prev + 1);
      setReviewItem(null);
      setReturnTask(null);
      setReturnReason("");
    }
  };

  const handleRejectTask = (task: any) => {
    if (task.type === "indicator") {
      try {
        const records = JSON.parse(localStorage.getItem("voltline-report-records") || "[]");
        const updated = records.map((r: any) => {
          if (r.id === task.id) {
            return { ...r, status: "Rejected" };
          }
          return r;
        });
        localStorage.setItem("voltline-report-records", JSON.stringify(updated));
        addAuditTrailEntry(task, "Reject", task.status, "Rejected");
        setRefreshApprovalTrigger(prev => prev + 1);
        setReviewItem(null);
        toast.error("Record rejected");
      } catch {
        toast.error("Failed to reject");
      }
    } else {
      toast.error("Record rejected");
      addAuditTrailEntry(task, "Reject", "Pending", "Rejected");
      setRefreshApprovalTrigger(prev => prev + 1);
      setReviewItem(null);
    }
  };

  // Sync bell deep link
  useEffect(() => {
    if (deepLinkRecordId) {
      setSubTab("approvals");
      const matched = approvalTasks.find(t => t.id === deepLinkRecordId);
      if (matched) {
        setReviewItem(matched);
      }
    }
  }, [deepLinkRecordId, approvalTasks]);

  if (activeForm) {
    return (
      <ReportDataEntryForm
        reportType={activeForm}
        editRecordId={editRecordId}
        initialProject={initialProject}
        initialSite={initialSite}
        initialPeriod={initialPeriod}
        onCancel={() => {
          setActiveForm(null);
          setEditRecordId(null);
          setInitialProject(undefined);
          setInitialSite(undefined);
          setInitialPeriod(undefined);
        }}
      />
    );
  }

  if (roleConfig.isContributorOnly) {
    return (
      <ContributorWorkspace
        esgRole={esgRole}
        roleConfig={roleConfig}
        activePeriod={period}
        scope={scope}
        onOpenForm={(reportType, recordId, project, siteId, periodId) => {
          setActiveForm(reportType);
          setEditRecordId(recordId);
          setInitialProject(project);
          setInitialSite(siteId);
          setInitialPeriod(periodId);
        }}
      />
    );
  }

  // Helper Functions
  const projectLocation = (projectId: string) => {
    switch (projectId) {
      case "pl-mbmt":
        return "Mira Bhayandar";
      case "pl-silvassa":
        return "Silvassa";
      case "pl-noida":
        return "Noida";
      case "pl-corp2":
        return "Andheri HQ";
      default:
        return "Corporate";
    }
  };

  const projectOwner = (projectId: string) => {
    switch (projectId) {
      case "pl-mbmt":
        return "Arjun Mehta";
      case "pl-silvassa":
        return "Priya Nair";
      case "pl-noida":
        return "Kavita Rao";
      case "pl-corp2":
        return "Sunil Patil";
      default:
        return "ESG Team";
    }
  };

  const projectResponsibleTeam = (entityId: string) => {
    switch (entityId) {
      case "mbmt":
        return "MBMT ESG Team";
      case "silvassa":
        return "Silvassa SPV";
      case "corp":
        return "HQ Compliance";
      default:
        return "Compliance Operations";
    }
  };

  const projectStageName = (stageKey: string) => {
    switch (stageKey) {
      case "new-opportunity":
        return "Initiation";
      case "screening":
      case "screening-doc":
        return "Screening";
      case "classification":
        return "Classification";
      case "esdd":
      case "esdd-risk":
      case "esdd-category":
      case "esia":
      case "esia-risk":
      case "esia-category":
        return "Assessment";
      case "esap-formulate":
      case "esmp-formulate":
      case "esdd-docs":
      case "esia-docs":
        return "Formulation";
      case "esap-implement":
      case "esmp-implement":
        return "Implementation";
      case "monitor-review":
      case "risk-reduced":
      case "update-action":
        return "Monitoring";
      case "maintain-ops":
      case "ongoing-monitoring":
        return "Operation";
      case "closure":
        return "Closed";
      default:
        return "Onboarding";
    }
  };

  const getProjectHealthLabel = (
    p: any,
    overdueCount: number,
    expiringCount: number,
    breachCount: number,
  ) => {
    if (p.currentStage === "closure") return "Completed";
    if (p.blocked) return "Critical";
    if (overdueCount > 2) return "High Risk";
    if (overdueCount > 0) return "Moderate Risk";
    if (expiringCount > 0 || breachCount > 0) return "Low Risk";
    return "Healthy";
  };

  const healthLabelToLevel = (label: string): "critical" | "warning" | "healthy" => {
    if (label === "Critical" || label === "High Risk") return "critical";
    if (label === "Moderate Risk" || label === "Low Risk") return "warning";
    return "healthy";
  };

  const getComplianceRiskLevel = (
    overdueCount: number,
    expiringCount: number,
    breachCount: number,
  ) => {
    if (overdueCount > 2) return "Severe";
    if (overdueCount > 0) return "High";
    if (breachCount > 0) return "Moderate";
    if (expiringCount > 0) return "Low";
    return "Fully Compliant";
  };

  const getComplianceRiskAccent = (level: string) => {
    switch (level) {
      case "Severe":
      case "High":
        return "var(--color-destructive)";
      case "Moderate":
      case "Low":
        return "var(--color-warning)";
      case "Fully Compliant":
      default:
        return "var(--color-success)";
    }
  };

  function SeverityDot({ level }: { level: "critical" | "warning" | "healthy" }) {
    const bg =
      level === "critical"
        ? "bg-destructive animate-pulse"
        : level === "warning"
          ? "bg-warning"
          : "bg-success";
    return <span className={cn("inline-block h-2 w-2 rounded-full", bg)} />;
  }

  const handleSelectProject = (proj: (typeof PROJECT_LIFECYCLES)[0]) => {
    setScope({ entityId: proj.entityId });
    setSelectedProjectId(proj.projectId);
    setPanel(null); // Clear active KPI panel drilldown on project switch
  };

  const handleClearProject = () => {
    setScope({});
    setSelectedProjectId(null);
    setPanel(null);
  };

  const external = audience === "external";

  // Calculate project aggregate context or global context
  const activeProject = useMemo(() => {
    return selectedProjectId
      ? PROJECT_LIFECYCLES.find((p) => p.projectId === selectedProjectId)
      : null;
  }, [selectedProjectId]);

  const projectAgg = useMemo(() => {
    if (activeProject) {
      return headline({ entityId: activeProject.entityId });
    }
    return headline(scope);
  }, [activeProject, scope]);

  // NC/monitoring calculations for detail tiles
  const ncRegister = useMemo(
    () =>
      buildNcRegister(
        activeProject ? { entityId: activeProject.entityId } : scope,
        period,
        audit,
        monitoring,
      ),
    [activeProject, scope, period, audit, monitoring],
  );
  const openNcItems = ncRegister.filter(
    (r) =>
      (r.source === "internal-audit" || r.source === "external-audit") &&
      r.actionStatus !== "closed",
  );
  const breachItems = ncRegister.filter((r) => r.source === "monitoring");

  const openActions = useMemo(() => {
    return ESAP_ACTIONS.filter((a) => a.status !== "closed").filter((a) => {
      const entityId = esapActionEntityId(a);
      if (activeProject) return entityId === activeProject.entityId;
      return entityId ? inScope({ entityId }, { entityId: scope.entityId }) : true;
    });
  }, [activeProject, scope.entityId]);

  // Deep-links
  useEffect(() => {
    if (!deepLinkRecordId) return;
    const rec = RECORDS.find((r) => r.id === deepLinkRecordId);
    if (rec) {
      const matchingProj = PROJECT_LIFECYCLES.find((p) => p.entityId === rec.entityId);
      if (matchingProj) {
        setScope({ entityId: rec.entityId });
        setSelectedProjectId(matchingProj.projectId);
      }
      setPanel({ kind: "state", state: recordState(rec) });
    }
  }, [deepLinkRecordId]);

  const entities = scope.entityId
    ? ESG_GROUP.entities.filter((e) => e.id === scope.entityId)
    : ESG_GROUP.entities;

  const panelRecords: ComplianceRecord[] = useMemo(() => {
    if (!panel) return [];
    if (panel.kind === "state")
      return projectAgg.records.filter((r) => recordState(r) === panel.state);
    if (panel.kind === "domain") {
      const cat = panel.domain === "permits" ? "permit" : "site";
      return RECORDS.filter(
        (r) => r.entityId === panel.entityId && typeByKey(r.typeKey)?.category === cat,
      );
    }
    return [];
  }, [panel, projectAgg.records]);

  const selectedProjectOverdue = projectAgg.overdue.length;
  const selectedProjectExpiring = projectAgg.expiring.length;
  const selectedProjectBreachCount = breachItems.length;

  const selectedProjectHealth = activeProject
    ? getProjectHealthLabel(
        activeProject,
        selectedProjectOverdue,
        selectedProjectExpiring,
        selectedProjectBreachCount,
      )
    : "Healthy";

  const selectedProjectHealthLevel = healthLabelToLevel(selectedProjectHealth);

  const complianceRisk = useMemo(() => {
    return getComplianceRiskLevel(
      selectedProjectOverdue,
      selectedProjectExpiring,
      selectedProjectBreachCount,
    );
  }, [selectedProjectOverdue, selectedProjectExpiring, selectedProjectBreachCount]);

  const panelMeta =
    panel?.kind === "state"
      ? {
          accent: STATE_META[panel.state].color,
          title:
            panel.state === "overdue"
              ? "Overdue — the risk stock"
              : panel.state === "expiring"
                ? "Expiring — inside the renewal window"
                : "Valid — in force",
          blurb:
            panel.state === "overdue"
              ? "Every row here is a live lapse. Root cause is mandatory; remediation is tracked, not just disclosure."
              : panel.state === "expiring"
                ? "The maintainer's work queue — renew before the clock runs out."
                : "In-force items, furthest expiry last.",
        }
      : panel?.kind === "domain"
        ? {
            accent: "var(--color-primary)",
            title: `${ESG_GROUP.entities.find((e) => e.id === panel.entityId)?.short} · ${DOMAINS.find((d) => d.key === panel.domain)?.label}`,
            blurb: "Drill-down from the compliance cards — same records, higher resolution.",
          }
        : panel?.kind === "actions"
          ? {
              accent: "var(--color-chart-2)",
              title: "Open ESAP actions",
              blurb:
                "Corrective actions from ESDD / ESIA findings — the same numbers as the ESMS register.",
            }
          : panel?.kind === "openNc"
            ? {
                accent: "var(--color-destructive)",
                title: "Open non-conformities",
                blurb:
                  "Internal & external audit NCs without a closed corrective action — the same register as NC Reports.",
              }
            : panel?.kind === "breaches"
              ? {
                  accent: "var(--color-warning)",
                  title: "Monitoring breaches",
                  blurb: "Site monitoring readings over their regulatory limit this period.",
                }
              : null;

  return (
    <div className="space-y-5">
      {!roleConfig.isContributorOnly && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card border border-border/60 rounded-xl p-3 shadow-sm">
          <div className="flex gap-2">
            {(["dashboard", "approvals", "escalations"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={cn(
                  "text-[12px] px-4 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer",
                  subTab === tab
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                {tab === "approvals" ? "Approval Center" : tab === "escalations" ? "Escalation Matrix" : "Governance Dashboard"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              {esgRole === "esg_team" ? "ESG Sustainability Lead" : esgRole === "reviewer" ? "ESG Compliance Reviewer" : esgRole === "approver" ? "ESG Approver" : "Administrator"}
            </span>
          </div>
        </div>
      )}

      {subTab === "approvals" && (
        <ApprovalCenterUI
          filteredApprovalTasks={filteredApprovalTasks}
          approvalMetrics={approvalMetrics}
          approvalFilter={approvalFilter}
          setApprovalFilter={setApprovalFilter}
          reviewItem={reviewItem}
          setReviewItem={setReviewItem}
          returnTask={returnTask}
          setReturnTask={setReturnTask}
          returnReason={returnReason}
          setReturnReason={setReturnReason}
          handleApproveTask={handleApproveTask}
          handleReturnTask={handleReturnTask}
          handleRejectTask={handleRejectTask}
        />
      )}

      {subTab === "escalations" && (
        <EscalationMatrixUI
          auditTrails={auditTrails}
        />
      )}

      {subTab === "dashboard" && (
        <>
          {activeProject ? (
            // Selected Project Overview Dashboard (Project Overview -> KPIs -> Lifecycle -> Quick Actions)
            <div className="space-y-5">
          {/* Back button and breadcrumb */}
          <div className="flex items-center gap-3 border-b border-border/40 pb-3">
            <button
              onClick={handleClearProject}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-card/60 text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground hover:-translate-x-0.5 active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/60 shadow-sm"
              aria-label="Back to all projects"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="h-4 w-[1px] bg-border/60" />
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-foreground tracking-tight select-none">
                All Projects
              </span>
            </div>
            <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-muted-foreground font-mono">
              Project Dashboard View
            </span>
          </div>

          {/* Selected Project Overview Header Card */}
          <PanelCard className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-primary">
                {projectResponsibleTeam(activeProject.entityId)}
              </span>
              <h2 className="text-[20px] font-semibold tracking-tight mt-0.5 text-foreground leading-snug">
                {activeProject.project}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5 text-[11.5px] text-muted-foreground">
                <span>
                  Location:{" "}
                  <strong className="text-foreground font-medium">
                    {projectLocation(activeProject.projectId)}
                  </strong>
                </span>
                <span>·</span>
                <span>
                  Stage:{" "}
                  <strong className="text-foreground font-medium">
                    {projectStageName(activeProject.currentStage)}
                  </strong>
                </span>
                <span>·</span>
                <span>
                  Lifecycle:{" "}
                  <strong className="text-foreground font-medium">
                    {lifecycleStageByKey(activeProject.currentStage)?.label}
                  </strong>
                </span>
                <span>·</span>
                <span>
                  Owner:{" "}
                  <strong className="text-foreground font-medium">
                    {projectOwner(activeProject.projectId)}
                  </strong>
                </span>
                <span>·</span>
                <span>
                  Timeline:{" "}
                  <strong className="text-foreground font-medium">
                    Entered stage {fmtDate(activeProject.stageEnteredOn)}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Overall Project Health
                </div>
                <span
                  className={cn(
                    "inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase mt-1 tracking-wider",
                    selectedProjectHealthLevel === "critical"
                      ? "bg-destructive/15 text-destructive animate-pulse border border-destructive/25"
                      : selectedProjectHealthLevel === "warning"
                        ? "bg-warning/15 text-warning border border-warning/25"
                        : "bg-success/15 text-success border border-success/25",
                  )}
                >
                  {selectedProjectHealth}
                </span>
              </div>
              <div className="h-10 w-[1px] bg-border/40" />
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Project Status
                </div>
                <span
                  className={cn(
                    "inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase mt-1 tracking-wider border",
                    activeProject.blocked
                      ? "bg-destructive/15 text-destructive border-destructive/25"
                      : "bg-success/15 text-success border-success/25",
                  )}
                >
                  {activeProject.blocked ? "Blocked" : "Active"}
                </span>
              </div>
            </div>
          </PanelCard>

          {/* KPI Cards section */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            <CriticalBeam
              active={!external && projectAgg.overdue.length > 0}
              size="pulse-inner"
              className="h-full [&>div:not([data-beam-bloom])]:h-full"
            >
              <RiskTile
                className="h-full"
                label="Overdue items"
                value={String(projectAgg.overdue.length)}
                hint="expired · non-compliant now"
                accent="var(--color-destructive)"
                active={panel?.kind === "state" && panel.state === "overdue"}
                onClick={() =>
                  setPanel(
                    panel?.kind === "state" && panel.state === "overdue"
                      ? null
                      : { kind: "state", state: "overdue" },
                  )
                }
                curated={external}
              />
            </CriticalBeam>
            <RiskTile
              className="h-full"
              label={
                <>
                  Open <Gloss text="NC" />s
                </>
              }
              value={String(openNcItems.length)}
              hint="audit non-conformities, no closed action"
              accent="var(--color-destructive)"
              active={panel?.kind === "openNc"}
              onClick={() => setPanel(panel?.kind === "openNc" ? null : { kind: "openNc" })}
              curated={external}
            />
            <RiskTile
              className="h-full"
              label="Monitoring breaches"
              value={String(breachItems.length)}
              hint="over the limit this period"
              accent="var(--color-warning)"
              active={panel?.kind === "breaches"}
              onClick={() => setPanel(panel?.kind === "breaches" ? null : { kind: "breaches" })}
              curated={external}
            />
            <RiskTile
              className="h-full"
              label="Expiring soon"
              value={String(projectAgg.expiring.length)}
              hint="inside the renewal lead window"
              accent="var(--color-warning)"
              active={panel?.kind === "state" && panel.state === "expiring"}
              onClick={() =>
                setPanel(
                  panel?.kind === "state" && panel.state === "expiring"
                    ? null
                    : { kind: "state", state: "expiring" },
                )
              }
            />
            <RiskTile
              className="h-full"
              label={
                <>
                  Open <Gloss text="ESAP" /> actions
                </>
              }
              value={String(openActions.length)}
              hint={`${openActions.filter((a) => esapState(a) === "overdue").length} past due date`}
              accent="var(--color-chart-2)"
              active={panel?.kind === "actions"}
              onClick={() => setPanel(panel?.kind === "actions" ? null : { kind: "actions" })}
              curated={external}
            />
            <RiskTile
              className="h-full"
              label="Compliance"
              value={complianceRisk}
              hint={`${projectAgg.records.length - projectAgg.overdue.length} of ${projectAgg.records.length} items in force`}
              accent={getComplianceRiskAccent(complianceRisk)}
              active={panel?.kind === "state" && panel.state === "valid"}
              onClick={() =>
                setPanel(
                  panel?.kind === "state" && panel.state === "valid"
                    ? null
                    : { kind: "state", state: "valid" },
                )
              }
            />
          </div>

          {/* Drilldown panel below project KPIs */}
          <AnimatePresence initial={false}>
            {panel && panelMeta && (
              <motion.div
                key={
                  panel.kind === "state"
                    ? panel.state
                    : panel.kind === "domain"
                      ? `${panel.entityId}-${panel.domain}`
                      : "actions"
                }
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, height: "auto" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                style={{ overflow: "hidden" }}
              >
                <PanelCard accent={panelMeta.accent}>
                  <div
                    className="flex items-center justify-between gap-3 border-b px-5 py-3.5"
                    style={{
                      borderColor: `color-mix(in oklab, ${panelMeta.accent} 20%, transparent)`,
                      background: `color-mix(in oklab, ${panelMeta.accent} 7%, transparent)`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-9 w-9 place-items-center rounded-xl"
                        style={{
                          background: `color-mix(in oklab, ${panelMeta.accent} 14%, transparent)`,
                          color: panelMeta.accent,
                        }}
                      >
                        <ClipboardList className="h-[18px] w-[18px]" aria-hidden />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-semibold tracking-tight">
                            {panelMeta.title}
                          </h3>
                          <span
                            className="num rounded-full px-2 py-0.5 text-[11px] font-semibold"
                            style={{
                              background: `color-mix(in oklab, ${panelMeta.accent} 14%, transparent)`,
                              color: panelMeta.accent,
                            }}
                          >
                            {panel.kind === "actions"
                              ? openActions.length
                              : panel.kind === "openNc"
                                ? openNcItems.length
                                : panel.kind === "breaches"
                                  ? breachItems.length
                                  : panelRecords.length}
                          </span>
                        </div>
                        <p className="text-[12px] text-muted-foreground">{panelMeta.blurb}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPanel(null)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Close details"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>

                  {panel.kind === "actions" ? (
                    <div className="max-h-[380px] overflow-auto">
                      {openActions.map((a) => {
                        const st = esapState(a);
                        const owner = personById(a.ownerId);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => goto("esms", { sub: "esap" })}
                            className="flex w-full items-center justify-between gap-4 border-b border-border/40 px-5 py-3 text-left transition-colors last:border-0 hover:bg-muted/40"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-[12.5px] font-medium">{a.action}</div>
                              <div className="truncate text-[11px] text-muted-foreground">
                                {a.finding} · {owner?.name}
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <span
                                className={cn(
                                  "num text-[12px] font-semibold",
                                  st === "overdue" ? "text-destructive" : "text-muted-foreground",
                                )}
                              >
                                due {fmtDate(a.due)}
                              </span>
                              <ArrowRight
                                className="h-3.5 w-3.5 text-muted-foreground/60"
                                aria-hidden
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : panel.kind === "openNc" || panel.kind === "breaches" ? (
                    <NcItemList
                      items={panel.kind === "openNc" ? openNcItems : breachItems}
                      onOpen={(sub) => goto("esms", { sub })}
                    />
                  ) : (
                    <WorkQueue
                      records={panelRecords}
                      defaultFilter="all"
                      highlightId={deepLinkRecordId}
                      compact
                    />
                  )}
                </PanelCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Existing Lifecycle Panel Section */}
          <div className="pt-2">
            <LifecyclePanel />
          </div>

          {/* Quick Actions section */}
          <PanelCard className="p-5">
            <h3 className="text-[13.5px] font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <button
                onClick={() => goto("esms", { sub: "lifecycle" })}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/60 bg-card/40 hover:bg-muted/40 transition-colors text-center cursor-pointer active:scale-[0.98]"
              >
                <Waypoints className="h-5 w-5 text-primary mb-1.5 opacity-80" />
                <span className="text-[11.5px] font-semibold text-foreground">Open Lifecycle</span>
                <span className="text-[9.5px] text-muted-foreground mt-0.5 font-mono">
                  Stage pipeline
                </span>
              </button>
              <button
                onClick={() => goto("esms", { sub: "policies" })}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/60 bg-card/40 hover:bg-muted/40 transition-colors text-center cursor-pointer active:scale-[0.98]"
              >
                <ClipboardList className="h-5 w-5 text-primary mb-1.5 opacity-80" />
                <span className="text-[11.5px] font-semibold text-foreground">View Registers</span>
                <span className="text-[9.5px] text-muted-foreground mt-0.5 font-mono">
                  Policies & SOPs
                </span>
              </button>
              <button
                onClick={() => goto("reports")}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/60 bg-card/40 hover:bg-muted/40 transition-colors text-center cursor-pointer active:scale-[0.98]"
              >
                <BarChart3 className="h-5 w-5 text-primary mb-1.5 opacity-80" />
                <span className="text-[11.5px] font-semibold text-foreground">View Reports</span>
                <span className="text-[9.5px] text-muted-foreground mt-0.5 font-mono">
                  Compliance summaries
                </span>
              </button>
              <button
                onClick={() => goto("projects", { sub: "permits" })}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/60 bg-card/40 hover:bg-muted/40 transition-colors text-center cursor-pointer active:scale-[0.98]"
              >
                <FileText className="h-5 w-5 text-primary mb-1.5 opacity-80" />
                <span className="text-[11.5px] font-semibold text-foreground">Documents</span>
                <span className="text-[9.5px] text-muted-foreground mt-0.5 font-mono">
                  DMS records
                </span>
              </button>
              <button
                onClick={() => goto("esms", { sub: "monitoring" })}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/60 bg-card/40 hover:bg-muted/40 transition-colors text-center cursor-pointer active:scale-[0.98]"
              >
                <Activity className="h-5 w-5 text-primary mb-1.5 opacity-80" />
                <span className="text-[11.5px] font-semibold text-foreground">Monitoring</span>
                <span className="text-[9.5px] text-muted-foreground mt-0.5 font-mono">
                  Emission telemetry
                </span>
              </button>
              <button
                onClick={() => goto("projects", { sub: "permits" })}
                className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/60 bg-card/40 hover:bg-muted/40 transition-colors text-center cursor-pointer active:scale-[0.98]"
              >
                <CircleCheck className="h-5 w-5 text-primary mb-1.5 opacity-80" />
                <span className="text-[11.5px] font-semibold text-foreground">Permits</span>
                <span className="text-[9.5px] text-muted-foreground mt-0.5 font-mono">
                  CTE/CTO licenses
                </span>
              </button>
            </div>
          </PanelCard>
        </div>
      ) : (
        // Initial Project Cards Workspace (Overview Landing Page)
        <div className="space-y-5">
          {/* Headline introduction */}
          <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
            <span className="text-[12px] font-semibold text-foreground">
              Select an active project below to open its dashboard and run operations.
            </span>
          </div>

          {/* Project Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {PROJECT_LIFECYCLES.map((p) => {
              const projectHeadline = headline({ entityId: p.entityId });
              const overdueCount = projectHeadline.overdue.length;
              const expiringCount = projectHeadline.expiring.length;

              // Count open NCs & breaches for health indicator
              const projNcRegister = buildNcRegister(
                { entityId: p.entityId },
                period,
                audit,
                monitoring,
              );
              const openNcCount = projNcRegister.filter(
                (r) =>
                  (r.source === "internal-audit" || r.source === "external-audit") &&
                  r.actionStatus !== "closed",
              ).length;
              const breachCount = projNcRegister.filter((r) => r.source === "monitoring").length;

              const healthLabel = getProjectHealthLabel(
                p,
                overdueCount,
                expiringCount,
                breachCount,
              );
              const healthLevel = healthLabelToLevel(healthLabel);

              return (
                <div
                  key={p.projectId}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectProject(p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectProject(p);
                    }
                  }}
                  className="cursor-pointer rounded-2xl border border-border/60 bg-card p-5 shadow-elevated transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-primary/40 active:scale-[0.98] flex flex-col justify-between"
                >
                  <div className="space-y-3.5 w-full">
                    {/* Top Row: Responsible SPV Team & Health Dot */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground font-mono">
                          {projectResponsibleTeam(p.entityId)}
                        </span>
                        <h4 className="font-semibold text-[13.5px] leading-snug text-foreground mt-0.5">
                          {p.project}
                        </h4>
                      </div>
                      <SeverityDot level={healthLevel} />
                    </div>

                    {/* Stage & Location info */}
                    <div className="text-[11.5px] space-y-1 pt-2 border-t border-border/30">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-semibold text-foreground font-mono">
                          {projectLocation(p.projectId)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Stage</span>
                        <span className="font-semibold text-foreground">
                          {projectStageName(p.currentStage)}
                        </span>
                      </div>
                    </div>

                    {/* Overall Compliance Score & Status */}
                    <div className="mt-4 flex items-baseline justify-between border-t border-border/30 pt-3">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Health Status
                        </div>
                        <span
                          className={cn(
                            "inline-block rounded px-1.5 py-0.5 text-[8.5px] font-semibold uppercase mt-1 tracking-wider border",
                            healthLevel === "critical"
                              ? "bg-destructive/12 text-destructive border-destructive/25 animate-pulse"
                              : healthLevel === "warning"
                                ? "bg-warning/12 text-warning border-warning/25"
                                : "bg-success/12 text-success border-success/25",
                          )}
                        >
                          {healthLabel}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                          Last Updated
                        </div>
                        <span className="text-[11.5px] font-mono text-muted-foreground">
                          {fmtDate(p.stageEnteredOn)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compliance matrix/graph (preserved at bottom) */}
          <PanelCard>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight">
                  Compliance by entity & area
                </h3>
                <p className="text-[12px] text-muted-foreground">
                  {external
                    ? "Curated view — aggregate health only; item-level lapses are withheld here."
                    : "Click any area to drill into the records behind it. Same substance, higher resolution."}
                </p>
              </div>
              <Segmented
                ariaLabel="View"
                size="sm"
                value={view}
                onChange={setView}
                options={[
                  { key: "matrix", label: "Cards", Icon: Grid3X3 },
                  { key: "graph", label: "Graph", Icon: BarChart3 },
                ]}
              />
            </div>

            {loading ? (
              <LoadingRows rows={4} />
            ) : entities.length === 0 ? (
              <EmptyState title="No entities in scope" hint="Adjust the scope selector above." />
            ) : view === "matrix" ? (
              <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
                {entities.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-2xl border border-border/60 bg-background/60 p-4"
                  >
                    <button
                      type="button"
                      onClick={() => setScope({ entityId: e.id })}
                      className="text-left text-[13.5px] font-semibold text-foreground underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                    >
                      {e.short}
                    </button>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {e.depots.length} depot{e.depots.length > 1 ? "s" : ""}
                    </div>
                    <ul className="mt-3 space-y-2 border-t border-border/50 pt-3">
                      {DOMAINS.map((d) => {
                        const stat = cellStat(e.id, d.key);
                        return (
                          <li key={d.key} className="flex items-center justify-between gap-3">
                            <span className="text-[11.5px] text-muted-foreground">
                              <Gloss text={d.label} />
                            </span>
                            <CellChip
                              stat={stat}
                              curated={external}
                              onClick={() => {
                                if (d.key === "permits" || d.key === "site")
                                  setPanel({ kind: "domain", entityId: e.id, domain: d.key });
                                else if (d.key === "esms") goto("esms");
                                else if (d.key === "vendor") goto("vendors");
                                else goto("projects");
                              }}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 p-5">
                {entities.map((e) => {
                  const totals = DOMAINS.reduce(
                    (acc, d) => {
                      const s = cellStat(e.id, d.key);
                      acc.valid += s.valid;
                      acc.expiring += s.expiring;
                      acc.overdue += s.overdue;
                      return acc;
                    },
                    { valid: 0, expiring: 0, overdue: 0 },
                  );
                  const total = Math.max(1, totals.valid + totals.expiring + totals.overdue);
                  const pct = Math.round((totals.valid / total) * 100);
                  return (
                    <div key={e.id} className="grid grid-cols-[140px_1fr_56px] items-center gap-4">
                      <div className="truncate text-[12.5px] font-medium">{e.short}</div>
                      {external ? (
                        <div className="flex h-5 w-full overflow-hidden rounded-md bg-muted/40 p-[1px]">
                          <div
                            className="h-full rounded-[3px] bg-success"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      ) : (
                        <StackBar stat={totals} />
                      )}
                      <div className="num text-right text-[13px] font-semibold text-foreground">
                        {pct}%
                      </div>
                    </div>
                  );
                })}
                {!external && (
                  <div className="flex items-center gap-4 border-t border-border/40 pt-3 text-[11px] text-muted-foreground">
                    {(["valid", "expiring", "overdue"] as EsgState[]).map((s) => (
                      <span key={s} className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-[3px]"
                          style={{ background: STATE_META[s].color }}
                        />
                        {STATE_META[s].label}
                      </span>
                    ))}
                    <span className="ml-auto">share of tracked items per entity</span>
                  </div>
                )}
              </div>
            )}
          </PanelCard>
        </div>
      )}
      </>
      )}
    </div>
  );
}

/* --------------------------------- Approval Center & Escalation UI -------------------------------- */

interface ApprovalCenterUIProps {
  filteredApprovalTasks: any[];
  approvalMetrics: any;
  approvalFilter: string;
  setApprovalFilter: (f: any) => void;
  reviewItem: any;
  setReviewItem: (t: any) => void;
  returnTask: any;
  setReturnTask: (t: any) => void;
  returnReason: string;
  setReturnReason: (r: string) => void;
  handleApproveTask: (t: any) => void;
  handleReturnTask: (t: any, reason: string) => void;
  handleRejectTask: (t: any) => void;
}

function ApprovalCenterUI({
  filteredApprovalTasks,
  approvalMetrics,
  approvalFilter,
  setApprovalFilter,
  reviewItem,
  setReviewItem,
  returnTask,
  setReturnTask,
  returnReason,
  setReturnReason,
  handleApproveTask,
  handleReturnTask,
  handleRejectTask,
}: ApprovalCenterUIProps) {
  return (
    <div className="space-y-5">
      {/* Functional Filters Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "pending", label: "Pending Reviews", count: approvalMetrics.pending, color: "text-warning", bg: "bg-warning/10" },
          { key: "today", label: "Due Today", count: approvalMetrics.today, color: "text-foreground", bg: "bg-muted" },
          { key: "overdue", label: "Overdue", count: approvalMetrics.overdue, color: "text-destructive", bg: "bg-destructive/10" },
          { key: "escalated", label: "Escalated", count: approvalMetrics.escalated, color: "text-destructive animate-pulse", bg: "bg-destructive/5" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setApprovalFilter(f.key as any)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all hover:shadow-md cursor-pointer outline-none",
              approvalFilter === f.key
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border/60 bg-card/60"
            )}
          >
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              {f.label}
            </span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className={cn("text-2xl font-extrabold num", f.color)}>
                {f.count}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">items</span>
            </div>
          </button>
        ))}
      </div>

      {/* Filter Stats bar */}
      <div className="flex justify-between items-center bg-card border border-border/40 rounded-xl px-4 py-3 shadow-sm">
        <span className="text-[12.5px] text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredApprovalTasks.length}</span> pending tasks
        </span>
        {approvalFilter !== "all" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setApprovalFilter("all")}
            className="h-8 text-[11px] rounded-lg"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Main Table */}
      <PanelCard>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px] min-w-[800px]">
            <thead>
              <tr className="border-b border-border/60 text-[11px] uppercase tracking-[0.1em] text-muted-foreground bg-muted/30">
                <th className="px-5 py-3 text-left font-medium">Record</th>
                <th className="px-3 py-3 text-left font-medium">Module</th>
                <th className="px-3 py-3 text-left font-medium">Project / Site</th>
                <th className="px-3 py-3 text-left font-medium">Reporting Period</th>
                <th className="px-3 py-3 text-left font-medium">Submitted By</th>
                <th className="px-3 py-3 text-left font-medium">Due Date</th>
                <th className="px-3 py-3 text-left font-medium">Escalation</th>
                <th className="px-5 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApprovalTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                    No pending records found matching this filter. All clean!
                  </td>
                </tr>
              ) : (
                filteredApprovalTasks.map((task) => (
                  <tr key={task.id} className="border-b border-border/40 hover:bg-muted/15 last:border-0">
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      {task.recordName}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground">
                      {task.module}
                    </td>
                    <td className="px-3 py-3.5 text-foreground font-semibold">
                      {task.projectSite}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground">
                      {task.period}
                    </td>
                    <td className="px-3 py-3.5 text-foreground font-medium">
                      {task.submittedBy}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground font-mono">
                      {task.dueDate}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase",
                        task.escalation !== "Level 0" ? "bg-destructive/10 text-destructive animate-pulse" : "bg-muted text-muted-foreground"
                      )}>
                        {task.escalation}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        className="h-8 text-[11.5px] rounded-lg"
                        onClick={() => setReviewItem(task)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>

      {/* Review Drawer Card overlay */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/40 backdrop-blur-[2px]">
          <div className="w-full max-w-[580px] h-full bg-card border-l border-border shadow-elevated flex flex-col justify-between p-6 space-y-6 animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-border/40 pb-4">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  {reviewItem.module} / Verification Queue
                </span>
                <h3 className="text-[17px] font-extrabold text-foreground tracking-tight mt-0.5">
                  {reviewItem.recordName}
                </h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setReviewItem(null)} className="h-8 w-8 rounded-lg p-0">
                ✕
              </Button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              {/* Submitted Value highlight */}
              <div className="p-4 bg-muted/40 rounded-xl border border-border/60">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Submitted Actual Value
                </span>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-3xl font-extrabold text-primary num">
                    {reviewItem.value || "Not Entered"}
                  </span>
                  <span className="text-[14px] font-bold text-muted-foreground">
                    {reviewItem.unit || ""}
                  </span>
                </div>
              </div>

              {/* Master Context mappings */}
              <div className="space-y-3">
                <h4 className="text-[12px] font-bold text-foreground uppercase tracking-wider">
                  Resolved Master Context
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-card border border-border/40 rounded-lg">
                    <span className="text-[10px] font-semibold text-muted-foreground block">Reporting Scope</span>
                    <span className="text-[12px] font-bold text-foreground mt-0.5 block">Project-Level Site Specific</span>
                  </div>
                  <div className="p-3 bg-card border border-border/40 rounded-lg">
                    <span className="text-[10px] font-semibold text-muted-foreground block">Submission Frequency</span>
                    <span className="text-[12px] font-bold text-foreground mt-0.5 block capitalize">{reviewItem.indicator?.maps?.[0] || "Monthly"}</span>
                  </div>
                </div>

                <div className="p-3 bg-card border border-border/40 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground block">Assigned Owner (Master)</span>
                    <span className="text-[12px] font-bold text-foreground mt-0.5 block">{reviewItem.submittedBy}</span>
                  </div>
                  <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                    Origin Owner
                  </span>
                </div>

                {/* Applicable Acts dropdown (with helper text) */}
                <div className="p-3 bg-card border border-border/40 rounded-lg">
                  <span className="text-[10px] font-semibold text-muted-foreground block mb-1">Applicable Legal / Regulatory Act</span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {reviewItem.acts?.map((act: string) => (
                      <span key={act} className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted border border-border/50 text-[11.5px] font-semibold text-foreground rounded-lg">
                        {act}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-[10.5px] text-muted-foreground">
                    Why are they applicable? <span className="font-semibold text-primary hover:underline cursor-pointer" onClick={() => toast.info(`This regulatory requirement applies because the facility performs energy storage operations at ${reviewItem.projectSite.split(" / ")[1]} as registered in the Projects Master.`)}>Explain Applicability</span>
                  </div>
                </div>

                {/* GHG Emissions calculations from Master */}
                {reviewItem.ghgContext && (
                  <div className="p-3 bg-card border border-border/40 rounded-lg space-y-2">
                    <span className="text-[10px] font-semibold text-muted-foreground block font-bold">GHG Emissions Master Parameters</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                      <div>Scope: <span className="font-bold text-foreground">Scope 2</span></div>
                      <div>Factor: <span className="font-mono font-bold text-foreground">{reviewItem.ghgContext.factor}</span></div>
                      <div>Formula: <span className="font-mono font-bold text-foreground">{reviewItem.ghgContext.formula}</span></div>
                      <div>Source: <span className="font-bold text-foreground">Central Electricity Authority</span></div>
                    </div>
                    <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-muted-foreground">Calculated carbon footprint:</span>
                      <span className="font-extrabold text-foreground">
                        {Math.round(Number(reviewItem.value || 0) * 0.82).toLocaleString()} kg CO₂e
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Evidence attachments */}
              <div className="p-3 bg-card border border-border/40 rounded-lg">
                <span className="text-[10px] font-semibold text-muted-foreground block mb-2">Submitted Evidence</span>
                <div className="flex items-center gap-2 p-2 bg-muted/30 border border-border/40 rounded-lg text-[12px] font-medium text-foreground">
                  <span>📄 energy_utility_bill_july2026.pdf</span>
                  <span className="ml-auto text-[10.5px] text-primary hover:underline cursor-pointer" onClick={() => toast.success("Downloading invoice evidence file...")}>
                    Download
                  </span>
                </div>
              </div>

              {/* Timeline Logs */}
              <div className="p-3 bg-card border border-border/40 rounded-lg">
                <span className="text-[10px] font-semibold text-muted-foreground block mb-2">Audit History</span>
                <div className="space-y-2 text-[11px] text-muted-foreground font-mono">
                  <div className="flex justify-between">
                    <span>● Draft created by Depot Manager</span>
                    <span>2026-07-08</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>● Submitted to validation queue</span>
                    <span>2026-07-10</span>
                  </div>
                  {reviewItem.escalation !== "Level 0" && (
                    <div className="flex justify-between text-destructive">
                      <span>● Escalation triggered due to SLA breach</span>
                      <span>{reviewItem.escalation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions bottom bar */}
            <div className="flex gap-3 border-t border-border/40 pt-4 bg-card">
              <Button variant="outline" className="flex-1 h-10 text-[12px] font-bold border-destructive text-destructive hover:bg-destructive/5" onClick={() => handleRejectTask(reviewItem)}>
                Reject Record
              </Button>
              <Button variant="outline" className="flex-1 h-10 text-[12px] font-bold border-warning text-warning hover:bg-warning/5" onClick={() => setReturnTask(reviewItem)}>
                Return for Correction
              </Button>
              <Button className="flex-1 h-10 text-[12px] font-bold bg-success hover:bg-success/90 text-white" onClick={() => handleApproveTask(reviewItem)}>
                Approve & Lock
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Return Correction Modal */}
      {returnTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
          <div className="bg-card border border-border/60 shadow-elevated rounded-xl p-5 w-full max-w-[420px] space-y-4">
            <div>
              <h4 className="text-[14px] font-extrabold text-foreground tracking-tight">Return for Correction</h4>
              <p className="text-[11.5px] text-muted-foreground mt-0.5 font-medium">Please provide a mandatory audit comment explaining what needs correction.</p>
            </div>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="E.g., The utility consumption figure is 15% higher than the sub-meter log. Please re-verify."
              className="w-full h-24 p-2.5 rounded-lg border border-border bg-muted/30 text-[12.5px] placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setReturnTask(null); setReturnReason(""); }}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-warning text-warning-foreground hover:bg-warning/90 font-bold"
                onClick={() => handleReturnTask(returnTask, returnReason)}
              >
                Return to Contributor
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EscalationMatrixUIProps {
  auditTrails: any[];
}

function EscalationMatrixUI({ auditTrails }: EscalationMatrixUIProps) {
  return (
    <div className="space-y-5">
      {/* Overview Card */}
      <div className="p-4 bg-muted/40 rounded-xl border border-border/40">
        <h4 className="text-[13px] font-bold text-foreground">SLA Governance & Role Assignments Matrix</h4>
        <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-normal">
          Rather than hardcoding individuals, the system dynamically resolves owners and escalation pathways from the Role Master, Project Master, and Site assignments mapping configurations.
        </p>
      </div>

      {/* Escalation Configurations */}
      <PanelCard>
        <div className="border-b border-border/60 px-5 py-3.5">
          <h4 className="text-[13px] font-bold text-foreground">Escalation Workflows & SLA Thresholds</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px] min-w-[700px]">
            <thead>
              <tr className="border-b border-border/60 text-[11px] uppercase tracking-[0.1em] text-muted-foreground bg-muted/40">
                <th className="px-5 py-3 text-left font-medium">Workflow</th>
                <th className="px-3 py-3 text-left font-medium">Trigger</th>
                <th className="px-3 py-3 text-left font-medium">Priority</th>
                <th className="px-3 py-3 text-left font-medium">Initial Owner</th>
                <th className="px-3 py-3 text-left font-medium">SLA Limit</th>
                <th className="px-3 py-3 text-left font-medium">Reminder</th>
                <th className="px-3 py-3 text-left font-medium">L1 Esc</th>
                <th className="px-3 py-3 text-left font-medium">L2 Esc</th>
                <th className="px-3 py-3 text-left font-medium">L3 Esc</th>
              </tr>
            </thead>
            <tbody>
              {[
                { workflow: "Data Approval", trigger: "Approval Pending", priority: "Medium", owner: "Approver", sla: "2 Days", reminder: "1 Day", l1: "ESG Lead", l2: "Management", l3: "—" },
                { workflow: "NC Remediation", trigger: "Overdue Closure", priority: "High", owner: "NC Owner", sla: "3 Days", reminder: "1 Day", l1: "Project Manager", l2: "ESG Lead", l3: "Management" },
                { workflow: "ESAP Actions", trigger: "Overdue Closure", priority: "High", owner: "Action Owner", sla: "3 Days", reminder: "1 Day", l1: "Project Manager", l2: "ESG Lead", l3: "Management" },
                { workflow: "Regulatory Compliance", trigger: "Expiry / Breach", priority: "Critical", owner: "Compliance Owner", sla: "2 Days", reminder: "Immediate", l1: "ESG Lead", l2: "Management", l3: "Executive Mgmt" },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-border/40 hover:bg-muted/10 last:border-0">
                  <td className="px-5 py-3 font-bold text-foreground">{row.workflow}</td>
                  <td className="px-3 py-3 text-muted-foreground">{row.trigger}</td>
                  <td className="px-3 py-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                      row.priority === "Critical" ? "bg-destructive/10 text-destructive" : row.priority === "High" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                    )}>
                      {row.priority}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-foreground font-semibold">{row.owner}</td>
                  <td className="px-3 py-3 text-muted-foreground font-mono">{row.sla}</td>
                  <td className="px-3 py-3 text-muted-foreground font-mono">{row.reminder}</td>
                  <td className="px-3 py-3 text-foreground font-semibold">{row.l1}</td>
                  <td className="px-3 py-3 text-foreground font-semibold">{row.l2}</td>
                  <td className="px-3 py-3 text-foreground font-semibold">{row.l3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>

      {/* Dynamic Traceable Logs */}
      <PanelCard>
        <div className="border-b border-border/60 px-5 py-3.5 flex justify-between items-center">
          <h4 className="text-[13px] font-bold text-foreground">Traceable Governance Audit Trail</h4>
          <span className="text-[11px] text-muted-foreground font-medium">Dynamically resolved via Master definitions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[800px]">
            <thead>
              <tr className="border-b border-border/60 text-[10px] uppercase tracking-[0.1em] text-muted-foreground bg-muted/40">
                <th className="px-5 py-2.5 text-left font-medium">User</th>
                <th className="px-3 py-2.5 text-left font-medium">Role</th>
                <th className="px-3 py-2.5 text-left font-medium">Project / Site</th>
                <th className="px-3 py-2.5 text-left font-medium">Record Action</th>
                <th className="px-3 py-2.5 text-left font-medium">SLA Status Delta</th>
                <th className="px-3 py-2.5 text-left font-medium">Master Config Source</th>
                <th className="px-5 py-2.5 text-right font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditTrails.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-muted-foreground font-semibold">
                    No validation events logged yet. Audit trails are recorded dynamically.
                  </td>
                </tr>
              ) : (
                auditTrails.map((log: any) => (
                  <tr key={log.id} className="border-b border-border/40 hover:bg-muted/10 last:border-0 font-mono text-[11.5px]">
                    <td className="px-5 py-2.5 font-bold text-foreground">{log.user}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{log.role}</td>
                    <td className="px-3 py-2.5 text-foreground">{log.project} / {log.site}</td>
                    <td className="px-3 py-2.5 text-foreground font-semibold">
                      {log.record}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-bold text-primary">{log.action}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">({log.previousStatus} → {log.newStatus})</span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{log.resolvedByMaster}</td>
                    <td className="px-5 py-2.5 text-right text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
}
