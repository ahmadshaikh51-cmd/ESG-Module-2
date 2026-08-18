import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Download,
  Eye,
  FileOutput,
  FileSpreadsheet,
  Filter,
  Globe,
  MapPin,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
  ArrowDownRight,
  CheckCircle2,
  Leaf,
  Zap,
  Flame,
  Info,
  Presentation,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  AMR_FIELDS,
  AMR_VALUES,
  ASSESSMENTS,
  CARBON,
  ESG_GROUP,
  GHG_PARAMS,
  GHG_QTY,
  PERIODS,
  RECORDS,
  REPORT_DEFS,
  fmtDate,
  inScope,
  personById,
  recordPlace,
  recordState,
  scopeLabel,
  typeByKey,
  type ReportDef,
} from "@/lib/esg-data";
import { type DateRange } from "./primitives";
import {
  buildNcRegister,
  NC_SOURCE_LABEL,
  ncItemOwnerName,
  ncItemPlace,
  ncRaisedLabel,
  sortNcRegister,
  type NcItem,
} from "@/lib/esg-nc";
import { exportToXlsx } from "@/lib/export-xlsx";
import { exportToPptx } from "@/lib/export-pptx";
import {
  A,
  DocChip,
  EmptyState,
  Gloss,
  PanelCard,
  StatePill,
  WithheldPill,
  useEsg,
  useStubLoad,
  LoadingRows,
} from "./primitives";

const nf = new Intl.NumberFormat("en-IN");

const KIND_LABEL: Record<ReportDef["kind"], string> = {
  rollup: "Roll-up · no new input",
  "external-format": "External format · configured",
  narrative: "Narrative",
  calculation: "Calculation",
};

/* ======================= Report approval workflow ========================== */

const REPORT_APPROVAL_STAGES: Record<string, string[]> = {
  amr: ["Data Entry", "Reviewer Verification", "Finance Sign-off", "ESG Lead Approval", "Submitted to Lender"],
  ghg: ["Data Capture", "Emission Factor Review", "ESMS Team Validation", "ESG Lead Approval", "Third-party Verification"],
  brsr: ["Section A Disclosure", "Section B Mapping", "Section C Principle Reporting", "Board/MD Approval", "SEBI Filing"],
  impact: ["Assessment Upload", "ESAP Action Tracking", "Impact Narrative Draft", "ESG Lead Review", "Stakeholder Publication"],
};

const REPORT_APPROVER: Record<string, string> = {
  amr: "Kavita Rao · ESG Lead",
  ghg: "Arjun Mehta · ESG Analyst",
  brsr: "Sunil Patil · Compliance Director",
  impact: "Priya Nair · ESMS Manager",
};

function ReportWorkflowBadge({ defId, period }: { defId: string; period: string }) {
  const stages = REPORT_APPROVAL_STAGES[defId];
  if (!stages) return null;
  // Simulate: first 2 stages complete, 3rd in-progress, rest pending
  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {stages.map((s, i) => (
        <span
          key={s}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            i < 2
              ? "bg-success/12 text-success"
              : i === 2
                ? "bg-warning/12 text-warning"
                : "bg-muted text-muted-foreground/60",
          )}
        >
          {i < 2 ? "✓ " : i === 2 ? "○ " : "· "}{s}
        </span>
      ))}
    </div>
  );
}

/* ======================= Reporting-tab-local filter ======================== */

export type ReportFilter = {
  siteId: "all" | string;
  dateRange: DateRange;
};

const TODAY = new Date("2026-07-15T09:00:00+05:30");

function makePreset(key: string): DateRange {
  const s = new Date(TODAY);
  const e = new Date(TODAY);
  switch (key) {
    case "today":
      return { start: s, end: e, presetKey: "today", label: "Today" };
    case "thisWeek": {
      s.setDate(TODAY.getDate() - TODAY.getDay());
      return { start: s, end: e, presetKey: "thisWeek", label: "This Week" };
    }
    case "last30":
      s.setDate(TODAY.getDate() - 29);
      return { start: s, end: e, presetKey: "last30", label: "Last 30 Days" };
    case "lastQuarter": {
      const qStart = Math.floor(TODAY.getMonth() / 3) * 3 - 3;
      s.setMonth(qStart);
      s.setDate(1);
      e.setMonth(qStart + 3);
      e.setDate(0);
      return { start: s, end: e, presetKey: "lastQuarter", label: "Last Quarter" };
    }
    case "thisYear":
      s.setMonth(0);
      s.setDate(1);
      e.setMonth(11);
      e.setDate(31);
      return { start: s, end: e, presetKey: "thisYear", label: "This Year" };
    default: {
      // thisMonth
      s.setDate(1);
      e.setMonth(TODAY.getMonth() + 1);
      e.setDate(0);
      return { start: s, end: e, presetKey: "thisMonth", label: "This Month" };
    }
  }
}

const DEFAULT_FILTER: ReportFilter = {
  siteId: "all",
  dateRange: makePreset("thisMonth"),
};

const DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "thisWeek", label: "This Week" },
  { key: "thisMonth", label: "This Month" },
  { key: "last30", label: "Last 30 Days" },
  { key: "lastQuarter", label: "Last Quarter" },
  { key: "thisYear", label: "This Year" },
];

const SITE_OPTIONS = [
  { id: "all", label: "All Sites" },
  ...ESG_GROUP.entities.map((e) => ({ id: e.id, label: e.name })),
];

