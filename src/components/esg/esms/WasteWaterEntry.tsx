import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Droplets,
  Layers,
  MapPin,
  Save,
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
import { ESG_GROUP, type WasteWaterRecord } from "@/lib/esg-data";

interface WasteWaterEntryProps {
  onSaveSuccess: () => void;
  onCancel?: () => void;
  onSave: (record: Omit<WasteWaterRecord, "id" | "createdAt" | "updatedAt">) => void;
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

export function WasteWaterEntry({
  onSaveSuccess,
  onCancel,
  onSave,
  initialEntityId = "mbmt",
  initialDepotId = "kashimira",
}: WasteWaterEntryProps) {
  // Form State
  const [entityId, setEntityId] = useState<string>(initialEntityId);
  const [depotId, setDepotId] = useState<string>(initialDepotId);
  const [monthDate, setMonthDate] = useState<string>("Aug 2026");
  const [qtyLitres, setQtyLitres] = useState<string>("12500");
  const [sludgeQty, setSludgeQty] = useState<string>("350");

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

  // Derived metrics
  const numLitres = Number(qtyLitres) || 0;
  const numSludge = Number(sludgeQty) || 0;
  const sludgeRatio =
    numLitres > 0 ? (numSludge / (numLitres / 1000)).toFixed(2) : "0.00";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const litres = Number(qtyLitres);
    const sludge = Number(sludgeQty);

    if (!monthDate) {
      toast.error("Please select a Month / Date.");
      return;
    }

    if (!litres || litres <= 0) {
      toast.error("Please enter valid Waste Water QTY in Litres.");
      return;
    }

    if (sludge < 0 || Number.isNaN(sludge)) {
      toast.error("Please enter a valid Sludge quantity.");
      return;
    }

    onSave({
      entityId,
      depotId,
      entityName: currentEntity.name,
      depotName: currentDepot.name,
      monthDate,
      qtyLitres: litres,
      sludgeQty: sludge,
    });

    toast.success("Waste water record saved successfully", {
      description: `${monthDate} log saved for ${currentDepot.name} (${litres.toLocaleString()} L effluent, ${sludge.toLocaleString()} Kg sludge).`,
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
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-foreground">
                Waste Water & Sludge Data Entry
              </h3>
              <p className="text-[12.5px] text-muted-foreground">
                Record depot wash-bay effluent volume, treatment recycling, and dried sludge output.
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

        {/* 02 — Core Waste Water Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <span className="font-mono text-[11px] font-bold text-primary">02</span>
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
              Waste Water & Effluent Parameters
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
                Effluent treatment cycle / date
              </p>
            </div>

            {/* 2. QTY Litres */}
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
                  placeholder="12500"
                  className="num h-10 text-[14px] font-bold bg-muted/20 pr-16"
                  required
                />
                <span className="absolute right-3 top-2.5 text-[11px] font-bold text-muted-foreground">
                  Litres
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Wash-bay effluent generated or treated
              </p>
            </div>

            {/* 3. Sludge (Weight/Volume) */}
            <div className="space-y-2 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
              <Label className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" /> Sludge (Weight/Volume) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={sludgeQty}
                  onChange={(e) => setSludgeQty(e.target.value)}
                  placeholder="350"
                  className="num h-10 text-[14px] font-bold bg-muted/20 pr-16"
                  required
                />
                <span className="absolute right-3 top-2.5 text-[11px] font-bold text-muted-foreground">
                  Kg / L
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Dry sludge cake cleared from sump / press
              </p>
            </div>
          </div>

          {/* Derived Real-time Summary Card */}
          <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-4.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Treatment & Sludge Ratio
                </span>
                <p className="text-[15px] font-bold text-foreground">
                  Sludge Intensity:{" "}
                  <strong className="text-primary">{sludgeRatio} Kg / kL effluent</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                Effluent: {numLitres.toLocaleString()} Litres
              </span>
              <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                Sludge: {numSludge.toLocaleString()} Kg / L
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
            <Save className="h-4 w-4" /> Save Waste Water Record
          </Button>
        </div>
      </div>
    </form>
  );
}
