import React, { useState } from "react";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Layers,
  MapPin,
  Paperclip,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getDerivedActionStatus,
  type ActionStatus,
  type ComplianceStatus,
  type SeverityLevel,
  type SiteObservation,
} from "@/lib/esg-monitoring";
import { monitoringAreaByKey } from "@/lib/esg-data";
import { cn } from "@/lib/utils";
import { EnvironmentMetadataCard } from "./EnvironmentMetadataCard";

interface ObservationDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  observation: SiteObservation | null;
  onEdit?: (obs: SiteObservation) => void;
  onCloseAction?: (id: string, remarks: string, date?: string) => void;
  onUpdateStatus?: (id: string, status: ActionStatus) => void;
}

export function ObservationDetailDrawer({
  open,
  onOpenChange,
  observation,
  onEdit,
  onCloseAction,
  onUpdateStatus,
}: ObservationDetailDrawerProps) {
  const [closingAction, setClosingAction] = useState(false);
  const [closureRemarks, setClosureRemarks] = useState("");

  if (!observation) return null;

  const areaMeta = monitoringAreaByKey(observation.monitoringArea);
  const derivedActionStatus = observation.correctiveAction
    ? getDerivedActionStatus(
        observation.correctiveAction.targetDate,
        observation.correctiveAction.status,
      )
    : undefined;

  const handleResolveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureRemarks.trim()) {
      toast.error("Please enter resolution remarks to close the action.");
      return;
    }
    if (onCloseAction) {
      onCloseAction(observation.id, closureRemarks.trim());
      toast.success("Corrective action marked as Closed", {
        description: "Status and closure timestamp updated in register.",
      });
      setClosingAction(false);
      setClosureRemarks("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[880px] p-0 gap-0 border-border/80 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-border/60 bg-card/95 backdrop-blur px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11.5px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                  {observation.id}
                </span>
                <span className="text-[11.5px] text-muted-foreground font-medium">·</span>
                <span className="text-[12px] font-semibold text-muted-foreground">
                  {observation.entityName}
                </span>
              </div>
              <DialogTitle className="text-[17px] font-bold text-foreground flex items-center gap-2">
                {observation.depotName} — {areaMeta?.label}
              </DialogTitle>
            </div>

            {/* Badges: Compliance & Severity */}
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "rounded-lg px-3 py-1 text-[11.5px] font-bold border capitalize",
                  observation.compliance === "compliant" &&
                    "border-success/40 bg-success/15 text-success",
                  observation.compliance === "partially_compliant" &&
                    "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400",
                  observation.compliance === "non_compliant" &&
                    "border-destructive/40 bg-destructive/15 text-destructive",
                  observation.compliance === "not_applicable" &&
                    "border-border bg-muted/40 text-muted-foreground",
                )}
              >
                {observation.compliance.replace("_", " ")}
              </span>

              <span
                className={cn(
                  "rounded-lg px-3 py-1 text-[11.5px] font-bold border capitalize",
                  observation.severity === "low" &&
                    "border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                  observation.severity === "medium" &&
                    "border-blue-500/30 bg-blue-500/15 text-blue-600 dark:text-blue-400",
                  observation.severity === "high" &&
                    "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400",
                  observation.severity === "critical" &&
                    "border-destructive/30 bg-destructive/15 text-destructive font-bold",
                )}
              >
                {observation.severity} Risk
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-7">
          {/* Metadata Meta Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Location / Site
              </span>
              <p className="text-[13px] font-bold text-foreground mt-1 truncate">
                {observation.depotName}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Monitoring Date
              </span>
              <p className="text-[13px] font-bold text-foreground mt-1">
                {observation.monitoringDate}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Reporting Period
              </span>
              <p className="text-[13px] font-bold text-foreground mt-1 font-mono">
                {observation.period}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" /> Field Monitor
              </span>
              <p className="text-[13px] font-bold text-foreground mt-1 truncate">
                {observation.monitorName}
              </p>
            </div>
          </div>

          {/* Detailed Finding Card */}
          <div className="rounded-xl border border-border/70 bg-card p-5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" /> Site Observation & Finding
              </span>
              <span className="text-[11px] text-muted-foreground">
                Recorded {new Date(observation.createdAt).toLocaleDateString()} at{" "}
                {new Date(observation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-[14px] font-medium text-foreground leading-relaxed">
              "{observation.observation}"
            </p>
          </div>

          {/* Surfaced Environment Metadata Context */}
          <div className="space-y-2">
            <EnvironmentMetadataCard
              entityId={observation.entityId}
              depotId={observation.depotId}
              period={observation.period}
              area={observation.monitoringArea}
            />
          </div>

          {/* Corrective Action (CAPA) Lifecycle */}
          {observation.correctiveAction ? (
            <div
              className={cn(
                "rounded-xl border p-5 space-y-4 transition-all shadow-xs",
                derivedActionStatus === "closed"
                  ? "border-success/40 bg-success/[0.03]"
                  : derivedActionStatus === "overdue"
                  ? "border-destructive/40 bg-destructive/[0.04]"
                  : "border-amber-500/40 bg-amber-500/[0.04]",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert
                    className={cn(
                      "h-5 w-5",
                      derivedActionStatus === "closed"
                        ? "text-success"
                        : derivedActionStatus === "overdue"
                        ? "text-destructive"
                        : "text-amber-500",
                    )}
                  />
                  <div>
                    <span className="text-[13.5px] font-bold text-foreground">
                      Corrective & Preventive Action Plan (CAPA)
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      ID: {observation.correctiveAction.id}
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border",
                    derivedActionStatus === "closed" &&
                      "border-success/40 bg-success/15 text-success",
                    derivedActionStatus === "in_progress" &&
                      "border-blue-500/40 bg-blue-500/15 text-blue-600 dark:text-blue-400",
                    derivedActionStatus === "open" &&
                      "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    derivedActionStatus === "overdue" &&
                      "border-destructive/40 bg-destructive/15 text-destructive font-bold animate-pulse",
                  )}
                >
                  Status: {derivedActionStatus}
                </span>
              </div>

              <div className="space-y-2.5">
                <p className="text-[13px] font-semibold text-foreground leading-relaxed">
                  {observation.correctiveAction.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground bg-muted/20 p-2.5 rounded-lg">
                  <span>
                    Action Owner:{" "}
                    <strong className="font-semibold text-foreground">
                      {observation.correctiveAction.ownerName}
                    </strong>
                  </span>
                  <span>·</span>
                  <span>
                    Target Date:{" "}
                    <strong
                      className={cn(
                        "font-semibold",
                        derivedActionStatus === "overdue"
                          ? "text-destructive font-bold"
                          : "text-foreground",
                      )}
                    >
                      {observation.correctiveAction.targetDate}
                    </strong>
                  </span>
                </div>
              </div>

              {/* If Closed: Display resolution details */}
              {derivedActionStatus === "closed" && (
                <div className="rounded-xl border border-success/30 bg-success/10 p-4 space-y-1.5 text-[12px]">
                  <div className="flex items-center gap-2 font-bold text-success">
                    <CheckCircle2 className="h-4 w-4" /> Action Resolved & Verified Closed (
                    {observation.correctiveAction.closureDate || "Completed"})
                  </div>
                  {observation.correctiveAction.closureRemarks && (
                    <p className="text-foreground leading-relaxed pl-6">
                      Resolution Remarks: {observation.correctiveAction.closureRemarks}
                    </p>
                  )}
                </div>
              )}

              {/* If Open/In Progress/Overdue: Action resolution CTA / Inline Form */}
              {derivedActionStatus !== "closed" && (
                <div className="pt-3 border-t border-border/50 space-y-3">
                  {!closingAction ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11.5px] text-muted-foreground">
                        {derivedActionStatus === "overdue" ? (
                          <span className="text-destructive font-bold flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" /> Target date has passed without verification!
                          </span>
                        ) : (
                          "Verify physical rectification on site before closing this action."
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {derivedActionStatus === "open" && onUpdateStatus && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 text-[11.5px]"
                            onClick={() => onUpdateStatus(observation.id, "in_progress")}
                          >
                            Mark In Progress
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 text-[11.5px] gap-1.5 bg-success text-white hover:bg-success/90 font-semibold"
                          onClick={() => setClosingAction(true)}
                        >
                          <CheckCircle2 className="h-4 w-4" /> Close Corrective Action
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleResolveAction}
                      className="space-y-3 rounded-xl border border-success/40 bg-card p-4 shadow-sm"
                    >
                      <div className="space-y-1.5">
                        <Label className="text-[12px] font-semibold text-foreground">
                          Resolution / Verification Remarks <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          rows={2}
                          value={closureRemarks}
                          onChange={(e) => setClosureRemarks(e.target.value)}
                          placeholder="State what corrective action was physically verified on site (e.g. containment tray replaced, spill pads placed, leak repaired)..."
                          className="text-[12.5px] leading-relaxed resize-none"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-[11.5px]"
                          onClick={() => setClosingAction(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          className="h-8 text-[11.5px] bg-success text-white hover:bg-success/90 gap-1.5 font-bold"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Confirm Closure
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/80 p-4 text-[12.5px] text-muted-foreground flex items-center justify-between bg-muted/10">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                No corrective action required — finding meets compliance norms.
              </span>
            </div>
          )}

          {/* Supporting Evidence Photos & Documents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[12.5px] font-bold text-foreground flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                Attached Evidence & Inspection Photos ({observation.evidence?.length || 0})
              </span>
            </div>

            {observation.evidence && observation.evidence.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {observation.evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3.5 text-[12px] shadow-xs hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {ev.type === "photo" ? (
                          <Camera className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 truncate">
                        <span className="font-semibold text-foreground truncate block">
                          {ev.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {ev.size} · Uploaded {new Date(ev.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] gap-1 px-2 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        toast.info("Evidence file ready for inspection", { description: ev.name })
                      }
                      title="Inspect evidence"
                    >
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/50 p-4 text-[12px] text-muted-foreground bg-muted/10 text-center">
                No photographic evidence was attached to this finding.
              </div>
            )}
          </div>

          {/* Optional Remarks Section if logged */}
          {observation.metadataSnapshot?.remarks && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-1.5 text-[12px]">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10.5px]">
                Additional Handover Remarks
              </span>
              <p className="text-muted-foreground leading-relaxed">
                {observation.metadataSnapshot.remarks}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="sticky bottom-0 z-20 border-t border-border/60 bg-card/95 backdrop-blur px-8 py-4 flex justify-between sm:justify-between items-center">
          <span className="text-[11.5px] text-muted-foreground">
            Created: {new Date(observation.createdAt).toLocaleString()}
          </span>
          <div className="flex items-center gap-2.5">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 text-[12.5px] gap-1.5 font-semibold"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(observation);
                }}
              >
                <Edit className="h-3.5 w-3.5" /> Edit Finding
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              className="h-9 px-5 text-[12.5px] font-bold"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
