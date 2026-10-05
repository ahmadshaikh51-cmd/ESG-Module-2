import { useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Edit,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  MapPin,
  MoreVertical,
  Paperclip,
  PencilLine,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  ESG_GROUP,
  ESG_TODAY,
  MONITORING_AREAS,
  MONITORING_PARAMS,
  monitoringAreaByKey,
  monitoringParamByKey,
  PERIODS,
  type MonitoringAreaKey,
  type MonitoringCategory,
} from "@/lib/esg-data";
import { canEditPolicies } from "@/lib/esg-policy";
import {
  cellBreaches,
  getDerivedActionStatus,
  MONITORING_CATEGORY_LABEL,
  type ActionStatus,
  type ComplianceStatus,
  type SeverityLevel,
  type SiteObservation,
} from "@/lib/esg-monitoring";
import { exportToXlsx } from "@/lib/export-xlsx";
import { EmptyState, PanelCard, ProvenanceChip, useEsg, WithheldPill } from "../primitives";
import { Segmented } from "../Segmented";
import { ObservationModal } from "./ObservationModal";
import { ObservationDetailDrawer } from "./ObservationDetailDrawer";
import { LabTestDataEntry } from "./LabTestDataEntry";
import { LabTestMonitorView } from "./LabTestMonitorView";
import { SocialDataEntry, type SocialRecordItem } from "./SocialDataEntry";
import { SocialMonitorView } from "./SocialMonitorView";
import { SiteMonitoringDashboard } from "../monitoring/SiteMonitoringDashboard";

const CATEGORIES: MonitoringCategory[] = ["air", "water", "noise"];

const ALL_DEPOT_OPTIONS = ESG_GROUP.entities.flatMap((e) =>
  e.depots.map((d) => ({
    entityId: e.id,
    depotId: d.id,
    label: `${e.short} · ${d.name.replace(" Depot", "")}`,
    entityName: e.name,
    depotName: d.name,
  })),
);

function BreachPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-destructive/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
      <TriangleAlert className="h-3 w-3" aria-hidden /> Breach
    </span>
  );
}

/* --------------------------- inline SVG sparkline -------------------------- */

