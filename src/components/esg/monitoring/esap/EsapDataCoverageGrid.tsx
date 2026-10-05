import React from 'react';
import { Grid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ESG_GROUP, type EsapAction } from '@/lib/esg-data';
import { getFilteredEsapActions, type EsapFilterState } from '@/lib/esg-esap-adapter';

interface EsapDataCoverageGridProps {
  allActions: EsapAction[];
  filters: EsapFilterState;
}

const SOURCES = [
  { key: 'assessment', label: 'Assessments (ESDD/ESIA)' },
  { key: 'internal-audit', label: 'Internal Audits' },
  { key: 'external-audit', label: 'External Audits' },
  { key: 'policy', label: 'Approved Policies' },
] as const;

export function EsapDataCoverageGrid({ allActions, filters }: EsapDataCoverageGridProps) {
  const actions = getFilteredEsapActions(allActions, filters);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Source Coverage & Compliance Matrix</h3>
          <p className="text-[12px] text-muted-foreground">
            Project SPVs vs Origin Sources matrix indicating action health and resolution progress
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span>100% Closed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-blue-500" />
            <span>Active Open / In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-destructive" />
            <span>Overdue Actions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-muted border border-border" />
            <span>No Actions Sourced</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated overflow-x-auto">
        <div className="min-w-[700px] space-y-3">
          {/* Header Row */}
          <div className="flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/40">
            <div className="w-56 shrink-0">Project SPV / Entity</div>
            <div className="flex flex-1 items-center gap-3">
              {SOURCES.map((s) => (
                <div key={s.key} className="flex-1 text-center truncate">
                  {s.label}
                </div>
              ))}
            </div>
            <div className="w-24 text-right shrink-0">Status Health</div>
          </div>

          {/* Rows for Entities */}
          {ESG_GROUP.entities.map((entity) => {
            const entityActions = actions.filter((a) => {
              if (a.source.kind === 'assessment' && a.source.id.includes('mbmt') && entity.id === 'spv-mbmt') return true;
              if (a.source.kind === 'assessment' && a.source.id.includes('silv') && entity.id === 'spv-silvassa') return true;
              if (a.source.kind === 'internal-audit' && entity.id === 'spv-mbmt') return true;
              if (a.source.kind === 'external-audit' && entity.id === 'spv-silvassa') return true;
              if (a.source.kind === 'policy') return true; // policy rolls up to all entities
              return false;
            });

            return (
              <div key={entity.id} className="flex items-center gap-3 text-[12px] py-1">
                {/* Project Title */}
                <div className="w-56 shrink-0 font-semibold text-foreground truncate">
                  {entity.name}
                  <span className="block text-[10.5px] font-normal text-muted-foreground">
                    {entity.short} · {entity.depots.length} depot{entity.depots.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Source Cells */}
                <div className="flex flex-1 items-center gap-3">
                  {SOURCES.map((src) => {
                    const srcActions = entityActions.filter((a) => a.source.kind === src.key);
                    const total = srcActions.length;
                    const closed = srcActions.filter((a) => a.status === 'closed').length;
                    const overdue = srcActions.filter((a) => a.status !== 'closed' && new Date(a.due) < new Date('2026-10-05')).length;

                    let bgClass = 'bg-muted/40 border border-border/40';
                    let label = 'No items';

                    if (total > 0) {
                      if (overdue > 0) {
                        bgClass = 'bg-destructive/80 text-white font-bold';
                        label = `${overdue} overdue`;
                      } else if (closed === total) {
                        bgClass = 'bg-emerald-500/80 text-white font-bold';
                        label = `${closed}/${total} closed`;
                      } else {
                        bgClass = 'bg-blue-500/80 text-white font-bold';
                        label = `${total - closed} open`;
                      }
                    }

                    return (
                      <div
                        key={src.key}
                        className={cn(
                          'h-7 flex-1 rounded-lg flex items-center justify-center text-[10.5px] transition-colors',
                          bgClass,
                        )}
                        title={`${entity.short} (${src.label}): ${label}`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>

                {/* Status Health Badge */}
                <div className="w-24 text-right shrink-0">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-semibold',
                      entityActions.some((a) => a.status !== 'closed' && new Date(a.due) < new Date('2026-10-05'))
                        ? 'bg-destructive/12 text-destructive'
                        : entityActions.every((a) => a.status === 'closed')
                        ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                        : 'bg-primary/10 text-primary',
                    )}
                  >
                    {entityActions.some((a) => a.status !== 'closed' && new Date(a.due) < new Date('2026-10-05'))
                      ? 'Overdue'
                      : entityActions.every((a) => a.status === 'closed')
                      ? 'Compliant'
                      : 'Active'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
