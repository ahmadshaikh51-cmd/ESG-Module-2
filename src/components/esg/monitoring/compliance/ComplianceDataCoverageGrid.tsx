import React from 'react';
import { cn } from '@/lib/utils';
import { ESG_GROUP, recordState, TYPE_MASTER, type ComplianceRecord } from '@/lib/esg-data';
import { getFilteredComplianceRecords, type ComplianceFilterState } from '@/lib/esg-compliance-adapter';

interface ComplianceDataCoverageGridProps {
  allRecords: ComplianceRecord[];
  filters: ComplianceFilterState;
}

export function ComplianceDataCoverageGrid({ allRecords, filters }: ComplianceDataCoverageGridProps) {
  const records = getFilteredComplianceRecords(allRecords, filters);

  // Take main statutory type keys
  const mainTypes = TYPE_MASTER.slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Statutory Permits & Compliance Grid Matrix</h3>
          <p className="text-[12px] text-muted-foreground">
            Project SPVs vs Statutory Item Types matrix indicating compliance health and expiry status
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span>Valid Permit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-amber-500" />
            <span>Expiring Soon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-destructive" />
            <span>Overdue Item</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-muted border border-border" />
            <span>Not Applicable / Pending</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated overflow-x-auto">
        <div className="min-w-[750px] space-y-3">
          {/* Header Row */}
          <div className="flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/40">
            <div className="w-56 shrink-0">Project SPV / Entity</div>
            <div className="flex flex-1 items-center gap-2">
              {mainTypes.map((t) => (
                <div key={t.key} className="flex-1 text-center truncate" title={t.label}>
                  {t.label.split(' ')[0]}
                </div>
              ))}
            </div>
            <div className="w-24 text-right shrink-0">Health Status</div>
          </div>

          {/* Grid Rows for Entities */}
          {ESG_GROUP.entities.map((entity) => {
            const entityRecords = records.filter((r) => r.entityId === entity.id);

            return (
              <div key={entity.id} className="flex items-center gap-3 text-[12px] py-1">
                {/* Project Title */}
                <div className="w-56 shrink-0 font-semibold text-foreground truncate">
                  {entity.name}
                  <span className="block text-[10.5px] font-normal text-muted-foreground">
                    {entity.short} · {entity.depots.length} depot{entity.depots.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Type Cells */}
                <div className="flex flex-1 items-center gap-2">
                  {mainTypes.map((t) => {
                    const matched = entityRecords.find((r) => r.typeKey === t.key);
                    const st = matched ? recordState(matched) : null;

                    let bgClass = 'bg-muted/40 border border-border/40';
                    let label = 'N/A';

                    if (matched && st) {
                      if (st === 'overdue') {
                        bgClass = 'bg-destructive/80 text-white font-bold';
                        label = 'Overdue';
                      } else if (st === 'expiring') {
                        bgClass = 'bg-amber-500/80 text-white font-bold';
                        label = 'Expiring';
                      } else {
                        bgClass = 'bg-emerald-500/80 text-white font-bold';
                        label = 'Valid';
                      }
                    }

                    return (
                      <div
                        key={t.key}
                        className={cn(
                          'h-7 flex-1 rounded-lg flex items-center justify-center text-[10.5px] transition-colors',
                          bgClass,
                        )}
                        title={`${entity.short} (${t.label}): ${label}`}
                      >
                        {label}
                      </div>
                    );
                  })}
                </div>

                {/* Health Status Badge */}
                <div className="w-24 text-right shrink-0">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-semibold',
                      entityRecords.some((r) => recordState(r) === 'overdue')
                        ? 'bg-destructive/12 text-destructive'
                        : entityRecords.some((r) => recordState(r) === 'expiring')
                        ? 'bg-amber-500/12 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400',
                    )}
                  >
                    {entityRecords.some((r) => recordState(r) === 'overdue')
                      ? 'Overdue'
                      : entityRecords.some((r) => recordState(r) === 'expiring')
                      ? 'Action Due'
                      : 'Healthy'}
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
