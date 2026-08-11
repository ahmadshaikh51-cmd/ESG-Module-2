import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Bell,
  Building2,
  Eye,
  Globe,
  Megaphone,
  ShieldAlert,
  TimerReset,
  FolderKanban,
  ChevronDown,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSearch } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { NOTIFICATIONS, PERIODS, PROJECT_LIFECYCLES, type EsgNotification } from "@/lib/esg-data";
import { useEsg, type Audience } from "./primitives";
import { DateRangePicker, ScopeWheelPicker } from "./WheelPicker";
import { Segmented } from "./Segmented";
import { getCurrentUser } from "@/lib/auth";
import { getRoleFromEmail, ESG_ROLES_CONFIG } from "@/lib/esg-roles";
import { generateEscalations } from "@/lib/esg-escalations";

const AREAS: { key: string; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "esms", label: "ESMS" },
  { key: "projects", label: "Project Regulatory Compliance" },
  { key: "reports", label: "Reporting" },
  { key: "vendors", label: "Vendors" },
  { key: "masters", label: "Masters" },
];

function ProjectFilterControl() {
  const { projectId, setProjectId } = useEsg();
  const activeProj = PROJECT_LIFECYCLES.find((p) => p.projectId === projectId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/8 px-2.5 text-[12px] font-medium text-primary transition-colors hover:bg-primary/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          aria-label={`Project filter: ${activeProj ? activeProj.project : "All Projects"}`}
        >
          <Building2 className="h-3.5 w-3.5" aria-hidden />
          <span className="truncate max-w-[180px]">
            {activeProj ? activeProj.project : "All Projects"}
          </span>
          <ChevronDown className="h-3 w-3 opacity-60" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[240px] rounded-xl border-border/60 p-1.5 shadow-elevated bg-card"
      >
        <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/75 border-b border-border/40 mb-1">
          Select Project
        </div>
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => setProjectId(null)}
            className={cn(
              "flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors hover:bg-muted/60",
              projectId === null
                ? "bg-muted font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All Projects
          </button>
          {PROJECT_LIFECYCLES.map((p) => (
            <button
              key={p.projectId}
              type="button"
              onClick={() => setProjectId(p.projectId)}
              className={cn(
                "flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors hover:bg-muted/60",
                projectId === p.projectId
                  ? "bg-muted font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.project}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** The audience lens — the hero control. Larger, brand-filled, unmistakable. */
function AudienceControl() {
  const { audience, setAudience } = useEsg();
  return (
    <div className="flex items-center gap-2.5">
      <Segmented<Audience>
        ariaLabel="Audience view — internal shows the complete record; external shows the curated view"
        size="lg"
        emphasis
        value={audience}
        onChange={setAudience}
        options={[
          { key: "internal", label: "Internal", Icon: Eye },
          { key: "external", label: "External", Icon: Globe },
        ]}
      />
      <span className="hidden text-[11px] font-medium leading-tight text-muted-foreground lg:block">
        {audience === "internal" ? (
          <>
            Complete record
            <br />
            nothing withheld
          </>
        ) : (
          <>
            Curated view
            <br />
            non-compliance hidden
          </>
        )}
      </span>
    </div>
  );
}

const NOTIF_ICON: Record<string, any> = {
  expiry: TimerReset,
  digest: Megaphone,
  escalation: ShieldAlert,
  reminder: TimerReset,
};

function NotificationsBell() {
  const { goto } = useEsg();
  const [activeFilter, setActiveFilter] = useState<"all" | "action" | "escalation" | "reminder">("all");
  
  const currentUser = getCurrentUser();
  const userNotifs = useMemo(() => {
    return generateEscalations(currentUser ? currentUser.email : null);
  }, [currentUser]);

  const filteredNotifs = useMemo(() => {
    return userNotifs.filter((n) => {
      if (activeFilter === "action") {
        return (n.level !== undefined && n.level > 0) || n.kind === "escalation";
      }
      if (activeFilter === "escalation") {
        return n.kind === "escalation" || (n.level !== undefined && n.level >= 2);
      }
      if (activeFilter === "reminder") {
        return n.kind === "reminder" || n.level === 0;
      }
      return true;
    });
  }, [userNotifs, activeFilter]);

  const unreadCount = useMemo(() => {
    return userNotifs.filter((n) => n.unread).length;
  }, [userNotifs]);

  const handleNotifClick = (n: EsgNotification) => {
    // Mark as read in session/local state if we wanted to (omitted for stub simplicity)
    if (n.indicatorId) {
      goto("projects", { sub: "amr", record: n.indicatorId });
    } else if (n.recordId) {
      goto("overview", { record: n.recordId });
    } else if (n.policyId) {
      goto("esms", { sub: "policies", record: n.policyId });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative grid h-8 w-8 place-items-center rounded-lg border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 cursor-pointer"
          aria-label={`Notifications${unreadCount ? ` — ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-3.5 w-3.5" aria-hidden />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] rounded-xl border-border/60 p-0 shadow-elevated z-50 bg-card"
      >
        <div className="border-b border-border/60 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold tracking-tight text-foreground">
              Attention Center
            </span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
                {unreadCount} Actions Awaiting
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal">
            Unified alert tracking and automated SLA escalation layer.
          </p>

          {/* Filters row */}
          <div className="flex gap-1.5 mt-2.5">
            {(["all", "action", "escalation", "reminder"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "text-[10.5px] px-2.5 py-0.5 rounded-full font-bold capitalize transition-all border cursor-pointer",
                  activeFilter === f
                    ? "bg-primary text-primary-foreground border-primary/20"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted/80"
                )}
              >
                {f === "action" ? "Action Required" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[340px] overflow-auto divide-y divide-border/40">
          {filteredNotifs.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center text-muted-foreground">
              <span className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground/60 mb-2">
                <Bell className="h-4.5 w-4.5" />
              </span>
              <p className="text-[12px] font-semibold">All caught up</p>
              <p className="text-[10.5px] text-muted-foreground/80 mt-0.5">
                No active notifications found for this filter.
              </p>
            </div>
          ) : (
            filteredNotifs.map((n) => {
              const Icon = NOTIF_ICON[n.kind] || Bell;
              const isEscalation = n.kind === "escalation";
              const isReminder = n.kind === "reminder";
              
              const levelLabel = n.level !== undefined 
                ? (n.level === 3 || n.level === 4 ? `CRITICAL · LEVEL ${n.level}` : `ESCALATION · LEVEL ${n.level}`)
                : "NOTIFICATION";

              const headerColor = n.level !== undefined && n.level >= 3
                ? "text-destructive bg-destructive/8 border border-destructive/15"
                : isEscalation
                  ? "text-destructive bg-destructive/5 border border-destructive/10"
                  : isReminder
                    ? "text-warning bg-warning/8 border border-warning/15"
                    : "text-primary bg-primary/8 border border-primary/15";

              const clickable = !!(n.recordId || n.indicatorId || n.policyId);

              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex flex-col gap-2 p-4 text-left border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors",
                    n.unread && "bg-primary/3"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-[9px] font-extrabold px-1.5 py-0.5 rounded", headerColor)}>
                      {levelLabel}
                    </span>
                    <span className="text-[9.5px] text-muted-foreground font-semibold num">
                      {new Date(n.when).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-[12px] font-bold text-foreground truncate" title={n.title}>
                      {n.title}
                    </h5>
                    <p className="text-[11.5px] leading-snug text-muted-foreground mt-1">
                      {n.detail}
                    </p>
                  </div>

                  {/* Metadata fields */}
                  {(n.owner || n.escalatedTo) && (
                    <div className="bg-muted/30 border border-border/40 rounded-lg p-2 text-[10px] space-y-1 mt-1">
                      {n.owner && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Owner:</span>
                          <span className="text-foreground font-semibold">{n.owner}</span>
                        </div>
                      )}
                      {n.level !== undefined && n.level > 0 && n.escalatedTo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground font-medium">Escalated to:</span>
                          <span className="text-primary font-bold">{n.escalatedTo}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {clickable && (
                    <button
                      type="button"
                      onClick={() => handleNotifClick(n)}
                      className="mt-1.5 w-full h-7 text-[11px] font-bold bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                    >
                      View Record
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getPageTitle(area: string, sub?: string) {
  if (area === "esms") {
    switch (sub) {
      case "policies":
      case "sops":
        return "Policies & SOPs";
      case "esdd":
      case "esia":
        return "Assessments";
      case "audit-internal":
      case "audit-external":
        return "Audits & Reviews";
      case "training":
        return "Training Panel";
      case "monitoring":
        return "Environmental Monitoring";
      case "lifecycle":
        return "Project Lifecycle";
      case "esap":
        return "Environmental & Social Action Plan";
      default:
        return "ESMS Dashboard";
    }
  }
  if (area === "projects") {
    switch (sub) {
      case "permits":
        return "Compliance to Permits";
      case "site":
        return "Site Compliance";
      case "nc":
        return "Non-Conformities";
      case "amr":
        return "Annual Monitoring";
      case "ghg":
        return "Greenhouse Gas Emissions";
      case "carbon":
        return "Carbon Accounting";
      case "data-entry":
        return "ESG Indicator Data Entry";
      default:
        return "Project Regulatory Compliance";
    }
  }
  if (area === "reports") return "Compliance Reporting";
  if (area === "vendors") return "Vendor Management";
  if (area === "masters") return "System Masters";
  return "Overview Dashboard";
}

/** ESG sub-header: in-tab navigation + the always-visible scope / period / audience context. */
export function EsgHeader({ area }: { area: string }) {
  const { goto, scope, setScope, goBack, hasHistory } = useEsg();
  const search = useSearch({ strict: false }) as any;
  const sub = search?.sub;

  const currentUser = getCurrentUser();
  const esgRole = currentUser ? getRoleFromEmail(currentUser.email) : "esg_team";
  const roleConfig = ESG_ROLES_CONFIG[esgRole] || ESG_ROLES_CONFIG.esg_team;
  const allowedAreas = AREAS.filter((a) => roleConfig.tabs.includes(a.key));

  return (
    <div className="space-y-3">
      {hasHistory && goBack && (
        <div className="flex items-center gap-3 border-b border-border/40 pb-3 mb-1">
          <button
            onClick={goBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-card/60 text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground hover:-translate-x-0.5 active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/60 shadow-sm"
            aria-label="Go Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="h-4 w-[1px] bg-border/60" />
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-foreground tracking-tight select-none">
              {getPageTitle(area, sub)}
            </span>
          </div>
        </div>
      )}

      {/* Audience lens leads on the left — it changes what every screen shows. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <AudienceControl />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <ProjectFilterControl />
          <DateRangePicker />
          <NotificationsBell />
        </div>
      </div>

      <Segmented
        ariaLabel="ESG areas"
        size="md"
        value={area}
        onChange={goto}
        className="w-full [&>button]:flex-1"
        options={allowedAreas.map((a) => ({ key: a.key, label: a.label }))}
      />
    </div>
  );
}
