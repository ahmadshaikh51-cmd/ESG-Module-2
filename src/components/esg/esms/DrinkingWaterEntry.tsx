import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Droplets,
  Layers,
  MapPin,
  Save,
  Users,
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
import { ESG_GROUP, type DrinkingWaterRecord } from "@/lib/esg-data";

interface DrinkingWaterEntryProps {
  onSaveSuccess: () => void;
  onCancel?: () => void;
  onSave: (record: Omit<DrinkingWaterRecord, "id" | "createdAt" | "updatedAt">) => void;
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

export function DrinkingWaterEntry({
  onSaveSuccess,
  onCancel,
  onSave,
  initialEntityId = "mbmt",
  initialDepotId = "kashimira",
}: DrinkingWaterEntryProps) {
  // Form State
  const [entityId, setEntityId] = useState<string>(initialEntityId);
  const [depotId, setDepotId] = useState<string>(initialDepotId);
  const [monthDate, setMonthDate] = useState<string>("Aug 2026");
  const [peopleCount, setPeopleCount] = useState<string>("120");
  const [qtyLitres, setQtyLitres] = useState<string>("3600");

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

  // Derived per-capita rate
  const numPeople = Number(peopleCount) || 0;
  const numLitres = Number(qtyLitres) || 0;
  const perCapitaRate = numPeople > 0 ? (numLitres / numPeople).toFixed(1) : "0.0";
  const dailyPerCapita = numPeople > 0 ? (numLitres / numPeople / 30).toFixed(2) : "0.00";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const count = Number(peopleCount);
    const litres = Number(qtyLitres);

    if (!monthDate) {
      toast.error("Please select a Month / Date.");
      return;
    }

    if (!count || count <= 0) {
      toast.error("Please enter a valid Number of People.");
      return;
    }

    if (!litres || litres <= 0) {
      toast.error("Please enter valid Drinking Water QTY in Litres.");
      return;
    }

    onSave({
      entityId,
      depotId,
      entityName: currentEntity.name,
      depotName: currentDepot.name,
      monthDate,
      peopleCount: count,
      qtyLitres: litres,
    });

    toast.success("Drinking water record saved successfully", {
      description: `${monthDate} data logged for ${currentDepot.name} (${count} people, ${litres.toLocaleString()} L).`,
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
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-foreground">
                Drinking Water Data Entry
              </h3>
              <p className="text-[12.5px] text-muted-foreground">
                Record depot potable drinking water consumption, workforce headcount, and volume in litres.
              </p>
            </div>
          </div>
          <span className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-1 text-[12px] font-bold text-primary">
            {monthDate}
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

        {/* 02 — Three Core Drinking Water Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <span className="font-mono text-[11px] font-bold text-primary">02</span>
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
              Drinking Water Consumption Data
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Month/Date */}
            <div className="space-y-2 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
              <Label className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Month/Date <span className="text-destructive">*</span>
              </Label>
              <Select value={monthDate} onValueChange={setMonthDate}>
                <SelectTrigger className="h-10 text-[13px] font-semibold bg-muted/20">
                  <SelectValue placeholder="Select Month/Date" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-[12.5px]">
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Consumption accounting cycle / date
              </p>
            </div>

            {/* 2. Number of People */}
            <div className="space-y-2 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
              <Label className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" /> Number of People <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  placeholder="120"
                  className="num h-10 text-[14px] font-bold bg-muted/20 pr-16"
                  required
                />
                <span className="absolute right-3 top-2.5 text-[11px] font-bold text-muted-foreground">
                  Persons
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Active depot staff, drivers & visitors
              </p>
            </div>

            {/* 3. QTY Litres */}
            <div className="space-y-2 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
              <Label className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5 text-primary" /> QTY Litres <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  step="any"
                  value={qtyLitres}
                  onChange={(e) => setQtyLitres(e.target.value)}
                  placeholder="3600"
                  className="num h-10 text-[14px] font-bold bg-muted/20 pr-16"
                  required
                />
                <span className="absolute right-3 top-2.5 text-[11px] font-bold text-muted-foreground">
                  Litres
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Total potable drinking water supplied / drawn
              </p>
            </div>
          </div>

          {/* Derived Real-time Consumption Card */}
          <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-4.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Derived Consumption Rate
                </span>
                <p className="text-[15px] font-bold text-foreground">
                  Per-Capita Rate:{" "}
                  <strong className="text-primary">{perCapitaRate} Litres / Person</strong>
                  <span className="text-[12px] text-muted-foreground font-normal ml-2">
                    (~{dailyPerCapita} L/Person/Day)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                Headcount: {numPeople} People
              </span>
              <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                Volume: {numLitres.toLocaleString()} L
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="h-10 text-[12.5px] px-5"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="h-10 text-[13px] px-6 font-bold gap-2 ml-auto shadow-sm"
          >
            <Save className="h-4 w-4" /> Save Drinking Water Record
          </Button>
        </div>
      </div>
    </form>
  );
}
