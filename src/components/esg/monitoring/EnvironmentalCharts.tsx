import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Leaf, Fuel, TreePine, Info } from 'lucide-react';
import { getTimeSeriesData, AggregateKpis, FilterState } from '@/lib/esg-site-monitoring-adapter';
import { Segmented } from '../Segmented';

interface EnvironmentalChartsProps {
  filters: FilterState;
  kpis: AggregateKpis;
}

export function EnvironmentalCharts({ filters, kpis }: EnvironmentalChartsProps) {
  const data = getTimeSeriesData(filters);
  const [metricView, setMetricView] = useState<'co2' | 'diesel'>('co2');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-foreground">Estimated Environmental Impact</h3>
            <span className="inline-flex rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Disclosed Estimation Methodology
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Avoided emissions and diesel displacement calculated from operational distance run
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart: CO2 / Diesel */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">
                {metricView === 'co2' ? 'Monthly CO2 Avoided (t CO2e)' : 'Monthly Diesel Saved (Litres)'}
              </span>
            </div>

            <Segmented<'co2' | 'diesel'>
              ariaLabel="Environmental chart metric"
              size="sm"
              value={metricView}
              onChange={setMetricView}
              options={[
                { key: 'co2', label: 't CO2 Avoided' },
                { key: 'diesel', label: 'Diesel Saved (L)' },
              ]}
            />
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnv" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={metricView === 'co2' ? '#10b981' : '#3b82f6'}
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor={metricView === 'co2' ? '#10b981' : '#3b82f6'}
                      stopOpacity={0.0}
                    />
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
                  formatter={(value: any) => [
                    metricView === 'co2'
                      ? `${Math.round(Number(value)).toLocaleString()} t CO2e`
                      : `${Math.round(Number(value)).toLocaleString()} Litres`,
                    metricView === 'co2' ? 'Est. CO2 Avoided' : 'Est. Diesel Saved',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={metricView === 'co2' ? 'totalCo2t' : 'totalDieselL'}
                  stroke={metricView === 'co2' ? '#10b981' : '#3b82f6'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorEnv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tailpipe Pollutant & Tree Tiles Summary */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-[13px] font-bold text-foreground">Tailpipe Pollutants Prevented</h4>
            <p className="text-[11px] text-muted-foreground">Estimated savings based on distance travelled</p>
          </div>

          <div className="space-y-2.5">
            {/* NOx */}
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-3.5 py-2">
              <span className="text-[12px] font-semibold text-foreground">NOx Reduction</span>
              <span className="num text-[14px] font-bold text-primary">
                {Math.round(kpis.totalNoxKg).toLocaleString()} kg
              </span>
            </div>

            {/* SO2 */}
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-3.5 py-2">
              <span className="text-[12px] font-semibold text-foreground">SO2 Reduction</span>
              <span className="num text-[14px] font-bold text-primary">
                {Math.round(kpis.totalSo2Kg).toLocaleString()} kg
              </span>
            </div>

            {/* PM2.5 */}
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-3.5 py-2">
              <span className="text-[12px] font-semibold text-foreground">PM2.5 Reduction</span>
              <span className="num text-[14px] font-bold text-primary">
                {kpis.totalPm25Kg < 10
                  ? kpis.totalPm25Kg.toFixed(2)
                  : Math.round(kpis.totalPm25Kg).toLocaleString()}{' '}
                kg
              </span>
            </div>

            {/* PM10 */}
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-3.5 py-2">
              <span className="text-[12px] font-semibold text-foreground">PM10 Reduction</span>
              <span className="num text-[14px] font-bold text-primary">
                {Math.round(kpis.totalPm10Kg).toLocaleString()} kg
              </span>
            </div>

            {/* Trees */}
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2">
              <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">
                Estimated Equivalent Trees
              </span>
              <span className="num text-[14px] font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(kpis.totalTrees).toLocaleString()} trees
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 text-[10.5px] text-muted-foreground">
            <strong>Methodology Note:</strong> Diesel = km / 3; CO2 = L x 2.64 kg / 1000; NOx = 0.0048 kg/L; SO2 = 0.04 kg/L; PM2.5 = 4e-6 kg/km; PM10 = PM2.5 / 0.15; Trees = 42 per tCO2.
          </div>
        </div>
      </div>
    </div>
  );
}
