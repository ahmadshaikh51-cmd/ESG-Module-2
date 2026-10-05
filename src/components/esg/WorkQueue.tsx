import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronRight, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  countdownLabel,
  daysUntil,
  personById,
  recordPlace,
  recordState,
  STATE_META,
  typeByKey,
  type ComplianceRecord,
  type EsgState,
} from "@/lib/esg-data";
import {
  CriticalBeam,
  EmptyState,
  Gloss,
  StateDot,
  StatePill,
  WithheldPill,
  useEsg,
} from "./primitives";

function getInitials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColors(name?: string): string {
  if (!name) return "bg-primary/10 text-primary border-primary/20";
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const presets = [
    "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20",
    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
    "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-500/20",
    "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border-violet-500/20",
    "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
    "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20",
    "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 border-cyan-500/20",
  ];
  return presets[hash % presets.length];
}

type StateFilter = "all" | EsgState;

/**
 * The maintainer's work queue — lands on "what's due", most urgent first.
 * Notifications deep-link here with the relevant row pre-selected.
 */
export function WorkQueue({
  records,
  defaultFilter = "all",
  highlightId,
  compact = false,
}: {
  records: ComplianceRecord[];
  defaultFilter?: StateFilter;
  highlightId?: string;
  compact?: boolean;
}) {
  const { audience, openRecord } = useEsg();
  const [filter, setFilter] = useState<StateFilter>(defaultFilter);
  const highlightRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => setFilter(defaultFilter), [defaultFilter]);
  useEffect(() => {
    if (highlightId) highlightRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightId]);

  const visible = useMemo(() => {
    let rs = records.filter((r) => (audience === "external" ? !r.withheldExternal : true));
    if (filter !== "all") rs = rs.filter((r) => recordState(r) === filter);
    return rs.sort((a, b) => {
      const da = a.expiryDate ? daysUntil(a.expiryDate) : 9999;
      const db = b.expiryDate ? daysUntil(b.expiryDate) : 9999;
      return da - db;
    });
  }, [records, filter, audience]);

  const counts = useMemo(() => {
    const scoped = records.filter((r) => (audience === "external" ? !r.withheldExternal : true));
    return {
      all: scoped.length,
      overdue: scoped.filter((r) => recordState(r) === "overdue").length,
      expiring: scoped.filter((r) => recordState(r) === "expiring").length,
      valid: scoped.filter((r) => recordState(r) === "valid").length,
    };
  }, [records, audience]);

  const chips: { key: StateFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "overdue", label: "Overdue" },
    { key: "expiring", label: "Expiring" },
    { key: "valid", label: "Valid" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 px-5 py-2.5">
        <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/20 p-1">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              aria-pressed={filter === c.key}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 cursor-pointer",
                filter === c.key
                  ? "bg-teal-500/25 text-teal-800 dark:text-teal-200 font-bold shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {c.label}
              <span className="num text-[10.5px] font-semibold opacity-80">{counts[c.key]}</span>
            </button>
          ))}
        </div>
        <span className="ml-auto hidden text-[10.5px] text-muted-foreground sm:block">
          sorted most-urgent first · capture is always on, reporting is monthly
        </span>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Nothing due in this scope"
          hint={
            audience === "external" && counts.all === 0
              ? "Items withheld from the external view are not shown. Switch to Internal for the complete record."
              : "No items match this filter — the valid stock is holding."
          }
        />
      ) : (
        <div className={cn("overflow-auto", compact ? "max-h-[380px]" : "max-h-[520px]")}>
          <table className="w-full text-[12.5px]">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border/60 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-5 py-2.5 text-left font-medium">Item</th>
                <th className="px-3 py-2.5 text-left font-medium">Owner</th>
                <th className="px-3 py-2.5 text-right font-medium">Expiry clock</th>
                <th className="px-3 py-2.5 text-left font-medium">State</th>
                <th className="px-5 py-2.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const st = recordState(r);
                const type = typeByKey(r.typeKey);
                const owner = personById(r.ownerId);
                const overdue = st === "overdue";
                const selected = r.id === highlightId;
                const colors = getAvatarColors(owner?.name);
                return (
                  <tr
                    key={r.id}
                    ref={selected ? highlightRef : undefined}
                    onClick={() => openRecord(r.id)}
                    className={cn(
                      "cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-muted/40",
                      selected && "bg-primary/8 ring-1 ring-inset ring-primary/30",
                    )}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <CriticalBeam active={overdue} size="sm">
                          <StateDot state={st} />
                        </CriticalBeam>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-semibold text-foreground">
                              <Gloss text={type?.label ?? r.typeKey} />
                            </span>
                            {r.renewal === "initiated" && (
                              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9.5px] font-bold text-primary uppercase">
                                Renewal in progress
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[9.5px] font-semibold uppercase text-muted-foreground/90">
                              {type?.category === "permit" ? "Permit" : "Site"}
                            </span>
                            <span className="text-muted-foreground/30" aria-hidden>·</span>
                            <span>{recordPlace(r)}</span>
                            {r.withheldExternal && audience === "internal" && (
                              <WithheldPill className="hidden lg:inline-flex" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className={cn("h-7 w-7 shrink-0 rounded-full border text-[10px] font-semibold", colors)}>
                          <AvatarFallback className="bg-transparent uppercase">
                            {getInitials(owner?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-foreground text-[12px]">{owner?.name}</div>
                          <div className="truncate text-[10.5px] text-muted-foreground">{owner?.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className="num text-[13px] font-semibold block"
                        style={{
                          color: st === "valid" ? "var(--color-muted-foreground)" : STATE_META[st].color,
                        }}
                      >
                        {countdownLabel(r)}
                      </span>
                      {r.expiryDate && (
                        <span className="text-[10.5px] text-muted-foreground block font-normal">
                          {r.expiryDate}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <StatePill state={st} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                            overdue
                              ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                              : st === "expiring"
                                ? "border-warning/35 bg-warning/10 text-warning hover:bg-warning/20"
                                : "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10",
                          )}
                        >
                          {overdue ? "Remediate" : st === "expiring" ? "Renew" : "View"}
                          <ArrowRight className="h-3 w-3" aria-hidden />
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 hidden sm:block" aria-hidden />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
