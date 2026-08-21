import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  PencilLine,
  TriangleAlert,
  Upload,
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
import { cn } from "@/lib/utils";
import {
  ESG_GROUP,
  entityById,
  MONITORING_PARAMS,
  monitoringParamByKey,
  PERIODS,
  type MonitoringCategory,
} from "@/lib/esg-data";
import { canEditPolicies } from "@/lib/esg-policy";
import { cellBreaches, MONITORING_CATEGORY_LABEL } from "@/lib/esg-monitoring";
import { exportToXlsx } from "@/lib/export-xlsx";
import { EmptyState, PanelCard, ProvenanceChip, useEsg, WithheldPill } from "../primitives";
import { Segmented } from "../Segmented";

const CATEGORIES: MonitoringCategory[] = ["air", "water", "noise"];
const DEPOTS = ESG_GROUP.entities.flatMap((e) =>
  e.depots.map((d) => ({
    entityId: e.id,
    depotId: d.id,
    label: `${e.short} · ${d.name.replace(" Depot", "")}`,
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
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border/60 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Parameter</th>
                    <th className="px-3 py-2 text-right font-medium">Value</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={i}
                      className={cn(
                        "border-b border-border/40 last:border-0",
                        !r.matched && "bg-warning/5",
                      )}
                    >
                      <td className="px-3 py-1.5">{r.label || r.paramKey}</td>
                      <td className="num px-3 py-1.5 text-right">
                        {Number.isFinite(r.value) ? r.value : "—"}
                      </td>
                      <td className="px-3 py-1.5">
                        {r.matched ? (
                          <span className="text-[11px] text-success">will import</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-warning">
                            <AlertTriangle className="h-3 w-3" aria-hidden /> unmatched — skipped
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

/* ------------------------------- monitoring -------------------------------- */

export function MonitoringPanel() {
  const { scope, period, role, audience, monitoring: wf } = useEsg();
  const external = audience === "external";
  const canEdit = canEditPolicies(role);
  const [view, setView] = useState<"entry" | "monitor">(canEdit ? "entry" : "monitor");
  const [importOpen, setImportOpen] = useState(false);
  const [manual, setManual] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    air: true,
    water: true,
    noise: true,
  });

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const [depot, setDepot] = useState(() => {
    const fromScope = DEPOTS.find(
      (d) => d.entityId === scope.entityId && (!scope.depotId || d.depotId === scope.depotId),
    );
    return fromScope ?? DEPOTS[0];
  });

  const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? period;

  const breachCount = useMemo(
    () =>
      MONITORING_PARAMS.filter((p) => {
        if (!CATEGORIES.includes(p.category)) return false;
        const c = wf.readingFor(p.key, depot.entityId, depot.depotId, period);
        return cellBreaches(p.key, c.value);
      }).length,
    [wf, depot, period],
  );

  const categoryStats = useMemo(() => {
    const stats: Record<
      string,
      {
        total: number;
        within: number;
        exceeds: number;
        nodata: number;
      }
    > = {};

    let overallTotal = 0;
    let overallWithin = 0;
    let overallExceeds = 0;
    let overallNodata = 0;

    for (const cat of CATEGORIES) {
      const params = MONITORING_PARAMS.filter((p) => p.category === cat);
      let total = params.length;
      let within = 0;
      let exceeds = 0;
      let nodata = 0;

      for (const p of params) {
        const c = wf.readingFor(p.key, depot.entityId, depot.depotId, period);
        if (c.value === null || c.value === undefined) {
          nodata++;
        } else if (cellBreaches(p.key, c.value)) {
          exceeds++;
        } else {
          within++;
        }
      }

      stats[cat] = { total, within, exceeds, nodata };
      
      overallTotal += total;
      overallWithin += within;
      overallExceeds += exceeds;
      overallNodata += nodata;
    }

    const overallPercentage = overallTotal > 0 ? Math.round((overallWithin / overallTotal) * 100) : 0;

    return {
      categories: stats,
      overall: {
        total: overallTotal,
        within: overallWithin,
        exceeds: overallExceeds,
        nodata: overallNodata,
        percentage: overallPercentage,
      },
    };
  }, [wf, depot, period]);

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
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={`${depot.entityId}|${depot.depotId}`}
            onValueChange={(v) => {
              const [e, d] = v.split("|");
              const found = DEPOTS.find((x) => x.entityId === e && x.depotId === d);
              if (found) setDepot(found);
            }}
          >
            <SelectTrigger className="h-8 w-[220px] text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEPOTS.map((d) => (
                <SelectItem
                  key={`${d.entityId}|${d.depotId}`}
                  value={`${d.entityId}|${d.depotId}`}
                  className="text-[12px]"
                >
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="rounded-lg border border-primary/25 bg-primary/8 px-2.5 py-1 text-[11.5px] font-medium text-primary">
            {periodLabel} · monthly
          </span>
        </div>
        <Segmented
          ariaLabel="Monitoring view"
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { key: "entry", label: "Data entry", Icon: PencilLine },
            { key: "monitor", label: "Monitor", Icon: FileSpreadsheet },
          ]}
        />
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Overview Card */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-elevated flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Overview</h3>
            <p className="text-[14px] font-semibold text-foreground">Monthly Summary</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 17v-5" />
              <path d="M12 17V9" />
              <path d="M15 17v-3" />
            </svg>
          </div>
        </div>

        {/* Air Card */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-elevated flex flex-col justify-between min-h-[110px]">
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Air</h3>
            <p className="text-[10px] text-muted-foreground">Parameters</p>
            <p className="text-[20px] font-bold text-foreground mt-0.5">
              {categoryStats.categories.air.total} / {categoryStats.categories.air.total}
            </p>
          </div>
          <div className="mt-2">
            {categoryStats.categories.air.exceeds > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#f59e0b] bg-[#fdfaf2] border border-[#fef3c7] px-2 py-0.5 rounded-lg dark:bg-amber-950/20 dark:border-amber-900/30">
                <span>✗</span> {categoryStats.categories.air.exceeds} Exceeds Limit
              </span>
            ) : categoryStats.categories.air.within > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-[#f4faf7] border border-success/20 px-2 py-0.5 rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/30">
                <span>✓</span> {categoryStats.categories.air.within} Within Limit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/40 border border-border px-2 py-0.5 rounded-lg">
                No Data
              </span>
            )}
          </div>
        </div>

        {/* Water Card */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-elevated flex flex-col justify-between min-h-[110px]">
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Water</h3>
            <p className="text-[10px] text-muted-foreground">Parameters</p>
            <p className="text-[20px] font-bold text-foreground mt-0.5">
              {categoryStats.categories.water.total} / {categoryStats.categories.water.total}
            </p>
          </div>
          <div className="mt-2">
            {categoryStats.categories.water.exceeds > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#f59e0b] bg-[#fdfaf2] border border-[#fef3c7] px-2 py-0.5 rounded-lg dark:bg-amber-950/20 dark:border-amber-900/30">
                <span>✗</span> {categoryStats.categories.water.exceeds} Exceeds Limit
              </span>
            ) : categoryStats.categories.water.within > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-[#f4faf7] border border-success/20 px-2 py-0.5 rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/30">
                <span>✓</span> {categoryStats.categories.water.within} Within Limit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/40 border border-border px-2 py-0.5 rounded-lg">
                No Data
              </span>
            )}
          </div>
        </div>

        {/* Noise Card */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-elevated flex flex-col justify-between min-h-[110px]">
          <div className="space-y-0.5">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Noise</h3>
            <p className="text-[10px] text-muted-foreground">Parameters</p>
            <p className="text-[20px] font-bold text-foreground mt-0.5">
              {categoryStats.categories.noise.total} / {categoryStats.categories.noise.total}
            </p>
          </div>
          <div className="mt-2">
            {categoryStats.categories.noise.exceeds > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#f59e0b] bg-[#fdfaf2] border border-[#fef3c7] px-2 py-0.5 rounded-lg dark:bg-amber-950/20 dark:border-amber-900/30">
                <span>✗</span> {categoryStats.categories.noise.exceeds} Exceeds Limit
              </span>
            ) : categoryStats.categories.noise.within > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success bg-[#f4faf7] border border-success/20 px-2 py-0.5 rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/30">
                <span>✓</span> {categoryStats.categories.noise.within} Within Limit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/40 border border-border px-2 py-0.5 rounded-lg">
                No Data
              </span>
            )}
          </div>
        </div>

        {/* Overall Compliance Card */}
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-elevated flex items-center gap-4 min-h-[110px]">
          {/* Circular progress SVG */}
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <svg width="56" height="56" className="transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="23"
                className="stroke-muted/30 fill-none"
                strokeWidth="4.5"
              />
              <circle
                cx="28"
                cy="28"
                r="23"
                className={cn(
                  "fill-none transition-all duration-500",
                  categoryStats.overall.percentage === 100
                    ? "stroke-success"
                    : categoryStats.overall.exceeds > 0
                    ? "stroke-warning"
                    : "stroke-success"
                )}
                strokeWidth="4.5"
                strokeDasharray="144.5"
                strokeDashoffset={144.5 - (144.5 * categoryStats.overall.percentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[12px] font-bold text-foreground">
              {categoryStats.overall.percentage}%
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <h3 className="text-[12px] font-semibold text-foreground truncate">Overall Compliance</h3>
            <p className="text-[10px] text-muted-foreground truncate">Parameters within limit</p>
            <p className="text-[16px] font-bold text-foreground mt-0.5">
              {categoryStats.overall.within} / {categoryStats.overall.total}
            </p>
          </div>
        </div>
      </div>

      {breachCount > 0 && !external && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/35 bg-destructive/6 px-4 py-2.5 text-[12px] font-medium text-destructive">
          <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
          {breachCount} parameter{breachCount === 1 ? "" : "s"} breaching the regulatory limit this
          period — withheld from the external view.
        </div>
      )}

      {view === "entry" && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-[12px]"
            onClick={downloadTemplate}
          >
            <Download className="h-3.5 w-3.5" aria-hidden /> Template
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-[12px]"
            onClick={() => setImportOpen(true)}
            disabled={!canEdit}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden /> Import Excel
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const params = MONITORING_PARAMS.filter((p) => p.category === cat);
          if (!params.length) return null;
          const isExpanded = expanded[cat] !== false;

          let CategoryIcon = null;
          if (cat === "air") {
            CategoryIcon = (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2 text-muted-foreground inline-block">
                <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
                <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
                <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
              </svg>
            );
          } else if (cat === "water") {
            CategoryIcon = (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2 text-muted-foreground inline-block">
                <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z" />
              </svg>
            );
          } else if (cat === "noise") {
            CategoryIcon = (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2 text-muted-foreground inline-block">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            );
          }

          return (
            <PanelCard key={cat}>
              <button
                type="button"
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between border-b border-border/60 bg-muted/20 px-5 py-3 text-left focus-visible:outline-none hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {CategoryIcon}
                  {MONITORING_CATEGORY_LABEL[cat]}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                  <span>{params.length} Parameters</span>
                  {isExpanded ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  )}
                </div>
              </button>
              
              {isExpanded && (
                <div className="divide-y divide-border/40">
                  {params.map((p) => {
                    const cell = wf.readingFor(p.key, depot.entityId, depot.depotId, period);
                    const breach = cellBreaches(p.key, cell.value);
                    const trend = PERIODS.slice()
                      .reverse()
                      .map((per) => wf.readingFor(p.key, depot.entityId, depot.depotId, per.id).value);

                    const status = cell.value == null
                      ? "no-data"
                      : breach
                      ? "exceeds"
                      : "within";

                    return (
                      <div
                        key={p.key}
                        className={cn(
                          "flex flex-wrap items-center gap-4 px-5 py-3.5 hover:bg-muted/5 transition-colors",
                          breach && !external && "border-l-2 border-l-destructive bg-destructive/5",
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13px] font-semibold text-foreground">{p.label}</span>
                            {breach && !external && (
                              <>
                                <BreachPill />
                                <WithheldPill />
                              </>
                            )}
                            {cell.source === "excel" && cell.prov && (
                              <ProvenanceChip prov={cell.prov} />
                            )}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {p.unit}
                            {p.limit != null ? ` · limit ${p.limit}` : " · no limit"}
                          </div>
                        </div>

                        {view === "monitor" && status !== "no-data" && !(breach && external) && (
                          <div className="shrink-0 mr-4">
                            <Sparkline values={trend} limit={p.limit} />
                          </div>
                        )}

                        {view === "entry" && canEdit ? (
                          <div className="w-[130px] shrink-0 text-right">
                            <Input
                              inputMode="decimal"
                              value={manual[p.key] ?? (cell.value != null ? String(cell.value) : "")}
                              onChange={(e) => setManual((m) => ({ ...m, [p.key]: e.target.value }))}
                              onBlur={(e) => commitManual(p.key, e.target.value)}
                              placeholder="—"
                              aria-label={`${p.label} (${p.unit})`}
                              className={cn(
                                "num h-9 text-right text-[13px] font-semibold",
                                breach && "border-destructive/40 text-destructive",
                              )}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-6 shrink-0 w-[240px] justify-end">
                            {/* Value Pill */}
                            <div className="w-16 flex justify-center">
                              {breach && external ? (
                                <span className="text-[11px] font-semibold text-muted-foreground">
                                  Withheld
                                </span>
                              ) : status === "exceeds" ? (
                                <span className="num inline-block w-full text-center text-[12.5px] font-bold text-[#f59e0b] bg-[#fdfaf2] border border-[#fef3c7] px-2.5 py-1 rounded-lg dark:bg-amber-950/20 dark:border-amber-900/30 shadow-xs">
                                  {cell.value}
                                </span>
                              ) : status === "within" ? (
                                <span className="num inline-block w-full text-center text-[12.5px] font-bold text-success bg-[#f4faf7] border border-success/20 px-2.5 py-1 rounded-lg dark:bg-emerald-950/20 dark:border-emerald-900/30 shadow-xs">
                                  {cell.value}
                                </span>
                              ) : (
                                <span className="num inline-block w-full text-center text-[12.5px] font-medium text-muted-foreground bg-muted/40 border border-border px-2.5 py-1 rounded-lg">
                                  —
                                </span>
                              )}
                            </div>

                            {/* Status badge with colored dot */}
                            <div className="w-[110px] text-left">
                              {status === "exceeds" ? (
                                <span className="text-[12px] font-semibold text-[#f59e0b] flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-[#f59e0b] shrink-0" />
                                  Exceeds Limit
                                </span>
                              ) : status === "within" ? (
                                <span className="text-[12px] font-semibold text-success flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-success shrink-0" />
                                  Within Limit
                                </span>
                              ) : (
                                <span className="text-[12px] font-semibold text-muted-foreground flex items-center gap-1.5">
                                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />
                                  No Data
                                </span>
                              )}
                            </div>

                            {/* Chevron right */}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0 select-none">
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </PanelCard>
          );
        })}
      </div>

      {MONITORING_PARAMS.filter((p) => CATEGORIES.includes(p.category)).length === 0 && (
        <EmptyState title="No monitoring parameters configured" />
      )}

      {/* Footer disclaimer & legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-muted-foreground px-1 pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          All values are compared against CPCB / MoEF&CC norms.
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            Within Limit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
            Exceeds Limit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
            No Data
          </span>
        </div>
      </div>

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
