import React, { useState, useMemo, useEffect } from "react";
import {
  Database,
  Search,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Activity,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { A, EmptyState, PanelCard, useEsg } from "../primitives";
import { PERIODS, PEOPLE } from "@/lib/esg-data";
import { INDICATORS, PROJECTS_MAPPING, type ReportType } from "./ReportDataEntryForm";
import { cn } from "@/lib/utils";

interface EsgDataPortalProps {
  onBack: () => void;
  onOpenForm: (
    reportType: ReportType,
    recordId: string | null,
    project: string,
    siteId: string,
    period: string
  ) => void;
}

const REPORT_COLORS: Record<string, { bg: string; text?: string; label: string }> = {
  amr: { bg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20", label: "AMR" },
  ghg: { bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20", label: "GHG" },
  brsr: { bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20", label: "BRSR" },
  carbon: { bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20", label: "Carbon" },
  impact: { bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20", label: "Impact" },
};

export function EsgDataPortal({ onBack, onOpenForm }: EsgDataPortalProps) {
  const { period: currentEsgPeriod } = useEsg();
  
  // State variables for filtering
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(currentEsgPeriod || "all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Load saved records from localStorage
  const savedRecords = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("voltline-report-records") || "[]");
    } catch (e) {
      return [];
    }
  }, [refreshTrigger]);

  // Sync site filter dropdown options when project changes
  const siteOptions = useMemo(() => {
    if (selectedProject === "all") return [];
    return PROJECTS_MAPPING[selectedProject]?.sites || [];
  }, [selectedProject]);

  // Reset site if project changes and previous site is not valid
  useEffect(() => {
    if (selectedProject !== "all") {
      const valid = PROJECTS_MAPPING[selectedProject]?.sites.some(s => s.id === selectedSite);
      if (!valid) setSelectedSite("all");
    } else {
      setSelectedSite("all");
    }
  }, [selectedProject]);

  // Generate indicator tasks dynamically
  const allTasks = useMemo(() => {
    const tasks: any[] = [];
    Object.entries(PROJECTS_MAPPING).forEach(([projName, projMeta]) => {
      projMeta.sites.forEach((siteMeta) => {
        projMeta.indicators.forEach((indId) => {
          const indMeta = INDICATORS.find(i => i.id === indId);
          if (!indMeta) return;

          PERIODS.forEach((periodMeta) => {
            // Find if there is a saved value for this indicator in this site & period
            const matchingRecord = savedRecords.find((r: any) =>
              r.project === projName &&
              r.site === siteMeta.id &&
              r.reportingPeriod === periodMeta.id &&
              r.indicatorValues?.[indId]?.actual !== undefined
            );

            let status = "Pending Entry";
            let value = null;
            let recordId = null;
            let reportType = indMeta.maps[0] as ReportType; // Default to first mapped report

            if (matchingRecord) {
              status = matchingRecord.status || "Draft";
              value = matchingRecord.indicatorValues[indId].actual;
              recordId = matchingRecord.id;
              reportType = matchingRecord.reportType;
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
            });
          });
        });
      });
    });
    return tasks;
  }, [savedRecords]);

  // Filter tasks based on selected values
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

  // Calculate high-level summary metrics
  const metrics = useMemo(() => {
    const total = filteredTasks.length;
    const pending = filteredTasks.filter(t => t.status === "Pending Entry").length;
    const draft = filteredTasks.filter(t => t.status === "Draft").length;
    const submitted = filteredTasks.filter(t => t.status === "Submitted").length;
    const approved = filteredTasks.filter(t => t.status === "Approved" || t.status === "Closed").length;
    
    return {
      total,
      pending,
      draft,
      submitted,
      approved,
      completionRate: total > 0 ? Math.round(((total - pending) / total) * 100) : 0,
    };
  }, [filteredTasks]);

  const nextPendingTask = useMemo(() => {
    return allTasks.find(t => t.status === "Pending Entry");
  }, [allTasks]);

  return (
    <div className="space-y-4">
      {/* Header section with Back navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="h-8.5 w-8.5 rounded-xl p-0 cursor-pointer"
            onClick={onBack}
            aria-label="Go back to compliance sections"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-[16px] font-bold text-foreground flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-primary" /> ESG Data Portal
            </h2>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">
              One centralized portal to enter, track, and validate ESG indicators across all projects.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-[11px] font-medium text-muted-foreground">
            Centralized Data Engine Active
          </span>
        </div>
      </div>

      {nextPendingTask && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="h-4.5 w-4.5 animate-pulse" />
            </span>
            <div>
              <span className="text-[10px] font-bold text-primary uppercase block">Next Required Action</span>
              <span className="text-[13px] font-extrabold text-foreground mt-0.5 block">
                Enter {nextPendingTask.indicator.name} for {nextPendingTask.siteName} ({nextPendingTask.periodLabel})
              </span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onOpenForm(nextPendingTask.reportType, nextPendingTask.recordId, nextPendingTask.project, nextPendingTask.siteId, nextPendingTask.period)}
            className="h-8.5 text-[11.5px] font-bold gap-1 rounded-xl cursor-pointer"
          >
            Enter Data Now <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <PanelCard className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Data Completeness
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-extrabold text-foreground num">
              {metrics.completionRate}%
            </span>
            <span className="text-[11.5px] text-muted-foreground font-mono">
              ({metrics.total - metrics.pending} / {metrics.total} fields)
            </span>
          </div>
          <div className="w-full bg-muted/60 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
        </PanelCard>

        <PanelCard className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Pending Tasks
          </span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className={cn(
              "text-2xl font-extrabold num",
              metrics.pending > 0 ? "text-warning" : "text-success"
            )}>
              {metrics.pending}
            </span>
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider block font-semibold">
              Needs Entry
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-3 block">
            Assigned to Depot / Facility managers
          </span>
        </PanelCard>

        <PanelCard className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Review Status
          </span>
          <div className="flex items-baseline gap-3 mt-2">
            <div>
              <span className="text-lg font-bold text-foreground num">{metrics.draft}</span>
              <span className="text-[10px] text-muted-foreground block font-medium">Draft</span>
            </div>
            <div>
              <span className="text-lg font-bold text-primary num">{metrics.submitted}</span>
              <span className="text-[10px] text-muted-foreground block font-medium">Submitted</span>
            </div>
            <div>
              <span className="text-lg font-bold text-success num">{metrics.approved}</span>
              <span className="text-[10px] text-muted-foreground block font-medium">Approved</span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground mt-3 block">
            Awaiting verification & review workflows
          </span>
        </PanelCard>

        <PanelCard className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Connected Reports
          </span>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {Object.values(REPORT_COLORS).map(r => (
              <span key={r.label} className={cn("text-[9.5px] font-bold px-1.5 py-0.5 rounded-md", r.bg)}>
                {r.label}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground mt-3 block">
            Data points feed compliance outputs once validated
          </span>
        </PanelCard>
      </div>

      {/* Filters & Search Row */}
      <PanelCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Project filter */}
          <div className="space-y-1">
            <Label className="text-[11.5px] font-semibold text-muted-foreground">Project</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="h-8.5 text-[12px] bg-background">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">All Projects</SelectItem>
                {Object.keys(PROJECTS_MAPPING).map(p => (
                  <SelectItem key={p} value={p} className="text-[12px]">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Site filter */}
          <div className="space-y-1">
            <Label className="text-[11.5px] font-semibold text-muted-foreground">Site / Depot</Label>
            <Select
              disabled={selectedProject === "all"}
              value={selectedSite}
              onValueChange={setSelectedSite}
            >
              <SelectTrigger className="h-8.5 text-[12px] bg-background">
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">All Sites</SelectItem>
                {siteOptions.map(s => (
                  <SelectItem key={s.id} value={s.id} className="text-[12px]">{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period filter */}
          <div className="space-y-1">
            <Label className="text-[11.5px] font-semibold text-muted-foreground">Reporting Period</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="h-8.5 text-[12px] bg-background num">
                <SelectValue placeholder="All Periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">All Periods</SelectItem>
                {PERIODS.map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-[12px] num">{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <Label className="text-[11.5px] font-semibold text-muted-foreground">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-8.5 text-[12px] bg-background">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">All Statuses</SelectItem>
                <SelectItem value="Pending Entry" className="text-[12px]">Pending Entry</SelectItem>
                <SelectItem value="Draft" className="text-[12px]">Draft</SelectItem>
                <SelectItem value="Submitted" className="text-[12px]">Submitted</SelectItem>
                <SelectItem value="Approved" className="text-[12px]">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search input */}
          <div className="space-y-1">
            <Label className="text-[11.5px] font-semibold text-muted-foreground">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search indicators..."
                className="h-8.5 pl-8 text-[12px] bg-background"
              />
            </div>
          </div>
        </div>
      </PanelCard>

      {/* Indicators Matrix Table */}
      <PanelCard>
        {filteredTasks.length === 0 ? (
          <EmptyState
            title="No ESG Data items match"
            hint="Try broadening your project, site, period, or status search filters above."
          />
        ) : (
          <div className="overflow-auto max-h-[520px]">
            <table className="w-full text-[12.5px]">
              <thead className="sticky top-0 z-10 bg-card">
                <tr className="border-b border-border/60 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="px-5 py-2.5 text-left font-medium">Indicator Details</th>
                  <th className="px-3 py-2.5 text-left font-medium">Project & Site</th>
                  <th className="px-3 py-2.5 text-left font-medium">Period</th>
                  <th className="px-3 py-2.5 text-left font-medium">Value</th>
                  <th className="px-3 py-2.5 text-left font-medium">Feeds Reports</th>
                  <th className="px-3 py-2.5 text-left font-medium">Status</th>
                  <th className="px-5 py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredTasks.map((t, idx) => {
                  const isPending = t.status === "Pending Entry";
                  const isDraft = t.status === "Draft";
                  const isSubmitted = t.status === "Submitted";
                  const isApproved = t.status === "Approved" || t.status === "Closed";
                  const owner = PEOPLE.find(p => p.id === t.responsible);

                  return (
                    <tr
                      key={`${t.project}-${t.siteId}-${t.indicator.id}-${t.period}-${idx}`}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Indicator ID & Name */}
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
                          <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1" title={t.indicator.def}>
                            {t.indicator.def}
                          </div>
                        </div>
                      </td>

                      {/* Project & Site */}
                      <td className="px-3 py-3">
                        <div className="font-semibold text-foreground text-[12.5px]">{t.project}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{t.siteName}</span>
                        </div>
                      </td>

                      {/* Period */}
                      <td className="px-3 py-3 font-medium text-foreground num">
                        {t.periodLabel}
                      </td>

                      {/* Raw Entered Value */}
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

                      {/* Connected Reports */}
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {t.indicator.maps.map((rId: string) => {
                            const badge = REPORT_COLORS[rId] || { bg: "bg-muted text-muted-foreground", label: rId.toUpperCase() };
                            return (
                              <span key={rId} className={cn("text-[9px] font-bold px-1 rounded-md", badge.bg)}>
                                {badge.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <span className={cn(
                          "inline-flex h-5 items-center rounded-md border px-1.5 text-[10px] font-bold",
                          isPending && "bg-muted/80 text-muted-foreground border-border/60",
                          isDraft && "bg-warning/10 text-warning border-warning/20",
                          isSubmitted && "bg-primary/10 text-primary border-primary/20",
                          isApproved && "bg-success/10 text-success border-success/20"
                        )}>
                          {t.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3 text-right">
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
                          {isPending ? "Enter Data" : "Edit / View"}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>
    </div>
  );
}
