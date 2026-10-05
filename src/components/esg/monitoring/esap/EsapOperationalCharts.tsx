import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FileSearch, Layers, Activity } from 'lucide-react';
import {
  getEsapSourceBreakdown,
  getEsapStatusBreakdown,
  getEsapProjectComparison,
  type EsapFilterState,
} from '@/lib/esg-esap-adapter';
import { type EsapAction } from '@/lib/esg-data';
import { Segmented } from '../../Segmented';

interface EsapOperationalChartsProps {
  actions: EsapAction[];
  filters: EsapFilterState;
}

export function EsapOperationalCharts({ actions, filters }: EsapOperationalChartsProps) {
  const [chartView, setChartView] = useState<'status' | 'source'>('status');

  const statusData = getEsapStatusBreakdown(actions);
  const sourceData = getEsapSourceBreakdown(actions);
  const projectData = getEsapProjectComparison(actions);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">ESAP Implementation & Operational Trends</h3>
          <p className="text-[12px] text-muted-foreground">
            Distribution of corrective actions across status categories, origin sources, and project SPVs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Action Status Distribution */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">Action Status Breakdown</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Open, In Progress, Overdue, Closed</span>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => [`${value} actions`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Actions by Origin Source */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">Actions by Origin Source</span>
            </div>
            <span className="text-[11px] text-muted-foreground">ESDD, ESIA, Audits & Policies</span>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="open" name="Active / Open" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="closed" name="Closed" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Project-wise Action Breakdown */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <FileSearch className="h-4 w-4" />
            </div>
            <span className="text-[13.5px] font-bold text-foreground">
              Project SPV Action Volume & Status Distribution
            </span>
          </div>
          <span className="text-[11.5px] text-muted-foreground">
            Corrective action counts per entity
          </span>
        </div>

        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
              <XAxis dataKey="projectName" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="open" name="Open" fill="#3b82f6" stackId="p" />
              <Bar dataKey="inProgress" name="In Progress" fill="#f59e0b" stackId="p" />
              <Bar dataKey="overdue" name="Overdue" fill="#ef4444" stackId="p" />
              <Bar dataKey="closed" name="Closed" fill="#10b981" radius={[4, 4, 0, 0]} stackId="p" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
