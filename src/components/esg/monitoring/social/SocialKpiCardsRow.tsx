import React from 'react';
import { Users, UserCheck, ShieldCheck, HeartPulse, Clock, Sparkles } from 'lucide-react';
import { SocialAggregateKpis } from '@/lib/esg-social-monitoring-adapter';

interface SocialKpiCardsRowProps {
  kpis: SocialAggregateKpis;
}

export function SocialKpiCardsRow({ kpis }: SocialKpiCardsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Passenger Ridership */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Passenger Journeys
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {kpis.totalPassengers > 1000000
                ? `${(kpis.totalPassengers / 1000000).toFixed(2)}M`
                : kpis.totalPassengers.toLocaleString()}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">commuters</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate" title={kpis.reportingNotes.passengers}>
            {kpis.reportingNotes.passengers}
          </p>
        </div>
      </div>

      {/* 2. Deployed Green Workforce & Drivers */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Green Jobs & Workforce
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {kpis.totalGreenJobs.toLocaleString()}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">personnel</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate" title={kpis.reportingNotes.workforce}>
            {kpis.totalDrivers} Drivers · {kpis.totalTechnicians} Techs
          </p>
        </div>
      </div>

      {/* 3. Driver Zero-Emission Safety Hours */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Zero-Exhaust Hours
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {kpis.totalDriverHours.toLocaleString()}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">hrs</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            Shift hours shielded from toxic diesel exhaust
          </p>
        </div>
      </div>

      {/* 4. Social Grievance SLA Resolution */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Grievance SLA %
            </span>
            <span className="inline-flex rounded bg-emerald-500/10 px-1 py-0.2 text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400">
              Resolved
            </span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <HeartPulse className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-foreground">
              {kpis.grievanceResolutionRate}%
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">closed</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {kpis.resolvedGrievances} of {kpis.totalGrievances} issues closed within target
          </p>
        </div>
      </div>

      {/* 5. Safety Compliance & Zero Fatalities */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-2 flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              OHS & EHS Compliance
            </span>
            <span className="inline-flex rounded bg-emerald-500/10 px-1 py-0.2 text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400">
              0 LTI
            </span>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[28px] font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {kpis.ppePassRate}%
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground">pass rate</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {kpis.reportingNotes.safety}
          </p>
        </div>
      </div>
    </div>
  );
}