function Sparkline({ values, limit }: { values: (number | null)[]; limit?: number }) {
  const pts = values.map((v, i) => ({ v, i }));
  const nums = values.filter((v): v is number => v != null);
  if (nums.length < 2) return <span className="text-[10.5px] text-muted-foreground">—</span>;
  const max = Math.max(...nums, limit ?? -Infinity);
  const min = Math.min(...nums, limit ?? Infinity);
  const range = max - min || 1;
  const w = 60;
  const h = 20;
  const x = (i: number) => (i / (values.length - 1)) * w;
  const y = (v: number) => h - ((v - min) / range) * h;
  const line = pts
    .filter((p) => p.v != null)
    .map((p) => `${x(p.i).toFixed(1)},${y(p.v as number).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible" aria-hidden>
      {limit != null && (
        <line
          x1={0}
          x2={w}
          y1={y(limit)}
          y2={y(limit)}
          stroke="var(--color-destructive)"
          strokeDasharray="2 2"
          strokeWidth={1}
          opacity={0.5}
        />
      )}
      <polyline points={line} fill="none" stroke="var(--color-primary)" strokeWidth={1.5} />
    </svg>
  );
}

/* ------------------------------ excel import ------------------------------- */

type ParsedRow = { paramKey: string; label: string; value: number; matched: boolean };

function ImportDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (rows: { paramKey: string; value: number }[], sourceName: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setRows(null);
    setFileName("");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const parse = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
        if (!json.length) {
          setError("The sheet has no rows.");
          return;
        }
        const parsed: ParsedRow[] = json
          .map((r) => {
            const paramKey = String(r.paramKey ?? r.key ?? r.Parameter ?? "").trim();
            const rawVal = r.value ?? r.Value ?? r.reading;
            const value = Number(rawVal);
            const param = monitoringParamByKey(paramKey);
            return {
              paramKey,
              label: param?.label ?? paramKey,
              value,
              matched: !!param && Number.isFinite(value),
            };
          })
          .filter((r) => r.paramKey);
        if (!parsed.length) {
          setError(
            "No recognisable rows. Use the template — a `paramKey` and `value` column are required.",
          );
          return;
        }
        setRows(parsed);
        setFileName(file.name);
      } catch {
        setError("Could not read this file. Make sure it is a valid .xlsx workbook.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const matched = rows?.filter((r) => r.matched) ?? [];

  const confirm = () => {
    if (!matched.length) return;
    onConfirm(
      matched.map((r) => ({ paramKey: r.paramKey, value: r.value })),
      fileName || "monitoring-upload.xlsx",
    );
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Import monitoring data from Excel</DialogTitle>
        </DialogHeader>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) parse(f);
          }}
        />

        {!rows ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <Upload className="h-6 w-6 text-muted-foreground" aria-hidden />
            <span className="text-[12.5px] font-medium">Drop an .xlsx file or click to choose</span>
            <span className="text-[11px] text-muted-foreground">
              Parsed in your browser — nothing is uploaded
            </span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="text-[12px] text-muted-foreground">
              {fileName} — {matched.length} of {rows.length} rows matched a known parameter.
            </div>
            <div className="max-h-[240px] overflow-y-auto rounded-lg border border-border/60">
              <Table className="w-full text-[12px]">
                <TableHeader>
                  <TableRow className="border-b border-border/60 text-[10.5px] uppercase tracking-wider text-muted-foreground hover:bg-transparent">
                    <TableHead className="px-3 py-2 text-left font-medium h-auto text-muted-foreground">Parameter</TableHead>
                    <TableHead className="px-3 py-2 text-right font-medium h-auto text-muted-foreground">Value</TableHead>
                    <TableHead className="px-3 py-2 text-left font-medium h-auto text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow
                      key={i}
                      className={cn(
                        "border-b border-border/40 last:border-0 hover:bg-muted/15",
                        !r.matched && "bg-warning/5",
                      )}
                    >
                      <TableCell className="px-3 py-1.5 text-foreground">{r.label || r.paramKey}</TableCell>
                      <TableCell className="num px-3 py-1.5 text-right text-foreground">
                        {Number.isFinite(r.value) ? r.value : "—"}
                      </TableCell>
                      <TableCell className="px-3 py-1.5 text-foreground">
                        {r.matched ? (
                          <span className="text-[11px] text-success">will import</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-warning">
                            <AlertTriangle className="h-3 w-3" aria-hidden /> unmatched — skipped
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {error && <p className="text-[12px] font-medium text-destructive">{error}</p>}

        <DialogFooter>
          {rows && (
            <Button size="sm" variant="outline" className="text-[12px]" onClick={reset}>
              Choose another file
            </Button>
          )}
          <Button size="sm" className="text-[12px]" onClick={confirm} disabled={!matched.length}>
            Import {matched.length || ""} rows
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function downloadTemplate() {
  exportToXlsx(
    "monitoring-template",
    [
      { key: "paramKey", header: "paramKey" },
      { key: "label", header: "label" },
      { key: "unit", header: "unit" },
      { key: "limit", header: "limit" },
      { key: "value", header: "value" },
    ],
    MONITORING_PARAMS.map((p) => ({
      paramKey: p.key,
      label: p.label,
      unit: p.unit,
      limit: p.limit ?? "",
      value: "",
    })),
    "Template",
  );
  toast.success("Template downloaded", { description: "Fill the `value` column and import." });
}

/* ------------------------------- Main Panel -------------------------------- */

type MainViewType = "observations" | "lab_parameters";

export function MonitoringPanel() {
  const { scope, period, role, audience, monitoring: wf } = useEsg();
  const external = audience === "external";
  const canEdit = canEditPolicies(role);

  // Domain tab state: Meta Data vs Meta Data Social
  const [topDomain, setTopDomain] = useState<"meta_data" | "meta_data_social">("meta_data");
  const [labEntryMode, setLabEntryMode] = useState<"entry" | "monitor">("monitor");
  const [socialEntryMode, setSocialEntryMode] = useState<"entry" | "monitor">("monitor");
  const [socialRecords, setSocialRecords] = useState<SocialRecordItem[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [manual, setManual] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    air: true,
    water: true,
    noise: true,
  });

  // Observations Modal & Drawer States
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<SiteObservation | null>(null);
  const [editingObservation, setEditingObservation] = useState<SiteObservation | null>(null);

  // Filters State
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterDepot, setFilterDepot] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [filterArea, setFilterArea] = useState<string>("all");
  const [filterCompliance, setFilterCompliance] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterActionStatus, setFilterActionStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [sortField, setSortField] = useState<"date" | "severity" | "compliance">("date");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Current active depot for Lab Parameters view
  const [depot, setDepot] = useState(() => {
    const fromScope = ALL_DEPOT_OPTIONS.find(
      (d) => d.entityId === scope.entityId && (!scope.depotId || d.depotId === scope.depotId),
    );
    return fromScope ?? ALL_DEPOT_OPTIONS[0];
  });

  const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? period;

  // Derive Summary KPI stats from all observations
  const kpiStats = useMemo(() => {
    const all = wf.observations;
    let compliant = 0;
    let partiallyCompliant = 0;
    let nonCompliant = 0;
    let openActions = 0;
    let overdueActions = 0;

    for (const obs of all) {
      if (obs.compliance === "compliant") compliant++;
      else if (obs.compliance === "partially_compliant") partiallyCompliant++;
      else if (obs.compliance === "non_compliant") nonCompliant++;

      if (obs.correctiveAction) {
        const derived = getDerivedActionStatus(
          obs.correctiveAction.targetDate,
          obs.correctiveAction.status,
        );
        if (derived === "open" || derived === "in_progress") openActions++;
        if (derived === "overdue") overdueActions++;
      }
    }

    return {
      total: all.length,
      compliant,
      partiallyCompliant,
      nonCompliant,
      openActions,
      overdueActions,
    };
  }, [wf.observations]);

  // Filtered and Sorted Observations List
  const filteredObservations = useMemo(() => {
    return wf.observations
      .filter((obs) => {
        if (filterProject !== "all" && obs.entityId !== filterProject) return false;
        if (filterDepot !== "all" && obs.depotId !== filterDepot) return false;
        if (filterPeriod !== "all" && obs.period !== filterPeriod) return false;
        if (filterArea !== "all" && obs.monitoringArea !== filterArea) return false;
        if (filterCompliance !== "all" && obs.compliance !== filterCompliance) return false;
        if (filterSeverity !== "all" && obs.severity !== filterSeverity) return false;
        if (filterActionStatus !== "all") {
          if (!obs.correctiveAction) return false;
          const derived = getDerivedActionStatus(
            obs.correctiveAction.targetDate,
            obs.correctiveAction.status,
          );
          if (derived !== filterActionStatus) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchFinding = obs.observation.toLowerCase().includes(q);
          const matchDepot = obs.depotName.toLowerCase().includes(q);
          const matchEntity = obs.entityName.toLowerCase().includes(q);
          const matchArea = obs.areaLabel.toLowerCase().includes(q);
          const matchMonitor = obs.monitorName.toLowerCase().includes(q);
          const matchAction = obs.correctiveAction?.description.toLowerCase().includes(q);
          const matchOwner = obs.correctiveAction?.ownerName.toLowerCase().includes(q);
          if (
            !matchFinding &&
            !matchDepot &&
            !matchEntity &&
            !matchArea &&
            !matchMonitor &&
            !matchAction &&
            !matchOwner
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === "date") {
          return sortAsc
            ? a.monitoringDate.localeCompare(b.monitoringDate)
            : b.monitoringDate.localeCompare(a.monitoringDate);
        }
        if (sortField === "severity") {
          const weight: Record<SeverityLevel, number> = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          return sortAsc
            ? weight[a.severity] - weight[b.severity]
            : weight[b.severity] - weight[a.severity];
        }
        if (sortField === "compliance") {
          return sortAsc
            ? a.compliance.localeCompare(b.compliance)
            : b.compliance.localeCompare(a.compliance);
        }
        return 0;
      });
  }, [
    wf.observations,
    filterProject,
    filterDepot,
    filterPeriod,
    filterArea,
    filterCompliance,
    filterSeverity,
    filterActionStatus,
    searchQuery,
    sortField,
    sortAsc,
  ]);

  const totalPages = Math.ceil(filteredObservations.length / pageSize) || 1;
  const paginatedObservations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredObservations.slice(start, start + pageSize);
  }, [filteredObservations, currentPage, pageSize]);

  const hasActiveFilters =
    filterProject !== "all" ||
    filterDepot !== "all" ||
    filterPeriod !== "all" ||
    filterArea !== "all" ||
    filterCompliance !== "all" ||
    filterSeverity !== "all" ||
    filterActionStatus !== "all" ||
    searchQuery.trim() !== "";

  const resetFilters = () => {
    setFilterProject("all");
    setFilterDepot("all");
    setFilterPeriod("all");
    setFilterArea("all");
    setFilterCompliance("all");
    setFilterSeverity("all");
    setFilterActionStatus("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // KPI Quick Filter Toggle
  const handleKpiFilterClick = (
    type: "compliant" | "partially" | "non_compliant" | "open" | "overdue" | "total",
  ) => {
    if (type === "total") {
      resetFilters();
    } else if (type === "compliant") {
      setFilterCompliance(filterCompliance === "compliant" ? "all" : "compliant");
    } else if (type === "partially") {
      setFilterCompliance(
        filterCompliance === "partially_compliant" ? "all" : "partially_compliant",
      );
    } else if (type === "non_compliant") {
      setFilterCompliance(filterCompliance === "non_compliant" ? "all" : "non_compliant");
    } else if (type === "open") {
      setFilterActionStatus(filterActionStatus === "open" ? "all" : "open");
    } else if (type === "overdue") {
      setFilterActionStatus(filterActionStatus === "overdue" ? "all" : "overdue");
    }
    setCurrentPage(1);
  };

  // Export Filtered Site Observations to Excel
  const handleExportObservations = () => {
    if (filteredObservations.length === 0) {
      toast.error("No observations available to export.");
      return;
    }

    const exportRows = filteredObservations.map((obs) => {
      const derived = obs.correctiveAction
        ? getDerivedActionStatus(obs.correctiveAction.targetDate, obs.correctiveAction.status)
        : "—";

      return {
        id: obs.id,
        date: obs.monitoringDate,
        period: obs.period,
        project: obs.entityName,
        site: obs.depotName,
        area: obs.areaLabel,
        finding: obs.observation,
        compliance: obs.compliance.replace("_", " "),
        severity: obs.severity,
        capa: obs.correctiveAction?.description || "—",
        owner: obs.correctiveAction?.ownerName || "—",
        targetDate: obs.correctiveAction?.targetDate || "—",
        actionStatus: derived || "—",
        evidenceCount: obs.evidence?.length || 0,
        monitor: obs.monitorName,
      };
    });

    exportToXlsx(
      `site-monitoring-register-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: "id", header: "Observation ID" },
        { key: "date", header: "Date" },
        { key: "period", header: "Period" },
        { key: "project", header: "Project / SPV" },
        { key: "site", header: "Site / Depot" },
        { key: "area", header: "Monitoring Area" },
        { key: "finding", header: "Finding / Observation" },
        { key: "compliance", header: "Compliance Status" },
        { key: "severity", header: "Risk Severity" },
        { key: "capa", header: "Corrective Action (CAPA)" },
        { key: "owner", header: "Action Owner" },
        { key: "targetDate", header: "Target Date" },
        { key: "actionStatus", header: "Action Status" },
        { key: "evidenceCount", header: "Evidence Attachments" },
        { key: "monitor", header: "Field Monitor" },
      ],
      exportRows,
      "Site Observations",
    );

    toast.success("Site Monitoring Report Exported", {
      description: `${exportRows.length} observations exported to Excel successfully.`,
    });
  };

  // Lab Parameter Breach Stats
  const breachCount = useMemo(
    () =>
      MONITORING_PARAMS.filter((p) => {
        if (!CATEGORIES.includes(p.category)) return false;
        const c = wf.readingFor(p.key, depot.entityId, depot.depotId, period);
        return cellBreaches(p.key, c.value);
      }).length,
    [wf, depot, period],
  );

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const commitManual = (paramKey: string, raw: string) => {
    const v = raw.trim() === "" ? null : Number(raw);
    wf.setReading(
      paramKey,
      depot.entityId,
      depot.depotId,
      period,
      v == null || Number.isNaN(v) ? null : v,
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Header: Title, Domain Switcher & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-[20px] font-bold tracking-tight text-foreground">
              Site Monitoring
            </h2>
            {/* Top Domain Tabs: Meta Data vs Meta Data Social */}
            <Segmented
              ariaLabel="Site Monitoring Domains"
              size="md"
              emphasis
              value={topDomain}
              onChange={setTopDomain}
              options={[
                { key: "meta_data", label: "Meta Data", Icon: Layers },
                { key: "meta_data_social", label: "Meta Data Social", Icon: Users },
              ]}
            />
          </div>
          <p className="text-[12.5px] text-muted-foreground">
            {topDomain === "meta_data"
              ? "Continuous environmental laboratory testing, ambient parameter monitoring, and statutory compliance assessment across depots."
              : "Workforce demographics, labour compliance, OH&S safety incident tracking, PPE audits, and stakeholder grievance register."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher inside the Active Domain (Monitor & Review vs Data Entry) */}
          {topDomain === "meta_data" ? (
            <Segmented
              ariaLabel="Environmental mode toggle"
              size="md"
              value={labEntryMode}
              onChange={setLabEntryMode}
              options={[
                { key: "monitor", label: "Monitor & Review", Icon: FileSpreadsheet },
                { key: "entry", label: "Data Entry", Icon: PencilLine },
              ]}
            />
          ) : (
            <Segmented
              ariaLabel="Social mode toggle"
              size="md"
              value={socialEntryMode}
              onChange={setSocialEntryMode}
              options={[
                { key: "monitor", label: "Monitor & Review", Icon: FileSpreadsheet },
                { key: "entry", label: "Data Entry", Icon: PencilLine },
              ]}
            />
          )}

          {/* Action Buttons for Meta Data domain */}
          {topDomain === "meta_data" && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-1.5 text-[12.5px] font-semibold"
                onClick={() => setImportOpen(true)}
                disabled={!canEdit}
              >
                <Upload className="h-4 w-4" aria-hidden /> Import Excel
              </Button>
            </div>
          )}

          {/* Action Buttons for Meta Data Social domain */}
          {topDomain === "meta_data_social" && socialEntryMode === "monitor" && (
            <Button
              size="sm"
              className="h-9 gap-2 font-bold text-[12.5px] shadow-sm px-4"
              onClick={() => setSocialEntryMode("entry")}
            >
              <Plus className="h-4 w-4" /> Enter Social Record
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {topDomain === "meta_data" ? (
        labEntryMode === "entry" ? (
          <LabTestDataEntry
            onSaveSuccess={() => setLabEntryMode("monitor")}
            onCancel={() => setLabEntryMode("monitor")}
            onSave={(testData) => wf.addLabTest(testData)}
            initialEntityId={depot.entityId}
            initialDepotId={depot.depotId}
            initialPeriod={period}
          />
        ) : (
          <SiteMonitoringDashboard />
        )
      ) : socialEntryMode === "entry" ? (
        <SocialDataEntry
          onSaveSuccess={() => setSocialEntryMode("monitor")}
          onCancel={() => setSocialEntryMode("monitor")}
          onSaveRecord={(record) => setSocialRecords((prev) => [record, ...prev])}
          initialEntityId={depot.entityId}
          initialDepotId={depot.depotId}
          initialPeriod={period}
          nextGrievanceSNo={socialRecords.length + 7}
          nextIncidentSNo={socialRecords.length + 4}
          nextPpeSNo={socialRecords.length + 4}
          nextOhsSNo={socialRecords.length + 4}
          nextFirstAidSNo={socialRecords.length + 4}
          nextFireExtinguisherSNo={socialRecords.length + 4}
          nextStakeholderTrackerSNo={socialRecords.length + 3}
          nextAnnualSeTrackerSNo={socialRecords.length + 3}
        />
      ) : (
        <SocialMonitorView
          customRecords={socialRecords}
          onNewRecordClick={() => setSocialEntryMode("entry")}
          onStatusChange={(id, newStatus) => {
            setSocialRecords((prev) =>
              prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
            );
          }}
        />
      )}

      {/* Observation Modal (Create / Edit) */}
      <ObservationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editObservation={editingObservation}
        initialEntityId={depot.entityId}
        initialDepotId={depot.depotId}
        initialPeriod={period}
        onSave={(obsData) => {
          if (editingObservation) {
            wf.updateObservation(editingObservation.id, obsData);
          } else {
            wf.addObservation(obsData);
          }
        }}
      />

      {/* Observation Detail & CAPA Resolution Drawer */}
      <ObservationDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        observation={selectedObservation}
        onEdit={(obs) => {
          setEditingObservation(obs);
          setModalOpen(true);
        }}
        onCloseAction={(id, remarks) => {
          wf.closeCorrectiveAction(id, remarks);
          const updated = wf.observations.find((o) => o.id === id);
          if (updated) setSelectedObservation(updated);
        }}
        onUpdateStatus={(id, status) => {
          wf.updateActionStatus(id, status);
          const updated = wf.observations.find((o) => o.id === id);
          if (updated) setSelectedObservation(updated);
        }}
      />

      {/* Excel Import Dialog */}
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onConfirm={(rows, sourceName) => {
          wf.importReadings(depot.entityId, depot.depotId, period, rows, sourceName);
          toast.success("Monitoring data imported", {
            description: `${rows.length} readings for ${depot.label} — flagged with provenance.`,
          });
        }}
      />
    </div>
  );
}
