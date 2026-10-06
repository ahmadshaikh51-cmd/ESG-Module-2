import React, { useState, useEffect } from 'react';
import { Zap, Route, Gauge, Calculator, RefreshCw, Info, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnergyEfficiencyCardProps {
  initialEnergyKwh?: number;
  initialDistanceKm?: number;
  title?: string;
  subtitle?: string;
  domainTag?: string;
  className?: string;
}

export function EnergyEfficiencyCard({
  initialEnergyKwh = 7429905,
  initialDistanceKm = 5762461,
  title = "Energy Efficiency",
  subtitle = "Monitor & Review Metadata Metric",
  domainTag = "Site Monitoring Metadata",
  className,
}: EnergyEfficiencyCardProps) {
  const [energyUsed, setEnergyUsed] = useState<string>(initialEnergyKwh.toString());
  const [distanceKm, setDistanceKm] = useState<string>(initialDistanceKm.toString());

  // Update when initial values change (e.g. filter changes)
  useEffect(() => {
    setEnergyUsed(initialEnergyKwh.toString());
  }, [initialEnergyKwh]);

  useEffect(() => {
    setDistanceKm(initialDistanceKm.toString());
  }, [initialDistanceKm]);

  // Parse numeric values
  const energyNum = parseFloat(energyUsed.replace(/,/g, '')) || 0;
  const distanceNum = parseFloat(distanceKm.replace(/,/g, '')) || 0;

  // Exact Formula: Energy Consumption (kWh/km) = Energy Used (kWh) ÷ Distance Travelled (km)
  const calculatedConsumption = distanceNum > 0 ? (energyNum / distanceNum).toFixed(2) : "0.00";

  const handleReset = () => {
    setEnergyUsed(initialEnergyKwh.toString());
    setDistanceKm(initialDistanceKm.toString());
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-primary/20 bg-card p-5 md:p-6 shadow-elevated space-y-5 transition-all dark:border-primary/25",
        className
      )}
    >
      {/* Card Header & Metadata Info */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/50 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="text-[16px] font-bold tracking-tight text-foreground">
              {title}
            </h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10.5px] font-bold text-primary">
              {domainTag}
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
              Monitor & Review
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            {subtitle} — Interactive performance calculation and metric tracker across fleet operations.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="h-8 gap-1.5 text-[11.5px] font-medium"
        >
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          Sync Live Data
        </Button>
      </div>

      {/* Formula Definition Banner */}
      <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-3.5 flex flex-wrap items-center justify-between gap-3 text-[12px]">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-foreground">Exact Formula:</span>
          <code className="rounded bg-background/80 px-2 py-0.5 font-mono text-[11.5px] font-bold text-primary border border-primary/20">
            Energy Consumption (kWh/km) = Energy Used (kWh) ÷ Distance Travelled (km)
          </code>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
          <Info className="h-3.5 w-3.5 text-primary" />
          <span>Automatic real-time calculation</span>
        </div>
      </div>

      {/* Inputs & Calculation Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Input 1: Energy Used (kWh) */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
          <label htmlFor="energy-used-input" className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Energy Used (kWh)
            </span>
            <span className="text-[10px] font-normal text-muted-foreground">(Input)</span>
          </label>
          <div className="relative">
            <Input
              id="energy-used-input"
              type="number"
              min="0"
              step="any"
              value={energyUsed}
              onChange={(e) => setEnergyUsed(e.target.value)}
              className="h-10 text-[15px] font-bold font-mono pl-3 pr-12 text-foreground bg-background border-border/80 focus-visible:ring-primary"
              placeholder="e.g. 7429905"
            />
            <span className="absolute right-3 top-2.5 text-[12px] font-semibold text-muted-foreground pointer-events-none">
              kWh
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Total energy consumed</span>
            <span className="font-mono text-[10.5px]">{energyNum.toLocaleString()} kWh</span>
          </p>
        </div>

        {/* Input 2: Distance Travelled (km) */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
          <label htmlFor="distance-travelled-input" className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Route className="h-3.5 w-3.5 text-primary" />
              Distance Travelled (km)
            </span>
            <span className="text-[10px] font-normal text-muted-foreground">(Input)</span>
          </label>
          <div className="relative">
            <Input
              id="distance-travelled-input"
              type="number"
              min="0"
              step="any"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              className="h-10 text-[15px] font-bold font-mono pl-3 pr-12 text-foreground bg-background border-border/80 focus-visible:ring-primary"
              placeholder="e.g. 5762461"
            />
            <span className="absolute right-3 top-2.5 text-[12px] font-semibold text-muted-foreground pointer-events-none">
              km
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Total fleet distance</span>
            <span className="font-mono text-[10.5px]">{distanceNum.toLocaleString()} km</span>
          </p>
        </div>

        {/* Output: Automatically Calculated Energy Consumption (kWh/km) */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-primary">
            <span className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-primary" />
              Energy Consumption
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9.5px] font-extrabold text-primary">
              Auto-Calculated
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="num text-[30px] font-black tracking-tight text-primary">
                {calculatedConsumption}
              </span>
              <span className="text-[15px] font-bold text-primary/80">kWh/km</span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
              {energyNum.toLocaleString()} kWh ÷ {distanceNum.toLocaleString()} km
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Operational Efficiency Status: Optimal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