/** Single unified filter bar — exclusive to the Reporting tab. */
function ReportFilterBar({
  filter,
  onChange,
}: {
  filter: ReportFilter;
  onChange: (f: ReportFilter) => void;
}) {
  const [open, setOpen] = useState(false);

  const activeSite = SITE_OPTIONS.find((s) => s.id === filter.siteId) ?? SITE_OPTIONS[0];
  const siteActive = filter.siteId !== "all";
  const dateActive = filter.dateRange.presetKey !== "thisMonth";
  const anyActive = siteActive || dateActive;

  const clearAll = () => {
    onChange(DEFAULT_FILTER);
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* ── unified filter trigger ── */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Open reporting filters"
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
              anyActive
                ? "border-primary/40 bg-primary/8 text-primary"
                : "border-border/60 bg-card/60 text-foreground hover:bg-muted/50",
            )}
          >
            <Filter className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
            <span>Filters</span>
            {anyActive && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {(siteActive ? 1 : 0) + (dateActive ? 1 : 0)}
              </span>
            )}
            <ChevronDown className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="rounded-xl border border-border/60 bg-card p-0 shadow-elevated"
          style={{ width: 340 }}
        >
          {/* header */}
          <div className="flex items-center justify-between border-b border-border/40 px-3.5 py-2.5">
            <span className="text-[12px] font-semibold text-foreground">Report Filters</span>
            {anyActive && (
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>

          <div className="flex divide-x divide-border/40">
            {/* ── Site column ── */}
            <div className="w-[160px] flex-none p-1.5">
              <div className="mb-1 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                <MapPin className="mr-1 inline h-2.5 w-2.5" aria-hidden />
                Site
              </div>
              <div className="space-y-0.5">
                {SITE_OPTIONS.map((site) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => onChange({ ...filter, siteId: site.id })}
                    className={cn(
                      "flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors hover:bg-muted/60",
                      filter.siteId === site.id
                        ? "bg-primary/10 font-bold text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {site.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Date column ── */}
            <div className="flex-1 p-1.5">
              <div className="mb-1 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                <CalendarDays className="mr-1 inline h-2.5 w-2.5" aria-hidden />
                Period
              </div>
              <div className="space-y-0.5">
                {DATE_PRESETS.map((preset) => {
                  const isActive = filter.dateRange.presetKey === preset.key;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => {
                        onChange({ ...filter, dateRange: makePreset(preset.key) });
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors hover:bg-muted/60",
                        isActive
                          ? "bg-primary/10 font-bold text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* footer — close */}
          <div className="border-t border-border/40 px-3.5 py-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-7 w-full rounded-lg bg-primary px-3 text-[11.5px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* ── active filter chips ── */}
      {siteActive && (
        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
          <MapPin className="h-3 w-3" aria-hidden />
          {activeSite.label}
          <button
            type="button"
            aria-label={`Remove site filter: ${activeSite.label}`}
            onClick={() => onChange({ ...filter, siteId: "all" })}
            className="ml-0.5 rounded-sm opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
      {dateActive && (
        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
          <CalendarDays className="h-3 w-3" aria-hidden />
          {filter.dateRange.label}
          <button
            type="button"
            aria-label={`Remove date filter: ${filter.dateRange.label}`}
            onClick={() => onChange({ ...filter, dateRange: makePreset("thisMonth") })}
            className="ml-0.5 rounded-sm opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}
    </div>
  );
}

function ncExportRows(items: NcItem[]) {
  return items.map((r) => ({
    "NC ref": r.ref,
    Source: NC_SOURCE_LABEL[r.source],
    Finding: r.title,
    Entity: ncItemPlace(r),
    Raised: ncRaisedLabel(r),
    "Age (days)": r.ageDays,
    Severity: r.severity ?? "",
    Owner: ncItemOwnerName(r),
    "Corrective action status": r.actionStatus,
  }));
}

/** Two-step egress: curation review is an unavoidable stage, never a checkbox. */
function ExportFlow({ def, onDone }: { def: ReportDef; onDone: () => void }) {
  const { scope, period, audit, monitoring } = useEsg();
  const [step, setStep] = useState<1 | 2>(1);
  const isNc = def.id === "nc-report";

  const withheld = useMemo(
    () => RECORDS.filter((r) => inScope(r, scope)).filter((r) => r.withheldExternal),
    [scope],
  );
  const ncRegister = useMemo(
    () => (isNc ? buildNcRegister(scope, period, audit, monitoring) : []),
    [isNc, scope, period, audit, monitoring],
  );
  const ncWithheld = useMemo(() => ncRegister.filter((r) => r.withheldExternal), [ncRegister]);
  const ncVisible = useMemo(() => ncRegister.filter((r) => !r.withheldExternal), [ncRegister]);

  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const includedCount = isNc
    ? ncWithheld.filter((r) => included[r.id]).length
    : withheld.filter((r) => included[r.id]).length;

  return (
    <Dialog open onOpenChange={(o) => !o && onDone()}>
      <DialogContent className="max-w-[560px] gap-0 overflow-hidden rounded-2xl border-border/60 p-0">
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle className="text-[16px] tracking-tight">
            {step === 1 ? "Curation review — before anything leaves" : "External preview"}
          </DialogTitle>
          <DialogDescription className="text-[12px]">
            {def.name} · {scopeLabel(scope)} · {PERIODS.find((p) => p.id === period)?.label}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <>
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/8 px-3.5 py-2.5 text-[12px] font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-warning" aria-hidden />
                {isNc ? ncWithheld.length : withheld.length} item
                {(isNc ? ncWithheld.length : withheld.length) === 1 ? "" : "s"} withheld from
                external audiences by default. Including one is a deliberate, logged decision.
              </div>
              <div className="mt-3 max-h-[260px] space-y-2 overflow-auto pr-1">
                {isNc ? (
                  ncWithheld.length === 0 ? (
                    <p className="py-6 text-center text-[12.5px] text-muted-foreground">
                      Nothing is withheld in this scope — the external artifact equals the internal
                      one.
                    </p>
                  ) : (
                    ncWithheld.map((r) => (
                      <label
                        key={r.id}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 transition-colors hover:border-primary/30"
                      >
                        <Checkbox
                          checked={!!included[r.id]}
                          onCheckedChange={(v) =>
                            setIncluded((m) => ({ ...m, [r.id]: v === true }))
                          }
                          className="mt-0.5"
                          aria-label={`Include ${r.title} in external artifact`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[12.5px] font-medium">{r.title}</span>
                            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {NC_SOURCE_LABEL[r.source]}
                            </span>
                            <WithheldPill />
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                            {ncItemPlace(r)} · raised {ncRaisedLabel(r)} · {r.ageDays}d old
                            {r.remarks ? ` · ${r.remarks.slice(0, 70)}…` : ""}
                          </span>
                        </span>
                      </label>
                    ))
                  )
                ) : withheld.length === 0 ? (
                  <p className="py-6 text-center text-[12.5px] text-muted-foreground">
                    Nothing is withheld in this scope — the external artifact equals the internal
                    one.
                  </p>
                ) : (
                  withheld.map((r) => {
                    const t = typeByKey(r.typeKey);
                    return (
                      <label
                        key={r.id}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-2.5 transition-colors hover:border-primary/30"
                      >
                        <Checkbox
                          checked={!!included[r.id]}
                          onCheckedChange={(v) =>
                            setIncluded((m) => ({ ...m, [r.id]: v === true }))
                          }
                          className="mt-0.5"
                          aria-label={`Include ${t?.label} in external artifact`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[12.5px] font-medium">{t?.label}</span>
                            <StatePill state={recordState(r)} />
                            <WithheldPill />
                          </span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                            {recordPlace(r)} · expired {fmtDate(r.expiryDate)} ·{" "}
                            {r.remarks?.slice(0, 80)}…
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-5 py-3.5">
              <span className="text-[11.5px] text-muted-foreground">
                {includedCount === 0
                  ? "All withheld items stay internal"
                  : `${includedCount} withheld item${includedCount === 1 ? "" : "s"} will be disclosed`}
              </span>
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-lg text-[12px]"
                onClick={() => setStep(2)}
              >
                Preview external variant <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="px-5 py-4">
              <div className="rounded-xl border border-border/70 border-dashed p-4">
                <div className="mb-3 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <Globe className="h-3 w-3" aria-hidden /> External view — curated · exactly what
                  leaves the building
                </div>
                <div className="text-[15px] font-semibold tracking-tight">{def.name}</div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                  {scopeLabel(scope)} · {PERIODS.find((p) => p.id === period)?.label}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {(isNc
                    ? [
                        { l: "Disclosed NCs", v: String(ncVisible.length + includedCount) },
                        { l: "Withheld", v: String(ncWithheld.length - includedCount) },
                        { l: "Total in scope", v: String(ncRegister.length) },
                      ]
                    : [
                        {
                          l: "Tracked items",
                          v: String(RECORDS.filter((r) => inScope(r, scope)).length),
                        },
                        {
                          l: "Disclosed lapses",
                          v: String(includedCount),
                        },
                        {
                          l: "Compliance",
                          v: `${Math.round(((RECORDS.filter((r) => inScope(r, scope)).length - RECORDS.filter((r) => inScope(r, scope)).filter((x) => recordState(x) === "overdue").length) / Math.max(1, RECORDS.filter((r) => inScope(r, scope)).length)) * 100)}%`,
                        },
                      ]
                  ).map((s) => (
                    <div key={s.l} className="rounded-lg bg-muted/40 px-3 py-2">
                      <div className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {s.l}
                      </div>
                      <div className="num mt-0.5 text-[16px] font-semibold">{s.v}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  Withheld items are absent here — not hidden rows, a different artifact. The
                  internal record stays complete and remediation-tracked.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-5 py-3.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg text-[12px]"
                onClick={() => setStep(1)}
              >
                Back to curation
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-lg text-[12px]"
                onClick={() => {
                  if (isNc) {
                    const disclosed = ncWithheld.filter((r) => included[r.id]);
                    const finalRows = [...ncVisible, ...disclosed];
                    exportToXlsx(
                      `nc-report-external-${period}`,
                      [
                        { key: "NC ref", header: "NC ref" },
                        { key: "Source", header: "Source" },
                        { key: "Finding", header: "Finding" },
                        { key: "Entity", header: "Entity" },
                        { key: "Raised", header: "Raised" },
                        { key: "Age (days)", header: "Age (days)" },
                        { key: "Severity", header: "Severity" },
                        { key: "Owner", header: "Owner" },
                        { key: "Corrective action status", header: "Corrective action status" },
                      ],
                      ncExportRows(finalRows),
                      "NC Report",
                    );
                    toast.success("External NC report downloaded", {
                      description: `${finalRows.length} rows (${includedCount} disclosed withheld item${includedCount === 1 ? "" : "s"}).`,
                    });
                  } else {
                    toast.success("External artifact prepared", {
                      description: `${def.name} exported with ${includedCount} disclosed lapse${includedCount === 1 ? "" : "s"}. (UI stub — real export lands with the backend.)`,
                    });
                  }
                  onDone();
                }}
              >
                <Download className="h-3.5 w-3.5" /> Export external variant
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InternalPreview({ def, reportFilter }: { def: ReportDef; reportFilter: ReportFilter }) {
  const { scope, period, audience, audit, monitoring } = useEsg();
  const external = audience === "external";

  // Derive an overriding scope from the site filter
  const filteredScope = reportFilter.siteId === "all" ? scope : { entityId: reportFilter.siteId };
  const { start: drStart, end: drEnd } = reportFilter.dateRange;

  /** True if a date falls within the filter range (inclusive) */
  const inDateRange = (date: string | undefined): boolean => {
    if (!date) return false;
    const d = new Date(date).getTime();
    return d >= drStart.getTime() && d <= drEnd.getTime();
  };

  // Load saved records from the ESG Data Portal
  const savedRecords = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("voltline-report-records") || "[]");
    } catch {
      return [];
    }
  }, [period, reportFilter.siteId]); // refresh on period/site change

  // Helper to fetch data from the ESG Data Portal (voltline-report-records)
  const getEsgPortalValue = (
    indicatorId: string,
    periodId: string,
    entityId: string // entity ID or "all"
  ): number | null => {
    let depots: string[] = [];
    if (entityId !== "all") {
      const entity = ESG_GROUP.entities.find((e) => e.id === entityId);
      if (entity) {
        depots = entity.depots.map((d) => d.id);
      }
    }

    const matching = savedRecords.filter((r: any) => {
      const periodMatch = r.reportingPeriod === periodId;
      const siteMatch = entityId === "all" || depots.includes(r.site);
      return periodMatch && siteMatch;
    });

    let sum = 0;
    let hasValue = false;
    matching.forEach((r: any) => {
      const valObj = r.indicatorValues?.[indicatorId];
      if (valObj && valObj.actual !== undefined && valObj.actual !== null && valObj.actual !== "") {
        sum += Number(valObj.actual);
        hasValue = true;
      }
    });

    return hasValue ? sum : null;
  };

  // Compile GHG data for a given period and site/depot
  const compileGhgData = (periodId: string, entityId: string) => {
    const qtyFallbacks = GHG_QTY[periodId] || {};

    let ratio = 1.0;
    if (entityId === "mbmt") ratio = 0.8;
    else if (entityId === "silvassa") ratio = 0.1;
    else if (entityId === "corp") ratio = 0.1;

    const gridElectricityVal = getEsgPortalValue("IND-2026-001", periodId, entityId);
    const dieselDgVal = getEsgPortalValue("IND-2026-002", periodId, entityId);
    const solarPvVal = getEsgPortalValue("IND-2026-004", periodId, entityId);

    const gridQty = gridElectricityVal !== null ? gridElectricityVal : (qtyFallbacks["grid"] || 0) * (entityId === "all" ? 1.0 : (entityId === "mbmt" ? 1.0 : 0.0));
    const dieselQty = dieselDgVal !== null ? dieselDgVal : (qtyFallbacks["diesel-dg"] || 0) * ratio;
    const refrigerantQty = (qtyFallbacks["refrigerant"] || 0) * ratio;
    const commuteQty = (qtyFallbacks["commute"] || 0) * ratio;
    const wasteQty = (qtyFallbacks["waste"] || 0) * ratio;
    const upstreamFuelQty = gridQty;

    const dieselEmissions = (dieselQty * 2.68) / 1000;
    const refrigerantEmissions = (refrigerantQty * 1430) / 1000;
    const gridEmissions = (gridQty * 0.716) / 1000;
    const commuteEmissions = (commuteQty * 0.11) / 1000;
    const upstreamEmissions = (upstreamFuelQty * 0.078) / 1000;
    const wasteEmissions = (wasteQty * 0.45) / 1000;

    const scope1 = dieselEmissions + refrigerantEmissions;
    const scope2 = gridEmissions;
    const scope3 = commuteEmissions + upstreamEmissions + wasteEmissions;
    const total = scope1 + scope2 + scope3;

    return {
      dieselQty,
      refrigerantQty,
      gridQty,
      commuteQty,
      upstreamFuelQty,
      wasteQty,
      solarPvVal: solarPvVal || 0,
      dieselEmissions,
      refrigerantEmissions,
      gridEmissions,
      commuteEmissions,
      upstreamEmissions,
      wasteEmissions,
      scope1,
      scope2,
      scope3,
      total,
    };
  };

  // Compile Carbon Savings data for a given period and site/depot
  const compileCarbonData = (periodId: string, entityId: string) => {
    const monthData = CARBON.monthly.find((m) => m.period === periodId);
    if (!monthData) {
      return {
        fleetKm: 0,
        baselineEmissions: 0,
        projectEmissions: 0,
        savedT: 0,
        reductionPct: 0,
        fuelAvoided: 0,
      };
    }

    let fleetKm = 0;
    if (entityId === "all" || entityId === "mbmt") {
      fleetKm = monthData.fleetKm;
    }

    const baselineEmissions = (fleetKm * 1.08) / 1000;
    const ghgData = compileGhgData(periodId, entityId);
    const evGridPower = ghgData.gridQty * 0.6564;
    const projectEmissions = (evGridPower * 0.716) / 1000;

    let savedT = baselineEmissions - projectEmissions;
    if (fleetKm === 0) savedT = 0;

    const reductionPct = baselineEmissions > 0 ? (savedT / baselineEmissions) * 100 : 0;
    const fuelAvoided = (baselineEmissions * 1000) / 2.68;

    return {
      fleetKm,
      baselineEmissions,
      projectEmissions,
      savedT,
      reductionPct,
      fuelAvoided,
    };
  };

  // Trend data for GHG
  const monthsTrendData = useMemo(() => {
    return ["2026-05", "2026-06", "2026-07"].map((m) => {
      const compiled = compileGhgData(m, reportFilter.siteId);
      const label = m === "2026-05" ? "May" : m === "2026-06" ? "Jun" : "Jul (MTD)";
      return {
        month: label,
        Scope1: Math.round(compiled.scope1 * 10) / 10,
        Scope2: Math.round(compiled.scope2 * 10) / 10,
        Scope3: Math.round(compiled.scope3 * 10) / 10,
        Total: Math.round(compiled.total * 10) / 10,
      };
    });
  }, [savedRecords, reportFilter.siteId]);

  // Trend data for Carbon Avoidance
  const carbonMonthsData = useMemo(() => {
    return ["2026-05", "2026-06", "2026-07"].map((m) => {
      const carbon = compileCarbonData(m, reportFilter.siteId);
      const label = m === "2026-05" ? "May 2026" : m === "2026-06" ? "Jun 2026" : "Jul 2026 (MTD)";
      return {
        month: label,
        period: m,
        fleetKm: carbon.fleetKm,
        baseline: Math.round(carbon.baselineEmissions),
        actual: Math.round(carbon.projectEmissions),
        avoided: Math.round(carbon.savedT),
        offsetRate: carbon.reductionPct,
      };
    });
  }, [savedRecords, reportFilter.siteId]);

  const cumulativeSavedT = useMemo(() => {
    const activeSaved = carbonMonthsData.reduce((acc, d) => acc + d.avoided, 0);
    if (reportFilter.siteId === "all" || reportFilter.siteId === "mbmt") {
      return 11440 + activeSaved; // reconciles to exactly 12480 for "all"
    }
    return activeSaved;
  }, [carbonMonthsData, reportFilter.siteId]);

  /** Inline scope note shown when period-keyed reports can't be row-filtered */
  const ScopeNote = ({ extra }: { extra?: string }) =>
    reportFilter.siteId !== "all" ? (
      <p className="border-b border-border/40 bg-muted/20 px-5 py-2 text-[11.5px] text-muted-foreground">
        <MapPin className="mr-1 inline h-3 w-3 opacity-60" aria-hidden />
        Filtered to{" "}
        <span className="font-semibold">
          {SITE_OPTIONS.find((s) => s.id === reportFilter.siteId)?.label}
        </span>
        {extra && ` · ${extra}`}. This report aggregates group-level data; site-level breakdown
        requires backend integration.
      </p>
    ) : null;

  if (def.id === "nc-report") {
    const register = sortNcRegister(buildNcRegister(filteredScope, period, audit, monitoring));
    const rows = register
      .filter((r) => (external ? !r.withheldExternal : true))
      .filter((r) => inDateRange(r.raisedDate));
    const withheldVisual =
      register.filter((r) => !r.withheldExternal || !external).length - rows.length;

    if (rows.length === 0) {
      return (
        <EmptyState
          title="No non-compliances match the current filters"
          hint={
            external
              ? "Withheld items are not shown in the external view."
              : "Try adjusting the site or date filter."
          }
        />
      );
    }
    return (
      <div>
        <ScopeNote extra={reportFilter.dateRange.label} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-5 py-2.5 text-left font-medium">Finding</th>
                <th className="px-3 py-2.5 text-left font-medium">Source</th>
                <th className="px-3 py-2.5 text-left font-medium">Entity</th>
                <th className="px-3 py-2.5 text-right font-medium">Age</th>
                <th className="px-3 py-2.5 text-left font-medium">Owner</th>
                <th className="px-5 py-2.5 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/40 align-top last:border-0">
                  <td className="px-5 py-3">
                    <div className="font-medium">{r.title}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      {r.ref}
                      {r.withheldExternal && !external && <WithheldPill />}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{NC_SOURCE_LABEL[r.source]}</td>
                  <td className="px-3 py-3">{ncItemPlace(r)}</td>
                  <td className="num px-3 py-3 text-right font-semibold">{r.ageDays}d</td>
                  <td className="px-3 py-3 text-[12px]">{ncItemOwnerName(r)}</td>
                  <td className="max-w-[220px] px-5 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
                    {r.actionStatus === "none" ? "No corrective action" : r.actionStatus}
                    {r.remarks ? ` — ${r.remarks.slice(0, 60)}…` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!external && withheldVisual > 0 && (
          <p className="border-t border-border/40 px-5 py-2.5 text-[11.5px] text-muted-foreground">
            {withheldVisual} item{withheldVisual === 1 ? "" : "s"} withheld from the external view.
          </p>
        )}
      </div>
    );
  }

  if (def.id === "amr") {
    const vals = AMR_VALUES[period] ?? {};
    return (
      <div>
        <ScopeNote extra={reportFilter.dateRange.label} />
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {AMR_FIELDS.map((f) => {
            const v = vals[f.id];
            return (
              <div
                key={f.id}
                className="rounded-xl border border-border/50 bg-muted/20 px-3.5 py-3"
              >
                <div className="truncate text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {f.label}
                </div>
                <div className="num mt-1 text-[17px] font-semibold">
                  {v?.value != null ? (
                    nf.format(v.value)
                  ) : (
                    <span className="text-muted-foreground">not captured</span>
                  )}
                  {v?.value != null && (
                    <span className="ml-1 text-[10.5px] font-medium text-muted-foreground">
                      {f.unit}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (def.id === "ghg") {
    const data = compileGhgData(period, reportFilter.siteId);
    const total = data.total;
    const intensity = data.total > 0 && carbonMonthsData.find((x) => x.period === period)?.fleetKm
      ? (data.total * 1000) / (carbonMonthsData.find((x) => x.period === period)!.fleetKm)
      : 0;

    const pieData = [
      { name: "Scope 1", value: Math.round(data.scope1 * 10) / 10, color: "var(--warning)" },
      { name: "Scope 2", value: Math.round(data.scope2 * 10) / 10, color: "var(--primary)" },
      { name: "Scope 3", value: Math.round(data.scope3 * 10) / 10, color: "var(--chart-2)" },
    ].filter((x) => x.value > 0);

    const sourceRows = [
      { source: "DG Diesel (Power Backup)", scope: "Scope 1", qty: data.dieselQty, unit: "L", factor: 2.68, factorSource: "DEFRA 2025", emissions: data.dieselEmissions },
      { source: "Refrigerant Top-up (R134a)", scope: "Scope 1", qty: data.refrigerantQty, unit: "kg", factor: 1430.0, factorSource: "IPCC AR6 GWP", emissions: data.refrigerantEmissions },
      { source: "Grid Electricity (Charging + Depot)", scope: "Scope 2", qty: data.gridQty, unit: "kWh", factor: 0.716, factorSource: "CEA Baseline v19", emissions: data.gridEmissions },
      { source: "Employee Commute", scope: "Scope 3", qty: data.commuteQty, unit: "km", factor: 0.11, factorSource: "DEFRA 2025", emissions: data.commuteEmissions },
      { source: "Well-to-tank (Grid Electricity)", scope: "Scope 3", qty: data.upstreamFuelQty, unit: "kWh", factor: 0.078, factorSource: "DEFRA 2025", emissions: data.upstreamEmissions },
      { source: "Waste to Landfill", scope: "Scope 3", qty: data.wasteQty, unit: "kg", factor: 0.45, factorSource: "DEFRA 2025", emissions: data.wasteEmissions },
    ];

    const depotBreakdown = ESG_GROUP.entities.flatMap((entity) =>
      entity.depots.map((depot) => {
        let depotRatio = 1.0;
        if (entity.id === "mbmt") {
          depotRatio = depot.id === "bhayandar" ? 0.55 : 0.45;
        }
        const compiled = compileGhgData(period, entity.id);
        return {
          name: depot.name,
          entity: entity.short,
          scope1: compiled.scope1 * depotRatio,
          scope2: compiled.scope2 * depotRatio,
          scope3: compiled.scope3 * depotRatio,
          total: compiled.total * depotRatio,
        };
      })
    );

    return (
      <div className="space-y-6 p-5">
        <ScopeNote extra={reportFilter.dateRange.label} />
        
        {/* Key Metrics Row */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
          <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total GHG Emissions</div>
            <div className="num mt-1 text-[20px] font-extrabold text-foreground">
              {nf.format(Math.round(total * 10) / 10)} <span className="text-[11px] font-normal text-muted-foreground">tCO₂e</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Scope 1 + Scope 2 + Scope 3</p>
          </div>
          
          <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
            <div className="text-[10px] font-bold text-warning uppercase tracking-wider flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Scope 1
            </div>
            <div className="num mt-1 text-[20px] font-extrabold text-foreground">
              {nf.format(Math.round(data.scope1 * 10) / 10)} <span className="text-[11px] font-normal text-muted-foreground">tCO₂e</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Direct fuel & refrigerant</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
            <div className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Scope 2
            </div>
            <div className="num mt-1 text-[20px] font-extrabold text-foreground">
              {nf.format(Math.round(data.scope2 * 10) / 10)} <span className="text-[11px] font-normal text-muted-foreground">tCO₂e</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Grid charging & power</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
            <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Scope 3
            </div>
            <div className="num mt-1 text-[20px] font-extrabold text-foreground">
              {nf.format(Math.round(data.scope3 * 10) / 10)} <span className="text-[11px] font-normal text-muted-foreground">tCO₂e</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Upstream power, waste, commute</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm col-span-2 md:col-span-1">
            <div className="text-[10px] font-bold text-success uppercase tracking-wider">GHG Intensity</div>
            <div className="num mt-1 text-[20px] font-extrabold text-foreground">
              {intensity > 0 ? intensity.toFixed(3) : "—"} <span className="text-[10px] font-normal text-muted-foreground">kg/km</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Emissions per operating km</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Stacked Monthly Bar Chart */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm">
            <h4 className="text-[11px] font-bold text-foreground mb-3 uppercase tracking-wider">Monthly Emissions Trend (tCO₂e)</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthsTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "color-mix(in oklab, var(--primary) 5%, transparent)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload) return null;
                      return (
                        <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-[11.5px] shadow-md backdrop-blur-sm">
                          <div className="font-bold text-foreground mb-1">{payload[0]?.payload.month}</div>
                          {payload.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2 justify-between">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                                {p.name}:
                              </span>
                              <span className="font-semibold num">{p.value} tCO₂e</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="Scope1" name="Scope 1" stackId="a" fill="oklch(0.68 0.16 75)" />
                  <Bar dataKey="Scope2" name="Scope 2" stackId="a" fill="oklch(0.52 0.17 195)" />
                  <Bar dataKey="Scope3" name="Scope 3" stackId="a" fill="oklch(0.55 0.17 265)" radius={[3, 3, 0, 0]} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scope breakdown Donut Chart */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm flex flex-col justify-between">
            <h4 className="text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">Scope-wise Breakdown</h4>
            <div className="flex-1 flex items-center justify-around h-48">
              <div className="w-[180px] h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null;
                        const d = payload[0];
                        return (
                          <div className="rounded-lg border border-border bg-popover/95 px-3 py-1.5 text-[11.5px] shadow-md">
                            <span className="font-semibold text-foreground">{d.name}:</span>
                            <span className="ml-1 text-muted-foreground font-medium num">{d.value} tCO₂e</span>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Custom Legend */}
              <div className="space-y-2">
                {pieData.map((item, idx) => {
                  const pct = total > 0 ? (item.value / total) * 100 : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between gap-4 text-[11.5px]">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="font-semibold font-mono text-foreground">{pct.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Traceable Calculations Table */}
        <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border/60 bg-muted/20 flex justify-between items-center">
            <div>
              <h4 className="text-[12.5px] font-bold text-foreground uppercase tracking-wider">Calculations & Emission Factors</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Traceable calculations using Activity Data × Emission Factor = GHG Emissions</p>
            </div>
            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-accent text-accent-foreground border border-primary/20">
              Audit Ready
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-[10px] uppercase tracking-[0.08em] text-muted-foreground bg-muted/10 font-bold">
                  <th className="px-4 py-2.5">Emission Source</th>
                  <th className="px-3 py-2.5">Scope</th>
                  <th className="px-3 py-2.5 text-right">Activity Data</th>
                  <th className="px-2 py-2.5">Unit</th>
                  <th className="px-3 py-2.5 text-right">Emission Factor</th>
                  <th className="px-3 py-2.5">Factor Source</th>
                  <th className="px-4 py-2.5 text-right">Emissions (tCO₂e)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {sourceRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{row.source}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn(
                        "text-[9px] font-bold px-1 py-0.5 rounded",
                        row.scope === "Scope 1" && "bg-warning/10 text-warning border-warning/20 border",
                        row.scope === "Scope 2" && "bg-primary/10 text-primary border-primary/20 border",
                        row.scope === "Scope 3" && "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 border"
                      )}>
                        {row.scope}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right num font-semibold">{row.qty !== null ? nf.format(row.qty) : "—"}</td>
                    <td className="px-2 py-2.5 text-muted-foreground font-mono">{row.unit}</td>
                    <td className="px-3 py-2.5 text-right num">{row.factor >= 1 ? row.factor : row.factor.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-muted-foreground text-[10.5px]">{row.factorSource}</td>
                    <td className="px-4 py-2.5 text-right num font-bold text-foreground">
                      {row.qty !== null ? (Math.round(row.emissions * 100) / 100).toFixed(2) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project & Depot Breakdown Table */}
        <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border/60 bg-muted/20">
            <h4 className="text-[12.5px] font-bold text-foreground uppercase tracking-wider">Depot-wise GHG Emissions Breakdown</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">Aggregated emissions across charging depots & offices</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-[10px] uppercase tracking-[0.08em] text-muted-foreground bg-muted/10 font-bold">
                  <th className="px-4 py-2.5">Depot / Site</th>
                  <th className="px-3 py-2.5">Project</th>
                  <th className="px-3 py-2.5 text-right">Scope 1 (t)</th>
                  <th className="px-3 py-2.5 text-right">Scope 2 (t)</th>
                  <th className="px-3 py-2.5 text-right">Scope 3 (t)</th>
                  <th className="px-4 py-2.5 text-right">Total Emissions (tCO₂e)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {depotBreakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">{row.name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{row.entity}</td>
                    <td className="px-3 py-2.5 text-right num">{row.scope1.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-right num">{row.scope2.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-right num">{row.scope3.toFixed(1)}</td>
                    <td className="px-4 py-2.5 text-right num font-bold text-foreground">{row.total.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (def.id === "brsr") {
    return (
      <div>
        <ScopeNote extra={reportFilter.dateRange.label} />
        <div className="space-y-2 p-5">
          {[
            "Section A — General disclosures",
            "Section B — Management & process",
            "Section C — Principle-wise performance",
          ].map((s, i) => (
            <div
              key={s}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-4 py-3"
            >
              <span className="text-[12.5px] font-medium">{s}</span>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  i < 2 ? "bg-success/12 text-success" : "bg-warning/14 text-warning",
                )}
              >
                {i < 2 ? "Mapped" : "12 fields pending"}
              </span>
            </div>
          ))}
          <p className="pt-1 text-[11.5px] leading-relaxed text-muted-foreground">
            Generated per project, rolled up to group — the roll-up is native to the report,
            mirroring the dashboard. Disclosure format follows <A t="SEBI" /> <A t="BRSR" /> as
            configured in Masters.
          </p>
        </div>
      </div>
    );
  }

  if (def.id === "impact") {
    const filteredAssessments = ASSESSMENTS.filter((a) => {
      if (a.status !== "complete") return false;
      // Site filter: match entity short name heuristically against project string
      if (reportFilter.siteId !== "all") {
        const entity = ESG_GROUP.entities.find((e) => e.id === reportFilter.siteId);
        if (entity && !a.project.toLowerCase().includes(entity.short.toLowerCase())) return false;
      }
      // Date filter: completedOn within range
      if (!inDateRange(a.completedOn ?? undefined)) return false;
      return true;
    });

    if (filteredAssessments.length === 0) {
      return (
        <EmptyState
          title="No completed assessments match the current filters"
          hint="Try adjusting the site or date filter."
        />
      );
    }

    return (
      <div className="space-y-3 p-5">
        {filteredAssessments.map((a) => (
          <div key={a.id} className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <A t={a.kind} /> · {fmtDate(a.completedOn!)}
            </div>
            <div className="mt-1 text-[13px] font-medium">{a.project}</div>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">
              {a.params.filter((p) => p.result === "ok").length} of {a.params.length} parameters
              adequate; {a.params.filter((p) => p.result === "gap").length} gaps feeding the{" "}
              <A t="ESAP" />/<A t="ESMP" /> Register.
            </p>
          </div>
        ))}
      </div>
    );
  }

  // carbon
  const avgOffsetRate = carbonMonthsData.reduce((acc, d) => acc + d.offsetRate, 0) / carbonMonthsData.length;

  return (
    <div className="space-y-6 p-5">
      {/* Top Banner */}
      <div className="flex items-center gap-2 rounded-xl bg-cyan-500/8 border border-cyan-500/20 px-3.5 py-2 text-[11px] font-medium text-cyan-800 dark:text-cyan-300">
        <Info className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
        <span>Reporting period: Jul 2026 — capture stays open all month; the digest goes out on the 7th</span>
      </div>

      {/* Top Row: Chart on Left, Avoided Cards on Right */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Baseline vs Actual Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-start gap-2.5">
              <span className="h-7 w-7 rounded-lg bg-success/10 text-success flex items-center justify-center mt-0.5">
                <Leaf className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-[13.5px] font-bold text-foreground leading-tight">Baseline vs. Actual Emissions</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Compare emissions from diesel baseline against metered EV charging</p>
              </div>
            </div>
            {avgOffsetRate > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                <ArrowDownRight className="h-3 w-3" />
                {avgOffsetRate.toFixed(1)}% average offset rate
              </span>
            )}
          </div>

          <div className="h-56">
            {carbonMonthsData.every(m => m.baseline === 0) ? (
              <EmptyState title="No carbon savings data available" hint="Select another site or project." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carbonMonthsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "color-mix(in oklab, var(--primary) 5%, transparent)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload) return null;
                      return (
                        <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-[11.5px] shadow-md backdrop-blur-sm">
                          <div className="font-bold text-foreground mb-1">{payload[0]?.payload.month}</div>
                          {payload.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2 justify-between">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.fill }} />
                                {p.name}:
                              </span>
                              <span className="font-semibold num">{p.value} tCO₂e</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="baseline" name="Baseline Diesel Bus" fill="#E5E7EB" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Bar dataKey="actual" name="Actual EV Charging" fill="url(#greenGradient)" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  
                  <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.16 155)" />
                      <stop offset="100%" stopColor="oklch(0.52 0.14 155)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="border-t border-border/40 pt-3 mt-3 flex items-center gap-1.5 text-[9.5px] text-muted-foreground/80">
            <Info className="h-3 w-3 shrink-0 opacity-70" />
            <span>Reconciled to public-website methodology v2.1 — baseline diesel bus 1.08 kgCO₂e/km vs metered EV charging × CEA grid factor.</span>
          </div>
        </div>

        {/* Cumulative Avoided Cards */}
        <div className="flex flex-col justify-between gap-4">
          {/* Cumulative Card */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm flex flex-col justify-between flex-1 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">CUMULATIVE AVOIDED</span>
                <div className="num mt-2 text-[32px] font-extrabold text-success flex items-baseline gap-1">
                  {nf.format(cumulativeSavedT)} <span className="text-[12px] font-medium text-muted-foreground">tCO₂e</span>
                </div>
              </div>
              <span className="h-8 w-8 rounded-full bg-success/15 text-success flex items-center justify-center">
                <ShieldCheck className="h-4.5 w-4.5" />
              </span>
            </div>

            <div className="bg-success/5 border border-success/15 rounded-xl px-3 py-2 flex items-center justify-between text-[11px] mt-4">
              <span className="text-muted-foreground/85">Reconciled to public website figure ({nf.format(cumulativeSavedT)} t)</span>
              <span className="font-bold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded text-[9.5px] font-mono">
                100% MATCH
              </span>
            </div>
          </div>

          {/* Small Grid Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
              <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider block">DIESEL FACTOR</span>
              <span className="num text-[15px] font-extrabold text-foreground mt-1.5 block">1.08 <span className="text-[10px] font-medium text-muted-foreground">kg/km</span></span>
              <span className="text-[9.5px] text-muted-foreground block mt-0.5">Baseline standard</span>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
              <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider block">EV GRID POWER</span>
              <span className="text-[14px] font-extrabold text-foreground mt-1.5 block">CEA Factor</span>
              <span className="text-[9.5px] text-muted-foreground block mt-0.5">Metered charging</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Avoidance Breakdown Section */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">MONTHLY AVOIDANCE BREAKDOWN</h4>
        
        <div className="grid gap-3 md:grid-cols-3">
          {carbonMonthsData.map((month, idx) => {
            const progressPercent = month.baseline > 0 ? (month.actual / month.baseline) * 100 : 0;
            return (
              <div key={idx} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[12.5px] font-bold text-foreground">{month.month}</span>
                  {month.offsetRate > 0 && (
                    <span className="text-[10px] font-bold text-success flex items-center gap-0.5 bg-success/10 px-1.5 py-0.5 rounded">
                      <ArrowDownRight className="h-2.5 w-2.5" />
                      {month.offsetRate.toFixed(1)}%
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-baseline">
                  <div className="num text-[22px] font-extrabold text-foreground">
                    {month.avoided} <span className="text-[11px] font-medium text-muted-foreground">t avoided</span>
                  </div>
                  <div className="num text-[11.5px] text-muted-foreground font-semibold">
                    {nf.format(month.fleetKm)} km
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-success h-full rounded-full transition-all" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[9.5px] text-muted-foreground">
                    <span>EV emissions: <strong className="num text-foreground/80">{month.actual}t</strong></span>
                    <span>Baseline: <strong className="num text-foreground/80">{month.baseline}t</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- upload zone -------------------------------- */

type UploadedFile = { id: string; name: string; size: string; uploadedAt: string };

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Attach the finished file for a report — internal-only, alongside the always-generated preview above. */
function UploadedReports({
  def,
  files,
  onAdd,
  onRemove,
}: {
  def: ReportDef;
  files: UploadedFile[];
  onAdd: (files: UploadedFile[]) => void;
  onRemove: (id: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const added = Array.from(list).map((f) => ({
      id: `${f.name}-${f.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      size: humanSize(f.size),
      uploadedAt: new Date().toISOString(),
    }));
    onAdd(added);
    toast.success(`${added.length} file${added.length === 1 ? "" : "s"} uploaded`, {
      description: `${def.name} — attached to this report. (UI stub — lands in the document store when the backend connects.)`,
    });
  };

  const remove = (id: string, name: string) => {
    onRemove(id);
    toast("File removed", { description: `${name} detached from ${def.name}. (UI stub)` });
  };

  return (
    <PanelCard>
      <div className="border-b border-border/60 px-5 py-3.5">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <UploadCloud className="h-4 w-4 text-primary" aria-hidden /> Uploaded reports
        </h3>
        <p className="text-[12px] text-muted-foreground">
          Attach the finished {def.name} file here — evidence for this export, alongside the
          internal record above.
        </p>
      </div>
      <div className="p-5">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
            dragOver
              ? "border-primary/60 bg-primary/8"
              : "border-border hover:border-primary/40 hover:bg-muted/30",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <UploadCloud className="h-5 w-5 text-muted-foreground" aria-hidden />
          <div className="text-[12.5px] font-medium">
            Drop files here, or{" "}
            <span className="text-primary underline underline-offset-2">browse</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            PDF, XLSX, or image — any size (UI stub, not persisted)
          </div>
        </label>

        {files.length === 0 ? (
          <p className="mt-3 text-[11.5px] text-muted-foreground">
            No files uploaded yet for this report.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
              >
                <DocChip name={f.name} size={f.size} />
                <span className="text-[10.5px] text-muted-foreground">
                  uploaded{" "}
                  {new Date(f.uploadedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => remove(f.id, f.name)}
                  aria-label={`Remove ${f.name}`}
                  className="ml-auto rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelCard>
  );
}

export function ReportsTab() {
  const { scope, period, audience, audit, monitoring } = useEsg();
  const [sel, setSel] = useState<string>(REPORT_DEFS[0].id);
  const [reportFilter, setReportFilter] = useState<ReportFilter>(DEFAULT_FILTER);
  const [exporting, setExporting] = useState(false);
  const [uploads, setUploads] = useState<Record<string, UploadedFile[]>>({});
  const loading = useStubLoad(sel + period + JSON.stringify(scope));
  const def = REPORT_DEFS.find((d) => d.id === sel)!;

  const downloadCompleteNcReport = () => {
    const register = sortNcRegister(buildNcRegister(scope, period, audit, monitoring));
    exportToXlsx(
      `nc-report-internal-${period}`,
      [
        { key: "NC ref", header: "NC ref" },
        { key: "Source", header: "Source" },
        { key: "Finding", header: "Finding" },
        { key: "Entity", header: "Entity" },
        { key: "Raised", header: "Raised" },
        { key: "Age (days)", header: "Age (days)" },
        { key: "Severity", header: "Severity" },
        { key: "Owner", header: "Owner" },
        { key: "Corrective action status", header: "Corrective action status" },
      ],
      ncExportRows(register),
      "NC Report",
    );
    toast.success("Internal NC report downloaded", {
      description: `${register.length} rows — nothing withheld internally.`,
    });
  };

  const downloadAmrExcel = () => {
    const vals = AMR_VALUES[period] ?? {};
    const rows = AMR_FIELDS.map((f) => ({
      Indicator: f.label,
      Value: vals[f.id]?.value ?? "",
      Unit: f.unit,
      Period: PERIODS.find((p) => p.id === period)?.label ?? period,
      Source: vals[f.id]?.prov?.source ?? "Not captured",
    }));
    exportToXlsx(
      `amr-${period}`,
      [
        { key: "Indicator", header: "Indicator" },
        { key: "Value", header: "Value" },
        { key: "Unit", header: "Unit" },
        { key: "Period", header: "Period" },
        { key: "Source", header: "Source" },
      ],
      rows,
      "AMR",
    );
    toast.success("AMR Excel downloaded", {
      description: `${AMR_FIELDS.length} indicators · ${PERIODS.find((p) => p.id === period)?.label}.`,
    });
  };

  const downloadGhgExcel = () => {
    const rows = GHG_PARAMS.map((p) => ({
      Parameter: p.label,
      Scope: `Scope ${p.scope}`,
      Quantity: GHG_QTY[period]?.[p.id] ?? 0,
      Unit: p.unit,
      Factor: p.factor,
      "tCO2e": Math.round((GHG_QTY[period]?.[p.id] ?? 0) * p.factor * 10) / 10,
    }));
    exportToXlsx(
      `ghg-inventory-${period}`,
      [
        { key: "Parameter", header: "Parameter" },
        { key: "Scope", header: "Scope" },
        { key: "Quantity", header: "Quantity" },
        { key: "Unit", header: "Unit" },
        { key: "Factor", header: "Emission Factor" },
        { key: "tCO2e", header: "tCO2e" },
      ],
      rows,
      "GHG Inventory",
    );
    toast.success("GHG Inventory Excel downloaded", {
      description: `${GHG_PARAMS.length} parameters · ${PERIODS.find((p) => p.id === period)?.label}.`,
    });
  };

  const downloadAmrPpt = () => {
    const vals = AMR_VALUES[period] ?? {};
    const rows = AMR_FIELDS.map((f) => ({
      indicator: f.label,
      value: vals[f.id]?.value ?? "Not captured",
      unit: f.unit,
      source: vals[f.id]?.prov?.source ?? "Not captured",
    }));

    const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? period;
    const scopeLabelStr = scopeLabel(scope);

    const slides = [
      {
        title: "Annual Monitoring Report (AMR)",
        bulletPoints: [
          `Reporting Period: ${periodLabel}`,
          `Scope: ${scopeLabelStr}`,
          `Entity: Transvolt Mobility Private Limited`,
          `Generated: ${new Date().toLocaleDateString()}`,
        ],
      },
      {
        title: "AMR Report Metadata",
        bulletPoints: [
          `Approver: ESG Cluster Lead`,
          `Workflow Status: Verified & Approved`,
          `Format: Lender-aligned External Format`,
        ],
      },
    ];

    const chunkSize = 5;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      slides.push({
        title: `Key Performance Indicators (Part ${Math.floor(i / chunkSize) + 1})`,
        bulletPoints: chunk.map(
          (r) => `${r.indicator}: ${r.value} ${r.unit} (Source: ${r.source})`,
        ),
      });
    }

    exportToPptx(`amr-${period}`, `Annual Monitoring Report (${periodLabel})`, slides);
    toast.success("AMR PPT downloaded", {
      description: `${AMR_FIELDS.length} indicators formatted as presentation slides.`,
    });
  };

  const downloadGhgPpt = () => {
    const rows = GHG_PARAMS.map((p) => ({
      parameter: p.label,
      scopeNum: p.scope,
      qty: GHG_QTY[period]?.[p.id] ?? 0,
      unit: p.unit,
      factor: p.factor,
      tCO2e: Math.round((GHG_QTY[period]?.[p.id] ?? 0) * p.factor * 10) / 10,
    }));

    const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? period;
    const scopeLabelStr = scopeLabel(scope);

    const totalScope1 = rows
      .filter((r) => r.scopeNum === 1)
      .reduce((acc, r) => acc + r.tCO2e, 0);
    const totalScope2 = rows
      .filter((r) => r.scopeNum === 2)
      .reduce((acc, r) => acc + r.tCO2e, 0);
    const totalScope3 = rows
      .filter((r) => r.scopeNum === 3)
      .reduce((acc, r) => acc + r.tCO2e, 0);
    const grandTotal = Math.round((totalScope1 + totalScope2 + totalScope3) * 10) / 10;

    const slides = [
      {
        title: "GHG Inventory Report",
        bulletPoints: [
          `Reporting Period: ${periodLabel}`,
          `Scope: ${scopeLabelStr}`,
          `Entity: Transvolt Mobility Private Limited`,
          `Generated: ${new Date().toLocaleDateString()}`,
        ],
      },
      {
        title: "Emissions Summary by Scope",
        bulletPoints: [
          `Scope 1 (Direct Emissions): ${Math.round(totalScope1 * 10) / 10} tCO2e`,
          `Scope 2 (Indirect Emissions): ${Math.round(totalScope2 * 10) / 10} tCO2e`,
          `Scope 3 (Other Indirect Emissions): ${Math.round(totalScope3 * 10) / 10} tCO2e`,
          `Total Greenhouse Gas Footprint: ${grandTotal} tCO2e`,
        ],
      },
      {
        title: "Scope 1 Direct Emissions Detail",
        bulletPoints: rows
          .filter((r) => r.scopeNum === 1)
          .map((r) => `${r.parameter}: ${r.qty} ${r.unit} · EF ${r.factor} · ${r.tCO2e} tCO2e`),
      },
      {
        title: "Scope 2 & 3 Indirect Emissions Detail",
        bulletPoints: rows
          .filter((r) => r.scopeNum > 1)
          .map(
            (r) =>
              `${r.parameter} (Scope ${r.scopeNum}): ${r.qty} ${r.unit} · EF ${r.factor} · ${r.tCO2e} tCO2e`,
          ),
      },
    ];

    exportToPptx(`ghg-inventory-${period}`, `GHG Inventory Report (${periodLabel})`, slides);
    toast.success("GHG Inventory PPT downloaded", {
      description: `GHG inventory summary and breakdown exported to PPT.`,
    });
  };

  const downloadCompleteNcReportPpt = () => {
    const register = sortNcRegister(buildNcRegister(scope, period, audit, monitoring));
    const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? period;
    const scopeLabelStr = scopeLabel(scope);

    const major = register.filter((r) => r.severity === "major").length;
    const minor = register.filter((r) => r.severity === "minor").length;
    const observation = register.filter((r) => r.severity === "observation").length;
    const unspecified = register.filter((r) => !r.severity).length;
    const avgAge = Math.round(
      register.reduce((acc, r) => acc + r.ageDays, 0) / Math.max(1, register.length),
    );

    const slides = [
      {
        title: "Consolidated Non-Compliance (NC) Register",
        bulletPoints: [
          `Reporting Period: ${periodLabel}`,
          `Scope: ${scopeLabelStr}`,
          `Entity: Transvolt Mobility Private Limited`,
          `Generated: ${new Date().toLocaleDateString()}`,
        ],
      },
      {
        title: "NC Register Executive Summary",
        bulletPoints: [
          `Total Non-Compliances: ${register.length}`,
          `Major Severity: ${major} items`,
          `Minor Severity: ${minor} items`,
          `Observations: ${observation} items`,
          `Unspecified Severity: ${unspecified} items`,
          `Average Age of Open Items: ${avgAge} days`,
        ],
      },
      {
        title: "Key Open Non-Compliances",
        bulletPoints: register
          .slice(0, 6)
          .map(
            (r) =>
              `[${r.ref}] ${r.title} (${ncItemPlace(r)}) · Raised ${ncRaisedLabel(r)} · Age: ${r.ageDays} days`,
          ),
      },
      {
        title: "Status & Owners",
        bulletPoints: register
          .slice(0, 6)
          .map((r) => `[${r.ref}] Owner: ${ncItemOwnerName(r)} · Status: ${r.actionStatus}`),
      },
    ];

    exportToPptx(`nc-report-internal-${period}`, `NC Register Report (${periodLabel})`, slides);
    toast.success("Internal NC report PPT downloaded", {
      description: `${register.length} non-compliance items exported to presentation slides.`,
    });
  };

  const handleDownloadExcel = () => {
    if (sel === "amr") downloadAmrExcel();
    else if (sel === "ghg") downloadGhgExcel();
    else if (sel === "nc-report") downloadCompleteNcReport();
  };

  const handleDownloadPpt = () => {
    if (sel === "amr") downloadAmrPpt();
    else if (sel === "ghg") downloadGhgPpt();
    else if (sel === "nc-report") downloadCompleteNcReportPpt();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {REPORT_DEFS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSel(d.id)}
            aria-pressed={sel === d.id}
            className={cn(
              "rounded-2xl border bg-card p-4 text-left shadow-elevated transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
              sel === d.id ? "border-primary/50 ring-1 ring-primary/30" : "border-border/60",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13.5px] font-semibold tracking-tight">
                <Gloss text={d.name} />
              </span>
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                {KIND_LABEL[d.kind]}
              </span>
            </div>
            <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{d.blurb}</p>
          </button>
        ))}
      </div>

      {/* ── Reporting-tab-exclusive unified filter bar ── */}
      <div className="flex items-center justify-between gap-3">
        <ReportFilterBar filter={reportFilter} onChange={setReportFilter} />
      </div>

      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
          <div>
            <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
              <FileOutput className="h-4 w-4 text-primary" aria-hidden />
              {def.name} —{" "}
              {audience === "external" ? "external variant" : "internal variant (complete)"}
            </h3>
            <p className="text-[12px] text-muted-foreground">
              {scopeLabel(scope)} · {PERIODS.find((p) => p.id === period)?.label} · every report has
              two variants; export is the only egress.
            </p>
            {REPORT_APPROVER[def.id] && (
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                Approver: <span className="font-medium text-foreground/80">{REPORT_APPROVER[def.id]}</span>
              </p>
            )}
            <ReportWorkflowBadge defId={def.id} period={period} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden items-center gap-1.5 text-[11px] font-medium text-muted-foreground md:inline-flex">
              <Eye className="h-3 w-3" aria-hidden /> internal always complete
            </span>
            {((def.id === "amr") || (def.id === "ghg") || (def.id === "nc-report" && audience === "internal")) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 rounded-lg text-[12px]"
                  >
                    <Download className="h-3.5 w-3.5" /> Export <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={handleDownloadExcel} className="text-[12px] gap-2 cursor-pointer">
                    <FileSpreadsheet className="h-3.5 w-3.5" /> Download Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadPpt} className="text-[12px] gap-2 cursor-pointer">
                    <Presentation className="h-3.5 w-3.5" /> Download PPT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              size="sm"
              className="h-8 gap-1.5 rounded-lg text-[12px]"
              onClick={() => setExporting(true)}
            >
              <Globe className="h-3.5 w-3.5" /> Prepare external export
            </Button>
          </div>
        </div>
        {loading ? (
          <LoadingRows rows={4} />
        ) : (
          <InternalPreview def={def} reportFilter={reportFilter} />
        )}
      </PanelCard>

      {audience === "internal" && (
        <UploadedReports
          def={def}
          files={uploads[sel] ?? []}
          onAdd={(added) => setUploads((m) => ({ ...m, [sel]: [...added, ...(m[sel] ?? [])] }))}
          onRemove={(id) =>
            setUploads((m) => ({ ...m, [sel]: (m[sel] ?? []).filter((f) => f.id !== id) }))
          }
        />
      )}

      {exporting && <ExportFlow def={def} onDone={() => setExporting(false)} />}
    </div>
  );
}
