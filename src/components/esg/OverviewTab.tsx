import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Segmented } from "./Segmented";
import {
  cellStat,
  DOMAINS,
  ESAP_ACTIONS,
  ESG_GROUP,
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
    projectId: selectedProjectId,
    setProjectId: setSelectedProjectId,
  } = useEsg();
  const [panel, setPanel] = useState<PanelSel>(null);
  const [view, setView] = useState<"matrix" | "graph">("matrix");
  const loading = useStubLoad(JSON.stringify(scope) + audience + selectedProjectId);
  const reduce = useReducedMotion();

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
    </div>
  );
}
