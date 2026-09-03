import React, { useState } from "react";
import {
  Activity,
  BatteryCharging,
  Calendar,
  CheckCircle2,
  Gauge,
  Layers,
  MapPin,
  Save,
  Truck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ESG_GROUP, PERIODS, type VehicleDataRecord } from "@/lib/esg-data";
import { cn } from "@/lib/utils";

interface VehicleDataEntryProps {
  onSaveSuccess: () => void;
  onCancel?: () => void;
  onSave: (record: Omit<VehicleDataRecord, "id" | "createdAt" | "updatedAt">) => void;
  initialEntityId?: string;
  initialDepotId?: string;
}

const MONTH_OPTIONS = [
  { value: "Aug 2026", label: "August 2026" },
  { value: "Jul 2026", label: "July 2026" },
  { value: "Jun 2026", label: "June 2026" },
  { value: "May 2026", label: "May 2026" },
  { value: "Apr 2026", label: "April 2026" },
  { value: "Mar 2026", label: "March 2026" },
  { value: "Feb 2026", label: "February 2026" },
  { value: "Jan 2026", label: "January 2026" },
  { value: "Sep 2026", label: "September 2026" },
  { value: "Oct 2026", label: "October 2026" },
];

export function VehicleDataEntry({
  onSaveSuccess,
  onCancel,
  onSave,
  initialEntityId = "mbmt",
  initialDepotId = "kashimira",
}: VehicleDataEntryProps) {
  // Form State
  const [entityId, setEntityId] = useState<string>(initialEntityId);
  const [depotId, setDepotId] = useState<string>(initialDepotId);
  const [month, setMonth] = useState<string>("Aug 2026");
  const [vehicleCount, setVehicleCount] = useState<string>("45");
  const [runKm, setRunKm] = useState<string>("386060");
  const [energyKwh, setEnergyKwh] = useState<string>("455150");

  const currentEntity = ESG_GROUP.entities.find((e) => e.id === entityId) || ESG_GROUP.entities[0];
  const availableDepots = currentEntity.depots;
  const currentDepot =
    availableDepots.find((d) => d.id === depotId) ||
    availableDepots[0] || { id: "depot", name: "Depot" };

  // Sync depot when entity changes
  const handleEntityChange = (id: string) => {
    setEntityId(id);
    const ent = ESG_GROUP.entities.find((e) => e.id === id);
    if (ent && ent.depots[0]) {
      setDepotId(ent.depots[0].id);
    }
  };

  // Derived intensity feedback
  const numRun = Number(runKm) || 0;
  const numEnergy = Number(energyKwh) || 0;
  const calculatedIntensity = numRun > 0 ? (numEnergy / numRun).toFixed(2) : "0.00";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const count = Number(vehicleCount);
    const km = Number(runKm);
    const kwh = Number(energyKwh);

    if (!month) {
      toast.error("Please select a Month.");
      return;
    }

    if (!count || count <= 0) {
      toast.error("Please enter a valid Vehicle Count.");
      return;
    }

    if (!km || km <= 0) {
      toast.error("Please enter a valid Run (Km).");
      return;
    }

    if (!kwh || kwh <= 0) {
      toast.error("Please enter valid Energy Consumption (kWh).");
      return;
    }

    onSave({
      entityId,
      depotId,
      entityName: currentEntity.name,
      depotName: currentDepot.name,
      month,
      vehicleCount: count,
      runKm: km,
      energyKwh: kwh,
    });

    toast.success("Vehicle data saved successfully", {
      description: `${month} data logged for ${currentDepot.name} (${count} vehicles, ${km.toLocaleString()} km, ${kwh.toLocaleString()} kWh).`,
    });

    onSaveSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Container Card */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-elevated space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-foreground">
                Vehicle Data Entry
              </h3>
              <p className="text-[12.5px] text-muted-foreground">
                Enter monthly fleet operational distance and charging energy consumption.
              </p>
            </div>
          </div>
          <span className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-1 text-[12px] font-bold text-primary">
            {month}
          </span>
        </div>

        {/* 01 — Site Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <span className="font-mono text-[11px] font-bold text-primary">01</span>
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
              Select Site / Depot
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Project / SPV <span className="text-destructive">*</span>
              </Label>
              <Select value={entityId} onValueChange={handleEntityChange}>
                <SelectTrigger className="h-10 text-[13px] bg-muted/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESG_GROUP.entities.map((e) => (
                    <SelectItem key={e.id} value={e.id} className="text-[12.5px]">
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Site / Depot */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" /> Site / Depot <span className="text-destructive">*</span>
              </Label>
              <Select value={depotId} onValueChange={setDepotId}>
                <SelectTrigger className="h-10 text-[13px] bg-muted/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableDepots.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="text-[12.5px]">
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 02 — Four Core Vehicle Data Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <span className="font-mono text-[11px] font-bold text-primary">02</span>
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
              Vehicle Operational Data
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Month */}
            <div className="space-y-2 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
              <Label className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Month <span className="text-destructive">*</span>
              </Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-10 text-[13px] font-semibold bg-muted/20">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-[12.5px]">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-[11px] text-muted-foreground block">Reporting operational cycle</span>
            </div>

            {/* 2. Vehicle Count */}
            <div className="space-y-2 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-primary" /> Vehicle Count <span className="text-destructive">*</span>
                </Label>
                <span className="rounded bg-muted px-2 py-0.5 text-[10.5px] font-bold text-muted-foreground">
                  Count
                </span>
              </div>
              <Input
                type="number"
                min={1}
                value={vehicleCount}
                onChange={(e) => setVehicleCount(e.target.value)}
                placeholder="e.g. 45"
                className="num h-10 text-[14px] font-bold bg-muted/20"
                required
              />
              <span className="text-[11px] text-muted-foreground block">Active operational buses</span>
            </div>

            {/* 3. Run (Km) */}
            <div className="space-y-2 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-primary" /> Run (Km) <span className="text-destructive">*</span>
                </Label>
                <span className="rounded bg-muted px-2 py-0.5 text-[10.5px] font-bold text-muted-foreground">
                  Km
                </span>
              </div>
              <Input
                type="number"
                min={0}
                value={runKm}
                onChange={(e) => setRunKm(e.target.value)}
                placeholder="e.g. 386060"
                className="num h-10 text-[14px] font-bold bg-muted/20"
                required
              />
              <span className="text-[11px] text-muted-foreground block">Total fleet distance run</span>
            </div>

            {/* 4. Energy Consumption (kWh) */}
            <div className="space-y-2 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" /> Energy Consumption (kWh) <span className="text-destructive">*</span>
                </Label>
                <span className="rounded bg-muted px-2 py-0.5 text-[10.5px] font-bold text-muted-foreground">
                  kWh
                </span>
              </div>
              <Input
                type="number"
                min={0}
                value={energyKwh}
                onChange={(e) => setEnergyKwh(e.target.value)}
                placeholder="e.g. 455150"
                className="num h-10 text-[14px] font-bold text-primary bg-muted/20"
                required
              />
              <span className="text-[11px] text-muted-foreground block">Total charging power drawn</span>
            </div>
          </div>
        </div>

        {/* Derived Efficiency Feedback Card */}
        <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-4.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BatteryCharging className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground block">
                Derived Energy Efficiency
              </span>
              <p className="text-[13px] text-foreground font-semibold">
                Fleet Intensity: <strong className="text-primary font-bold">{calculatedIntensity} kWh/Km</strong>
              </p>
            </div>
          </div>
          <span className="text-[12px] text-muted-foreground">
            Automatic calculation ({numEnergy.toLocaleString()} kWh ÷ {numRun.toLocaleString()} Km)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            className="h-10 text-[12.5px] px-5"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="h-10 text-[13px] px-6 font-bold gap-2 shadow-sm"
          >
            <Save className="h-4 w-4" /> Save Vehicle Data
          </Button>
        </div>
      </div>
    </form>
  );
}
