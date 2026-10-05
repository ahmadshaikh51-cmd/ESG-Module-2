import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ShieldAlert, UserCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  getEsapSeverityBreakdown,
  type EsapFilterState,
} from '@/lib/esg-esap-adapter';
import { personById, type EsapAction } from '@/lib/esg-data';

interface EsapRiskChartsProps {
  actions: EsapAction[];
  filters: EsapFilterState;
}

export function EsapRiskCharts({ actions, filters }: EsapRiskChartsProps) {
  const severityData = getEsapSeverityBreakdown(actions);

  // Group actions by owner
  const ownerMap: Record<string, { name: string; total: number; closed: number; overdue: number }> = {};
  for (const a of actions) {
    const owner = personById(a.ownerId);
    const name = owner?.name ?? a.ownerId;
    if (!ownerMap[a.ownerId]) {
      ownerMap[a.ownerId] = { name, total: 0, closed: 0, overdue: 0 };
    }
    ownerMap[a.ownerId].total++;
    if (a.status === 'closed') ownerMap[a.ownerId].closed++;
    if (a.status !== 'closed' && new Date(a.due) < new Date('2026-10-05')) {
      ownerMap[a.ownerId].overdue++;
    }
  }
  const ownerRows = Object.values(ownerMap).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-foreground">Risk Severity & Accountability Matrix</h3>
            <span className="inline-flex rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Governance & Oversight
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Audit risk severity classification and action owner workload allocation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Severity Distribution Pie Chart */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">Risk Severity Breakdown</span>
            </div>
          </div>

          <div className="h-[250px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => [`${value} items`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '11.5px', paddingTop: '10px' }} />
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`sev-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 2 Cols: Action Owner Allocation */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserCheck className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">
                Action Owner Workload & Execution Health
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">{ownerRows.length} active owners</span>
          </div>

          <div className="space-y-3 pt-1">
            {ownerRows.map((o) => {
              const pct = o.total > 0 ? Math.round((o.closed / o.total) * 100) : 0;
              return (
                <div
                  key={o.name}
                  className="rounded-xl border border-border/50 bg-muted/20 p-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-[160px]">
                    <span className="text-[13px] font-semibold text-foreground block">{o.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {o.total} action{o.total === 1 ? '' : 's'} assigned
                    </span>
                  </div>

                  <div className="flex-1 min-w-[140px] space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                      <span>Progress</span>
                      <span>{pct}% complete</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-[11.5px] font-medium">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {o.closed} closed
                    </span>
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
