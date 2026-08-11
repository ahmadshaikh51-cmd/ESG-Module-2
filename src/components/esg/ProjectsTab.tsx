import { useEffect, useMemo, useState } from "react";
import {
  Factory,
  FileBadge,
  Flame,
  Leaf,
  RefreshCw,
  Save,
  Zap,
  Info,
  ShieldCheck,
  TrendingDown,
  Plus,
  History,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CHART_ENTER_FAST } from "@/lib/chart-motion";
import {
  AMR_FIELDS,
  AMR_VALUES,
  CARBON,
  GHG_QTY,
  PERIODS,
  RECORDS,
  inScope,
  typeByKey,
} from "@/lib/esg-data";
import {
  A,
  CriticalBeam,
  EmptyState,
  Gloss,
  PanelCard,
  ProvenanceChip,
  useEsg,
  useStubLoad,
  LoadingRows,
} from "./primitives";
import { WorkQueue } from "./WorkQueue";
import { NcPanel } from "./projects/NcPanel";
import { ReportDataEntryForm } from "./projects/ReportDataEntryForm";
import { EsgDataPortal } from "./projects/EsgDataPortal";
import { PEOPLE } from "@/lib/esg-data";
import { getCurrentUser } from "@/lib/auth";
import { getRoleFromEmail, ESG_ROLES_CONFIG } from "@/lib/esg-roles";

type Sub = "permits" | "site" | "nc" | "amr" | "ghg" | "brsr" | "impact" | "carbon";

const nf = new Intl.NumberFormat("en-IN");

function PeriodBadge() {
  const { period } = useEsg();
  const label = PERIODS.find((p) => p.id === period)?.label;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/8 px-2.5 py-1 text-[11.5px] font-medium text-primary">
      <RefreshCw className="h-3 w-3" aria-hidden />
      Reporting period: {label} — capture stays open all month; the digest goes out on the 7th
    </span>
  );
}

/* ----------------------------------- AMR ----------------------------------- */

