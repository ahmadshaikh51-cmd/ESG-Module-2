import React, { useState, useMemo } from 'react';
import { Search, Eye, ArrowUpDown, AlertCircle, Info, ExternalLink, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  getSocialProjectComparisonRows,
  SocialProjectComparisonRow,
} from '@/lib/esg-social-monitoring-adapter';
import { FilterState } from '@/lib/esg-site-monitoring-adapter';
import { cn } from '@/lib/utils';

interface SocialProjectComparisonTableProps {
  filters: FilterState;
  onSelectProjectDetails: (projectId: string) => void;
}

export function SocialProjectComparisonTable({
  filters,
  onSelectProjectDetails,
}: SocialProjectComparisonTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof SocialProjectComparisonRow>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const rows = getSocialProjectComparisonRows(filters);

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

  const toggleSort = (field: keyof SocialProjectComparisonRow) => {
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
          <h3 className="text-[16px] font-bold text-foreground">Project Social Performance Comparison</h3>
          <p className="text-[12px] text-muted-foreground">
            Side-by-side social metadata, passenger ridership, workforce deployment, and safety scores
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
            <strong>Note:</strong> Active project reporting windows vary per municipal contract start date. Range details are shown under "Reporting Window".
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
                    Project / Client <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3.5 font-semibold">Classification</TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold cursor-pointer hover:text-foreground text-right"
                  onClick={() => toggleSort('activeVehicles')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Fleet Size <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold cursor-pointer hover:text-foreground text-right text-emerald-600 dark:text-emerald-400"
                  onClick={() => toggleSort('totalPassengers')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Passengers Carried <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold cursor-pointer hover:text-foreground text-right"
                  onClick={() => toggleSort('totalDrivers')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Drivers & Crew <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold cursor-pointer hover:text-foreground text-right"
                  onClick={() => toggleSort('driverHours')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Safety Hours <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold cursor-pointer hover:text-foreground text-center"
                  onClick={() => toggleSort('grievancesLogged')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Grievances <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold cursor-pointer hover:text-foreground text-center"
                  onClick={() => toggleSort('safetyScore')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Safety Score <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="px-5 py-3.5 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-border/40">
              {filteredRows.map((r) => (
                <TableRow
                  key={r.id}
                  className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  onClick={() => onSelectProjectDetails(r.id)}
                >
                  {/* Project & Client */}
                  <TableCell className="px-5 py-3.5 font-medium">
                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {r.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{r.client}</div>
                  </TableCell>

                  {/* Classification */}
                  <TableCell className="px-4 py-3.5 text-[11.5px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider',
                          r.vehicleType === 'E-Bus'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        )}
                      >
                        {r.vehicleType}
                      </span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                        {r.businessType}
                      </span>
                    </div>
                  </TableCell>

                  {/* Fleet Size */}
                  <TableCell className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                    {r.activeVehicles}
                    <span className="text-[10px] text-muted-foreground block font-sans">
                      Tracker: {r.trackerFleetSize}
                    </span>
                  </TableCell>

                  {/* Passengers Carried */}
                  <TableCell className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {r.totalPassengers > 0
                      ? r.totalPassengers > 1000000
                        ? `${(r.totalPassengers / 1000000).toFixed(2)}M`
                        : r.totalPassengers.toLocaleString()
                      : 'N/A (Freight)'}
                  </TableCell>

                  {/* Drivers & Crew */}
                  <TableCell className="px-4 py-3.5 text-right font-mono text-foreground font-semibold">
                    {r.totalDrivers} drivers
                    <span className="text-[10px] text-muted-foreground block font-sans">
                      +{r.totalTechnicians} techs
                    </span>
                  </TableCell>

                  {/* Safety Hours */}
                  <TableCell className="px-4 py-3.5 text-right font-mono text-muted-foreground">
                    {r.driverHours.toLocaleString()} hrs
                  </TableCell>

                  {/* Grievances */}
                  <TableCell className="px-4 py-3.5 text-center text-[11.5px]">
                    <span className="font-bold text-foreground">{r.grievancesResolved}/{r.grievancesLogged}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                      {r.grievancesLogged > 0 ? `${Math.round((r.grievancesResolved / r.grievancesLogged) * 100)}% SLA` : '100% SLA'}
                    </span>
                  </TableCell>

                  {/* Safety Score */}
                  <TableCell className="px-4 py-3.5 text-center">
                    <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {r.safetyScore}%
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-[11.5px] font-semibold text-primary hover:bg-primary/10"
                      onClick={() => onSelectProjectDetails(r.id)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
