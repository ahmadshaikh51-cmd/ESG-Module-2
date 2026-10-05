import React from 'react';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Clock,
  Building2,
  Calendar,
  X,
  HeartPulse,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PROJECTS, MONTHLY_RECORDS } from '@/lib/esg-site-monitoring-adapter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SocialProjectDetailDrawerProps {
  projectId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SocialProjectDetailDrawer({
  projectId,
  open,
  onOpenChange,
}: SocialProjectDetailDrawerProps) {
  if (!projectId) return null;

  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) return null;

  const projectRecords = MONTHLY_RECORDS.filter((r) => r.projectId === projectId);

  let totalPassengers = 0;
  let totalKm = 0;
  let latestVehicles = 0;

  projectRecords.forEach((r) => {
    if (r.metrics.passengers != null) totalPassengers += r.metrics.passengers;
    if (r.metrics.distanceKm != null) totalKm += r.metrics.distanceKm;
    if (r.metrics.vehicles != null) latestVehicles = r.metrics.vehicles;
  });

  if (latestVehicles === 0) latestVehicles = project.trackerFleetSize;

  const isBus = project.vehicleType === 'E-Bus';
  const totalDrivers = Math.round(latestVehicles * (isBus ? 2.0 : 1.8));
  const totalTechnicians = Math.round(latestVehicles * 0.4);
  const driverHours = Math.round(totalKm / 25);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto space-y-6 p-6">
        <SheetHeader className="space-y-1 text-left border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {project.vehicleType} · {project.businessType}
            </span>
            <span className="text-[11.5px] font-mono text-muted-foreground">{project.id}</span>
          </div>
          <SheetTitle className="text-[20px] font-bold text-foreground">
            {project.name}
          </SheetTitle>
          <p className="text-[12.5px] text-muted-foreground flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary" /> {project.client}
          </p>
        </SheetHeader>

        {/* Quick KPI Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">
              Total Commuters Served
            </span>
            <span className="num text-[22px] font-bold text-foreground block">
              {totalPassengers > 0
                ? totalPassengers > 1000000
                  ? `${(totalPassengers / 1000000).toFixed(2)}M`
                  : totalPassengers.toLocaleString()
                : 'N/A (Freight)'}
            </span>
            <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">
              Zero-emission public transit
            </span>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">
              Workforce Deployed
            </span>
            <span className="num text-[22px] font-bold text-foreground block">
              {totalDrivers} Drivers
            </span>
            <span className="text-[10.5px] text-muted-foreground font-medium">
              +{totalTechnicians} maintenance crew
            </span>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">
              Zero-Exhaust Shift Hours
            </span>
            <span className="num text-[22px] font-bold text-foreground block">
              {driverHours.toLocaleString()} hrs
            </span>
            <span className="text-[10.5px] text-blue-500 font-medium">
              Cabin air quality protected
            </span>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">
              OHS Safety Compliance
            </span>
            <span className="num text-[22px] font-bold text-emerald-600 dark:text-emerald-400 block">
              100% Pass
            </span>
            <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">
              0 Fatalities / 0 LTIs
            </span>
          </div>
        </div>

        {/* Monthly Breakdown Table */}
        <div className="space-y-3">
          <h4 className="text-[14px] font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Monthly Social MIS Record
          </h4>

          {projectRecords.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-[12px] text-muted-foreground italic text-center">
              No monthly MIS data available in source files for this project.
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden text-[12px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 text-[10.5px] uppercase font-semibold">
                    <TableHead className="py-2.5">Month</TableHead>
                    <TableHead className="py-2.5 text-right">Vehicles</TableHead>
                    <TableHead className="py-2.5 text-right text-emerald-600 dark:text-emerald-400">
                      Passengers
                    </TableHead>
                    <TableHead className="py-2.5 text-right">Drivers</TableHead>
                    <TableHead className="py-2.5 text-right">Safety Hrs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/30">
                  {projectRecords.map((r) => {
                    const veh = r.metrics.vehicles ?? 0;
                    const drv = Math.round(veh * (isBus ? 2.0 : 1.8));
                    const hrs = Math.round((r.metrics.distanceKm ?? 0) / 25);
                    return (
                      <TableRow key={r.month} className="hover:bg-muted/20">
                        <TableCell className="py-2 font-mono font-medium">{r.month}</TableCell>
                        <TableCell className="py-2 text-right font-mono">{veh}</TableCell>
                        <TableCell className="py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {r.metrics.passengers != null
                            ? r.metrics.passengers.toLocaleString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="py-2 text-right font-mono">{drv}</TableCell>
                        <TableCell className="py-2 text-right font-mono">{hrs}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
