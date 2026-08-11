import React from "react";
import {
  AlertCircle,
  Calendar,
  Clock,
  User,
  History,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { EscalationDetail } from "@/lib/esg-escalations";

interface EscalationStatusIndicatorProps {
  escalation: EscalationDetail;
  className?: string;
}

export function EscalationStatusIndicator({
  escalation,
  className,
}: EscalationStatusIndicatorProps) {
  const isCritical = escalation.level >= 3;
  const isEscalated = escalation.level === 2;
  const isOverdue = escalation.level === 1;

  const badgeColor = isCritical
    ? "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15 animate-pulse"
    : isEscalated
      ? "bg-destructive/8 text-destructive border-destructive/15 hover:bg-destructive/12"
      : isOverdue
        ? "bg-warning/10 text-warning border-warning/20 hover:bg-warning/15"
        : "bg-muted/80 text-muted-foreground border-border/60 hover:bg-muted";

  const statusLabel = isCritical
    ? `Critical · L${escalation.level}`
    : isEscalated
      ? `Escalated · L${escalation.level}`
      : isOverdue
        ? `Overdue · L${escalation.level}`
        : "Reminder";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring",
            badgeColor,
            className
          )}
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{statusLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[320px] rounded-xl border border-border/60 bg-card p-4 shadow-elevated z-50"
      >
        <div className="space-y-3.5">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
            <ShieldAlert className={cn(
              "h-4.5 w-4.5",
              isCritical ? "text-destructive" : isEscalated ? "text-destructive" : "text-warning"
            )} />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Escalation Status
              </span>
              <span className={cn(
                "text-[13px] font-extrabold uppercase tracking-tight",
                isCritical ? "text-destructive" : isEscalated ? "text-destructive" : "text-warning"
              )}>
                {escalation.severity} · LEVEL {escalation.level}
              </span>
            </div>
          </div>

          {/* Reason */}
          <p className="text-[11.5px] leading-relaxed text-foreground bg-muted/30 border border-border/40 rounded-lg p-2">
            {escalation.reason}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="font-bold text-muted-foreground uppercase text-[9px] block">
                Original Owner
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                <User className="h-3 w-3 text-muted-foreground" />
                {escalation.owner}
              </span>
            </div>

            <div>
              <span className="font-bold text-muted-foreground uppercase text-[9px] block">
                Escalated To
              </span>
              <span className="font-semibold text-primary flex items-center gap-1 mt-0.5">
                <ShieldAlert className="h-3 w-3" />
                {escalation.escalatedTo}
              </span>
            </div>

            <div>
              <span className="font-bold text-muted-foreground uppercase text-[9px] block">
                Due Date
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {escalation.dueDate}
              </span>
            </div>

            <div>
              <span className="font-bold text-muted-foreground uppercase text-[9px] block">
                Days Overdue
              </span>
              <span className="font-bold text-destructive flex items-center gap-1 mt-0.5 num">
                <Clock className="h-3 w-3" />
                {escalation.daysOverdue} days
              </span>
            </div>
          </div>

          {/* SLA countdown */}
          {escalation.nextEscalationDate && (
            <div className="text-[10px] bg-primary/5 text-primary border border-primary/10 rounded px-2 py-1 flex justify-between font-medium">
              <span>Next Escalation Milestone:</span>
              <span className="font-bold">{escalation.nextEscalationDate}</span>
            </div>
          )}

          {/* History log */}
          {escalation.history && escalation.history.length > 0 && (
            <div className="space-y-1.5 border-t border-border/40 pt-2.5">
              <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <History className="h-3.5 w-3.5" />
                Audit & Escalation History
              </span>
              <div className="relative pl-3 border-l border-border/60 ml-1.5 space-y-2 mt-1">
                {escalation.history.map((h, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[16px] top-1 h-1.5 w-1.5 rounded-full bg-border border border-card" />
                    <div className="text-[10px] text-muted-foreground flex justify-between font-semibold">
                      <span>L{h.level} Entry</span>
                      <span className="font-normal num text-[9.5px]">{h.date}</span>
                    </div>
                    <div className="text-[10px] text-foreground leading-snug mt-0.5">
                      {h.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
