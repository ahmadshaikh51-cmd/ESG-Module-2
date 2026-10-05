import React from 'react';
import { Grid, Info } from 'lucide-react';
import {
  getCoverageGridData,
  FilterState,
  ALL_MONTHS,
  isMonthInFilterRange,
} from '@/lib/esg-site-monitoring-adapter';
import { cn } from '@/lib/utils';

interface DataCoverageGridProps {
  filters: FilterState;
}

export function DataCoverageGrid({ filters }: DataCoverageGridProps) {
  const coverageData = getCoverageGridData(filters);
  const months = ALL_MONTHS.filter((m) => isMonthInFilterRange(m, filters));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Data Coverage & Completeness Grid</h3>
          <p className="text-[12px] text-muted-foreground">
            Monthly reporting matrix across projects indicating reported, assumed, and projected records
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span>Reported Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-amber-500" />
            <span>Pre-metering Assumed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-blue-500 border border-dashed border-blue-300" />
            <span>Extrapolated / Projected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-muted border border-border" />
            <span>Missing Data</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-muted/40 border border-border opacity-50" />
            <span>No Monthly MIS</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated overflow-x-auto">
        <div className="min-w-[800px] space-y-3">
          {/* Header Row: Month Names */}
          <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border/40">
            <div className="w-48 shrink-0">Project / Entity</div>
            <div className="flex flex-1 items-center gap-1 overflow-hidden">
              {months.map((m) => (
                <div key={m} className="flex-1 text-center truncate" title={m}>
                  {m.slice(2)}
                </div>
              ))}
            </div>
            <div className="w-28 text-right shrink-0">Latest Report</div>
          </div>

          {/* Grid Rows */}
          {coverageData.map((row) => (
            <div key={row.project.id} className="flex items-center gap-2 text-[12px]">
              {/* Project Title */}
              <div className="w-48 shrink-0 font-semibold text-foreground truncate">
                {row.project.name}
                <span className="block text-[10px] font-normal text-muted-foreground truncate">
                  {row.project.client}
                </span>
              </div>

              {/* Month Cells */}
              <div className="flex flex-1 items-center gap-1">
                {row.months.map((cell) => (
                  <div
                    key={cell.month}
                    className={cn(
                      'h-6 flex-1 rounded transition-colors',
                      cell.status === 'reported' && 'bg-emerald-500/80 hover:bg-emerald-500',
                      cell.status === 'assumed' && 'bg-amber-500/80 hover:bg-amber-500',
                      cell.status === 'extrapolated' &&
                        'bg-blue-500/80 border border-dashed border-blue-300 hover:bg-blue-500',
                      cell.status === 'missing' && 'bg-muted border border-border/60',
                      cell.status === 'no_mis' && 'bg-muted/30 border border-border/30 opacity-40'
                    )}
                    title={`${row.project.name} (${cell.month}): ${cell.status}`}
                  />
                ))}
              </div>

              {/* Latest Reported Month */}
              <div className="w-28 text-right shrink-0 text-[11px] font-mono font-semibold text-muted-foreground">
                {row.latestReportedMonth || 'No MIS'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
