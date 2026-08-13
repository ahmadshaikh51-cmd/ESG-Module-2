import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AUDITS,
  ESG_TODAY,
  entityById,
  fmtDate,
  type Audit,
} from "@/lib/esg-data";
import { EmptyState, PanelCard, useEsg } from "../primitives";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isoDayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthMatrix(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7; // Mon = 0
  const start = new Date(year, month, 1 - startDow);
  const weeks: Date[][] = [];
  let cur = start;
  while (weeks.length < 6) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur));
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    weeks.push(week);
    if (cur.getMonth() > month || cur.getFullYear() > year) break;
  }
  return weeks;
}

function auditTint(a: Audit) {
  if (a.kind === "external") {
    return a.status === "closed"
      ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
      : a.status === "in-progress"
        ? "bg-primary/12 text-primary"
        : "bg-violet-500/12 text-violet-700 dark:text-violet-400";
  }
  return a.status === "closed"
    ? "bg-success/12 text-success"
    : a.status === "in-progress"
      ? "bg-amber-500/12 text-amber-700 dark:text-amber-400"
      : "bg-muted text-muted-foreground";
}

function StatusPill({ status }: { status: Audit["status"] }) {
  const map: Record<Audit["status"], { label: string; cls: string }> = {
    planned: { label: "Planned", cls: "bg-muted text-muted-foreground" },
    "in-progress": { label: "In Progress", cls: "bg-warning/12 text-warning" },
    closed: { label: "Closed", cls: "bg-success/12 text-success" },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        cls,
      )}
    >
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */

