import React from 'react';
import { FileBadge, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { type ComplianceKpiStats } from '@/lib/esg-compliance-adapter';

interface ComplianceKpiCardsRowProps {
  kpis: ComplianceKpiStats;
  onFilterClick?: (status: 'all' | 'valid' | 'expiring' | 'overdue') => void;
}

export function ComplianceKpiCardsRow({ kpis, onFilterClick }: ComplianceKpiCardsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Compliance Items */}
      <button
        type="button"
        onClick={() => onFilterClick?.('all')}
        className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between text-left transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 cursor-pointer"
      >
        <div className="flex items-center justify-between text-muted-foreground w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Compliance Stock
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileBadge className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {kpis.totalRecords}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">records</span>
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-1 truncate">
            {kpis.permitsCount} permits · {kpis.siteComplianceCount} site items
          </p>
        </div>
      </button>

      {/* 2. Valid Stock */}
      <button
        type="button"
        onClick={() => onFilterClick?.('valid')}
        className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between text-left transition-all hover:border-emerald-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 cursor-pointer"
      >
        <div className="flex items-center justify-between text-muted-foreground w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Valid Stock
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {kpis.validCount}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">valid</span>
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-1 truncate">
            {kpis.validPct}% compliance health score
          </p>
        </div>
      </button>

      {/* 3. Expiring Soon */}
      <button
        type="button"
        onClick={() => onFilterClick?.('expiring')}
        className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between text-left transition-all hover:border-amber-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 cursor-pointer"
      >
        <div className="flex items-center justify-between text-muted-foreground w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Expiring Soon
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {kpis.expiringCount}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">expiring</span>
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-1 truncate">
            Inside lead window (30-90 days)
          </p>
        </div>
      </button>

      {/* 4. Overdue Items */}
      <button
        type="button"
        onClick={() => onFilterClick?.('overdue')}
        className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between text-left transition-all hover:border-destructive/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 cursor-pointer"
      >
        <div className="flex items-center justify-between text-muted-foreground w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-destructive">
            Overdue Items
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-destructive">
              {kpis.overdueCount}
            </span>
            <span className="text-[13px] font-semibold text-destructive/80">overdue</span>
          </div>
          <p className="text-[11.5px] text-destructive/80 mt-1 truncate font-medium">
            Immediate remediation required
          </p>
        </div>
      </button>

      {/* 5. Renewals In Progress */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground w-full">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Renewals In Progress
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <RefreshCw className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {kpis.renewalsInitiatedCount}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">initiated</span>
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-1 truncate">
            Filing active with regulators
          </p>
        </div>
      </div>
    </div>
  );
}
