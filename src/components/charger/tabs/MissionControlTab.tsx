import React, { useState, useEffect } from "react";
import { useChargingSystem } from "../ChargingSystemProvider";
import {
  GlassPanel,
  PanelHead,
  LivePulse,
  SeverityDot,
  RiskPill,
  fmt,
} from "../command/primitives";
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Bolt,
  Clock,
  Coins,
  Cpu,
  Zap,
  ShieldCheck,
  TrendingUp,
  Wrench,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
} from "recharts";

// Simulated activity feed template
interface ActivityEvent {
  id: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  depot: string;
}

const INITIAL_ACTIVITIES: ActivityEvent[] = [
  {
    id: "act_1",
    time: "10:48:32",
    type: "info",
    message: "Bus MH-31-EQ-1008 entered queue",
    depot: "Khapri",
  },
  {
    id: "act_2",
    time: "10:45:15",
    type: "success",
    message: "TV-BKC-01 session completed for MH-02-FL-4001",
    depot: "BKC Mumbai",
  },
  {
    id: "act_3",
    time: "10:39:44",
    type: "error",
    message: "TV-WAD-02 raised Critical Temp Alert (68°C)",
    depot: "Wadi",
  },
  {
    id: "act_4",
    time: "10:30:10",
    type: "info",
    message: "Technician Rajesh Kumar assigned to TV-WAD-02",
    depot: "Wadi",
  },
  {
    id: "act_5",
    time: "10:15:00",
    type: "success",
    message: "Scheduled maintenance started on TV-BKC-02",
    depot: "BKC Mumbai",
  },
];

