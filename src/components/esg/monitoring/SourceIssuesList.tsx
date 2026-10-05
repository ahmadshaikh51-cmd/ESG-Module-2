import React from 'react';
import { AlertTriangle, Info, ShieldAlert, CheckCircle2, Layers } from 'lucide-react';
import { DATA_ISSUES, PROJECTS, NON_OPERATIONAL } from '@/lib/esg-site-monitoring-adapter';
import { cn } from '@/lib/utils';

export function SourceIssuesList() {
  const noMisProjects = PROJECTS.filter((p) => !p.hasMonthlyData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Data Audit & Source Flags Register</h3>
          <p className="text-[12px] text-muted-foreground">
            Documented inconsistencies, cell comments, and data quality flags preserved from source workbook
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Issues / Inconsistencies List */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <h4 className="text-[13.5px] font-bold text-foreground">
              Documented Source Inconsistencies ({DATA_ISSUES.length})
            </h4>
          </div>

          <div className="space-y-3">
            {DATA_ISSUES.map((issue) => (
              <div
                key={issue.id}
                className={cn(
                  'rounded-xl border p-3.5 space-y-1 text-[12px] transition-colors',
                  issue.severity === 'review'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-border/50 bg-muted/20'
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

                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                      issue.severity === 'review'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {issue.severity === 'review' ? 'Needs Verification' : 'Data Note'}
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

        {/* Side Panel: No MIS & Non-Operational Projects */}
        <div className="space-y-6">
          {/* Projects with No Monthly MIS */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-[13px] font-bold text-foreground">Projects with No Monthly MIS</h4>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Classified in Category Summary but missing monthly operational files:
            </p>

            <div className="space-y-2">
              {noMisProjects.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-border/50 bg-muted/20 p-2.5 text-[12px] space-y-0.5"
                >
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>{p.name}</span>
                    <span className="text-[10.5px] font-normal text-muted-foreground">
                      Tracker: {p.trackerFleetSize}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{p.client}</div>
                  <span className="inline-block text-[10px] text-amber-600 dark:text-amber-400 italic">
                    "No monthly MIS data in source files"
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Not Yet Operational Projects */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-3">
            <h4 className="text-[13px] font-bold text-foreground">Not Yet Operational Projects</h4>
            <div className="space-y-2">
              {NON_OPERATIONAL.map((p, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/40 bg-muted/10 p-2 text-[11.5px] flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-foreground block">{p.name}</span>
                    <span className="text-[10.5px] text-muted-foreground">{p.client}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground rounded bg-muted px-1.5 py-0.5">
                    {p.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
