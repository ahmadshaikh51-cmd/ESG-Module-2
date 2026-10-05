import React from 'react';
import {
  FileSearch,
  Link2,
  Calendar,
  User,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  esapSourceLabel,
  esapState,
  fmtDate,
  personById,
  type EsapAction,
} from '@/lib/esg-data';

interface EsapDetailDrawerProps {
  action: EsapAction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdvanceStatus?: (action: EsapAction) => void;
  onOpenSource?: (sub: string) => void;
}

export function EsapDetailDrawer({
  action,
  open,
  onOpenChange,
  onAdvanceStatus,
  onOpenSource,
}: EsapDetailDrawerProps) {
  if (!action) return null;

  const st = esapState(action);
  const closed = action.status === 'closed';
  const owner = personById(action.ownerId);
  const src = esapSourceLabel(action.source);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-6">
        <DialogHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-[18px] font-bold text-foreground flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-primary" />
                <span>{action.action}</span>
              </DialogTitle>
              {action.ncRef && (
                <div className="mt-1">
                  <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                    NC Reference: {action.ncRef}
                  </span>
                </div>
              )}
            </div>

            <span
              className={cn(
                'inline-flex items-center justify-center gap-1 rounded-md px-3 py-1 text-[11px] font-semibold uppercase tracking-wider',
                closed
                  ? 'bg-success/12 text-success'
                  : st === 'overdue'
                  ? 'bg-destructive/12 text-destructive'
                  : action.status === 'in-progress'
                  ? 'bg-warning/14 text-warning'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {closed
                ? 'Closed'
                : st === 'overdue'
                ? 'Overdue'
                : action.status === 'in-progress'
                ? 'In progress'
                : 'Open'}
            </span>
          </div>
        </DialogHeader>

        {/* Overview Grid */}
        <div className="grid grid-cols-2 gap-4 text-[12.5px]">
          {/* Finding */}
          <div className="col-span-2 rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground block">
              Origin Finding / Non-Conformance
            </span>
            <p className="font-medium text-foreground">{action.finding}</p>
          </div>

          {/* Source */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground block">
              Source Module
            </span>
            <button
              type="button"
              onClick={() => onOpenSource?.(src.sub)}
              className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline text-left"
            >
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              {src.label}
            </button>
          </div>

          {/* Owner */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground block">
              Assigned Owner
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {owner?.name ?? action.ownerId} ({owner?.role ?? 'Owner'})
            </div>
          </div>

          {/* Due Date */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground block">
              Target Due Date
            </span>
            <div className="flex items-center gap-1.5 font-semibold">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={cn(st === 'overdue' && !closed ? 'text-destructive font-bold' : 'text-foreground')}>
                {closed && action.closedOn ? `Closed on ${fmtDate(action.closedOn)}` : fmtDate(action.due)}
              </span>
            </div>
          </div>

          {/* Severity */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10.5px] font-semibold uppercase text-muted-foreground block">
              Risk Severity
            </span>
            <div>
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize',
                  action.severity === 'major'
                    ? 'bg-destructive/12 text-destructive'
                    : action.severity === 'observation'
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-warning/14 text-warning',
                )}
              >
                {action.severity ?? 'minor'}
              </span>
            </div>
          </div>
        </div>

        {/* Audit Log / History Timeline */}
        <div className="space-y-3">
          <h4 className="text-[13px] font-bold text-foreground">Action Timeline & Compliance Audit Log</h4>
          <div className="space-y-2 border-l-2 border-border/60 pl-4 text-[12px]">
            <div className="relative space-y-0.5">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="font-semibold text-foreground">Action Created & Logged into Register</span>
              <span className="block text-[11px] text-muted-foreground">Source: {src.label}</span>
            </div>

            {action.status === 'in-progress' && (
              <div className="relative space-y-0.5 pt-2">
                <span className="absolute -left-[21px] top-3.5 h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-foreground">In Progress — Work Started</span>
                <span className="block text-[11px] text-muted-foreground">Assigned to {owner?.name}</span>
              </div>
            )}

            {closed && (
              <div className="relative space-y-0.5 pt-2">
                <span className="absolute -left-[21px] top-3.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Action Verified & Closed
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  Closed on {fmtDate(action.closedOn ?? action.due)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        {!closed && onAdvanceStatus && (
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button
              size="sm"
              onClick={() => {
                onAdvanceStatus(action);
                onOpenChange(false);
              }}
              className="font-bold text-[12px]"
            >
              {action.status === 'open' ? 'Start Implementation' : 'Mark Action Closed'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
