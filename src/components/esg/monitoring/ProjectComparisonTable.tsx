import React, { useState, useMemo } from 'react';
import { Search, Eye, ArrowUpDown, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  getProjectComparisonRows,
  ProjectComparisonRow,
  FilterState,
} from '@/lib/esg-site-monitoring-adapter';
import { cn } from '@/lib/utils';

interface ProjectComparisonTableProps {
  filters: FilterState;
  energyUnit: 'kWh' | 'MWh';
  onSelectProjectDetails: (projectId: string) => void;
}

export function ProjectComparisonTable({
  filters,
  energyUnit,
  onSelectProjectDetails,
}: ProjectComparisonTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof ProjectComparisonRow>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const rows = getProjectComparisonRows(filters);

  const filteredRows = useMemo(() => {
    return rows
      .filter((r) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.client.toLowerCase().includes(q) ||
          r.vehicleType.toLowerCase().includes(q) ||
          r.businessType.toLowerCase().includes(q)
        );
      })
      .sort((a: any, b: any) => {
        const valA = a[sortField] ?? -Infinity;
        const valB = b[sortField] ?? -Infinity;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [rows, search, sortField, sortAsc]);

  const toggleSort = (field: keyof ProjectComparisonRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const hasPeriodMismatch = rows.some((r) => r.periodDiffersFromFilter && r.hasMonthlyData);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Project Performance Comparison</h3>
          <p className="text-[12px] text-muted-foreground">
            Side-by-side operational metrics across all classified projects
          </p>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project or client..."
            className="h-9 pl-9 text-[12.5px] bg-muted/20 border-border/60"
          />
        </div>
      </div>

      {hasPeriodMismatch && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-[12px] text-amber-700 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            <strong>Note:</strong> Some projects started at different dates or have distinct active reporting periods. Range details are shown under "Reporting Period".
          </span>
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card shadow-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-[12.5px]">
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                <TableHead
                  className="px-5 py-3.5 font-semibold cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Project <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3.5 font-semibold">Client / Authority</TableHead>
                <TableHead className="px-4 py-3.5 font-semibold">Type</TableHead>
                <TableHead className="px-4 py-3.5 font-semibold">Biz</TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold text-right cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('latestVehicles')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Active Vehicles <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold text-right cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('distanceKm')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Distance (km) <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold text-right cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('energyKwh')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Energy ({energyUnit}) <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold text-right cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('co2t')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Est. CO2 (t) <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3.5 font-semibold">Reporting Period</TableHead>
                <TableHead className="px-5 py-3.5 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {filteredRows.map((r) => {
                const energyDisplayVal =
                  r.energyKwh != null
                    ? Math.round(
                        energyUnit === 'kWh' ? r.energyKwh : r.energyKwh / 1000
                      ).toLocaleString()
                    : 'No data';

                return (
                  <TableRow
                    key={r.id}
                    className={cn(
                      'hover:bg-muted/15 transition-colors',
                      !r.hasMonthlyData && 'opacity-65 bg-muted/10'
                    )}
                  >
                    {/* Project Name */}
                    <TableCell className="px-5 py-3.5 font-bold text-foreground">
                      {r.name}
                      {!r.hasMonthlyData && (
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          No monthly MIS data
                        </span>
                      )}
                    </TableCell>

                    {/* Client */}
                    <TableCell className="px-4 py-3.5 text-muted-foreground font-medium">
                      {r.client}
                    </TableCell>

                    {/* Type */}
                    <TableCell className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-[11px] font-semibold text-foreground">
                        {r.vehicleType}
                      </span>
                    </TableCell>

                    {/* Business */}
                    <TableCell className="px-4 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold',
                          r.businessType === 'B2G'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        )}
                      >
                        {r.businessType}
                      </span>
                    </TableCell>

                    {/* Vehicles */}
                    <TableCell className="px-4 py-3.5 text-right num">
                      {r.latestVehicles != null ? (
                        <div>
                          <span className="font-bold text-foreground">{r.latestVehicles}</span>
                          <span className="block text-[10px] text-muted-foreground">
                            Tracker: {r.trackerFleetSize}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* Distance */}
                    <TableCell className="px-4 py-3.5 text-right num font-semibold text-foreground">
                      {r.distanceKm != null ? Math.round(r.distanceKm).toLocaleString() : 'No data'}
                    </TableCell>

                    {/* Energy */}
                    <TableCell className="px-4 py-3.5 text-right num font-semibold">
                      {r.energyKwh != null ? (
                        <span className="text-foreground">{energyDisplayVal}</span>
                      ) : (
                        <span className="text-muted-foreground italic">No energy data</span>
                      )}
                    </TableCell>

                    {/* CO2 */}
                    <TableCell className="px-4 py-3.5 text-right num font-semibold text-emerald-600 dark:text-emerald-400">
                      {r.co2t != null ? Math.round(r.co2t).toLocaleString() : '—'}
                    </TableCell>

                    {/* Reporting Period */}
                    <TableCell className="px-4 py-3.5 whitespace-nowrap">
                      {r.firstMonth && r.lastMonth ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-semibold text-foreground">
                            {r.firstMonth} to {r.lastMonth}
                          </span>
                          {r.periodDiffersFromFilter && (
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-amber-500"
                              title="Differs from main range filter"
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">No monthly records</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-3.5 text-right">
                      {r.hasMonthlyData ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectProjectDetails(r.id)}
                          className="h-7 text-[11.5px] gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">No MIS</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
