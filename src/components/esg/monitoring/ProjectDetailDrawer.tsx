import React from 'react';
import { X, Layers, Route, Truck, Zap, Fuel, Leaf, ShieldAlert, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  PROJECTS,
  MONTHLY_RECORDS,
  DATA_ISSUES,
  MonthlyRecord,
} from '@/lib/esg-site-monitoring-adapter';
import { cn } from '@/lib/utils';

interface ProjectDetailDrawerProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  energyUnit: 'kWh' | 'MWh';
}

export function ProjectDetailDrawer({
  projectId,
  open,
  onOpenChange,
  energyUnit,
}: ProjectDetailDrawerProps) {
  if (!projectId) return null;

  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) return null;

  const records = MONTHLY_RECORDS.filter((r) => r.projectId === projectId).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  const issues = DATA_ISSUES.filter((i) => i.projectId === projectId);

  let totalKm = 0;
  let totalKwh = 0;
  let totalCo2 = 0;
  let totalDiesel = 0;

  records.forEach((r) => {
    if (r.metrics.distanceKm != null) totalKm += r.metrics.distanceKm;
    if (r.metrics.energyKwh != null) totalKwh += r.metrics.energyKwh;
    if (r.metrics.co2t != null) totalCo2 += r.metrics.co2t;
    if (r.metrics.dieselSavedL != null) totalDiesel += r.metrics.dieselSavedL;
  });

  const latestVeh = records.length > 0 ? records[records.length - 1].metrics.vehicles : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
        <DialogHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-[20px] font-bold text-foreground flex items-center gap-2">
                <span>{project.name}</span>
                <span className="rounded-md border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                  {project.vehicleType}
                </span>
                <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {project.businessType}
                </span>
              </DialogTitle>
              <p className="text-[12.5px] text-muted-foreground mt-1">
                Client: <strong>{project.client}</strong> — MIS Status: {project.misStatus}
              </p>
            </div>

            <div className="text-right text-[12px]">
              <span className="text-muted-foreground block">Tracker Fleet Size</span>
              <span className="font-bold text-foreground text-[16px]">{project.trackerFleetSize} vehicles</span>
            </div>
          </div>
        </DialogHeader>

        {/* Project KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground block">
              Active Vehicles (Reported)
            </span>
            <span className="num text-[20px] font-bold text-foreground">{latestVeh ?? '—'}</span>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground block">
              Total Distance
            </span>
            <span className="num text-[20px] font-bold text-foreground">
              {Math.round(totalKm).toLocaleString()} km
            </span>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground block">
              Total Energy ({energyUnit})
            </span>
            <span className="num text-[20px] font-bold text-foreground">
              {totalKwh > 0
                ? Math.round(energyUnit === 'kWh' ? totalKwh : totalKwh / 1000).toLocaleString()
                : 'No data'}
            </span>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 block">
              Est. CO2 Avoided
            </span>
            <span className="num text-[20px] font-bold text-emerald-600 dark:text-emerald-400">
              {Math.round(totalCo2).toLocaleString()} t
            </span>
          </div>
        </div>

        {/* Project Specific Issues */}
        {issues.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 text-[12px]">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
              <ShieldAlert className="h-4 w-4" />
              <span>Source Inconsistencies & Flags ({issues.length})</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {issues.map((i) => (
                <li key={i.id}>
                  <strong>{i.month ? `[${i.month}]` : ''}</strong> {i.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Monthly Table */}
        <div className="space-y-2">
          <h4 className="text-[14px] font-bold text-foreground">Monthly Operational Records</h4>
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <Table className="w-full text-left text-[12px]">
              <TableHeader>
                <TableRow className="border-b border-border/60 bg-muted/30 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  <TableHead className="px-3 py-2 font-semibold">Month</TableHead>
                  <TableHead className="px-3 py-2 font-semibold text-right">Vehicles</TableHead>
                  <TableHead className="px-3 py-2 font-semibold text-right">Run (km)</TableHead>
                  <TableHead className="px-3 py-2 font-semibold text-right">Energy (kWh)</TableHead>
                  <TableHead className="px-3 py-2 font-semibold text-right">Est. Diesel (L)</TableHead>
                  <TableHead className="px-3 py-2 font-semibold text-right">Est. CO2 (t)</TableHead>
                  <TableHead className="px-3 py-2 font-semibold">Quality Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40">
                {records.map((r) => {
                  const isExt =
                    r.quality.distanceKm === 'extrapolated' ||
                    r.quality.energyKwh === 'extrapolated';
                  const isAssumed = r.quality.energyKwh === 'assumed';

                  return (
                    <TableRow
                      key={r.month}
                      className={cn(
                        'hover:bg-muted/15',
                        isExt && 'bg-blue-500/5',
                        isAssumed && 'bg-amber-500/5'
                      )}
                    >
                      <TableCell className="px-3 py-2 font-mono font-semibold text-foreground">
                        {r.month}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right num">
                        {r.metrics.vehicles ?? '—'}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right num font-medium text-foreground">
                        {r.metrics.distanceKm != null
                          ? Math.round(r.metrics.distanceKm).toLocaleString()
                          : '—'}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right num font-medium">
                        {r.metrics.energyKwh != null
                          ? Math.round(r.metrics.energyKwh).toLocaleString()
                          : 'No data'}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right num">
                        {r.metrics.dieselSavedL != null
                          ? Math.round(r.metrics.dieselSavedL).toLocaleString()
                          : '—'}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right num text-emerald-600 dark:text-emerald-400 font-semibold">
                        {r.metrics.co2t != null ? Math.round(r.metrics.co2t).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <span
                          className={cn(
                            'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                            isExt && 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-dashed border-blue-400',
                            isAssumed && 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
                            !isExt && !isAssumed && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          )}
                        >
                          {isExt ? 'Extrapolated' : isAssumed ? 'Pre-metering Assumed' : 'Reported'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
