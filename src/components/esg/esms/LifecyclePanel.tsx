import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PanelCard, useEsg } from "../primitives";
import {
  ArrowDown,
  Globe,
  UserCog,
  ShieldCheck,
  ArrowLeftRight,
  Zap,
  Trash2,
  Heart,
  Circle,
  Waypoints,
  MapPin,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  entityById,
  fmtDate,
  isEsmsSubAvailable,
  lifecycleDaysInStage,
  lifecycleIsBottleneck,
  lifecycleStageByKey,
  lifecycleStageCounts,
  PROJECT_LIFECYCLES,
} from "@/lib/esg-data";

// Vertical connection line
function VerticalLine() {
  return <div className="w-[1px] h-6 bg-border mx-auto" />;
}

// Top-level flowchart nodes
function Node({
  title,
  subtitle,
  variant = "default",
  onClick,
}: {
  title: string;
  subtitle?: string;
  variant?: "primary" | "default" | "active";
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-[260px] flex flex-col items-center justify-center p-3.5 rounded-xl border bg-card text-center transition-all hover:-translate-y-0.5 hover:shadow-md z-10",
        variant === "primary" &&
          "bg-primary text-primary-foreground border-primary rounded-full py-2.5",
        variant === "active" &&
          "border-primary/60 shadow-[0_0_0_2px_rgba(var(--primary),0.2)] bg-card",
        onClick ? "cursor-pointer" : "cursor-default",
      )}
    >
      <span
        className={cn(
          "text-[12.5px] font-bold leading-tight",
          variant === "primary" && "text-primary-foreground",
          variant === "active" && "text-primary",
        )}
      >
        {title}
      </span>
      {subtitle && (
        <span className="text-[10.5px] text-muted-foreground mt-0.5 leading-tight">{subtitle}</span>
      )}
    </div>
  );
}

// Branch column header (Environment, Labour, OH&S)
function BranchHeader({
  title,
  color,
  icon: Icon,
}: {
  title: string;
  color: "green" | "orange" | "red";
  icon: any;
}) {
  const colorClasses = {
    green: "bg-success/15 text-success border-success/30",
    orange: "bg-warning/15 text-warning border-warning/30",
    red: "bg-destructive/15 text-destructive border-destructive/30",
  };

  return (
    <div
      className={cn(
        "w-full py-2.5 px-4 rounded-lg border flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider mb-4",
        colorClasses[color],
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {title}
    </div>
  );
}

// Standard branch nodes (Permits, Compliance)
function BranchNode({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full flex flex-col items-start p-3.5 rounded-xl border border-border bg-card hover:-translate-y-0.5 transition-transform shadow-sm mb-3",
        onClick ? "cursor-pointer hover:shadow-md" : "cursor-default",
      )}
    >
      <span className="text-[11.5px] font-bold text-foreground">{title}</span>
      <span className="text-[10.5px] text-muted-foreground leading-tight mt-0.5">{subtitle}</span>
    </div>
  );
}

// Solid action buttons
function BranchAction({
  title,
  color,
  onClick,
}: {
  title: string;
  color: "green" | "orange" | "red";
  onClick?: () => void;
}) {
  const colorClasses = {
    green: "bg-success text-success-foreground hover:bg-success/90",
    orange: "bg-warning text-warning-foreground hover:bg-warning/90",
    red: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full py-2.5 px-4 rounded-md text-center text-[11.5px] font-bold cursor-pointer transition-colors mb-3 shadow-sm",
        colorClasses[color],
      )}
    >
      {title}
    </div>
  );
}

