import React from 'react';
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
import { Activity, Layers, FileBadge } from 'lucide-react';
import {
  getComplianceStatusBreakdown,
  getComplianceCategoryBreakdown,
  getComplianceProjectComparison,
  type ComplianceFilterState,
} from '@/lib/esg-compliance-adapter';
import { type ComplianceRecord } from '@/lib/esg-data';

interface ComplianceOperationalChartsProps {
  records: ComplianceRecord[];
  filters: ComplianceFilterState;
}

export function ComplianceOperationalCharts({ records, filters }: ComplianceOperationalChartsProps) {
  const statusData = getComplianceStatusBreakdown(records);
  const categoryData = getComplianceCategoryBreakdown(records);
  const projectData = getComplianceProjectComparison(records);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Compliance Status & Expiry Trends</h3>
          <p className="text-[12px] text-muted-foreground">
            Visual breakdown of statutory permits, site compliance items, and expiry clock distributions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Expiry Clock Status Breakdown */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">Expiry Clock Status Breakdown</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Valid, Expiring & Overdue</span>
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
                  formatter={(value: any, name: any) => [`${value} records`, name]}
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

        {/* Chart 2: Category Breakdown */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">Compliance Category Breakdown</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Permits vs Site Compliance</span>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                  formatter={(value: any) => [`${value} items`, 'Total Records']}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cat-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Project SPV Compliance Health */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <FileBadge className="h-4 w-4" />
            </div>
            <span className="text-[13.5px] font-bold text-foreground">
              Project SPV Compliance Volume & Expiry Distribution
            </span>
          </div>
          <span className="text-[11.5px] text-muted-foreground">
            Permits and compliance items per SPV
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
              <Bar dataKey="valid" name="Valid" fill="#10b981" stackId="p" />
              <Bar dataKey="expiring" name="Expiring Soon" fill="#f59e0b" stackId="p" />
              <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="p" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
