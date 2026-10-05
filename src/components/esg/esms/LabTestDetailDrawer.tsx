import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Droplets,
  Eye,
  FileCheck,
  FileSpreadsheet,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  evaluateParamCompliance,
  getLabParamDef,
  getLabTestType,
  PERIODS,
} from "@/lib/esg-data";
import { getDerivedActionStatus, type LabTestRecord } from "@/lib/esg-monitoring";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface LabTestDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testRecord: LabTestRecord | null;
  onCloseAction?: (id: string, remarks: string, date?: string) => void;
}

export function LabTestDetailDrawer({
  open,
  onOpenChange,
  testRecord,
  onCloseAction,
}: LabTestDetailDrawerProps) {
  const [closingAction, setClosingAction] = useState(false);
  const [closureRemarks, setClosureRemarks] = useState("");

  if (!testRecord) return null;

  const testMeta = getLabTestType(testRecord.testType);
  const derivedActionStatus = testRecord.correctiveAction
    ? getDerivedActionStatus(
        testRecord.correctiveAction.targetDate,
        testRecord.correctiveAction.status,
      )
    : undefined;

  const handleResolveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closureRemarks.trim()) {
      toast.error("Please enter resolution remarks to close this action.");
      return;
    }
    if (onCloseAction) {
      onCloseAction(testRecord.id, closureRemarks.trim());
      toast.success("Corrective action marked as Closed", {
        description: "Action status updated in laboratory register.",
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
                  {testRecord.id}
                </span>
                <span className="text-[11.5px] text-muted-foreground font-medium">·</span>
                <span className="text-[12px] font-semibold text-muted-foreground">
                  {testRecord.entityName}
                </span>
              </div>
              <DialogTitle className="text-[17px] font-bold text-foreground flex items-center gap-2">
                {testRecord.depotName} — {testRecord.testLabel}
              </DialogTitle>
            </div>

            {/* Overall Status Badge */}
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[11.5px] font-bold border flex items-center gap-1.5",
                  testRecord.overallCompliance === "within_limits"
                    ? "border-success/40 bg-success/15 text-success"
                    : "border-destructive/40 bg-destructive/15 text-destructive font-extrabold",
                )}
              >
                {testRecord.overallCompliance === "within_limits" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> 100% Within Limits
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" /> Attention Required (Exceedances)
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content: Answers 5 Core Questions */}
        <div className="p-8 space-y-7">
          {/* ========================================================================= */}
          {/* QUESTION 1 & 2: WHAT WAS TESTED & WHERE? */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" /> Where?
              </span>
              <p className="text-[13px] font-bold text-foreground mt-1 truncate">
                {testRecord.depotName}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Test Date
              </span>
              <p className="text-[13px] font-bold text-foreground mt-1">
                {testRecord.testDate}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Reporting Period
              </span>
              <p className="text-[13px] font-bold text-foreground mt-1 font-mono">
                {testRecord.period}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" /> Field Monitor
              </span>
              <p className="text-[13px] font-bold text-foreground mt-1 truncate">
                {testRecord.monitorName}
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* QUESTION 3 & 4: WHAT WAS THE RESULT & IS IT WITHIN LIMITS? */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4.5 w-4.5 text-primary" />
                <span className="text-[13.5px] font-bold text-foreground">
                  Tested Parameters, Results & Statutory Limits
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                Standard: {testMeta?.standard || "Statutory Norms"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table className="w-full text-left text-[12.5px]">
                <TableHeader>
                  <TableRow className="border-b border-border/60 bg-muted/30 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    <TableHead className="px-4 py-2.5 font-semibold">Parameter</TableHead>
                    <TableHead className="px-4 py-2.5 font-semibold text-right">Result Entered</TableHead>
                    <TableHead className="px-4 py-2.5 font-semibold">Unit</TableHead>
                    <TableHead className="px-4 py-2.5 font-semibold">Allowed Limit</TableHead>
                    <TableHead className="px-4 py-2.5 font-semibold">Compliance Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/40">
                  {testMeta?.parameters.map((param) => {
                    const val = testRecord.results[param.key];
                    const status = evaluateParamCompliance(param, val);

                    return (
                      <TableRow
                        key={param.key}
                        className={cn(
                          "hover:bg-muted/10 transition-colors",
                          status === "exceeds" && "bg-destructive/[0.04] font-semibold",
                        )}
                      >
                        <TableCell className="px-4 py-3">
                          <div className="font-bold text-foreground">{param.name}</div>
                          <span className="text-[11px] text-muted-foreground">{param.description}</span>
                        </TableCell>
                        <TableCell className="num px-4 py-3 text-right text-[13.5px] font-bold">
                          {val != null ? (
                            <span
                              className={cn(
                                status === "exceeds" ? "text-destructive font-extrabold" : "text-foreground",
                              )}
                            >
                              {typeof val === "number" ? val.toLocaleString() : val}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground font-medium">{param.unit}</TableCell>
                        <TableCell className="px-4 py-3 font-semibold text-foreground">{param.limitDisplay}</TableCell>
                        <TableCell className="px-4 py-3">
                          {testRecord.testType === "vehicle_data" ||
                          testRecord.testType === "drinking_water" ||
                          testRecord.testType === "waste_water" ||
                          testRecord.testType === "dry_waste" ||
                          testRecord.testType === "wet_waste" ||
                          testRecord.testType === "hazardous_waste" ? (
                            val != null ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-success/15 border border-success/30 px-2 py-0.5 text-[11px] font-bold text-success">
                                <Check className="h-3.5 w-3.5" /> Logged
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">— Not recorded</span>
                            )
                          ) : status === "within" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-success/15 border border-success/30 px-2 py-0.5 text-[11px] font-bold text-success">
                              <Check className="h-3.5 w-3.5" /> Within Limit
                            </span>
                          ) : status === "exceeds" ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-destructive/15 border border-destructive/30 px-2 py-0.5 text-[11px] font-bold text-destructive animate-pulse">
                              <AlertTriangle className="h-3.5 w-3.5" /> Exceeds Limit
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">— Not recorded</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {testRecord.testType === "drinking_water" && (
              <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-4 flex flex-wrap items-center justify-between gap-3 mt-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Drinking Water Analysis
                    </span>
                    <span className="text-[13px] font-bold text-foreground">
                      Per-Capita Rate:{" "}
                      <strong className="text-primary">
                        {Number(testRecord.results["people_count"]) > 0
                          ? (
                              Number(testRecord.results["qty_litres"]) /
                              Number(testRecord.results["people_count"])
                            ).toFixed(1)
                          : "0.0"}{" "}
                        L/Person
                      </strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-card border border-border/60 px-2.5 py-1 text-[11.5px] font-bold text-foreground">
                    Headcount: {Number(testRecord.results["people_count"]) || 0}
                  </span>
                  <span className="rounded-lg bg-card border border-border/60 px-2.5 py-1 text-[11.5px] font-bold text-foreground">
                    Volume: {(Number(testRecord.results["qty_litres"]) || 0).toLocaleString()} L
                  </span>
                </div>
              </div>
            )}

            {testRecord.testType === "waste_water" && (
              <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-4 flex flex-wrap items-center justify-between gap-3 mt-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Waste Water & Sludge Analysis
                    </span>
                    <span className="text-[13px] font-bold text-foreground">
                      Sludge Generation Ratio:{" "}
                      <strong className="text-primary">
                        {Number(testRecord.results["qty_litres"]) > 0
                          ? (
                              Number(testRecord.results["sludge_qty"]) /
                              (Number(testRecord.results["qty_litres"]) / 1000)
                            ).toFixed(2)
                          : "0.00"}{" "}
                        Kg / kL
                      </strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-card border border-border/60 px-2.5 py-1 text-[11.5px] font-bold text-foreground">
                    Effluent: {(Number(testRecord.results["qty_litres"]) || 0).toLocaleString()} L
                  </span>
                  <span className="rounded-lg bg-card border border-border/60 px-2.5 py-1 text-[11.5px] font-bold text-foreground">
                    Sludge: {(Number(testRecord.results["sludge_qty"]) || 0).toLocaleString()} Kg
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* QUESTION 5: DOES ANYTHING NEED ACTION? (CAPA WORKFLOW) */}
          {/* ========================================================================= */}
          {testRecord.correctiveAction ? (
            <div
              className={cn(
                "rounded-2xl border p-5 space-y-4 shadow-xs transition-all",
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
                      Corrective Action Required — Exceedance Found
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      ID: {testRecord.correctiveAction.id}
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border",
                    derivedActionStatus === "closed" &&
                      "border-success/40 bg-success/15 text-success",
                    derivedActionStatus === "open" &&
                      "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    derivedActionStatus === "overdue" &&
                      "border-destructive/40 bg-destructive/15 text-destructive font-bold animate-pulse",
                  )}
                >
                  Action Status: {derivedActionStatus}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-foreground leading-relaxed">
                  {testRecord.correctiveAction.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground bg-muted/20 p-2.5 rounded-lg">
                  <span>
                    Owner:{" "}
                    <strong className="font-semibold text-foreground">
                      {testRecord.correctiveAction.ownerName}
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
                      {testRecord.correctiveAction.targetDate}
                    </strong>
                  </span>
                </div>
              </div>

              {/* If Closed: Display resolution remarks */}
              {derivedActionStatus === "closed" && (
                <div className="rounded-xl border border-success/30 bg-success/10 p-3.5 space-y-1 text-[12px]">
                  <div className="flex items-center gap-1.5 font-bold text-success">
                    <CheckCircle2 className="h-4 w-4" /> Action Resolved & Verified Closed (
                    {testRecord.correctiveAction.closureDate || "Completed"})
                  </div>
                  {testRecord.correctiveAction.closureRemarks && (
                    <p className="text-foreground leading-relaxed pl-5">
                      Verification Remarks: {testRecord.correctiveAction.closureRemarks}
                    </p>
                  )}
                </div>
              )}

              {/* If Open: Inline closure workflow */}
              {derivedActionStatus !== "closed" && (
                <div className="pt-2 border-t border-border/50">
                  {!closingAction ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] text-muted-foreground">
                        Have containment measures been implemented? Close this action once verified.
                      </span>
                      <Button
                        size="sm"
                        className="h-8 text-[11.5px] bg-success text-white hover:bg-success/90 gap-1.5 font-semibold"
                        onClick={() => setClosingAction(true)}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Close Corrective Action
                      </Button>
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
                          placeholder="State what corrective action was taken (e.g. bio-culture dosed, clarifier weir cleaned, re-sampled on 15th)..."
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
                          className="h-8 text-[11.5px] bg-success text-white hover:bg-success/90 font-bold gap-1.5"
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
            <div className="rounded-2xl border border-dashed border-border/80 p-4 text-[12.5px] text-muted-foreground flex items-center gap-2.5 bg-muted/10">
              <CheckCircle2 className="h-4.5 w-4.5 text-success" />
              <span className="font-medium text-foreground">
                No corrective action required — all parameters comply with statutory limits.
              </span>
            </div>
          )}

          {/* Evidence Documents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-[12.5px] font-bold text-foreground flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                Attached Lab Reports & Certificates ({testRecord.evidence?.length || 0})
              </span>
            </div>

            {testRecord.evidence && testRecord.evidence.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {testRecord.evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3.5 text-[12px] shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 truncate">
                        <span className="font-semibold text-foreground truncate block">{ev.name}</span>
                        <span className="text-[11px] text-muted-foreground">{ev.size} · Uploaded</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground gap-1"
                      onClick={() =>
                        toast.info("Opening lab test report for inspection", { description: ev.name })
                      }
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border/50 p-4 text-[12px] text-muted-foreground bg-muted/10 text-center">
                No lab report attachment logged.
              </div>
            )}
          </div>

          {/* Remarks */}
          {testRecord.remarks && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-1 text-[12px]">
              <span className="font-bold text-foreground uppercase tracking-wider text-[10.5px]">
                Sampling Remarks
              </span>
              <p className="text-muted-foreground leading-relaxed">{testRecord.remarks}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="sticky bottom-0 z-20 border-t border-border/60 bg-card/95 backdrop-blur px-8 py-4 flex justify-between sm:justify-between items-center">
          <span className="text-[11.5px] text-muted-foreground">
            Logged on {new Date(testRecord.createdAt).toLocaleDateString()}
          </span>
          <Button
            type="button"
            size="sm"
            className="h-9 px-5 text-[12.5px] font-bold"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
