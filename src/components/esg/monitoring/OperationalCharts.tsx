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
import { Route, Zap, Truck } from 'lucide-react';
import { getTimeSeriesData, FilterState, PROJECTS } from '@/lib/esg-site-monitoring-adapter';
import { Segmented } from '../Segmented';

interface OperationalChartsProps {
  filters: FilterState;
  energyUnit: 'kWh' | 'MWh';
  onEnergyUnitToggle: (unit: 'kWh' | 'MWh') => void;
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

export function OperationalCharts({ filters, energyUnit, onEnergyUnitToggle }: OperationalChartsProps) {
  const data = getTimeSeriesData(filters);
  const [distanceViewMode, setDistanceViewMode] = useState<'total' | 'by_project'>('total');

  // Format data for Energy chart depending on unit
  const chartData = data.map((d) => ({
    ...d,
    energyVal: energyUnit === 'kWh' ? d.totalEnergyKwh : d.totalEnergyKwh / 1000,
  }));

  const showPerProject = distanceViewMode === 'by_project' && filters.projectId === 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Operational Performance Trends</h3>
          <p className="text-[12px] text-muted-foreground">
            Monthly distance run, fleet deployment numbers, and grid electricity consumption
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Distance Travelled Over Time */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Route className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">Distance Travelled Over Time</span>
            </div>

            {filters.projectId === 'all' && (
              <Segmented<'total' | 'by_project'>
                ariaLabel="Distance chart mode"
                size="sm"
                value={distanceViewMode}
                onChange={setDistanceViewMode}
                options={[
                  { key: 'total', label: 'Total Fleet' },
                  { key: 'by_project', label: 'By Project' },
                ]}
              />
            )}
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {showPerProject ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                      `${Number(value).toLocaleString()} km`,
                      String(name).replace('km_', ''),
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  {PROJECTS.filter((p) => p.hasMonthlyData).map((p) => (
                    <Line
                      key={p.id}
                      type="monotone"
                      dataKey={`km_${p.id}`}
                      name={p.name}
                      stroke={PROJECT_COLORS[p.id] || '#0ea5e9'}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
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
                    formatter={(value: any) => [`${Number(value).toLocaleString()} km`, 'Total Distance']}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalKm"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorKm)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fleet Deployment Trend */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Truck className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">Fleet Deployment Trend</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Monthly active vehicle count</span>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                  formatter={(value: any) => [`${value} vehicles`, 'Active Vehicles']}
                />
                <Line
                  type="stepAfter"
                  dataKey="totalVehicles"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Electricity Consumption Over Time */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-[13.5px] font-bold text-foreground">
              Electricity Consumption Over Time ({energyUnit})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground">
              Note: NTSPL has no energy data; blank months shown as gaps
            </span>
            <button
              type="button"
              onClick={() => onEnergyUnitToggle(energyUnit === 'kWh' ? 'MWh' : 'kWh')}
              className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Switch to {energyUnit === 'kWh' ? 'MWh' : 'kWh'}
            </button>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                formatter={(value: any) => [
                  `${Math.round(Number(value)).toLocaleString()} ${energyUnit}`,
                  'Energy Consumed',
                ]}
              />
              <Bar dataKey="energyVal" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