// Meta Data Table component
function MetaDataCard({
  items,
  color,
}: {
  items: { label: string; icon?: any }[];
  color: "green" | "orange" | "red";
}) {
  const headerColors = {
    green: "bg-success text-success-foreground",
    orange: "bg-warning text-warning-foreground",
    red: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="w-full rounded-xl border border-border bg-card overflow-hidden mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={cn(
          "w-full px-3.5 py-2.5 text-[11px] font-bold flex justify-between items-center",
          headerColors[color],
        )}
      >
        <span>META DATA.xlsx</span>
        <ArrowDown className="w-3.5 h-3.5 opacity-70" />
      </div>
      <div className="flex flex-col">
        {items.map((item, i) => (
          <div
            key={i}
            className="px-3.5 py-2.5 text-[10.5px] text-muted-foreground border-b border-border last:border-0 hover:bg-muted/50 transition-colors flex items-center gap-2.5"
          >
            {item.icon ? (
              <item.icon className="w-3.5 h-3.5 opacity-60" />
            ) : (
              <Circle className="w-1.5 h-1.5 opacity-40 fill-current" />
            )}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LifecyclePanel() {
  const { goto, scope } = useEsg();
  const [mode, setMode] = useState<"all" | string>("all");

  useEffect(() => {
    if (scope.entityId) {
      const proj = PROJECT_LIFECYCLES.find((p) => p.entityId === scope.entityId);
      if (proj) {
        setMode(proj.projectId);
      } else {
        setMode("all");
      }
    } else {
      setMode("all");
    }
  }, [scope.entityId]);

  const counts = useMemo(() => lifecycleStageCounts(), []);
  const activeLifecycle =
    mode !== "all" ? PROJECT_LIFECYCLES.find((p) => p.projectId === mode) : undefined;
  const bottlenecked = PROJECT_LIFECYCLES.filter(lifecycleIsBottleneck);
  const nodeTitle = useMemo(() => {
    if (!activeLifecycle) return "Project Initiation";
    if (activeLifecycle.projectId === "pl-mbmt") return "MBMT Initiation";
    if (activeLifecycle.projectId === "pl-silvassa") return "Silvassa Initiation";
    if (activeLifecycle.projectId === "pl-noida") return "Noida Initiation";
    const short = entityById(activeLifecycle.entityId)?.short || "Project";
    return `${short} Initiation`;
  }, [activeLifecycle]);

  const onOpen = (sub: string) => goto("esms", { sub });

  return (
    <div className="space-y-4">
      {/* Top Controls from old flow */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Waypoints className="h-4 w-4 text-primary" aria-hidden />
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="h-8 w-[240px] text-[12px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">
                All projects — pipeline view
              </SelectItem>
              {PROJECT_LIFECYCLES.map((p) => (
                <SelectItem key={p.projectId} value={p.projectId} className="text-[12px]">
                  {p.project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-foreground/25 bg-muted/50" />{" "}
            Start/end
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md border border-primary/25 bg-primary/8" /> Process
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md border border-warning/40 bg-warning/10" /> Decision
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md border border-dashed border-border bg-card" />{" "}
            Document
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md border border-destructive/60 bg-destructive/8" />{" "}
            Bottleneck
          </span>
        </div>
      </div>

      {activeLifecycle && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-[12px]">
          <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
          <span className="font-medium">{activeLifecycle.project}</span>
          <span className="text-muted-foreground">
            · {entityById(activeLifecycle.entityId)?.short} · in{" "}
            <span className="font-semibold">
              {lifecycleStageByKey(activeLifecycle.currentStage)?.label ||
                activeLifecycle.currentStage}
            </span>{" "}
            since {fmtDate(activeLifecycle.stageEnteredOn)}
          </span>
          {lifecycleIsBottleneck(activeLifecycle) && (
            <span className="rounded-md bg-destructive/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
              Bottlenecked
            </span>
          )}
        </div>
      )}

      {mode === "all" && bottlenecked.length > 0 && (
        <div className="rounded-xl border border-destructive/35 bg-destructive/6 px-4 py-2.5 text-[12px] font-medium text-destructive">
          {bottlenecked.length} project{bottlenecked.length === 1 ? "" : "s"} stuck beyond the
          normal window — {bottlenecked.map((p) => p.project).join(", ")}.
        </div>
      )}

      <PanelCard>
        <div className="overflow-x-auto p-8 flex justify-center pb-12">
          <div className="flex flex-col items-center min-w-[850px]">
            {/* Trunk */}
            <Node title={nodeTitle} variant="primary" />
            <VerticalLine />
            <Node
              title="Preliminary E&S Screening"
              subtitle="Initial impact assessment report"
              onClick={() => onOpen("screening")}
            />
            <VerticalLine />
            <Node
              title="ESDD Report"
              subtitle="Environmental & Social Due Diligence"
              onClick={() => onOpen("esdd")}
            />
            <VerticalLine />
            <Node
              title="ESAP"
              subtitle="Environmental & Social Action Plan"
              variant="active"
              onClick={() => onOpen("esap")}
            />

            {/* Splitter */}
            <div className="w-[1px] h-6 bg-border" />
            <div className="w-[66.6%] h-[1px] bg-border" />
            <div className="w-[66.6%] flex justify-between">
              <div className="w-[1px] h-6 bg-border" />
              <div className="w-[1px] h-6 bg-border" />
              <div className="w-[1px] h-6 bg-border" />
            </div>

            {/* Branches Grid */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-[950px]">
              {/* Environment Branch */}
              <div className="flex flex-col items-center w-full">
                <BranchHeader title="Environment" color="green" icon={Globe} />
                <BranchNode
                  title="Permits"
                  subtitle="Environmental clearance & licensing"
                  onClick={() => onOpen("permits")}
                />
                <BranchNode
                  title="Compliance"
                  subtitle="Statutory verification"
                  onClick={() => onOpen("compliance")}
                />
                <BranchNode
                  title="Environmental Monitoring"
                  subtitle="Resource mapping"
                  onClick={() => onOpen("monitoring")}
                />

                <BranchAction
                  title="Environmental Monitoring"
                  color="green"
                  onClick={() => onOpen("monitoring")}
                />

                <MetaDataCard
                  color="green"
                  items={[
                    { label: "Vehicle", icon: ArrowLeftRight },
                    { label: "Energy", icon: Zap },
                    { label: "Waste", icon: Trash2 },
                    { label: "Consumption", icon: Heart },
                  ]}
                />

                <BranchAction title="Training" color="green" onClick={() => onOpen("training")} />
                <BranchAction
                  title="Biannual monitoring"
                  color="green"
                  onClick={() => onOpen("training")}
                />
              </div>

              {/* Labour Branch */}
              <div className="flex flex-col items-center w-full">
                <BranchHeader title="Labour" color="orange" icon={UserCog} />
                <BranchNode
                  title="Permits"
                  subtitle="Labour law compliance"
                  onClick={() => onOpen("permits")}
                />
                <BranchNode
                  title="Compliance"
                  subtitle="Wage & Hour verification"
                  onClick={() => onOpen("compliance")}
                />
                <BranchNode
                  title="Social Monitoring"
                  subtitle="Workforce demographics"
                  onClick={() => onOpen("monitoring")}
                />

                <BranchAction
                  title="Social Monitoring"
                  color="orange"
                  onClick={() => onOpen("monitoring")}
                />

                <MetaDataCard
                  color="orange"
                  items={[
                    { label: "Internal Grievance Tracker" },
                    { label: "Stakeholder Engagement Register" },
                    { label: "MOM Tracker" },
                  ]}
                />

                <BranchAction title="Training" color="orange" onClick={() => onOpen("training")} />
                <BranchAction
                  title="Biannual monitoring"
                  color="orange"
                  onClick={() => onOpen("training")}
                />
              </div>

              {/* OH&S Branch */}
              <div className="flex flex-col items-center w-full">
                <BranchHeader title="OH&S" color="red" icon={ShieldCheck} />
                <BranchNode
                  title="Permits"
                  subtitle="Safety licensing"
                  onClick={() => onOpen("permits")}
                />
                <BranchNode
                  title="Compliance"
                  subtitle="Audit protocols"
                  onClick={() => onOpen("compliance")}
                />
                <BranchNode
                  title="Social Monitoring"
                  subtitle="Incident tracking"
                  onClick={() => onOpen("monitoring")}
                />

                <BranchAction
                  title="Social Monitoring"
                  color="red"
                  onClick={() => onOpen("monitoring")}
                />

                <MetaDataCard
                  color="red"
                  items={[
                    { label: "Accident / Incident Register" },
                    { label: "PPE Register" },
                    { label: "OHS Inspection Register" },
                    { label: "First Aid Register" },
                    { label: "Fire Extinguisher Register" },
                  ]}
                />

                <BranchAction title="Training" color="red" onClick={() => onOpen("training")} />
                <BranchAction
                  title="Biannual monitoring"
                  color="red"
                  onClick={() => onOpen("training")}
                />
              </div>
            </div>
          </div>
        </div>
      </PanelCard>
    </div>
  );
}
