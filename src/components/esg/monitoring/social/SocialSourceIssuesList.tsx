import React from 'react';
import { ShieldAlert, Info, HeartPulse } from 'lucide-react';
import { SOCIAL_DATA_ISSUES } from '@/lib/esg-social-monitoring-adapter';
import { PROJECTS } from '@/lib/esg-site-monitoring-adapter';
import { cn } from '@/lib/utils';

export function SocialSourceIssuesList() {
  const noMisProjects = PROJECTS.filter((p) => !p.hasMonthlyData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Social Data Audit & Quality Flags Register</h3>
          <p className="text-[12px] text-muted-foreground">
            Documented social metadata notes, freight passenger exclusions, and driver workforce benchmarks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Issues / Inconsistencies List */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-[13.5px] font-bold text-foreground">
              Documented Social Data Audit Flags ({SOCIAL_DATA_ISSUES.length})
            </h4>
          </div>

          <div className="space-y-3">
            {SOCIAL_DATA_ISSUES.map((issue) => (
              <div
                key={issue.id}
                className={cn(
                  'rounded-xl border p-3.5 space-y-1 text-[12px] transition-colors border-border/50 bg-muted/20'
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span>{issue.projectId}</span>
                    {issue.month && (
                      <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10.5px] text-muted-foreground">
                        {issue.month}
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {issue.category} Note
                  </span>
                </div>

                <p className="text-foreground">{issue.message}</p>
                <span className="text-[10.5px] text-muted-foreground block font-mono">
                  Source Ref: {issue.sourceRef}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel: Freight vs Transit & Social Benchmarks */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-[13px] font-bold text-foreground">Social Governance Benchmarks</h4>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Methodology applied to derive workforce & safety metrics:
            </p>

            <div className="space-y-2 text-[12px]">
              <div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1">
                <span className="font-bold text-foreground block">E-Bus Driver Ratio: 2.0 Drivers/Bus</span>
                <p className="text-[11px] text-muted-foreground">
                  Reflects double-shift municipal bus schedules (6 AM - 10 PM) across MBMT, UMC, VECV, NMC.
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1">
                <span className="font-bold text-foreground block">E-Truck Driver Ratio: 1.8 Drivers/Truck</span>
                <p className="text-[11px] text-muted-foreground">
                  Heavy industrial haulage ratio across Ultratech, Star Cement, and JM Baxi port operations.
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1">
                <span className="font-bold text-foreground block">Safety Hours Calculation</span>
                <p className="text-[11px] text-muted-foreground">
                  Derived from operational distance / 25 km/h depot transit speed average.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
