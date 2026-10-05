import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpDown,
  BatteryCharging,
  Calendar,
  Download,
  Edit,
  Gauge,
  Layers,
  MapPin,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  X,
  Zap,
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
import { ESG_GROUP, type VehicleDataRecord } from "@/lib/esg-data";
import { exportToXlsx } from "@/lib/export-xlsx";
import { EmptyState } from "../primitives";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface VehicleDataMonitorProps {
  vehicleData: VehicleDataRecord[];
  onNewEntryClick: () => void;
  onUpdateRecord: (id: string, patch: Partial<VehicleDataRecord>) => void;
  onDeleteRecord: (id: string) => void;
}

export function VehicleDataMonitor({
  vehicleData,
  onNewEntryClick,
  onUpdateRecord,
  onDeleteRecord,
}: VehicleDataMonitorProps) {
  // Filters State
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterDepot, setFilterDepot] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<VehicleDataRecord | null>(null);
  const [editCount, setEditCount] = useState<string>("");
  const [editKm, setEditKm] = useState<string>("");
  const [editKwh, setEditKwh] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Distinct Months present in data
  const availableMonths = useMemo(() => {
    const set = new Set(vehicleData.map((d) => d.month));
    return Array.from(set);
  }, [vehicleData]);

  // Filtered List
  const filteredList = useMemo(() => {
    return vehicleData.filter((rec) => {
      if (filterProject !== "all" && rec.entityId !== filterProject) return false;
      if (filterDepot !== "all" && rec.depotId !== filterDepot) return false;
      if (filterMonth !== "all" && rec.month !== filterMonth) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMonth = rec.month.toLowerCase().includes(q);
        const matchDepot = rec.depotName.toLowerCase().includes(q);
        const matchEntity = rec.entityName.toLowerCase().includes(q);
        if (!matchMonth && !matchDepot && !matchEntity) return false;
      }
      return true;
    });
  }, [vehicleData, filterProject, filterDepot, filterMonth, searchQuery]);

  // Summary Metrics
  const summary = useMemo(() => {
    let totalVehicles = 0;
    let totalRunKm = 0;
    let totalEnergyKwh = 0;

    for (const r of filteredList) {
      totalVehicles += r.vehicleCount;
      totalRunKm += r.runKm;
      totalEnergyKwh += r.energyKwh;
    }

    const avgIntensity = totalRunKm > 0 ? (totalEnergyKwh / totalRunKm).toFixed(2) : "0.00";

    return {
      recordCount: filteredList.length,
      totalVehicles,
      totalRunKm,
      totalEnergyKwh,
      avgIntensity,
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

  const handleOpenEdit = (rec: VehicleDataRecord) => {
    setEditingRecord(rec);
    setEditCount(String(rec.vehicleCount));
    setEditKm(String(rec.runKm));
    setEditKwh(String(rec.energyKwh));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const count = Number(editCount);
    const km = Number(editKm);
    const kwh = Number(editKwh);

    if (!count || count <= 0 || !km || km <= 0 || !kwh || kwh <= 0) {
      toast.error("Please enter valid positive numbers for all fields.");
      return;
    }

    onUpdateRecord(editingRecord.id, {
      vehicleCount: count,
      runKm: km,
      energyKwh: kwh,
    });

    toast.success("Vehicle record updated", {
      description: `Updated ${editingRecord.month} data for ${editingRecord.depotName}.`,
    });
    setEditingRecord(null);
  };

  const handleExport = () => {
    if (filteredList.length === 0) {
      toast.error("No vehicle records to export.");
      return;
    }

    const rows = filteredList.map((r) => ({
      month: r.month,
      project: r.entityName,
      depot: r.depotName,
      vehicleCount: r.vehicleCount,
      runKm: r.runKm,
      energyKwh: r.energyKwh,
      intensity: (r.energyKwh / (r.runKm || 1)).toFixed(2),
    }));

    exportToXlsx(
      `vehicle-data-report-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: "month", header: "Month" },
        { key: "project", header: "Project" },
        { key: "depot", header: "Site / Depot" },
        { key: "vehicleCount", header: "Vehicle Count" },
        { key: "runKm", header: "Run (Km)" },
        { key: "energyKwh", header: "Energy Consumption (kWh)" },
        { key: "intensity", header: "Energy Intensity (kWh/Km)" },
      ],
      rows,
      "Vehicle Data",
    );

    toast.success("Vehicle data exported", {
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
            <span className="text-[11.5px] font-bold uppercase tracking-wider">Logged Months</span>
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <p className="num text-[26px] font-bold text-foreground">{summary.recordCount}</p>
          <span className="text-[11px] text-muted-foreground block truncate">Monthly monitoring cycles</span>
        </div>

        {/* Total Vehicles */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-bold uppercase tracking-wider">Vehicle Count</span>
            <Truck className="h-4 w-4 text-primary" />
          </div>
          <p className="num text-[26px] font-bold text-foreground">
            {summary.totalVehicles}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">Buses</span>
          </p>
          <span className="text-[11px] text-muted-foreground block truncate">Active fleet across sites</span>
        </div>

        {/* Total Run Km */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-bold uppercase tracking-wider">Run (Km)</span>
            <Gauge className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="num text-[26px] font-bold text-foreground">
            {summary.totalRunKm.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">Km</span>
          </p>
          <span className="text-[11px] text-muted-foreground block truncate">Total distance traveled</span>
        </div>

        {/* Total Energy kWh */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11.5px] font-bold uppercase tracking-wider">Energy (kWh)</span>
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <p className="num text-[26px] font-bold text-primary">
            {summary.totalEnergyKwh.toLocaleString()}{" "}
            <span className="text-[13px] font-normal text-muted-foreground">kWh</span>
          </p>
          <span className="text-[11px] text-muted-foreground block truncate">
            Avg: {summary.avgIntensity} kWh/Km
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
              placeholder="Search by month, project, or site depot..."
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
              <Plus className="h-4 w-4" /> + Enter Vehicle Data
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
              Month
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

      {/* Vehicle Data Table */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-[13px] min-w-[800px]">
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                <TableHead className="px-6 py-4 font-semibold w-[180px]">Month</TableHead>
                <TableHead className="px-6 py-4 font-semibold w-[180px] text-right">Vehicle Count</TableHead>
                <TableHead className="px-6 py-4 font-semibold w-[200px] text-right">Run (Km)</TableHead>
                <TableHead className="px-6 py-4 font-semibold w-[240px] text-right">
                  Energy Consumption (kWh)
                </TableHead>
                <TableHead className="px-6 py-4 font-semibold text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-16 text-center">
                    <EmptyState
                      title="No vehicle data records found"
                      hint={
                        hasActiveFilters
                          ? "Try clearing your filters or search query."
                          : "Click '+ Enter Vehicle Data' to record your first operational month."
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((rec) => (
                  <TableRow
                    key={rec.id}
                    className="hover:bg-muted/15 transition-colors group"
                  >
                    {/* Month */}
                    <TableCell className="px-6 py-4.5 whitespace-nowrap">
                      <div className="font-bold text-foreground text-[13.5px]">
                        {rec.month}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {rec.depotName} · {rec.entityName}
                      </span>
                    </TableCell>

                    {/* Vehicle Count */}
                    <TableCell className="num px-6 py-4.5 text-right font-bold text-foreground text-[14px] whitespace-nowrap">
                      {rec.vehicleCount.toLocaleString()}
                    </TableCell>

                    {/* Run (Km) */}
                    <TableCell className="num px-6 py-4.5 text-right font-bold text-foreground text-[14px] whitespace-nowrap">
                      {rec.runKm.toLocaleString()}
                    </TableCell>

                    {/* Energy Consumption (kWh) */}
                    <TableCell className="num px-6 py-4.5 text-right font-bold text-primary text-[14px] whitespace-nowrap">
                      {rec.energyKwh.toLocaleString()}
                    </TableCell>

                    {/* Row Actions */}
                    <TableCell className="px-6 py-4.5 text-right whitespace-nowrap">
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
                        <DropdownMenuContent align="end" className="text-[12.5px] w-40 p-1">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(rec)}
                            className="gap-2.5 py-2"
                          >
                            <Edit className="h-4 w-4 text-muted-foreground" /> Edit Values
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              onDeleteRecord(rec.id);
                              toast.success("Vehicle record deleted");
                            }}
                            className="gap-2.5 py-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingRecord && (
        <Dialog open={!!editingRecord} onOpenChange={(o) => !o && setEditingRecord(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-[16px]">
                Edit Vehicle Data — {editingRecord.month} ({editingRecord.depotName})
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Vehicle Count (Count)
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={editCount}
                  onChange={(e) => setEditCount(e.target.value)}
                  className="num h-10 text-[13.5px] font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Run (Km)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={editKm}
                  onChange={(e) => setEditKm(e.target.value)}
                  className="num h-10 text-[13.5px] font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Energy Consumption (kWh)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={editKwh}
                  onChange={(e) => setEditKwh(e.target.value)}
                  className="num h-10 text-[13.5px] font-bold text-primary"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
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
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
