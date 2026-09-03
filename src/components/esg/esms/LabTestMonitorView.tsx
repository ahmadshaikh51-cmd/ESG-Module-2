import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  MapPin,
  MoreVertical,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Upload,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ESG_GROUP,
  getLabTestType,
  LAB_TEST_TYPES,
  type LabTestTypeKey,
} from "@/lib/esg-data";
import {
  getDerivedActionStatus,
  type LabTestRecord,
} from "@/lib/esg-monitoring";
import { exportToXlsx } from "@/lib/export-xlsx";
import { EmptyState, PanelCard } from "../primitives";
import { cn } from "@/lib/utils";
import { LabTestDetailDrawer } from "./LabTestDetailDrawer";

interface LabTestMonitorViewProps {
  labTests: LabTestRecord[];
  onNewTestClick: () => void;
  onDeleteTest: (id: string) => void;
  onCloseAction: (id: string, remarks: string, date?: string) => void;
}

export function LabTestMonitorView({
  labTests,
  onNewTestClick,
  onDeleteTest,
  onCloseAction,
}: LabTestMonitorViewProps) {
  // Detail Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTestRecord | null>(null);

  // Filters State
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterDepot, setFilterDepot] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCompliance, setFilterCompliance] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("all");

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Summary KPI calculation
  const summary = useMemo(() => {
    let within = 0;
    let exceed = 0;
    let openActions = 0;

    for (const t of labTests) {
      if (t.overallCompliance === "within_limits") within++;
      else if (t.overallCompliance === "attention_required") exceed++;

      if (t.correctiveAction) {
        const derived = getDerivedActionStatus(
          t.correctiveAction.targetDate,
          t.correctiveAction.status,
        );
        if (derived === "open" || derived === "overdue" || derived === "in_progress") {
          openActions++;
        }
      }
    }

    return {
      total: labTests.length,
      within,
      exceed,
      openActions,
    };
  }, [labTests]);

  // Filtered List
  const filteredTests = useMemo(() => {
    return labTests
      .filter((t) => {
        if (filterProject !== "all" && t.entityId !== filterProject) return false;
        if (filterDepot !== "all" && t.depotId !== filterDepot) return false;
        if (filterType !== "all" && t.testType !== filterType) return false;
        if (filterCompliance !== "all" && t.overallCompliance !== filterCompliance) return false;
        if (searchQuery.trim() && searchQuery !== "all") {
          const q = searchQuery.toLowerCase();
          const matchLabel = t.testLabel.toLowerCase().includes(q);
          const matchDepot = t.depotName.toLowerCase().includes(q);
          const matchEntity = t.entityName.toLowerCase().includes(q);
          const matchMonitor = t.monitorName.toLowerCase().includes(q);
          const matchRemarks = t.remarks?.toLowerCase().includes(q);
          if (!matchLabel && !matchDepot && !matchEntity && !matchMonitor && !matchRemarks) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        return sortAsc
          ? a.testDate.localeCompare(b.testDate)
          : b.testDate.localeCompare(a.testDate);
      });
  }, [labTests, filterProject, filterDepot, filterType, filterCompliance, searchQuery, sortAsc]);

  const totalPages = Math.ceil(filteredTests.length / pageSize) || 1;
  const paginatedTests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTests.slice(start, start + pageSize);
  }, [filteredTests, currentPage, pageSize]);

  const hasActiveFilters =
    filterProject !== "all" ||
    filterDepot !== "all" ||
    filterType !== "all" ||
    filterCompliance !== "all" ||
    (searchQuery.trim() !== "" && searchQuery !== "all");

  const resetFilters = () => {
    setFilterProject("all");
    setFilterDepot("all");
    setFilterType("all");
    setFilterCompliance("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (filteredTests.length === 0) {
      toast.error("No laboratory records to export.");
      return;
    }

    const rows = filteredTests.map((t) => ({
      id: t.id,
      date: t.testDate,
      period: t.period,
      project: t.entityName,
      site: t.depotName,
      testType: t.testLabel,
      overallStatus: t.overallCompliance === "within_limits" ? "Within Limits" : "Exceedances Found",
      testedParams: t.testedCount,
      withinLimits: t.withinCount,
      exceedingLimits: t.exceedCount,
      actionRequired: t.correctiveAction?.description || "None",
      actionOwner: t.correctiveAction?.ownerName || "—",
      actionTargetDate: t.correctiveAction?.targetDate || "—",
      monitor: t.monitorName,
    }));

    exportToXlsx(
      `laboratory-testing-register-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: "id", header: "Test ID" },
        { key: "date", header: "Date" },
        { key: "period", header: "Period" },
        { key: "project", header: "Project" },
        { key: "site", header: "Site / Depot" },
        { key: "testType", header: "Test Category" },
        { key: "overallStatus", header: "Overall Status" },
        { key: "testedParams", header: "Params Tested" },
        { key: "withinLimits", header: "Within Limits" },
        { key: "exceedingLimits", header: "Exceeding Limits" },
        { key: "actionRequired", header: "Corrective Action" },
        { key: "actionOwner", header: "Action Owner" },
        { key: "actionTargetDate", header: "Target Date" },
        { key: "monitor", header: "Lead Monitor" },
      ],
      rows,
      "Lab Test Register",
    );

    toast.success("Lab test register exported", {
      description: `${rows.length} test records saved to Excel.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Lab Tests */}
        <button
          type="button"
          onClick={resetFilters}
          className={cn(
            "rounded-2xl border p-5 text-left transition-all shadow-elevated space-y-2 cursor-pointer",
            !hasActiveFilters
              ? "border-primary/50 bg-primary/[0.05] ring-2 ring-primary/30"
              : "border-border/60 bg-card hover:bg-muted/10",
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-bold uppercase tracking-wider">Total Tests</span>
            <FileSpreadsheet className="h-4 w-4 text-primary" />
          </div>
          <p className="num text-[26px] font-bold text-foreground">{summary.total}</p>
          <span className="text-[11px] text-muted-foreground block truncate">All lab testing runs</span>
        </button>

        {/* Within Limits */}
        <button
          type="button"
          onClick={() => {
            setFilterCompliance(filterCompliance === "within_limits" ? "all" : "within_limits");
            setCurrentPage(1);
          }}
          className={cn(
            "rounded-2xl border p-5 text-left transition-all shadow-elevated space-y-2 cursor-pointer",
            filterCompliance === "within_limits"
              ? "border-success bg-success/10 ring-2 ring-success/30"
              : "border-border/60 bg-card hover:bg-muted/10",
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-success">
              100% Within Limits
            </span>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
          <p className="num text-[26px] font-bold text-success">{summary.within}</p>
          <span className="text-[11px] text-muted-foreground block truncate">
            Meeting CPCB / IS 10500 standards
          </span>
        </button>

        {/* Exceedances */}
        <button
          type="button"
          onClick={() => {
            setFilterCompliance(
              filterCompliance === "attention_required" ? "all" : "attention_required",
            );
            setCurrentPage(1);
          }}
          className={cn(
            "rounded-2xl border p-5 text-left transition-all shadow-elevated space-y-2 cursor-pointer",
            filterCompliance === "attention_required"
              ? "border-destructive bg-destructive/10 ring-2 ring-destructive/30"
              : "border-border/60 bg-card hover:bg-muted/10",
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-destructive">
              Exceedances Found
            </span>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <p className="num text-[26px] font-bold text-destructive">{summary.exceed}</p>
          <span className="text-[11px] text-muted-foreground block truncate">
            Attention & CAPA required
          </span>
        </button>

        {/* Active CAPA */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Active Actions
            </span>
            <ShieldAlert className="h-4 w-4 text-blue-500" />
          </div>
          <p className="num text-[26px] font-bold text-blue-600 dark:text-blue-400">
            {summary.openActions}
          </p>
          <span className="text-[11px] text-muted-foreground block truncate">
            Containment measures in progress
          </span>
        </div>
      </div>

      {/* Filter Toolbar & Actions */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery === "all" ? "" : searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by test type, parameter, depot, monitor, or remarks..."
              className="h-10 pl-10 text-[13px] bg-muted/20 border-border/60"
            />
            {searchQuery && searchQuery !== "all" && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                className="h-10 text-[12px] gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={resetFilters}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Clear Filters
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-10 text-[12.5px] gap-1.5 shadow-xs"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 text-muted-foreground" /> Export Register
            </Button>

            <Button
              size="sm"
              className="h-10 text-[12.5px] font-bold gap-2 px-4 shadow-sm"
              onClick={onNewTestClick}
            >
              <Plus className="h-4 w-4" /> + Enter New Lab Test
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/50">
          {/* Project */}
          <div className="space-y-1">
            <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Project
            </span>
            <Select
              value={filterProject}
              onValueChange={(v) => {
                setFilterProject(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-[12px] bg-muted/15">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">
                  All Projects
                </SelectItem>
                {ESG_GROUP.entities.map((e) => (
                  <SelectItem key={e.id} value={e.id} className="text-[12px]">
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Test Type */}
          <div className="space-y-1">
            <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Test Category
            </span>
            <Select
              value={filterType}
              onValueChange={(v) => {
                setFilterType(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-[12px] bg-muted/15">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">
                  All Categories
                </SelectItem>
                {LAB_TEST_TYPES.map((t) => (
                  <SelectItem key={t.key} value={t.key} className="text-[12px]">
                    {t.shortLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Compliance */}
          <div className="space-y-1">
            <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Compliance
            </span>
            <Select
              value={filterCompliance}
              onValueChange={(v) => {
                setFilterCompliance(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-[12px] bg-muted/15">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">
                  All Status
                </SelectItem>
                <SelectItem value="within_limits" className="text-[12px] text-success">
                  Within Limits
                </SelectItem>
                <SelectItem value="attention_required" className="text-[12px] text-destructive">
                  Exceedances Found
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sorting */}
          <div className="space-y-1">
            <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Sort Date
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full justify-between text-[12px] bg-muted/15"
              onClick={() => setSortAsc(!sortAsc)}
            >
              <span>{sortAsc ? "Oldest First" : "Newest First"}</span>
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lab Tests Register Table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] min-w-[1100px]">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5 font-semibold w-[130px]">Test Date</th>
                <th className="px-4 py-3.5 font-semibold w-[200px]">Site / Depot</th>
                <th className="px-4 py-3.5 font-semibold w-[220px]">Test Category</th>
                <th className="px-5 py-3.5 font-semibold min-w-[260px]">Key Results vs Limits</th>
                <th className="px-4 py-3.5 font-semibold w-[160px]">Overall Status</th>
                <th className="px-4 py-3.5 font-semibold w-[140px]">Lead Monitor</th>
                <th className="px-4 py-3.5 font-semibold w-[160px]">Corrective Action</th>
                <th className="px-5 py-3.5 font-semibold text-right w-[80px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paginatedTests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <EmptyState
                      title="No laboratory testing records found"
                      hint={
                        hasActiveFilters
                          ? "Try clearing your filters or search query."
                          : "Click '+ Enter New Lab Test' to record your first laboratory analysis."
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedTests.map((t) => {
                  const testMeta = getLabTestType(t.testType);
                  const isCompliant = t.overallCompliance === "within_limits";
                  const derivedAction = t.correctiveAction
                    ? getDerivedActionStatus(
                        t.correctiveAction.targetDate,
                        t.correctiveAction.status,
                      )
                    : undefined;

                  return (
                    <tr
                      key={t.id}
                      className={cn(
                        "hover:bg-muted/15 transition-colors cursor-pointer group",
                        !isCompliant && "border-l-4 border-l-destructive bg-destructive/[0.02]",
                      )}
                      onClick={() => {
                        setSelectedTest(t);
                        setDrawerOpen(true);
                      }}
                    >
                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-semibold text-foreground">{t.testDate}</div>
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10.5px] font-mono text-muted-foreground">
                          {t.period}
                        </span>
                      </td>

                      {/* Site / Depot */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-foreground truncate">{t.depotName}</div>
                        <span className="text-[11px] text-muted-foreground truncate block">
                          {t.entityName}
                        </span>
                      </td>

                      {/* Test Category */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11.5px] font-semibold text-primary">
                          {testMeta?.shortLabel || t.testLabel}
                        </span>
                      </td>

                      {/* Key Results Summary */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {testMeta?.parameters.slice(0, 3).map((p) => {
                            const val = t.results[p.key];
                            const numVal = typeof val === "number" ? val : null;
                            const isExceed =
                              numVal != null &&
                              ((p.limitMax != null && numVal > p.limitMax) ||
                                (p.limitMin != null && numVal < p.limitMin));

                            return (
                              <span
                                key={p.key}
                                className={cn(
                                  "rounded-md px-2 py-0.5 text-[11px] font-semibold border",
                                  val == null
                                    ? "bg-muted text-muted-foreground border-border"
                                    : isExceed
                                    ? "bg-destructive/15 text-destructive border-destructive/30 font-bold"
                                    : "bg-success/10 text-success border-success/20",
                                )}
                              >
                                {p.name || p.code}: {val != null ? (typeof val === "number" ? val.toLocaleString() : val) : "—"}{" "}
                                {p.unit !== "Date" &&
                                p.unit !== "Asset" &&
                                p.unit !== "Activity" &&
                                p.unit !== "Material"
                                  ? p.unit
                                  : ""}
                              </span>
                            );
                          })}
                          {testMeta && testMeta.parameters.length > 3 && (
                            <span className="text-[10.5px] text-muted-foreground">
                              +{testMeta.parameters.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Overall Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border",
                            isCompliant
                              ? "border-success/30 bg-success/10 text-success"
                              : "border-destructive/30 bg-destructive/10 text-destructive",
                          )}
                        >
                          {isCompliant ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Within Limits
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5" /> Exceedance ({t.exceedCount})
                            </>
                          )}
                        </span>
                      </td>

                      {/* Lead Monitor */}
                      <td className="px-4 py-4">
                        <span className="text-[12px] font-medium text-foreground truncate block">
                          {t.monitorName}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        {derivedAction ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border",
                              derivedAction === "closed" &&
                                "border-success/30 bg-success/15 text-success",
                              derivedAction === "open" &&
                                "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400",
                              derivedAction === "overdue" &&
                                "border-destructive/30 bg-destructive/15 text-destructive animate-pulse font-bold",
                            )}
                          >
                            {derivedAction}
                          </span>
                        ) : (
                          <span className="text-[11.5px] text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-5 py-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-[12.5px] w-48 p-1">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTest(t);
                                setDrawerOpen(true);
                              }}
                              className="gap-2.5 py-2"
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" /> View 5-Point Summary
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                onDeleteTest(t.id);
                                toast.success("Lab test deleted from register");
                              }}
                              className="gap-2.5 py-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" /> Delete Test
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTests.length > pageSize && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 text-[12px] text-muted-foreground bg-muted/10">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredTests.length)} of {filteredTests.length} tests
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-[12px] font-semibold text-foreground px-3">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 5-Question Lab Test Detail Drawer */}
      <LabTestDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        testRecord={selectedTest}
        onCloseAction={(id, remarks) => {
          onCloseAction(id, remarks);
          const updated = labTests.find((t) => t.id === id);
          if (updated) setSelectedTest(updated);
        }}
      />
    </div>
  );
}
