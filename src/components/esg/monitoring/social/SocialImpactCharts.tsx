import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { HeartPulse, ShieldCheck, Clock, Users, Flame, Award, Building2 } from 'lucide-react';
import { SocialAggregateKpis } from '@/lib/esg-social-monitoring-adapter';
import { FilterState } from '@/lib/esg-site-monitoring-adapter';

interface SocialImpactChartsProps {
  filters: FilterState;
  kpis: SocialAggregateKpis;
}

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export function SocialImpactCharts({ filters, kpis }: SocialImpactChartsProps) {
  // Ridership by SPV Donut Data
  const spvRidershipData = [
    { name: 'TMBPL (MBMT)', value: 14250000, color: '#0ea5e9' },
    { name: 'NTSPL (Nagpur)', value: 18400000, color: '#8b5cf6' },
    { name: 'TEOPL (Volvo Eicher)', value: 6800000, color: '#f59e0b' },
    { name: 'TUPL (Ulhasnagar)', value: 3050000, color: '#10b981' },
  ];

  // Grievance SLA Resolution by Department
  const grievanceDeptData = [
    { department: 'Electrical Ops', closed: 12, open: 1 },
    { department: 'Depot Admin', closed: 8, open: 0 },
    { department: 'Stores & PPE', closed: 5, open: 0 },
    { department: 'Driver Amenities', closed: 2, open: 0 },
  ];

  // Incident & Near-Miss Severity Distribution
  const incidentSeverityData = [
    { type: 'Near Misses', count: 9, fill: '#3b82f6' },
    { type: 'First Aid Cases', count: 5, fill: '#f59e0b' },
    { type: 'Medical Treatment', count: 0, fill: '#ef4444' },
    { type: 'Lost Time Injury (LTI)', count: 0, fill: '#dc2626' },
    { type: 'Fatalities', count: 0, fill: '#991b1b' },
  ];

  // PPE & Facility Safety Inspection Pass Rates
  const facilityAuditData = [
    { depot: 'Kashimira', ppeScore: 99.1, fireScore: 100 },
    { depot: 'Shahad', ppeScore: 98.4, fireScore: 97.5 },
    { depot: 'Pithampur', ppeScore: 98.8, fireScore: 99.0 },
    { depot: 'Wathoda', ppeScore: 99.5, fireScore: 100 },
    { depot: 'Kandla Port', ppeScore: 97.9, fireScore: 98.2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Social Impact & EHS Safety Governance</h3>
          <p className="text-[12px] text-muted-foreground">
            Municipal ridership distribution, driver zero-exhaust exposure hours, grievance resolution SLAs, and EHS audit pass rates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Public Transit Ridership Distribution */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-bold text-foreground">Municipal Transit Passengers</h4>
              <p className="text-[11px] text-muted-foreground">Distribution across municipal STU projects</p>
            </div>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spvRidershipData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {spvRidershipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${(Number(val) / 1000000).toFixed(2)}M passengers`, 'Ridership']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-border/40 pt-3">
            {spvRidershipData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Driver Zero-Exhaust Safety Hours */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-bold text-foreground">Driver Zero-Exhaust Hours</h4>
              <p className="text-[11px] text-muted-foreground">Occupational safety & clean shift hours</p>
            </div>
          </div>

          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total Shielded Driver Shift Hours
              </span>
              <span className="num text-[30px] font-bold text-foreground block">
                {kpis.totalDriverHours.toLocaleString()} hrs
              </span>
              <p className="text-[11.5px] text-emerald-600 dark:text-emerald-400 font-medium">
                100% Zero tailpipe exhaust exposure inside vehicle cabin & depot bays
              </p>
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Urban PM2.5 Avoided</span>
                <span className="font-bold text-foreground">{kpis.pm25AvoidedKg} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Urban PM10 Avoided</span>
                <span className="font-bold text-foreground">{kpis.pm10AvoidedKg} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Diesel Fuel Replaced</span>
                <span className="font-bold text-foreground">{kpis.totalDieselSavedL.toLocaleString()} Litres</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Grievance SLA Resolution Status */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <HeartPulse className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-bold text-foreground">Grievance SLA Resolution</h4>
              <p className="text-[11px] text-muted-foreground">Status by operational department</p>
            </div>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grievanceDeptData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis dataKey="department" type="category" stroke="var(--color-muted-foreground)" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="closed" name="Resolved (SLA)" fill="#10b981" radius={[0, 4, 4, 0]} stackId="g" />
                <Bar dataKey="open" name="Pending" fill="#f59e0b" radius={[0, 4, 4, 0]} stackId="g" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] border-t border-border/40 pt-3">
            <span className="text-muted-foreground">Average SLA Closure Time:</span>
            <span className="font-bold text-foreground">2.4 Days (Target &lt; 5 Days)</span>
          </div>
        </div>

        {/* Card 4: Safety Incident & Near-Miss Distribution */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-bold text-foreground">Safety Incidents & Severity</h4>
              <p className="text-[11px] text-muted-foreground">Proactive Near-Miss reporting culture</p>
            </div>
          </div>

          <div className="space-y-3 py-1">
            {incidentSeverityData.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-muted-foreground font-medium">{item.type}</span>
                  <span className="font-bold text-foreground">{item.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: item.count > 0 ? `${(item.count / 10) * 100}%` : '0%',
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] border-t border-border/40 pt-3 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>100% Zero Fatalities Record</span>
            <span>CAPA Closure: 100%</span>
          </div>
        </div>

        {/* Card 5: Facility & PPE Inspection Pass Rates */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-bold text-foreground">PPE & Fire Safety Audits</h4>
              <p className="text-[11px] text-muted-foreground">Depot compliance audit pass rates (%)</p>
            </div>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facilityAuditData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
                <XAxis dataKey="depot" stroke="var(--color-muted-foreground)" fontSize={10} />
                <YAxis domain={[90, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Audit Score']}
                />
                <Bar dataKey="ppeScore" name="PPE Audit %" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fireScore" name="Fire Extinguisher %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] border-t border-border/40 pt-3">
            <span className="text-muted-foreground">Overall Facility Pass Rate:</span>
            <span className="font-bold text-foreground">98.8%</span>
          </div>
        </div>

        {/* Card 6: Accessibility & Inclusive Mobility Index */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-bold text-foreground">Accessibility & Equal Opportunity</h4>
              <p className="text-[11px] text-muted-foreground">Inclusive design & fair labor standards</p>
            </div>
          </div>

          <div className="space-y-3 text-[12px] py-2">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span>Low-Floor Wheelchair Access</span>
                <span className="text-emerald-600 dark:text-emerald-400">100% E-Bus Fleet</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Full ramp access for senior citizens & disabled passengers</p>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span>Equal Opportunity Labor Code</span>
                <span className="text-emerald-600 dark:text-emerald-400">100% Compliant</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Minimum wages, provident fund & ESIC insurance verified</p>
            </div>

            <div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1">
              <div className="flex items-center justify-between font-bold text-foreground">
                <span>Driver Ergonomics & Climate</span>
                <span className="text-emerald-600 dark:text-emerald-400">AC Cabins</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Air-conditioned driver cabins with air-suspension seating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
