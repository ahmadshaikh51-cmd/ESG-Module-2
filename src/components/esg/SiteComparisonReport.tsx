import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  AMR_FIELDS,
  AMR_VALUES,
  ASSESSMENTS,
  CARBON,
  ESG_GROUP,
  GHG_PARAMS,
  GHG_QTY,
  PERIODS,
  type ReportDef,
} from "@/lib/esg-data";
import { ReportFilter } from "./ReportsTab";
import { useEsg, EmptyState, A } from "./primitives";
import { buildNcRegister, sortNcRegister, NC_SOURCE_LABEL } from "@/lib/esg-nc";
import { MapPin, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const nf = new Intl.NumberFormat("en-IN");

export function SiteComparisonReport({
  def,
  reportFilter,
}: {
  def: ReportDef;
  reportFilter: ReportFilter;
}) {
  const { scope, period, audit, monitoring } = useEsg();
  const sites = reportFilter.siteIds
    .map((id) => ESG_GROUP.entities.find((e) => e.id === id))
    .filter(Boolean) as typeof ESG_GROUP.entities;

  // Load saved records from the ESG Data Portal
  const savedRecords = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("voltline-report-records") || "[]");
    } catch {
      return [];
    }
  }, []);

  const getEsgPortalValue = (indicatorId: string, periodId: string, entityId: string): number | null => {
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

  const compileGhgData = (periodId: string, entityId: string) => {
    const qtyFallbacks = GHG_QTY[periodId] || {};
    let ratio = 1.0;
    if (entityId === "mbmt") ratio = 0.8;
    else if (entityId === "silvassa") ratio = 0.1;
    else if (entityId === "corp") ratio = 0.1;

    const gridElectricityVal = getEsgPortalValue("IND-2026-001", periodId, entityId);
    const dieselDgVal = getEsgPortalValue("IND-2026-002", periodId, entityId);
    
    const gridQty = gridElectricityVal !== null ? gridElectricityVal : (qtyFallbacks["grid"] || 0) * (entityId === "all" ? 1.0 : entityId === "mbmt" ? 1.0 : 0.0);
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
    return { scope1, scope2, scope3, total: scope1 + scope2 + scope3, gridQty };
  };

  const compileCarbonData = (periodId: string, entityId: string) => {
    const monthData = CARBON.monthly.find((m) => m.period === periodId);
    if (!monthData) return { fleetKm: 0, baselineEmissions: 0, projectEmissions: 0, savedT: 0 };
    
    let fleetKm = 0;
    if (entityId === "all" || entityId === "mbmt") fleetKm = monthData.fleetKm;
    if (entityId === "silvassa") fleetKm = monthData.fleetKm * 0.2; // roughly
    
    const baselineEmissions = (fleetKm * 1.08) / 1000;
    const ghgData = compileGhgData(periodId, entityId);
    const evGridPower = ghgData.gridQty * 0.6564;
    const projectEmissions = (evGridPower * 0.716) / 1000;
    let savedT = baselineEmissions - projectEmissions;
    if (fleetKm === 0) savedT = 0;
    
    return { fleetKm, baselineEmissions, projectEmissions, savedT };
  };

  const renderNCComparison = () => {
    const siteData = sites.map((site) => {
      const register = sortNcRegister(buildNcRegister({ entityId: site.id }, period, audit, monitoring));
      const major = register.filter((r) => r.severity === "major").length;
      const minor = register.filter((r) => r.severity === "minor").length;
      const obs = register.filter((r) => r.severity === "observation").length;
      const avgAge = register.length > 0 ? register.reduce((acc, r) => acc + r.ageDays, 0) / register.length : 0;
      return { site, total: register.length, major, minor, obs, avgAge, register };
    });

    return (
      <div className="space-y-6 mt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {siteData.map((d) => (
            <div key={d.site.id} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 text-[12.5px] font-bold text-foreground mb-3">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {d.site.name}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold">Total NCs</div>
                  <div className="text-[20px] font-extrabold mt-0.5">{d.total}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold">Avg Age</div>
                  <div className="text-[20px] font-extrabold mt-0.5">{Math.round(d.avgAge)}d</div>
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11.5px]">
                  <span className="text-muted-foreground">Major</span>
                  <span className="font-bold text-destructive">{d.major}</span>
                </div>
                <div className="flex justify-between text-[11.5px]">
                  <span className="text-muted-foreground">Minor</span>
                  <span className="font-bold text-warning">{d.minor}</span>
                </div>
                <div className="flex justify-between text-[11.5px]">
                  <span className="text-muted-foreground">Observation</span>
                  <span className="font-bold text-muted-foreground">{d.obs}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAMRComparison = () => {
    return (
      <div className="rounded-xl border border-border/60 bg-card/60 overflow-hidden shadow-sm mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-[10px] uppercase tracking-[0.08em] text-muted-foreground bg-muted/10 font-bold">
                <th className="px-4 py-3 min-w-[200px]">Indicator</th>
                {sites.map((s) => (
                  <th key={s.id} className="px-4 py-3 text-right min-w-[120px]">{s.short}</th>
                ))}
                <th className="px-4 py-3 text-right">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {AMR_FIELDS.map((f) => {
                const rowVals = sites.map((s) => {
                  const pVal = getEsgPortalValue(f.id, period, s.id);
                  if (pVal !== null) return pVal;
                  // fallback to global AMR_VALUES divided by site if possible, but honestly AMR is global.
                  // For a realistic stub, we will just use the global value divided by sites.length 
                  const globalVal = AMR_VALUES[period]?.[f.id]?.value;
                  if (globalVal == null) return 0;
                  return s.id === "mbmt" ? globalVal * 0.8 : globalVal * 0.2;
                });
                const min = Math.min(...rowVals);
                const max = Math.max(...rowVals);
                const diff = max - min;
                const pct = min > 0 ? (diff / min) * 100 : 0;
                
                return (
                  <tr key={f.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      {f.label}
                      <span className="ml-1 text-[10px] text-muted-foreground font-normal">({f.unit})</span>
                    </td>
                    {rowVals.map((v, i) => (
                      <td key={sites[i].id} className="px-4 py-2.5 text-right num font-semibold">
                        {v > 0 ? nf.format(Math.round(v)) : "—"}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right num">
                      {diff > 0 ? (
                        <span className="text-[11px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          Δ {nf.format(Math.round(diff))} ({pct.toFixed(0)}%)
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderGHGComparison = () => {
    const data = sites.map((s) => ({
      name: s.short,
      ...compileGhgData(period, s.id),
    }));

    return (
      <div className="space-y-6 mt-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart */}
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <h4 className="text-[11px] font-bold text-foreground mb-3 uppercase tracking-wider">Site Emissions Comparison (tCO₂e)</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "color-mix(in oklab, var(--primary) 5%, transparent)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload) return null;
                      return (
                        <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 text-[11.5px] shadow-md backdrop-blur-sm">
                          <div className="font-bold text-foreground mb-1">{payload[0]?.payload.name}</div>
                          {payload.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2 justify-between">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                                {p.name}:
                              </span>
                              <span className="font-semibold num">{Number(p.value).toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="scope1" name="Scope 1" stackId="a" fill="oklch(0.68 0.16 75)" />
                  <Bar dataKey="scope2" name="Scope 2" stackId="a" fill="oklch(0.52 0.17 195)" />
                  <Bar dataKey="scope3" name="Scope 3" stackId="a" fill="oklch(0.55 0.17 265)" radius={[4, 4, 0, 0]} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-border/60 bg-muted/20">
              <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">Metrics Breakdown</h4>
            </div>
            <table className="w-full text-[12px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-[10px] uppercase tracking-[0.08em] text-muted-foreground bg-muted/10 font-bold">
                  <th className="px-4 py-2.5">Site</th>
                  <th className="px-3 py-2.5 text-right">Scope 1</th>
                  <th className="px-3 py-2.5 text-right">Scope 2</th>
                  <th className="px-3 py-2.5 text-right">Scope 3</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-foreground">{row.name}</td>
                    <td className="px-3 py-2.5 text-right num text-warning">{row.scope1.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-right num text-primary">{row.scope2.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-right num text-purple-500">{row.scope3.toFixed(1)}</td>
                    <td className="px-4 py-2.5 text-right num font-extrabold text-foreground">{row.total.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderCarbonComparison = () => {
    const data = sites.map((s) => ({
      name: s.short,
      ...compileCarbonData(period, s.id),
    }));

    return (
      <div className="space-y-6 mt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((d) => (
            <div key={d.name} className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[13px] font-bold text-foreground">
                <MapPin className="h-4 w-4 text-primary" /> {d.name}
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Carbon Avoided</div>
                <div className="num text-[28px] font-extrabold text-success flex items-baseline gap-1">
                  {nf.format(Math.round(d.savedT))} <span className="text-[11px] font-medium text-muted-foreground">tCO₂e</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Baseline</div>
                  <div className="num text-[14px] font-semibold text-foreground/80 mt-0.5">{Math.round(d.baselineEmissions)}t</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Actual (EV)</div>
                  <div className="num text-[14px] font-semibold text-foreground/80 mt-0.5">{Math.round(d.projectEmissions)}t</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBRSRComparison = () => {
    return (
      <div className="space-y-6 mt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <div key={site.id} className="rounded-xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[13px] font-bold text-foreground border-b border-border/40 pb-3">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {site.name}
              </div>
              <div className="space-y-2">
                {[
                  "Section A — General disclosures",
                  "Section B — Management & process",
                  "Section C — Principle-wise performance",
                ].map((s, i) => {
                  // Stub out some fake variance for the comparison feel
                  const isMapped = site.id === "mbmt" ? i < 3 : i < 2;
                  return (
                    <div
                      key={s}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2"
                    >
                      <span className="text-[11px] font-medium max-w-[140px] truncate" title={s}>{s}</span>
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap",
                          isMapped ? "bg-success/12 text-success" : "bg-warning/14 text-warning",
                        )}
                      >
                        {isMapped ? "Mapped" : "12 pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="pt-1 text-[11.5px] leading-relaxed text-muted-foreground">
          Generated per project. Disclosure format follows <A t="SEBI" /> <A t="BRSR" /> as
          configured in Masters.
        </p>
      </div>
    );
  };

  const renderImpactComparison = () => {
    const { start: drStart, end: drEnd } = reportFilter.dateRange;
    const inDateRange = (date: string | undefined): boolean => {
      if (!date) return false;
      const d = new Date(date).getTime();
      return d >= drStart.getTime() && d <= drEnd.getTime();
    };

    return (
      <div className="space-y-6 mt-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => {
            const filteredAssessments = ASSESSMENTS.filter((a) => {
              if (a.status !== "complete") return false;
              if (!a.project.toLowerCase().includes(site.short.toLowerCase())) return false;
              if (!inDateRange(a.completedOn ?? undefined)) return false;
              return true;
            });

            return (
              <div key={site.id} className="rounded-xl border border-border/60 bg-card shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 text-[13px] font-bold text-foreground border-b border-border/40 px-5 py-4 bg-muted/10">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {site.name}
                  <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {filteredAssessments.length}
                  </span>
                </div>
                
                <div className="p-4 flex-1 space-y-3 bg-card">
                  {filteredAssessments.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground text-[11px]">
                      No completed assessments in this period.
                    </div>
                  ) : (
                    filteredAssessments.map((a) => (
                      <div key={a.id} className="rounded-lg border border-border/50 bg-muted/10 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                            <A t={a.kind} />
                          </div>
                          <div className="text-[9.5px] text-muted-foreground font-medium">
                            {new Date(a.completedOn!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                          <span className="font-bold text-foreground/80">{a.params.filter((p) => p.result === "ok").length}</span> of {a.params.length} parameters
                          adequate; <span className="font-bold text-warning">{a.params.filter((p) => p.result === "gap").length} gaps</span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-[16px] font-bold tracking-tight">Cross-Site Comparison: {def.name}</h3>
      </div>
      <p className="text-[12px] text-muted-foreground mb-6 flex items-center gap-1.5">
        <Info className="h-3.5 w-3.5" /> Benchmarking performance across {sites.length} selected sites.
      </p>

      {def.id === "nc-report" && renderNCComparison()}
      {def.id === "amr" && renderAMRComparison()}
      {def.id === "ghg" && renderGHGComparison()}
      {def.id === "carbon" && renderCarbonComparison()}
      {def.id === "brsr" && renderBRSRComparison()}
      {def.id === "impact" && renderImpactComparison()}
    </div>
  );
}
