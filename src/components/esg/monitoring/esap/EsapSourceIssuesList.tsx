import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { esapSourceLabel, esapState, personById, type EsapAction } from '@/lib/esg-data';

interface EsapSourceIssuesListProps {
  allActions: EsapAction[];
  onSelectAction: (action: EsapAction) => void;
}

export function EsapSourceIssuesList({ allActions, onSelectAction }: EsapSourceIssuesListProps) {
  const overdueActions = allActions.filter((a) => a.status !== 'closed' && esapState(a) === 'overdue');
  const majorActions = allActions.filter((a) => a.severity === 'major');
  const upcomingPolicyActions = allActions.filter((a) => a.source.kind === 'policy' && a.status !== 'closed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Critical Escalations & Priority Action Flags</h3>
          <p className="text-[12px] text-muted-foreground">
            High-risk overdue corrective actions, major NC items, and pending policy compliance rollouts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Actions List (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h4 className="text-[13.5px] font-bold text-foreground">
                Overdue Corrective Actions ({overdueActions.length})
              </h4>
            </div>
            <span className="text-[11px] text-muted-foreground">Requires immediate escalation</span>
          </div>

          <div className="space-y-3">
            {overdueActions.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-[12px] text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                No overdue actions! All target dates are currently on track.
              </div>
            ) : (
              overdueActions.map((action) => {
                const src = esapSourceLabel(action.source);
                const owner = personById(action.ownerId);

                return (
                  <div
                    key={action.id}
                    onClick={() => onSelectAction(action)}
                    className="rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 space-y-1.5 text-[12px] cursor-pointer hover:bg-destructive/10 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <span>{action.action}</span>
                        {action.ncRef && (
                          <span className="rounded bg-destructive/15 px-1.5 py-0.2 text-[10px] font-bold text-destructive">
                            {action.ncRef}
                          </span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                        Target Passed: {action.due}
                      </span>
                    </div>

                    <p className="text-muted-foreground">{action.finding}</p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span>Source: {src.label}</span>
                      <span className="font-semibold text-foreground">Owner: {owner?.name ?? action.ownerId}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Side Panel: Major NCs & Pending Policies */}
        <div className="space-y-6">
          {/* Major NC Items */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <h4 className="text-[13px] font-bold text-foreground">Major NC Sourced Actions</h4>
            </div>
            <p className="text-[11px] text-muted-foreground">High impact non-conformances across audits</p>

            <div className="space-y-2">
              {majorActions.map((a) => (
                <div
                  key={a.id}
                  onClick={() => onSelectAction(a)}
                  className="rounded-xl border border-border/50 bg-muted/20 p-2.5 text-[12px] space-y-0.5 cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span className="truncate max-w-[180px]">{a.action}</span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                      {a.ncRef || 'Major'}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{a.finding}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Policy Rollouts */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h4 className="text-[13px] font-bold text-foreground">Policy Rollout Actions</h4>
            </div>
            <div className="space-y-2">
              {upcomingPolicyActions.map((a) => (
                <div
                  key={a.id}
                  onClick={() => onSelectAction(a)}
                  className="rounded-xl border border-border/40 bg-muted/10 p-2 text-[11.5px] flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <div>
                    <span className="font-semibold text-foreground block truncate max-w-[160px]">{a.action}</span>
                    <span className="text-[10.5px] text-muted-foreground">Due {a.due}</span>
                  </div>
                  <span className="text-[10px] font-mono rounded bg-primary/10 text-primary px-1.5 py-0.5">
                    Policy
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