export const MissionControlTab: React.FC = () => {
  const { chargers, queue, maintenance } = useChargingSystem();
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_ACTIVITIES);

  // Simulated activity generator (micro-animations / live feel)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomBus = 1000 + Math.floor(Math.random() * 200);
      const randomDepots = ["Khapri", "Wadi", "MIHAN", "BKC Mumbai", "Andheri"];
      const randomDepot = randomDepots[Math.floor(Math.random() * randomDepots.length)];
      const randomEvents: { msg: string; type: "info" | "success" | "warning" | "error" }[] = [
        { msg: `Bus MH-31-EQ-${randomBus} charging started`, type: "success" },
        { msg: `Bus MH-31-EQ-${randomBus} entered queue`, type: "info" },
        {
          msg: `OCPP connection reset on TV-${randomDepot.slice(0, 3).toUpperCase()}-02`,
          type: "warning",
        },
        { msg: `Power factor normal at ${randomDepot} transformer`, type: "info" },
      ];
      const selected = randomEvents[Math.floor(Math.random() * randomEvents.length)];

      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];

      const newAct: ActivityEvent = {
        id: `act_${Date.now()}`,
        time: timeStr,
        type: selected.type,
        message: selected.msg,
        depot: randomDepot,
      };

      setActivities((prev) => [newAct, ...prev.slice(0, 9)]);
    }, 15000); // Trigger every 15s

    return () => clearInterval(interval);
  }, []);

  // Compute live variables from context
  const totalChargers = chargers.length;
  const onlineChargers = chargers.filter((c) => c.commsStatus === "online").length;
  const chargingCount = chargers.filter((c) => c.status === "charging").length;
  const faultedCount = chargers.filter((c) => c.status === "faulted").length;
  const maintCount = chargers.filter((c) => c.status === "maintenance").length;
  const queueLength = queue.length;

  const totalPowerDeliveredKw = chargers.reduce(
    (acc, curr) => acc + (curr.currentSession?.powerKw ?? 0),
    0,
  );

  // 24h Hourly Load chart data (simulated rolling power curve)
  const hourlyData = [
    { time: "00:00", power: 120, limit: 450 },
    { time: "03:00", power: 280, limit: 450 },
    { time: "06:00", power: 340, limit: 450 },
    { time: "09:00", power: 180, limit: 450 },
    { time: "12:00", power: 210, limit: 450 },
    { time: "15:00", power: 390, limit: 450 },
    { time: "18:00", power: 350, limit: 450 },
    { time: "21:00", power: 190, limit: 450 },
  ];

  return (
    <div className="space-y-6 chart-enter">
      {/* KPI Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Network health Summary */}
        <GlassPanel className="p-5 flex flex-col justify-between min-h-[140px]">
          <div>
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span>Network status</span>
              <span className="flex items-center gap-1.5 text-success lowercase font-sans font-normal">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                {onlineChargers}/{totalChargers} online
              </span>
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tight num">
              {onlineChargers}{" "}
              <span className="text-[14px] font-normal text-muted-foreground">
                / {totalChargers} Chargers
              </span>
            </div>
          </div>
          <div className="mt-4 flex gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-success" /> {chargingCount} Charging
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-destructive" /> {faultedCount} Faults
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-warning" /> {maintCount} Maint.
            </span>
          </div>
        </GlassPanel>

        {/* Energy, Cost, Revenue */}
        <GlassPanel className="p-5 flex flex-col justify-between min-h-[140px]">
          <div>
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span>Today's Energy flow</span>
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tight num">
              2,840 <span className="text-[14px] font-normal text-muted-foreground">kWh</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-[11px] text-muted-foreground">
            <span className="text-warning">₹22,720 Cost</span>
            <span className="text-success">₹34,080 Rev.</span>
            <span className="text-destructive">4.2% loss</span>
          </div>
        </GlassPanel>

        {/* Demand & Queue */}
        <GlassPanel className="p-5 flex flex-col justify-between min-h-[140px]">
          <div>
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span>Peak demand</span>
              <Activity className="h-3.5 w-3.5 text-warning" />
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tight num">
              {totalPowerDeliveredKw > 0 ? totalPowerDeliveredKw : 380}{" "}
              <span className="text-[14px] font-normal text-muted-foreground">kW</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-[11px] text-muted-foreground">
            <span>500 kW Limit</span>
            <span className="flex items-center gap-1 text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Queue: {queueLength} vehicles
            </span>
          </div>
        </GlassPanel>

        {/* SLA & PM compliance */}
        <GlassPanel className="p-5 flex flex-col justify-between min-h-[140px]">
          <div>
            <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span>SLA & PM Compliance</span>
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
            </div>
            <div className="mt-2 text-[26px] font-semibold tracking-tight num">
              95.8% <span className="text-[14px] font-normal text-muted-foreground">SLA</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-[11px] text-muted-foreground">
            <span className="text-success">100% PM Compliant</span>
            <span className="text-success">98.2% Success</span>
          </div>
        </GlassPanel>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Load Curve Chart */}
        <GlassPanel className="lg:col-span-2 p-5 flex flex-col justify-between min-h-[380px]">
          <PanelHead
            title="Sanctioned Load vs. Active Power Demand"
            sub="Real-time aggregation across all active depots"
          />
          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="powerGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10 }}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
                <ChartTooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    fontSize: "11px",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="power"
                  name="Power Demand (kW)"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#powerGlow)"
                />
                <Area
                  type="monotone"
                  dataKey="limit"
                  name="Sanctioned Limit"
                  stroke="var(--color-destructive)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* AI Operations Panel */}
        <GlassPanel className="p-5 flex flex-col min-h-[380px]">
          <PanelHead
            title="AI Co-Pilot Recommendations"
            sub="Intelligent alerts, optimization opportunities & risks"
          />
          <div className="mt-4 space-y-3 overflow-y-auto flex-1">
            <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/8 transition-all hover:scale-[1.01] hover:bg-primary/12 cursor-pointer">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <Cpu className="h-3.5 w-3.5" /> Shift Charging Opportunity
              </div>
              <h4 className="mt-1.5 text-[12.5px] font-semibold text-foreground leading-tight">
                Shift Khapri Depot charging window to off-peak
              </h4>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                Saves ₹12,400 per day by shifting 4 buses out of high tariff window (18:00 - 22:00).
              </p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-primary font-medium">
                <span>Auto-reschedule opportunity</span>
                <span className="flex items-center">
                  Apply action <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-warning/20 bg-warning/8 transition-all hover:scale-[1.01] hover:bg-warning/12 cursor-pointer">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-warning">
                <AlertTriangle className="h-3.5 w-3.5" /> Queue Conflict Risk
              </div>
              <h4 className="mt-1.5 text-[12.5px] font-semibold text-foreground leading-tight">
                Conflicting allocation for TV-KHA-02
              </h4>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                Bus MH-31-EQ-1008 and MH-31-EQ-1014 assigned simultaneously. Re-routing recommended.
              </p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-warning font-medium">
                <span>Priority mismatch detected</span>
                <span className="flex items-center">
                  Re-allocate queue <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>

            {maintenance.some((m) => m.priority === "critical" && m.status !== "completed") && (
              <div className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/8 transition-all hover:scale-[1.01] hover:bg-destructive/12 cursor-pointer">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-destructive">
                  <Wrench className="h-3.5 w-3.5" /> Maintenance SLA Alert
                </div>
                <h4 className="mt-1.5 text-[12.5px] font-semibold text-foreground leading-tight">
                  Wadi Sensor Fault SLA Breach approaching
                </h4>
                <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                  TV-WAD-02 temperature fault SLA expires soon. Technician Rajesh is on site.
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-destructive font-medium">
                  <span>Critical temperature threshold</span>
                  <span className="flex items-center">
                    Open work ticket <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* Depot Schematic & Live Feeds */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Depot Overview Schematic */}
        <GlassPanel className="p-5 flex flex-col justify-between min-h-[360px]">
          <PanelHead
            title="Depot Operations Schematic"
            sub="Active chargers, peak load & anomalies across clusters"
          />
          <div className="mt-4 space-y-3.5">
            <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/30">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 items-center justify-center rounded bg-success/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                </span>
                <div>
                  <h4 className="text-[12.5px] font-semibold">Khapri Depot</h4>
                  <span className="text-[10px] text-muted-foreground">Cluster Alpha · Nagpur</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[12px] font-semibold num">2 / 2 Active</div>
                <div className="text-[10px] text-muted-foreground num">210 kW Peak load</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/30">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 items-center justify-center rounded bg-destructive/20 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-ping" />
                </span>
                <div>
                  <h4 className="text-[12.5px] font-semibold">Wadi Depot</h4>
                  <span className="text-[10px] text-muted-foreground">Cluster Beta · Nagpur</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[12px] font-semibold text-destructive num">
                  1 Active · 1 Fault
                </div>
                <div className="text-[10px] text-muted-foreground num">142 kW Peak load</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/30">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 items-center justify-center rounded bg-warning/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                </span>
                <div>
                  <h4 className="text-[12.5px] font-semibold">BKC Mumbai</h4>
                  <span className="text-[10px] text-muted-foreground">Cluster Gamma · Mumbai</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[12px] font-semibold text-warning num">
                  1 Active · 1 Maint.
                </div>
                <div className="text-[10px] text-muted-foreground num">227 kW Peak load</div>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Live Telemetry Feed */}
        <GlassPanel className="p-5 flex flex-col min-h-[360px]">
          <PanelHead
            title="Live Telemetry & Activity Feed"
            sub="Real-time charging operations timeline"
          />
          <div className="mt-4 space-y-3.5 overflow-y-auto max-h-[250px] pr-1 flex-1">
            {activities.map((a) => {
              const borderTheme =
                a.type === "error"
                  ? "border-destructive/30 bg-destructive/5"
                  : a.type === "warning"
                    ? "border-warning/30 bg-warning/5"
                    : a.type === "success"
                      ? "border-success/30 bg-success/5"
                      : "border-border/30 bg-card/20";
              return (
                <div
                  key={a.id}
                  className={`flex gap-3 px-3 py-2.5 rounded-lg border text-[12px] ${borderTheme} transition-colors hover:bg-card/40`}
                >
                  <span className="text-[10px] text-muted-foreground font-mono mt-0.5 num">
                    {a.time}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{a.message}</p>
                    <span className="text-[10px] text-muted-foreground">{a.depot}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};
