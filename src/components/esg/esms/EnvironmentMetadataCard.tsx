import React from "react";
import {
  Activity,
  AlertCircle,
  BatteryCharging,
  CheckCircle2,
  Clock,
  Droplets,
  Factory,
  FileCheck,
  FileSpreadsheet,
  Flame,
  Gauge,
  HardHat,
  Info,
  Layers,
  Recycle,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  Zap,
} from "lucide-react";
import {
  getEnvironmentMetadata,
  monitoringAreaByKey,
  type MonitoringAreaKey,
  type SiteEnvironmentMetadata,
} from "@/lib/esg-data";
import { cn } from "@/lib/utils";
import { ProvenanceChip } from "../primitives";

interface EnvironmentMetadataCardProps {
  entityId: string;
  depotId: string;
  period: string;
  area: MonitoringAreaKey;
  className?: string;
}

export function EnvironmentMetadataCard({
  entityId,
  depotId,
  period,
  area,
  className,
}: EnvironmentMetadataCardProps) {
  const meta: SiteEnvironmentMetadata = getEnvironmentMetadata(entityId, depotId, period);
  const areaMeta = monitoringAreaByKey(area);

  return (
    <div
      className={cn(
        "rounded-xl border border-primary/20 bg-primary/[0.02] p-5 text-foreground transition-all dark:border-primary/25 dark:bg-primary/[0.04] space-y-4",
        className,
      )}
    >
      {/* Header with area badge and provenance */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-foreground">
                Environment Metadata Reference
              </span>
              <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10.5px] font-bold text-primary">
                {areaMeta?.badgeText || "Active Baseline"}
              </span>
            </div>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">
              Live operational records for {period} — use as context to verify physical conditions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ProvenanceChip
            prov={{
              source: "Environment Telemetry & Registers",
              fetchedAt: "2026-07-15T09:00:00Z",
            }}
          />
        </div>
      </div>

      {/* Content depending on selected monitoring area */}
      <div>
        {area === "energy_vehicle" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Vehicle Count
                </span>
                <p className="num mt-1 text-[18px] font-bold text-foreground">
                  {meta.energyVehicle.vehicleCount}{" "}
                  <span className="text-[12px] font-normal text-muted-foreground">Buses</span>
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Fleet Distance
                </span>
                <p className="num mt-1 text-[18px] font-bold text-foreground">
                  {meta.energyVehicle.runKm.toLocaleString()}{" "}
                  <span className="text-[12px] font-normal text-muted-foreground">km</span>
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Charging Energy
                </span>
                <p className="num mt-1 text-[18px] font-bold text-primary">
                  {meta.energyVehicle.energyKwh.toLocaleString()}{" "}
                  <span className="text-[12px] font-normal text-muted-foreground">kWh</span>
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Energy Intensity
                </span>
                <p className="num mt-1 text-[18px] font-bold text-foreground">
                  {meta.energyVehicle.energyIntensityKwhPerKm}{" "}
                  <span className="text-[12px] font-normal text-muted-foreground">kWh/km</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-[12px]">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>
                  Rooftop Solar Generation:{" "}
                  <strong className="font-semibold text-foreground">
                    {meta.energyVehicle.solarGeneratedKwh.toLocaleString()} kWh
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>
                  DG Backup Diesel:{" "}
                  <strong className="font-semibold text-foreground">
                    {meta.energyVehicle.dgDieselLitres} Litres
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-success font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>{meta.energyVehicle.reportingStatus}</span>
              </div>
            </div>
          </div>
        )}

        {area === "hazardous_waste" && (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-xs">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2.5 font-semibold">Hazardous Waste Stream</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Recorded Qty</th>
                    <th className="px-4 py-2.5 font-semibold">Frequency</th>
                    <th className="px-4 py-2.5 font-semibold">Storage Location</th>
                    <th className="px-4 py-2.5 font-semibold">Recycler / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {meta.hazardousWaste.map((hw, idx) => (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-2 font-medium text-foreground">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          {hw.type}
                        </span>
                      </td>
                      <td className="num px-4 py-2 text-right font-bold text-foreground">
                        {hw.quantity} {hw.unit}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{hw.frequency}</td>
                      <td className="px-4 py-2 text-muted-foreground">{hw.storageLocation}</td>
                      <td className="px-4 py-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-medium",
                            hw.disposalStatus === "Dispatched to Recycler"
                              ? "bg-success/10 text-success border border-success/20"
                              : "bg-warning/10 text-warning border border-warning/20",
                          )}
                        >
                          {hw.disposalStatus}
                          {hw.vendorRecycler && ` · ${hw.vendorRecycler}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              💡 <strong>Field Check:</strong> Inspect bunding wall integrity, secondary spill
              containment pallets, Form 9 labeling, and fire extinguisher readiness in the hazardous
              waste storage shed.
            </p>
          </div>
        )}

        {area === "non_hazardous_waste" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Dry Waste */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.03] p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-blue-500/20">
                  <span className="text-[11.5px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Recycle className="h-4 w-4" /> Dry Recyclables
                  </span>
                  <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10.5px] font-bold text-blue-600 dark:text-blue-400">
                    Blue Bin
                  </span>
                </div>
                <div className="space-y-2 text-[12px]">
                  {meta.nonHazardousWaste
                    .filter((w) => w.category === "Dry")
                    .map((w, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between border-b border-border/30 pb-1.5 last:border-0"
                      >
                        <span className="text-muted-foreground truncate">{w.type}</span>
                        <span className="num font-bold text-foreground ml-2">
                          {w.quantity} {w.unit}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Wet Waste */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-500/20">
                  <span className="text-[11.5px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Trash2 className="h-4 w-4" /> Wet Organic Waste
                  </span>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400">
                    Green Bin
                  </span>
                </div>
                <div className="space-y-2 text-[12px]">
                  {meta.nonHazardousWaste
                    .filter((w) => w.category === "Wet")
                    .map((w, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between border-b border-border/30 pb-1.5 last:border-0"
                      >
                        <span className="text-muted-foreground truncate">{w.type}</span>
                        <span className="num font-bold text-foreground ml-2">
                          {w.quantity} {w.unit}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Domestic Haz */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
                  <span className="text-[11.5px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Domestic Haz
                  </span>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10.5px] font-bold text-amber-600 dark:text-amber-400">
                    Red Box
                  </span>
                </div>
                <div className="space-y-2 text-[12px]">
                  {meta.nonHazardousWaste
                    .filter((w) => w.category === "Domestic Hazardous")
                    .map((w, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between border-b border-border/30 pb-1.5 last:border-0"
                      >
                        <span className="text-muted-foreground truncate">{w.type}</span>
                        <span className="num font-bold text-foreground ml-2">
                          {w.quantity} {w.unit}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {area === "haz_consumption" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {meta.consumption.hazardousMaterials.map((mat, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/60 bg-card p-3.5 flex items-center justify-between shadow-xs"
                >
                  <div className="space-y-0.5">
                    <span className="text-[12.5px] font-bold text-foreground">{mat.name}</span>
                    <p className="text-[11px] text-muted-foreground">Storage: {mat.storage}</p>
                  </div>
                  <div className="text-right">
                    <span className="num text-[16px] font-bold text-primary">{mat.quantity}</span>
                    <span className="text-[11.5px] text-muted-foreground ml-1">{mat.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {area === "drinking_water" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  RO Water Consumed
                </span>
                <p className="num mt-1 text-[18px] font-bold text-primary">
                  {meta.consumption.drinkingWaterLitres.toLocaleString()}{" "}
                  <span className="text-[12px] font-normal text-muted-foreground">Litres</span>
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tested TDS Level
                </span>
                <p className="num mt-1 text-[18px] font-bold text-success">
                  {meta.consumption.tdsPpm}{" "}
                  <span className="text-[12px] font-normal text-muted-foreground">ppm</span>
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-3.5 col-span-2 shadow-xs">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Water Quality & Purification
                </span>
                <p className="mt-1 text-[13px] font-semibold text-foreground truncate">
                  {meta.consumption.waterSource}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/25 bg-success/[0.04] px-4 py-3 text-[12px]">
              <span className="inline-flex items-center gap-2 font-semibold text-success">
                <ShieldCheck className="h-4 w-4" /> {meta.consumption.potabilityStatus}
              </span>
              <span className="text-muted-foreground">
                Last Filter Replacement:{" "}
                <strong className="font-semibold text-foreground">
                  {meta.consumption.lastFilterChangeDate}
                </strong>
              </span>
            </div>
          </div>
        )}

        {area === "wastewater" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Effluent Treated
                </span>
                <p className="num mt-1 text-[18px] font-bold text-foreground">
                  {meta.wastewaterDisposal.effluentTreatedKL}{" "}
                  <span className="text-[12px] font-normal text-muted-foreground">KL</span>
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Treated pH
                </span>
                <p className="num mt-1 text-[18px] font-bold text-success">
                  {meta.wastewaterDisposal.labPh}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  BOD Level
                </span>
                <p className="num mt-1 text-[18px] font-bold text-success">
                  {meta.wastewaterDisposal.labBodMgL}{" "}
                  <span className="text-[12px] font-normal text-muted-foreground">mg/L</span>
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  COD Level
                </span>
                <p className="num mt-1 text-[18px] font-bold text-success">
                  {meta.wastewaterDisposal.labCodMgL}{" "}
                  <span className="text-[12px] font-normal text-muted-foreground">mg/L</span>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-[12px] flex flex-wrap items-center justify-between gap-3">
              <span>
                Facility:{" "}
                <strong className="font-semibold text-foreground">
                  {meta.wastewaterDisposal.treatmentFacility}
                </strong>
              </span>
              <span className="text-success font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> {meta.wastewaterDisposal.dischargeMode}
              </span>
            </div>
          </div>
        )}

        {area === "waste_disposal" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3 shadow-xs text-[12.5px]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">Last Recycler Consignment</span>
                </div>
                <span className="rounded-md border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  Manifest: {meta.wastewaterDisposal.manifestNumber}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Dispatch Date</span>
                  <strong className="font-semibold text-foreground mt-0.5 block">
                    {meta.wastewaterDisposal.lastRecyclerDispatchDate}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">
                    Authorized Transporter
                  </span>
                  <strong className="font-semibold text-foreground truncate mt-0.5 block">
                    {meta.wastewaterDisposal.transporterName}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">CHWTSDF Receiver</span>
                  <strong className="font-semibold text-foreground truncate mt-0.5 block">
                    {meta.wastewaterDisposal.authorizedReceiverName}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {(area === "housekeeping" || area === "other") && (
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2 text-[12.5px] shadow-xs">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <HardHat className="h-4 w-4 text-primary" />
              <span>Depot Environmental Baseline Checklist</span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Verify charging bay housekeeping, oil spill containment kits (absorbent pads & booms),
              stormwater drainage grills, battery servicing ventilation, and emergency eyewash
              stations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
