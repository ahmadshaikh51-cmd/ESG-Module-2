import React from 'react';
import { ShieldCheck, UserCheck, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import {
  getComplianceAuthorityBreakdown,
  type ComplianceFilterState,
} from '@/lib/esg-compliance-adapter';
import { personById, recordState, type ComplianceRecord } from '@/lib/esg-data';

interface ComplianceRiskChartsProps {
  records: ComplianceRecord[];
  filters: ComplianceFilterState;
}

export function ComplianceRiskCharts({ records, filters }: ComplianceRiskChartsProps) {
  const authorityRows = getComplianceAuthorityBreakdown(records);

  // Group records by owner
  const ownerMap: Record<string, { name: string; role: string; total: number; valid: number; expiring: number; overdue: number }> = {};
  for (const r of records) {
    const owner = personById(r.ownerId);
    const name = owner?.name ?? r.ownerId;
    const role = owner?.role ?? 'Owner';
    if (!ownerMap[r.ownerId]) {
      ownerMap[r.ownerId] = { name, role, total: 0, valid: 0, expiring: 0, overdue: 0 };
    }
    ownerMap[r.ownerId].total++;
    const st = recordState(r);
    if (st === 'valid') ownerMap[r.ownerId].valid++;
    else if (st === 'expiring') ownerMap[r.ownerId].expiring++;
    else ownerMap[r.ownerId].overdue++;
  }
  const ownerRows = Object.values(ownerMap).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-foreground">Regulator & Accountability Matrix</h3>
            <span className="inline-flex rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Statutory Regulators
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Distribution of compliance items across statutory authorities and owner accountability
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Authority Breakdown */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">Statutory Regulators</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{authorityRows.length} Authorities</span>
          </div>

          <div className="space-y-2.5 pt-1 max-h-[320px] overflow-y-auto pr-1">
            {authorityRows.map((auth) => (
              <div
                key={auth.authority}
                className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1 text-[12px]"
              >
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span className="truncate max-w-[180px]">{auth.authority}</span>
                  <span className="num text-[11px] text-muted-foreground">{auth.count} items</span>
                </div>

                <div className="flex items-center gap-2 text-[10.5px] font-medium pt-1">
                  <span className="text-emerald-600 dark:text-emerald-400">{auth.valid} valid</span>
                  {auth.expiring > 0 && <span className="text-amber-600 dark:text-amber-400">{auth.expiring} expiring</span>}
                  {auth.overdue > 0 && <span className="text-destructive font-bold">{auth.overdue} overdue</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Cols: Owner Accountability */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserCheck className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">
                Compliance Owner Workload & Health Score
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">{ownerRows.length} active owners</span>
          </div>

          <div className="space-y-3 pt-1">
            {ownerRows.map((o) => {
              const pct = o.total > 0 ? Math.round((o.valid / o.total) * 100) : 0;
              return (
                <div
                  key={o.name}
                  className="rounded-xl border border-border/50 bg-muted/20 p-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-[160px]">
                    <span className="text-[13px] font-semibold text-foreground block">{o.name}</span>
                    <span className="text-[11px] text-muted-foreground">{o.role} · {o.total} items</span>
                  </div>

                  <div className="flex-1 min-w-[140px] space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                      <span>Valid Health</span>
                      <span>{pct}% valid</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-[11.5px] font-medium">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {o.valid} valid
                    </span>
                    {o.expiring > 0 && (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Clock className="h-3.5 w-3.5" /> {o.expiring} expiring
                      </span>
                    )}
                    {o.overdue > 0 && (
                      <span className="inline-flex items-center gap-1 text-destructive font-semibold">
                        <AlertTriangle className="h-3.5 w-3.5" /> {o.overdue} overdue
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
