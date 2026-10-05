import React, { useState } from 'react';
import { Route, Truck, Zap, Fuel, Leaf, Info } from 'lucide-react';
import { AggregateKpis } from '@/lib/esg-site-monitoring-adapter';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KpiCardsRowProps {
  kpis: AggregateKpis;
  energyUnit: 'kWh' | 'MWh';
  onEnergyUnitToggle: (unit: 'kWh' | 'MWh') => void;
}

export function KpiCardsRow({ kpis, energyUnit, onEnergyUnitToggle }: KpiCardsRowProps) {
  const energyVal = energyUnit === 'kWh' ? kpis.totalEnergyKwh : kpis.totalEnergyKwh / 1000;
  const energyLabel = energyUnit === 'kWh' ? 'kWh' : 'MWh';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Distance Travelled */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Distance Travelled
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Route className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {Math.round(kpis.totalDistanceKm).toLocaleString()}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">km</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {kpis.reportingNotes.distance}
          </p>
        </div>
      </div>

      {/* 2. Active Vehicles */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Active Vehicles
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Truck className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {kpis.activeVehicles}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">vehicles</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {kpis.reportingNotes.vehicles}
          </p>
        </div>
      </div>

      {/* 3. Electricity Consumed */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Electricity Consumed
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Unit Toggle */}
            <button
              type="button"
              onClick={() => onEnergyUnitToggle(energyUnit === 'kWh' ? 'MWh' : 'kWh')}
              className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
              title="Toggle unit between kWh and MWh"
            >
              {energyUnit} (switch)
            </button>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {Math.round(energyVal).toLocaleString()}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">{energyLabel}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate" title={kpis.reportingNotes.energy}>
            {kpis.reportingNotes.energy}
          </p>
        </div>
      </div>

      {/* 4. Estimated Diesel Saved */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Est. Diesel Saved
            </span>
            <span className="inline-flex rounded bg-muted/80 px-1 py-0.2 text-[9.5px] font-semibold text-muted-foreground">
              Est.
            </span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Fuel className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {Math.round(kpis.totalDieselSavedL).toLocaleString()}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">Litres</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Calculated as distance / 3</p>
        </div>
      </div>

      {/* 5. Estimated CO2 Avoided */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Est. CO2 Avoided
            </span>
            <span className="inline-flex rounded bg-emerald-500/10 px-1 py-0.2 text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400">
              Est.
            </span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Leaf className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {Math.round(kpis.totalCo2t).toLocaleString()}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">t CO2e</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Calculated as diesel x 2.64 kg/L</p>
        </div>
      </div>
    </div>
  );
}
