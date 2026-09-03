import React, { useMemo, useState } from "react";
import {
  Calendar,
  Download,
  Droplets,
  Edit,
  Layers,
  MapPin,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ESG_GROUP, type DrinkingWaterRecord } from "@/lib/esg-data";
import { exportToXlsx } from "@/lib/export-xlsx";
import { EmptyState } from "../primitives";
import { cn } from "@/lib/utils";

interface DrinkingWaterMonitorProps {
  drinkingWaterData: DrinkingWaterRecord[];
  onNewEntryClick: () => void;
  onUpdateRecord: (id: string, patch: Partial<DrinkingWaterRecord>) => void;
  onDeleteRecord: (id: string) => void;
}

export function DrinkingWaterMonitor({
  drinkingWaterData,
  onNewEntryClick,
  onUpdateRecord,
  onDeleteRecord,
}: DrinkingWaterMonitorProps) {
  // Filters State
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterDepot, setFilterDepot] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<DrinkingWaterRecord | null>(null);
  const [editPeople, setEditPeople] = useState<string>("");
  const [editLitres, setEditLitres] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Distinct Months present in data
  const availableMonths = useMemo(() => {
    const set = new Set(drinkingWaterData.map((d) => d.monthDate));
    return Array.from(set);
  }, [drinkingWaterData]);

  // Filtered List
  const filteredList = useMemo(() => {
    return drinkingWaterData.filter((rec) => {
      if (filterProject !== "all" && rec.entityId !== filterProject) return false;
      if (filterDepot !== "all" && rec.depotId !== filterDepot) return false;
      if (filterMonth !== "all" && rec.monthDate !== filterMonth) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMonth = rec.monthDate.toLowerCase().includes(q);
        const matchDepot = rec.depotName.toLowerCase().includes(q);
        const matchEntity = rec.entityName.toLowerCase().includes(q);
        if (!matchMonth && !matchDepot && !matchEntity) return false;
      }
      return true;
    });
  }, [drinkingWaterData, filterProject, filterDepot, filterMonth, searchQuery]);

  // Summary Metrics
  const summary = useMemo(() => {
    let totalPeople = 0;
    let totalLitres = 0;

    for (const r of filteredList) {
      totalPeople += r.peopleCount;
      totalLitres += r.qtyLitres;
    }

    const avgPerCapita = totalPeople > 0 ? (totalLitres / totalPeople).toFixed(1) : "0.0";
    const avgDailyRate = totalPeople > 0 ? (totalLitres / totalPeople / 30).toFixed(2) : "0.00";

    return {
      recordCount: filteredList.length,
      totalPeople,
      totalLitres,
      avgPerCapita,
      avgDailyRate,
    };
  }, [filteredList]);

  const hasActiveFilters =
    filterProject !== "all" ||
    filterDepot !== "all" ||
    filterMonth !== "all" ||
    searchQuery.trim() !== "";

  const resetFilters = () => {
    setFilterProject("all");
    setFilterDepot("all");
    setFilterMonth("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleOpenEdit = (rec: DrinkingWaterRecord) => {
    setEditingRecord(rec);
    setEditPeople(String(rec.peopleCount));
    setEditLitres(String(rec.qtyLitres));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const count = Number(editPeople);
    const litres = Number(editLitres);

    if (!count || count <= 0 || !litres || litres <= 0) {
      toast.error("Please enter valid positive numbers for all fields.");
      return;
    }

    onUpdateRecord(editingRecord.id, {
      peopleCount: count,
      qtyLitres: litres,
    });

    toast.success("Drinking water record updated", {
      description: `Updated ${editingRecord.monthDate} data for ${editingRecord.depotName}.`,
    });
    setEditingRecord(null);
  };

  const handleExport = () => {
    if (filteredList.length === 0) {
      toast.error("No drinking water records to export.");
      return;
    }

    const rows = filteredList.map((r) => ({
      monthDate: r.monthDate,
      project: r.entityName,
      depot: r.depotName,
      peopleCount: r.peopleCount,
      qtyLitres: r.qtyLitres,
      perCapita: (r.qtyLitres / (r.peopleCount || 1)).toFixed(1),
      dailyRate: (r.qtyLitres / (r.peopleCount || 1) / 30).toFixed(2),
    }));

    exportToXlsx(
      `drinking-water-report-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: "monthDate", header: "Month / Date" },
        { key: "project", header: "Project / SPV" },
        { key: "depot", header: "Site / Depot" },
        { key: "peopleCount", header: "Number of People" },
        { key: "qtyLitres", header: "QTY Litres" },
        { key: "perCapita", header: "Per-Capita (L/Person)" },
        { key: "dailyRate", header: "Estimated Daily (L/Person/Day)" },
      ],
      rows,
      "Drinking Water",
    );

    toast.success("Drinking water data exported", {
      description: `${rows.length} records exported to Excel.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Records */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-bold uppercase tracking-wider">Logged Periods</span>
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <p className="num text-[26px] font-bold text-foreground">{summary.recordCount}</p>
          <span className="text-[11px] text-muted-foreground block truncate">Monthly monitoring entries</span>
        </div>

        {/* Total Headcount */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-bold uppercase tracking-wider">Number of People</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="num text-[26px] font-bold text-foreground">
            {summary.totalPeople.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">Staff & Crew</span>
          </p>
          <span className="text-[11px] text-muted-foreground block truncate">Depot workforce served</span>
        </div>

        {/* Total Litres */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-bold uppercase tracking-wider">QTY Litres</span>
            <Droplets className="h-4 w-4 text-primary" />
          </div>
          <p className="num text-[26px] font-bold text-foreground">
            {summary.totalLitres.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">Litres</span>
          </p>
          <span className="text-[11px] text-muted-foreground block truncate">Total potable water supplied</span>
        </div>

        {/* Avg Rate */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-bold uppercase tracking-wider">Per-Capita Rate</span>
            <Droplets className="h-4 w-4 text-primary" />
          </div>
          <p className="num text-[26px] font-bold text-primary">
            {summary.avgPerCapita}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">L / Person</span>
          </p>
          <span className="text-[11px] text-muted-foreground block truncate">
            Daily avg: ~{summary.avgDailyRate} L/Day
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
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by period, project, or site depot..."
              className="h-10 pl-10 text-[13px] bg-muted/20 border-border/60"
            />
            {searchQuery && (
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
              <Download className="h-4 w-4 text-muted-foreground" /> Export
            </Button>

            <Button
              size="sm"
              className="h-10 text-[12.5px] font-bold gap-2 px-4 shadow-sm"
              onClick={onNewEntryClick}
            >
              <Plus className="h-4 w-4" /> + Enter Drinking Water
            </Button>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/50">
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

          {/* Site / Depot */}
          <div className="space-y-1">
            <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Site / Depot
            </span>
            <Select
              value={filterDepot}
              onValueChange={(v) => {
                setFilterDepot(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-[12px] bg-muted/15">
                <SelectValue placeholder="All Depots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">
                  All Depots
                </SelectItem>
                {ESG_GROUP.entities.flatMap((e) =>
                  e.depots.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="text-[12px]">
                      {e.short} · {d.name}
                    </SelectItem>
                  )),
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Month */}
          <div className="space-y-1">
            <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Month / Date
            </span>
            <Select
              value={filterMonth}
              onValueChange={(v) => {
                setFilterMonth(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-[12px] bg-muted/15">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[12px]">
                  All Months
                </SelectItem>
                {availableMonths.map((m) => (
                  <SelectItem key={m} value={m} className="text-[12px]">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] min-w-[800px]">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4 font-semibold w-[180px]">Month / Date</th>
                <th className="px-6 py-4 font-semibold w-[200px]">Site / Project</th>
                <th className="px-6 py-4 font-semibold w-[180px] text-right">Number of People</th>
                <th className="px-6 py-4 font-semibold w-[200px] text-right">QTY Litres</th>
                <th className="px-6 py-4 font-semibold w-[200px] text-right">Consumption Rate</th>
                <th className="px-6 py-4 font-semibold text-right w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <EmptyState
                      title="No drinking water records found"
                      hint={
                        hasActiveFilters
                          ? "Try clearing your filters or search query."
                          : "Click '+ Enter Drinking Water' to record your first consumption cycle."
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredList.map((rec) => {
                  const rate = rec.peopleCount > 0 ? (rec.qtyLitres / rec.peopleCount).toFixed(1) : "0.0";
                  const daily = rec.peopleCount > 0 ? (rec.qtyLitres / rec.peopleCount / 30).toFixed(2) : "0.00";
                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-muted/15 transition-colors group"
                    >
                      {/* Month/Date */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="font-bold text-foreground text-[13.5px]">
                          {rec.monthDate}
                        </div>
                      </td>

                      {/* Site / Project */}
                      <td className="px-6 py-4.5">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{rec.depotName}</span>
                        </div>
                        <span className="text-[11.5px] text-muted-foreground block ml-5">
                          {rec.entityName}
                        </span>
                      </td>

                      {/* Number of People */}
                      <td className="num px-6 py-4.5 text-right font-bold text-[14px] text-foreground">
                        {rec.peopleCount.toLocaleString()}{" "}
                        <span className="text-[12px] font-normal text-muted-foreground">Persons</span>
                      </td>

                      {/* QTY Litres */}
                      <td className="num px-6 py-4.5 text-right font-bold text-[14px] text-foreground">
                        {rec.qtyLitres.toLocaleString()}{" "}
                        <span className="text-[12px] font-normal text-muted-foreground">L</span>
                      </td>

                      {/* Rate */}
                      <td className="num px-6 py-4.5 text-right">
                        <span className="inline-flex items-center gap-1 font-bold text-primary text-[13px] bg-primary/10 px-2.5 py-1 rounded-lg">
                          <Droplets className="h-3 w-3" /> {rate} L/Person
                        </span>
                        <span className="text-[10.5px] text-muted-foreground block mt-0.5">
                          ~{daily} L/day
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4.5 text-right">
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
                          <DropdownMenuContent align="end" className="text-[12.5px] w-40">
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(rec)}
                              className="gap-2 cursor-pointer"
                            >
                              <Edit className="h-3.5 w-3.5 text-primary" /> Edit Record
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteRecord(rec.id)}
                              className="gap-2 text-destructive cursor-pointer focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
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
      </div>

      {/* Edit Record Modal */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-bold">
              Edit Drinking Water Record — {editingRecord?.monthDate}
            </DialogTitle>
          </DialogHeader>

          {editingRecord && (
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label className="text-[12px] font-semibold text-muted-foreground">
                  Site / Depot
                </Label>
                <div className="h-9 flex items-center px-3 rounded-lg border border-border/50 bg-muted/20 text-[13px] font-bold text-foreground">
                  {editingRecord.depotName} ({editingRecord.entityName})
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Number of People (Staff & Crew) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={editPeople}
                  onChange={(e) => setEditPeople(e.target.value)}
                  className="num h-10 text-[14px] font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  QTY Litres <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min="1"
                  step="any"
                  value={editLitres}
                  onChange={(e) => setEditLitres(e.target.value)}
                  className="num h-10 text-[14px] font-bold"
                  required
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingRecord(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-bold">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
