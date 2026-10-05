import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Users, UserCheck, ShieldCheck } from 'lucide-react';
import { getSocialTimeSeriesData } from '@/lib/esg-social-monitoring-adapter';
import { FilterState, PROJECTS } from '@/lib/esg-site-monitoring-adapter';
import { Segmented } from '../../Segmented';

interface SocialOperationalChartsProps {
  filters: FilterState;
}

const PROJECT_COLORS: Record<string, string> = {
  TMBPL: '#0ea5e9',
  TUPL: '#10b981',
  TEOPL: '#f59e0b',
  NTSPL: '#8b5cf6',
  UCL: '#ec4899',
  SCL: '#14b8a6',
  JM_BAXI: '#6366f1',
};

export function SocialOperationalCharts({ filters }: SocialOperationalChartsProps) {
  const data = getSocialTimeSeriesData(filters);
  const [passengerViewMode, setPassengerViewMode] = useState<'total' | 'by_project'>('total');

  const showPerProject = passengerViewMode === 'by_project' && filters.projectId === 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Social Mobility & Workforce Trends</h3>
          <p className="text-[12px] text-muted-foreground">
            Monthly passenger commuters, green job workforce deployment, and zero-emission driver safety hours
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Passenger Mobility Trend */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">Passenger Mobility Over Time</span>
            </div>

            {filters.projectId === 'all' && (
              <Segmented<'total' | 'by_project'>
                ariaLabel="Passenger chart mode"
                size="sm"
                value={passengerViewMode}
                onChange={setPassengerViewMode}
                options={[
                  { key: 'total', label: 'Total Commuters' },
                  { key: 'by_project', label: 'By Project' },
                ]}
              />
            )}
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {showPerProject ? (
                <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name: any) => [
                      `${Number(value).toLocaleString()} passengers`,
                      String(name).replace('pass_', ''),
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  {PROJECTS.filter((p) => p.hasMonthlyData && p.vehicleType === 'E-Bus').map((p) => (
                    <Line
                      key={p.id}
                      type="monotone"
                      dataKey={`pass_${p.id}`}
                      name={p.name}
                      stroke={PROJECT_COLORS[p.id] || '#10b981'}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              ) : (
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPassengers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis
                    stroke="var(--color-muted-foreground)"
                    fontSize={11}
                    tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()} passengers`, 'Total Commuters Carried']}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalPassengers"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPassengers)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Green Jobs & Driver Deployment Trend */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UserCheck className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">Workforce Deployment (Drivers vs Techs)</span>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} personnel`,
                    name === 'driversCount' ? 'Drivers & Shift Crew' : 'Maintenance Techs',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="driversCount" name="Drivers & Shift Crew" fill="var(--color-primary)" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="techsCount" name="Maintenance Techs" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