function AuditDetailCard({ audit, onClose }: { audit: Audit; onClose: () => void }) {
  const entity = entityById(audit.entityId);
  return (
    <PanelCard className="border-primary/30">
      <div className="flex items-start justify-between border-b border-border/60 px-5 py-3.5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={cn(
                "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                audit.kind === "external"
                  ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              )}
            >
              {audit.kind === "external" ? "External Audit" : "Internal Audit"}
            </span>
            <StatusPill status={audit.status} />
          </div>
          <h3 className="text-[14px] font-semibold leading-snug tracking-tight">{audit.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close detail"
        >
          ✕
        </button>
      </div>
      <div className="space-y-2.5 px-5 py-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12px]">
          <div>
            <div className="section-label mb-0.5">Entity</div>
            <div className="font-medium">{entity?.short ?? audit.entityId}</div>
          </div>
          {audit.standard && (
            <div>
              <div className="section-label mb-0.5">Standard</div>
              <div className="font-medium">{audit.standard}</div>
            </div>
          )}
          <div>
            <div className="section-label mb-0.5">Auditor</div>
            <div className="font-medium">
              {audit.auditorName}
              {audit.auditorOrg && (
                <span className="text-muted-foreground"> · {audit.auditorOrg}</span>
              )}
            </div>
          </div>
          <div>
            <div className="section-label mb-0.5">Scheduled</div>
            <div className="font-medium">{fmtDate(audit.scheduledOn)}</div>
          </div>
          {audit.conductedOn && (
            <div>
              <div className="section-label mb-0.5">Conducted</div>
              <div className="font-medium">{fmtDate(audit.conductedOn)}</div>
            </div>
          )}
        </div>
        {audit.reportDoc && (
          <div className="flex items-center gap-2 pt-1.5 border-t border-border/40">
            <div className="flex-1 text-[11.5px] text-muted-foreground">
              <span className="font-medium text-foreground">{audit.reportDoc.name}</span>
              {" · "}
              {audit.reportDoc.size}
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/16 transition-colors"
            >
              <ExternalLink className="h-3 w-3" aria-hidden />
              View Report
            </button>
          </div>
        )}
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */

function AuditItem({
  audit,
  selected,
  onSelect,
}: {
  audit: Audit;
  selected: boolean;
  onSelect: (a: Audit) => void;
}) {
  const entity = entityById(audit.entityId);
  return (
    <button
      type="button"
      onClick={() => onSelect(audit)}
      className={cn(
        "w-full text-left rounded-xl border px-4 py-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        selected
          ? "border-primary/40 bg-primary/5"
          : "border-border/50 bg-card hover:border-primary/25 hover:bg-muted/30",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <span
              className={cn(
                "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                audit.kind === "external"
                  ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              )}
            >
              {audit.kind === "external" ? "External" : "Internal"}
            </span>
            <StatusPill status={audit.status} />
          </div>
          <div className="text-[12.5px] font-semibold text-foreground leading-snug line-clamp-2">
            {audit.title}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span>{entity?.short ?? audit.entityId}</span>
            {audit.standard && <span className="text-muted-foreground/70">{audit.standard}</span>}
            <span className="font-medium text-foreground">{audit.auditorName}</span>
            {audit.auditorOrg && <span>{audit.auditorOrg}</span>}
            <span>
              <span className="font-medium text-foreground/80">Scheduled:</span>{" "}
              {fmtDate(audit.scheduledOn)}
            </span>
            {audit.conductedOn && (
              <span>
                <span className="font-medium text-foreground/80">Conducted:</span>{" "}
                {fmtDate(audit.conductedOn)}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */

function CalendarGrid({
  year,
  month,
  auditsByDay,
  onSelect,
}: {
  year: number;
  month: number;
  auditsByDay: Record<string, Audit[]>;
  onSelect: (a: Audit) => void;
}) {
  const weeks = useMemo(() => monthMatrix(year, month), [year, month]);
  return (
    <PanelCard className="overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border/40 text-center text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weeks.flat().map((day, i) => {
          const inMonth = day.getMonth() === month;
          const key = isoDayKey(day);
          const dayAudits = auditsByDay[key] ?? [];
          const isToday = sameDay(day, ESG_TODAY);
          return (
            <div
              key={i}
              className={cn(
                "min-h-[72px] border-b border-r border-border/30 p-1.5",
                !inMonth && "bg-muted/20",
                i % 7 === 6 && "border-r-0",
              )}
            >
              <div
                className={cn(
                  "mb-1 inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[11px] font-semibold",
                  isToday
                    ? "bg-primary text-primary-foreground"
                    : inMonth
                      ? "text-foreground"
                      : "text-muted-foreground/40",
                )}
              >
                {day.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayAudits.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onSelect(a)}
                    className={cn(
                      "block w-full truncate rounded px-1.5 py-0.5 text-left text-[9.5px] font-medium transition-opacity hover:opacity-75",
                      auditTint(a),
                    )}
                    title={a.title}
                  >
                    {a.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */

export function AssuranceCalendarPanel() {
  const { scope } = useEsg();
  const [cursor, setCursor] = useState({ y: ESG_TODAY.getFullYear(), m: ESG_TODAY.getMonth() });
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const audits = useMemo(() => {
    return AUDITS.filter((a) => {
      if (!scope.entityId) return true;
      return a.entityId === scope.entityId;
    });
  }, [scope.entityId]);

  const auditsByDay = useMemo(() => {
    const map: Record<string, Audit[]> = {};
    for (const a of audits) {
      (map[a.scheduledOn] ||= []).push(a);
    }
    return map;
  }, [audits]);

  const shift = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const toggleSelect = (a: Audit) =>
    setSelectedAudit((prev) => (prev?.id === a.id ? null : a));

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <PanelCard>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border/60">
          <div>
            <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              Assurance Calendar
            </h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Internal audits, external certifications, and compliance reviews across all depots.
            </p>
          </div>
          <div className="flex rounded-lg border border-border/60 overflow-hidden text-[11.5px]">
            {(["calendar", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={cn(
                  "px-3 py-1.5 font-medium capitalize transition-colors",
                  view === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        {/* Color legend */}
        <div className="flex flex-wrap items-center gap-4 px-5 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-muted-foreground/40" /> Internal — Planned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-amber-400" /> Internal — In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-violet-400" /> External — Planned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-primary/80" /> External — In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded bg-success/70" /> Closed
          </span>
        </div>
      </PanelCard>

      {/* Calendar view */}
      {view === "calendar" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => shift(-1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <div className="text-[14px] font-semibold tracking-tight">
              {MONTHS[cursor.m]} {cursor.y}
            </div>
            <button
              type="button"
              onClick={() => shift(1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <CalendarGrid
            year={cursor.y}
            month={cursor.m}
            auditsByDay={auditsByDay}
            onSelect={toggleSelect}
          />
          {selectedAudit && (
            <AuditDetailCard audit={selectedAudit} onClose={() => setSelectedAudit(null)} />
          )}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="space-y-3">
          {audits.length === 0 ? (
            <PanelCard>
              <EmptyState
                icon={CalendarDays}
                title="No audits in this scope"
                hint="Audits and certifications scheduled for your projects will appear here."
              />
            </PanelCard>
          ) : (
            <div className="space-y-4">
              {(["planned", "in-progress", "closed"] as Audit["status"][]).map((statusKey) => {
                const items = audits
                  .filter((a) => a.status === statusKey)
                  .sort((a, b) => a.scheduledOn.localeCompare(b.scheduledOn));
                if (items.length === 0) return null;
                const labels: Record<Audit["status"], string> = {
                  planned: "Upcoming",
                  "in-progress": "In Progress",
                  closed: "Closed",
                };
                return (
                  <div key={statusKey} className="space-y-2">
                    <div className="section-label px-1">{labels[statusKey]}</div>
                    {items.map((a) => (
                      <AuditItem
                        key={a.id}
                        audit={a}
                        selected={selectedAudit?.id === a.id}
                        onSelect={toggleSelect}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
          {selectedAudit && (
            <AuditDetailCard audit={selectedAudit} onClose={() => setSelectedAudit(null)} />
          )}
        </div>
      )}
    </div>
  );
}