function AmrSection({ onAdd }: { onAdd?: () => void }) {
  const { period } = useEsg();
  const stub = AMR_VALUES[period] ?? {};
  const [manual, setManual] = useState<Record<string, string>>({});
  useEffect(() => setManual({}), [period]);

  const save = () => {
    const filled = AMR_FIELDS.filter(
      (f) => f.mode === "manual" && (manual[f.id] ?? stub[f.id]?.value != null),
    ).length;
    toast.success("AMR inputs saved", {
      description: `${filled} of ${AMR_FIELDS.filter((f) => f.mode === "manual").length} manual fields captured for ${PERIODS.find((p) => p.id === period)?.label}. (UI stub)`,
    });
  };

  return (
    <PanelCard>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            <A t="AMR" /> input capture
          </h3>
          <p className="text-[12px] text-muted-foreground">
            Field list is lender-configured (Masters). Auto-fetched values arrive read-only with
            provenance; anything can be challenged.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg text-[12px]" onClick={save}>
            <Save className="h-3.5 w-3.5" /> Save period inputs
          </Button>
        </div>
      </div>
      <div className="divide-y divide-border/40">
        {AMR_FIELDS.map((f) => {
          const v = stub[f.id];
          const auto = f.mode === "auto";
          const errored = !!v?.prov?.error;
          return (
            <div key={f.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium">{f.label}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="num">{f.unit}</span>
                  {auto && v?.prov && (
                    <ProvenanceChip
                      prov={v.prov}
                      onFlag={() =>
                        toast("Value flagged", {
                          description: `${f.label} — challenge recorded against ${f.source}. (UI stub)`,
                        })
                      }
                    />
                  )}
                  {!auto && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                      manual entry
                    </span>
                  )}
                </div>
                {errored && (
                  <p className="mt-1 text-[11px] font-medium text-destructive">
                    {v?.prov?.error}.{" "}
                    <button
                      type="button"
                      className="underline underline-offset-2"
                      onClick={() =>
                        toast("Retry queued", {
                          description: "Meter gateway re-poll requested. (UI stub)",
                        })
                      }
                    >
                      Retry fetch
                    </button>{" "}
                    or enter manually below.
                  </p>
                )}
              </div>
              <div className="w-[160px] shrink-0">
                {auto && !errored ? (
                  <div
                    className="num rounded-lg border border-primary/20 bg-accent/50 px-3 py-1.5 text-right text-[13px] font-semibold text-accent-foreground"
                    title="Read from source — not hand-typed"
                  >
                    {v?.value != null ? nf.format(v.value) : "—"}
                  </div>
                ) : (
                  <CriticalBeam active={errored} size="sm">
                    <Input
                      inputMode="decimal"
                      value={manual[f.id] ?? (v?.value != null && !auto ? String(v.value) : "")}
                      onChange={(e) => setManual((m) => ({ ...m, [f.id]: e.target.value }))}
                      placeholder="Enter value"
                      aria-label={`${f.label} (${f.unit})`}
                      className="num h-9 bg-muted/40 text-right text-[13px] font-semibold"
                    />
                  </CriticalBeam>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
}

/* ----------------------------------- GHG ----------------------------------- */

function GhgSection({ onAdd }: { onAdd?: () => void }) {
  const { period, masters } = useEsg();
  const [qty, setQty] = useState<Record<string, string>>({});
  useEffect(() => setQty({}), [period]);

  // Masters is the single source for factors/active state — editing or
  // deactivating a parameter there is reflected here, not a parallel copy.
  const params = masters.ghgParams().filter((p) => p.active);

  const rows = useMemo(
    () =>
      params.map((p) => {
        const base = GHG_QTY[period]?.[p.id];
        const raw = qty[p.id];
        const q = raw !== undefined && raw !== "" ? Number(raw) : base;
        const valid = q != null && Number.isFinite(q);
        return { p, q: valid ? (q as number) : null, kg: valid ? (q as number) * p.factor : null };
      }),
    [params, period, qty],
  );

  const scopeTotal = (s: 1 | 2 | 3) =>
    rows.filter((r) => r.p.scope === s).reduce((acc, r) => acc + (r.kg ?? 0), 0);
  const grand = scopeTotal(1) + scopeTotal(2) + scopeTotal(3);

  const SCOPE_META: Record<1 | 2 | 3, { label: string; hint: string; Icon: typeof Flame }> = {
    1: {
      label: "Scope 1 — direct",
      hint: "Fuel burned and refrigerants on our sites",
      Icon: Flame,
    },
    2: {
      label: "Scope 2 — purchased energy",
      hint: "Grid electricity for charging and depots",
      Icon: Zap,
    },
    3: { label: "Scope 3 — value chain", hint: "Commute, upstream fuel, waste", Icon: Factory },
  };

  return (
    <PanelCard>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            <A t="GHG" /> inventory — parameter × factor
          </h3>
          <p className="text-[12px] text-muted-foreground">
            Emission = quantity × factor. Factors are supplied externally (<A t="CEA" />,{" "}
            <A t="DEFRA" />) and configured in Masters — never hardcoded.
          </p>
        </div>
      </div>

      {([1, 2, 3] as const).map((s) => {
        const meta = SCOPE_META[s];
        const scopeRows = rows.filter((r) => r.p.scope === s);
        return (
          <div key={s} className="border-b border-border/40 last:border-0">
            <div className="flex items-center justify-between gap-3 bg-muted/30 px-5 py-2">
              <div className="flex items-center gap-2">
                <meta.Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground">
                  {meta.label}
                </span>
                <span className="hidden text-[11px] text-muted-foreground sm:inline">
                  · {meta.hint}
                </span>
              </div>
              <span className="num text-[12px] font-semibold text-foreground">
                {nf.format(Math.round(scopeTotal(s) / 100) / 10)}{" "}
                <span className="text-[10px] font-medium text-muted-foreground">tCO₂e</span>
              </span>
            </div>
            <div className="divide-y divide-border/30">
              {scopeRows.map(({ p, q, kg }) => {
                const auto = p.mode === "auto";
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-2.5 sm:grid-cols-[minmax(0,1.4fr)_150px_minmax(120px,0.8fr)_110px]"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[12.5px] font-medium">{p.label}</div>
                      <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                        <span className="num">
                          × {p.factor} kgCO₂e/{p.unit}
                        </span>
                        <span className="rounded-md bg-accent px-1 py-px font-medium text-accent-foreground ring-1 ring-inset ring-primary/15">
                          {p.factorSource}
                        </span>
                      </div>
                    </div>
                    <div className="row-start-2 sm:row-start-auto">
                      {auto ? (
                        <div
                          className="num rounded-lg border border-primary/20 bg-accent/50 px-3 py-1.5 text-right text-[12.5px] font-semibold text-accent-foreground"
                          title={`Auto-fetched from ${p.source}`}
                        >
                          {q != null ? nf.format(q) : "—"}
                        </div>
                      ) : (
                        <Input
                          inputMode="decimal"
                          value={
                            qty[p.id] ??
                            (GHG_QTY[period]?.[p.id] != null ? String(GHG_QTY[period][p.id]) : "")
                          }
                          onChange={(e) => setQty((m) => ({ ...m, [p.id]: e.target.value }))}
                          placeholder="qty"
                          aria-label={`${p.label} quantity (${p.unit})`}
                          className="num h-8 bg-muted/40 text-right text-[12.5px] font-semibold"
                        />
                      )}
                    </div>
                    <div className="hidden text-[10.5px] text-muted-foreground sm:block">
                      {auto ? `auto · ${p.source}` : "manual entry"} · {p.unit}
                    </div>
                    <div className="num text-right text-[12.5px] font-semibold">
                      {kg != null ? nf.format(Math.round(kg)) : "—"}{" "}
                      <span className="text-[10px] font-medium text-muted-foreground">kg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between bg-primary/6 px-5 py-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Period total
        </span>
        <span className="num text-[18px] font-semibold text-foreground">
          {nf.format(Math.round(grand / 100) / 10)}{" "}
          <span className="text-[11px] font-medium text-muted-foreground">tCO₂e</span>
        </span>
      </div>
    </PanelCard>
  );
}

/* --------------------------------- carbon ---------------------------------- */

function CustomCarbonTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-xl border border-border/70 bg-popover/95 p-3.5 text-[12px] shadow-elevated backdrop-blur-sm min-w-[200px]">
      <div className="mb-2 text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-1.5">
        {data.fullPeriod}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/45" />
            Diesel Baseline:
          </span>
          <span className="num font-semibold text-foreground">{nf.format(data.baseline)} t</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm bg-success" />
            Actual EV Charging:
          </span>
          <span className="num font-semibold text-foreground">{nf.format(data.actual)} t</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-border/40 pt-1.5 mt-1">
          <span className="flex items-center gap-1.5 font-medium text-success">
            <TrendingDown className="h-3.5 w-3.5" />
            Avoided Savings:
          </span>
          <span className="num font-bold text-success">-{nf.format(data.saved)} t</span>
        </div>
        <div className="text-[10px] text-muted-foreground/80 text-right mt-1.5">
          Offset Rate:{" "}
          <strong className="num text-success font-semibold">{data.reductionPercent}%</strong>
        </div>
      </div>
    </div>
  );
}

function CustomCarbonLegend({ payload }: any) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-[11px] font-medium text-muted-foreground">
      {payload.map((entry: any, index: number) => {
        const isActual = entry.dataKey === "actual";
        return (
          <div key={`item-${index}`} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{
                background: isActual
                  ? "var(--color-success)"
                  : "color-mix(in oklab, var(--muted-foreground) 35%, transparent)",
                border: isActual ? "none" : "1px solid var(--muted-foreground)",
              }}
            />
            <span>{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function CarbonSection({ onAdd }: { onAdd?: () => void }) {
  const chartData = useMemo(() => {
    return CARBON.monthly.map((m) => {
      const label = PERIODS.find((p) => p.id === m.period)?.label || m.period;
      const labelShort = label.split(" ")[0]; // "May", "Jun", "Jul"
      const baseline = (m.fleetKm * CARBON.baselinePerKm) / 1000;
      const actual = baseline - m.savedT;
      const saved = m.savedT;
      const reductionPercent = (saved / baseline) * 100;
      return {
        period: labelShort + (m.period === "2026-07" ? " (MTD)" : ""),
        fullPeriod: label + (m.period === "2026-07" ? " (MTD)" : ""),
        baseline: Math.round(baseline),
        actual: Math.round(actual),
        saved: Math.round(saved),
        reductionPercent: Number(reductionPercent.toFixed(1)),
        fleetKm: m.fleetKm,
      };
    });
  }, []);

  // Compute stats
  const avgReductionRate = useMemo(() => {
    const totalBaseline = CARBON.monthly.reduce(
      (acc, m) => acc + (m.fleetKm * CARBON.baselinePerKm) / 1000,
      0,
    );
    const totalSaved = CARBON.monthly.reduce((acc, m) => acc + m.savedT, 0);
    return ((totalSaved / totalBaseline) * 100).toFixed(1);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left Side: Chart Panel */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated transition-all flex flex-col justify-between min-h-[365px]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-success/10 text-success">
                  <Leaf className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                    Baseline vs. Actual Emissions
                  </h3>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">
                    Compare emissions from diesel baseline against metered EV charging
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-success/8 border border-success/20 px-2.5 py-1 text-[11px] font-medium text-success mr-2">
                  <TrendingDown className="h-3 w-3" />
                  <span>{avgReductionRate}% average offset rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-[210px] w-full mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="baseline-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--muted-foreground)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="actual-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="color-mix(in oklab, var(--border) 40%, transparent)"
                />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontWeight: 500 }}
                  unit=" t"
                />
                <Tooltip
                  content={<CustomCarbonTooltip />}
                  cursor={{ fill: "var(--muted)", opacity: 0.15 }}
                />
                <Legend content={<CustomCarbonLegend />} verticalAlign="bottom" height={36} />
                <Bar
                  dataKey="baseline"
                  name="Baseline Diesel Bus"
                  fill="url(#baseline-grad)"
                  stroke="var(--muted-foreground)"
                  strokeOpacity={0.25}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                  {...CHART_ENTER_FAST}
                />
                <Bar
                  dataKey="actual"
                  name="Actual EV Charging"
                  fill="url(#actual-grad)"
                  stroke="var(--color-success)"
                  strokeWidth={1}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                  {...CHART_ENTER_FAST}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-border/40 pt-3 text-[11px] text-muted-foreground flex items-start gap-1.5 leading-snug">
            <Info className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/60 shrink-0" />
            <span>
              <Gloss text={CARBON.methodology} />
            </span>
          </div>
        </div>

        {/* Right Side: Hero cumulative card + mini info */}
        <div className="flex flex-col gap-5">
          {/* Cumulative card */}
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-elevated transition-all flex flex-col justify-between flex-1 min-h-[170px]">
            {/* Ambient background glow */}
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-success/8 blur-3xl"
              aria-hidden
            />

            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Cumulative Avoided
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="num text-[42px] font-extrabold leading-none tracking-tight text-success">
                    {nf.format(CARBON.cumulativeSavedT)}
                  </span>
                  <span className="text-[14px] font-semibold text-muted-foreground">tCO₂e</span>
                </div>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-success/12 text-success ring-1 ring-success/20">
                <ShieldCheck className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-2.5 border border-border/40">
              <div className="text-[11.5px] leading-relaxed text-muted-foreground">
                Reconciled to the public website figure (
                <span className="num font-semibold text-foreground">
                  {nf.format(CARBON.websiteFigureT)} t
                </span>
                )
              </div>
              <span className="shrink-0 rounded-md bg-success/10 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-success border border-success/20">
                100% Match
              </span>
            </div>
          </div>

          {/* Quick context cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 flex flex-col justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Diesel Factor
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="num text-[17px] font-semibold text-foreground">1.08</span>
                <span className="text-[10px] text-muted-foreground">kg/km</span>
              </div>
              <span className="text-[9.5px] text-muted-foreground mt-1 block">
                Baseline standard
              </span>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 flex flex-col justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                EV Grid Power
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="num text-[17px] font-semibold text-foreground">CEA Factor</span>
              </div>
              <span className="text-[9.5px] text-muted-foreground mt-1 block">
                Metered charging
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Cards Grid */}
      <div>
        <h4 className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">
          Monthly Avoidance Breakdown
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chartData.map((m, idx) => {
            const rawPeriod = CARBON.monthly[idx].period;
            return (
              <div
                key={rawPeriod}
                className="card-interactive group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4.5 shadow-elevated transition-all hover:-translate-y-0.5"
              >
                {/* Visual hover accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-success/0 transition-colors group-hover:bg-success/50" />

                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-bold text-foreground tracking-tight">
                    {m.fullPeriod}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success">
                    <TrendingDown className="h-3 w-3" />
                    {m.reductionPercent}%
                  </span>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="num text-[20px] font-bold text-foreground">
                      {nf.format(m.saved)}
                    </span>
                    <span className="text-[10.5px] font-medium text-muted-foreground ml-1">
                      t avoided
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="num text-[11.5px] font-medium text-muted-foreground">
                      {nf.format(m.fleetKm)}
                    </span>
                    <span className="text-[9.5px] text-muted-foreground ml-1">km</span>
                  </div>
                </div>

                {/* Progress bar comparison */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[9.5px] text-muted-foreground">
                    <span>
                      EV emissions:{" "}
                      <strong className="num text-foreground font-semibold">{m.actual}t</strong>
                    </span>
                    <span>
                      Baseline:{" "}
                      <strong className="num text-foreground font-semibold">{m.baseline}t</strong>
                    </span>
                  </div>
                  <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-success rounded-full transition-all duration-500"
                      style={{ width: `${m.reductionPercent}%` }}
                    />
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

/* ---------------------------------- BRSR ----------------------------------- */

function BrsrSection({ onAdd }: { onAdd?: () => void }) {
  const saved = useMemo(() => {
    return JSON.parse(localStorage.getItem("voltline-report-records") || "[]")
      .filter((r: any) => r.reportType === "brsr");
  }, []);

  return (
    <PanelCard>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            <A t="BRSR" /> Disclosures register
          </h3>
          <p className="text-[12px] text-muted-foreground">
            Principle-wise disclosure logs mapped directly to SEBI framework.
          </p>
        </div>
      </div>
      {saved.length === 0 ? (
        <EmptyState title="No BRSR records submitted" hint="No disclosures are currently logged in this period." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-5 py-2.5 text-left font-medium">Project</th>
                <th className="px-3 py-2.5 text-left font-medium">Period</th>
                <th className="px-3 py-2.5 text-left font-medium">Data Entry Tab</th>
                <th className="px-3 py-2.5 text-left font-medium">Status</th>
                <th className="px-3 py-2.5 text-left font-medium">Reviewer</th>
                <th className="px-5 py-2.5 text-left font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {saved.map((r: any) => (
                <tr key={r.id} className="border-b border-border/40 last:border-0 hover:bg-muted/5">
                  <td className="px-5 py-2.5 font-semibold text-foreground">{r.project}</td>
                  <td className="px-3 py-2.5 num">{r.reportingPeriod}</td>
                  <td className="px-3 py-2.5 font-medium">{r.dataEntryTab}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex h-5 items-center rounded bg-primary/10 border border-primary/20 px-1.5 text-[10px] font-bold text-primary">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">{PEOPLE.find(p => p.id === r.reviewer)?.name || r.reviewer}</td>
                  <td className="px-5 py-2.5 num text-muted-foreground">{new Date(r.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelCard>
  );
}

/* --------------------------------- Impact ---------------------------------- */

function ImpactSection({ onAdd }: { onAdd?: () => void }) {
  const saved = useMemo(() => {
    return JSON.parse(localStorage.getItem("voltline-report-records") || "[]")
      .filter((r: any) => r.reportType === "impact");
  }, []);

  return (
    <PanelCard>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            Impact Metrics Register
          </h3>
          <p className="text-[12px] text-muted-foreground">
            Monitor baseline vs current targets across clean energy, water conservation, and staff safety.
          </p>
        </div>
      </div>
      {saved.length === 0 ? (
        <EmptyState title="No Impact reports submitted" hint="No KPI tracking records are currently logged in this period." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-5 py-2.5 text-left font-medium">Project</th>
                <th className="px-3 py-2.5 text-left font-medium">Period</th>
                <th className="px-3 py-2.5 text-left font-medium">Data Entry Tab</th>
                <th className="px-3 py-2.5 text-left font-medium">Status</th>
                <th className="px-3 py-2.5 text-left font-medium">Reviewer</th>
                <th className="px-5 py-2.5 text-left font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {saved.map((r: any) => (
                <tr key={r.id} className="border-b border-border/40 last:border-0 hover:bg-muted/5">
                  <td className="px-5 py-2.5 font-semibold text-foreground">{r.project}</td>
                  <td className="px-3 py-2.5 num">{r.reportingPeriod}</td>
                  <td className="px-3 py-2.5 font-medium">{r.dataEntryTab}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex h-5 items-center rounded bg-primary/10 border border-primary/20 px-1.5 text-[10px] font-bold text-primary">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">{PEOPLE.find(p => p.id === r.reviewer)?.name || r.reviewer}</td>
                  <td className="px-5 py-2.5 num text-muted-foreground">{new Date(r.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelCard>
  );
}

/* --------------------------------- projects -------------------------------- */

export function ProjectsTab({ initialSub }: { initialSub?: string }) {
  const { scope } = useEsg();
  const [sub, setSub] = useState<Sub>((initialSub as Sub) || "permits");
  const [activeForm, setActiveForm] = useState<Sub | null>(null);
  const [editRecordId, setEditRecordId] = useState<string | null>(null);
  const [showDataPortal, setShowDataPortal] = useState(false);
  const [initialProject, setInitialProject] = useState<string | undefined>(undefined);
  const [initialSite, setInitialSite] = useState<string | undefined>(undefined);
  const [initialPeriod, setInitialPeriod] = useState<string | undefined>(undefined);
  const loading = useStubLoad(sub + JSON.stringify(scope));

  useEffect(() => {
    if (initialSub) {
      setSub(initialSub as Sub);
    }
  }, [initialSub]);

  // Reset form when sub tab changes
  useEffect(() => {
    setActiveForm(null);
    setEditRecordId(null);
    setShowDataPortal(false);
  }, [sub]);

  const subs: { key: Sub; label: React.ReactNode }[] = [
    { key: "permits", label: "Permits & Licences" },
    { key: "site", label: "Project Compliance Status" },
    {
      key: "nc",
      label: (
        <>
          <A t="NC" /> Report
        </>
      ),
    },
    { key: "amr", label: <A t="AMR" /> },
    { key: "ghg", label: "GHG Inventory" },
    { key: "brsr", label: <A t="BRSR" /> },
    { key: "impact", label: "Impact Report" },
    { key: "carbon", label: "Carbon Saving" },
  ];

  const currentUser = getCurrentUser();
  const esgRole = currentUser ? getRoleFromEmail(currentUser.email) : "esg_team";
  const roleConfig = ESG_ROLES_CONFIG[esgRole] || ESG_ROLES_CONFIG.esg_team;
  
  const allowedSubKeys = roleConfig.subtabs.projects || [];
  const allowedSubs = subs.filter((s) => allowedSubKeys.includes(s.key));

  useEffect(() => {
    if (allowedSubKeys.length > 0 && !allowedSubKeys.includes(sub)) {
      setSub(allowedSubKeys[0] as Sub);
    }
  }, [esgRole, sub, allowedSubKeys]);

  const records = useMemo(
    () =>
      RECORDS.filter((r) => inScope(r, scope)).filter(
        (r) => typeByKey(r.typeKey)?.category === (sub === "permits" ? "permit" : "site"),
      ),
    [scope, sub],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className="flex items-center gap-0.5 overflow-x-auto rounded-xl border border-border/60 bg-card/60 p-1"
            role="tablist"
            aria-label="Project regulatory compliance sections"
          >
            {allowedSubs.map((s) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={sub === s.key && !showDataPortal}
                onClick={() => {
                  setSub(s.key);
                  setShowDataPortal(false);
                }}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  (sub === s.key && !showDataPortal)
                    ? "nav-pill-active"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowDataPortal(!showDataPortal)}
            className={cn(
              "shrink-0 rounded-xl px-4 py-2 text-[12px] font-semibold border transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5",
              showDataPortal
                ? "bg-primary text-primary-foreground border-primary/20 shadow-sm font-bold"
                : "bg-card hover:bg-muted/50 text-foreground border-border/60"
            )}
          >
            <Database className="h-3.5 w-3.5" />
            {showDataPortal ? "Close Data Portal" : "ESG Data Portal"}
          </button>
        </div>
        {!showDataPortal && (sub === "amr" || sub === "ghg" || sub === "carbon") && <PeriodBadge />}
      </div>

      {activeForm ? (
        <ReportDataEntryForm
          reportType={activeForm as any}
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
      ) : showDataPortal ? (
        <EsgDataPortal
          onBack={() => setShowDataPortal(false)}
          onOpenForm={(reportType, recordId, project, siteId, period) => {
            setActiveForm(reportType);
            setEditRecordId(recordId);
            setInitialProject(project);
            setInitialSite(siteId);
            setInitialPeriod(period);
          }}
        />
      ) : loading ? (
        <PanelCard>
          <LoadingRows rows={5} />
        </PanelCard>
      ) : sub === "permits" || sub === "site" ? (
        <PanelCard>
          <div className="border-b border-border/60 px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
              <FileBadge className="h-4 w-4 text-primary" aria-hidden />
              {sub === "permits" ? "Permits, licences & certificates" : "Site compliance items"}
            </h3>
            <p className="text-[12px] text-muted-foreground">
              {sub === "permits" ? (
                <>
                  Incorporation, <A t="ROC" />, <A t="MOA/AOA" />, <A t="CTO" />, <A t="COE" /> —
                  one record type, one expiry clock, one owner each.
                </>
              ) : (
                <>
                  Fire <A t="NOC" />, <A t="SWM" />, <A t="STP" />, <A t="ETP" />, <A t="ISO" />,{" "}
                  <A t="PCC" /> — the same atomic record with a different type master.
                </>
              )}
            </p>
          </div>
          {records.length === 0 ? (
            <EmptyState
              title="No items in this scope"
              hint="Widen the scope selector to see group-level records."
            />
          ) : (
            <WorkQueue records={records} />
          )}
        </PanelCard>
      ) : sub === "nc" ? (
        <NcPanel onAdd={() => setActiveForm("nc")} onEdit={(id) => { setEditRecordId(id); setActiveForm("nc"); }} />
      ) : sub === "amr" ? (
        <AmrSection onAdd={() => setActiveForm("amr")} />
      ) : sub === "ghg" ? (
        <GhgSection onAdd={() => setActiveForm("ghg")} />
      ) : sub === "brsr" ? (
        <BrsrSection onAdd={() => setActiveForm("brsr")} />
      ) : sub === "impact" ? (
        <ImpactSection onAdd={() => setActiveForm("impact")} />
      ) : sub === "carbon" ? (
        <CarbonSection onAdd={() => setActiveForm("carbon")} />
      ) : null}
    </div>
  );
}
