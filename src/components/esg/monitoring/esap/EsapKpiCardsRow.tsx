import React from 'react';
import { FileSearch, Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { type EsapKpiStats } from '@/lib/esg-esap-adapter';

interface EsapKpiCardsRowProps {
  kpis: EsapKpiStats;
  onFilterClick?: (status: 'all' | 'open' | 'overdue' | 'closed') => void;
}

export function EsapKpiCardsRow({ kpis, onFilterClick }: EsapKpiCardsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total ESAP Actions */}
      <button
        type="button"
        onClick={() => onFilterClick?.('all')}
        className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between text-left transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <div className="flex items-center justify-between text-muted-foreground w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total ESAP Actions
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileSearch className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {kpis.totalActions}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">actions</span>
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-1 truncate">
            {kpis.closureRatePct}% overall closure rate
          </p>
        </div>
      </button>

      {/* 2. Open Actions */}
      <button
        type="button"
        onClick={() => onFilterClick?.('open')}
        className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between text-left transition-all hover:border-blue-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <div className="flex items-center justify-between text-muted-foreground w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Open & In Progress
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {kpis.openActions + kpis.inProgressActions}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">active</span>
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-1 truncate">
            {kpis.inProgressActions} actively in progress
          </p>
        </div>
      </button>

      {/* 3. Overdue Actions */}
      <button
        type="button"
        onClick={() => onFilterClick?.('overdue')}
        className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between text-left transition-all hover:border-destructive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <div className="flex items-center justify-between text-muted-foreground w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-destructive">
            Overdue Actions
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-destructive">
              {kpis.overdueActions}
            </span>
            <span className="text-[13px] font-semibold text-destructive/80">due past</span>
          </div>
          <p className="text-[11.5px] text-destructive/80 mt-1 truncate font-medium">
            Action required immediately
          </p>
        </div>
      </button>

      {/* 4. Closed Actions */}
      <button
        type="button"
        onClick={() => onFilterClick?.('closed')}
        className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between text-left transition-all hover:border-emerald-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <div className="flex items-center justify-between text-muted-foreground w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Closed Actions
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {kpis.closedActions}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">closed</span>
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-1 truncate">
            {kpis.onTimeClosureRatePct}% closed on time
          </p>
        </div>
      </button>

      {/* 5. Major NC Actions */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Major NC Actions
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {kpis.majorCount}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">major</span>
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-1 truncate">
            {kpis.minorCount} minor · {kpis.observationCount} observations
          </p>
        </div>
      </div>
    </div>
  );
}
