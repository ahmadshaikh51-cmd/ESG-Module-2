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

const NOTIF_ICON: Record<EsgNotification["kind"], typeof Bell> = {
  expiry: TimerReset,
  digest: Megaphone,
  escalation: ShieldAlert,
};

function NotificationsBell() {
  const { goto } = useEsg();
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative grid h-8 w-8 place-items-center rounded-lg border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          aria-label={`Notifications${unread ? ` — ${unread} unread` : ""}`}
        >
          <Bell className="h-3.5 w-3.5" aria-hidden />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] rounded-xl border-border/60 p-0 shadow-elevated"
      >
        <div className="border-b border-border/60 px-4 py-3">
          <div className="text-[13px] font-semibold tracking-tight">Notifications</div>
          <p className="text-[11px] text-muted-foreground">
            Per-item renewal alerts, escalations, and the monthly digest — deduplicated by design.
          </p>
        </div>
        <div className="max-h-[340px] overflow-auto">
          {NOTIFICATIONS.map((n) => {
            const Icon = NOTIF_ICON[n.kind];
            const clickable = !!n.recordId;
            return (
              <button
                key={n.id}
                type="button"
                disabled={!clickable}
                onClick={() => n.recordId && goto("overview", { record: n.recordId })}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-border/40 px-4 py-3 text-left last:border-0",
                  clickable && "cursor-pointer transition-colors hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg",
                    n.kind === "escalation"
                      ? "bg-destructive/12 text-destructive"
                      : n.kind === "expiry"
                        ? "bg-warning/14 text-warning"
                        : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-[12.5px]",
                      n.unread ? "font-semibold" : "font-medium",
                    )}
                  >
                    {n.title}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
                    {n.detail}
                  </span>
                  {clickable && (
                    <span className="mt-1 block text-[10.5px] font-medium text-primary">
                      Open in work queue →
                    </span>
                  )}
                </span>
              </button>
            );
          })}
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
        options={AREAS.map((a) => ({ key: a.key, label: a.label }))}
      />
    </div>
  );
}
