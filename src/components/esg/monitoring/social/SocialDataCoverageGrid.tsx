import React from 'react';
import { Users, Info } from 'lucide-react';
import {
  getSocialCoverageGridData,
} from '@/lib/esg-social-monitoring-adapter';
import { FilterState, ALL_MONTHS, isMonthInFilterRange } from '@/lib/esg-site-monitoring-adapter';
import { cn } from '@/lib/utils';

interface SocialDataCoverageGridProps {
  filters: FilterState;
}

export function SocialDataCoverageGrid({ filters }: SocialDataCoverageGridProps) {
  const coverageData = getSocialCoverageGridData(filters);
  const months = ALL_MONTHS.filter((m) => isMonthInFilterRange(m, filters));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Social Metadata Coverage & Completeness Grid</h3>
          <p className="text-[12px] text-muted-foreground">
            Monthly reporting matrix across projects indicating passenger ridership, workforce, and EHS data coverage
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span>Passenger Data Reported</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-blue-500" />
            <span>Freight / Heavy Haul (Workforce Only)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-amber-500 border border-dashed border-amber-300" />
            <span>Scaled / Extrapolated</span>
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
                      cell.status === 'freight_na' && 'bg-blue-500/80 hover:bg-blue-500',
                      cell.status === 'extrapolated' &&
                        'bg-amber-500/80 border border-dashed border-amber-300 hover:bg-amber-500',
                      cell.status === 'missing' && 'bg-muted border border-border/60',
                      cell.status === 'no_mis' && 'bg-muted/30 border border-border/30 opacity-40'
                    )}
                    title={`${row.project.name} (${cell.month}): ${
                      cell.status === 'reported'
                        ? 'Passenger & EHS Data Reported'
                        : cell.status === 'freight_na'
                        ? 'E-Truck Freight Logistics (Workforce Only)'
                        : cell.status === 'extrapolated'
                        ? 'Scaled / Extrapolated'
                        : 'No Data'
                    }`}
                  />
                ))}
              </div>

              {/* Latest Reported Month */}
              <div className="w-28 text-right shrink-0 text-[11px] font-mono font-semibold text-muted-foreground">
                {row.lastReported}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
