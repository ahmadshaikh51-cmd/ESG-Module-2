import React, { useEffect, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  Paperclip,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ESG_GROUP,
  ESG_TODAY,
  MONITORING_AREAS,
  monitoringAreaByKey,
  PEOPLE,
  type MonitoringAreaKey,
} from "@/lib/esg-data";
import {
  type ActionStatus,
  type ComplianceStatus,
  type MonitoringEvidence,
  type SeverityLevel,
  type SiteObservation,
} from "@/lib/esg-monitoring";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { EnvironmentMetadataCard } from "./EnvironmentMetadataCard";

interface ObservationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editObservation?: SiteObservation | null;
  onSave: (obs: Omit<SiteObservation, "id" | "createdAt" | "updatedAt">) => void;
  initialEntityId?: string;
  initialDepotId?: string;
  initialPeriod?: string;
}

const COMPLIANCE_OPTIONS: {
  key: ComplianceStatus;
  label: string;
  desc: string;
  color: string;
}[] = [
  {
    key: "compliant",
    label: "Compliant",
    desc: "Fully adheres to statutory norms & SOPs",
    color: "border-success/40 bg-success/10 text-success dark:bg-success/15",
  },
  {
    key: "partially_compliant",
    label: "Partially Compliant",
    desc: "Minor procedural or housekeeping gaps noted",
    color: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/15",
  },
  {
    key: "non_compliant",
    label: "Non-Compliant",
    desc: "Breach of environmental law or safety hazard",
    color: "border-destructive/40 bg-destructive/10 text-destructive dark:bg-destructive/15",
  },
  {
    key: "not_applicable",
    label: "Not Applicable",
    desc: "Activity or equipment not operational today",
    color: "border-border bg-muted/40 text-muted-foreground",
  },
];

const SEVERITY_OPTIONS: {
  key: SeverityLevel;
  label: string;
  desc: string;
  badge: string;
}[] = [
  {
    key: "low",
    label: "Low Risk",
    desc: "No immediate threat",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    key: "medium",
    label: "Medium Risk",
    desc: "Requires standard correction",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  {
    key: "high",
    label: "High Risk",
    desc: "Priority containment required",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    key: "critical",
    label: "Critical Risk",
    desc: "Immediate intervention needed",
    badge: "bg-destructive/10 text-destructive border-destructive/30 font-bold",
  },
];

const QUICK_OBSERVATION_TEMPLATES: Record<MonitoringAreaKey, string[]> = {
  energy_vehicle: [
    "Charging telematics meter readings verified against sub-station meter; zero variance.",
    "Bus energy consumption on target (1.18 kWh/km); regenerative telemetry active.",
  ],
  hazardous_waste: [
    "Used lubricant drum secondary containment inspected; bunding clean and spill kit ready.",
    "Oil seepage observed near charging bay 3 spill tray; containment pallet replacement required.",
  ],
  non_hazardous_waste: [
    "Canteen organic food waste segregated in green bins and dispatched for municipal composting.",
    "Unsegregated dry cardboard packaging found in yard corner; color-coded bins needed.",
  ],
  haz_consumption: [
    "Hydraulic oil and dielectric coolant inventory logged with valid SDS sheets displayed.",
    "Solvent storage cabinet grounding earthing strap verified secure (< 1 Ohm).",
  ],
  drinking_water: [
    "RO water dispenser TDS tested at 142 ppm; potability certificate verified compliant.",
    "Drinking water filter replacement inspection completed; dispenser nozzle sanitized.",
  ],
  wastewater: [
    "Depot ETP wash bay oil-water separator inspected; treated effluent recycled 100%.",
    "Wash pit settling sump sludge level within permissible limit; no surface oil bypass.",
  ],
  waste_disposal: [
    "Form 10 hazardous waste manifest verified for authorized recycler dispatch.",
    "Recycler transporter vehicle GPS and driver passbook verified before gate exit.",
  ],
  housekeeping: [
    "Charging bays, emergency eyewash stations, and stormwater drainage channels clean.",
    "Absorbent spill boom station restocked in workshop bay.",
  ],
  other: [
    "Annual environmental compliance site walk conducted with external auditor.",
    "Ad-hoc noise level measurement recorded during peak vehicle ingress.",
  ],
};

export function ObservationModal({
  open,
  onOpenChange,
  editObservation,
  onSave,
  initialEntityId = "mbmt",
  initialDepotId = "kashimira",
  initialPeriod = "2026-07",
}: ObservationModalProps) {
  const currentUser = getCurrentUser();
  const defaultMonitor = currentUser?.name || "Rahul Patil";

  // Form State
  const [entityId, setEntityId] = useState<string>(initialEntityId);
  const [depotId, setDepotId] = useState<string>(initialDepotId);
  const [monitoringDate, setMonitoringDate] = useState<string>(
    ESG_TODAY.toISOString().slice(0, 10),
  );
  const [monitoringArea, setMonitoringArea] = useState<MonitoringAreaKey>("hazardous_waste");
  const [monitorName, setMonitorName] = useState<string>(defaultMonitor);
  const [observation, setObservation] = useState<string>("");
  const [compliance, setCompliance] = useState<ComplianceStatus>("compliant");
  const [severity, setSeverity] = useState<SeverityLevel>("low");
  const [evidenceList, setEvidenceList] = useState<MonitoringEvidence[]>([]);
  const [additionalRemarks, setAdditionalRemarks] = useState<string>("");

  // Corrective Action State
  const [hasAction, setHasAction] = useState<boolean>(false);
  const [actionDesc, setActionDesc] = useState<string>("");
  const [actionOwnerId, setActionOwnerId] = useState<string>("rohan");
  const [actionTargetDate, setActionTargetDate] = useState<string>("2026-07-25");
  const [actionStatus, setActionStatus] = useState<ActionStatus>("open");

  // Derive Reporting Month from Monitoring Date
  const derivedPeriod = monitoringDate ? monitoringDate.slice(0, 7) : initialPeriod;

  // Selected Entity and Depots
  const currentEntity = ESG_GROUP.entities.find((e) => e.id === entityId) || ESG_GROUP.entities[0];
  const availableDepots = currentEntity.depots;
  const currentDepot =
    availableDepots.find((d) => d.id === depotId) ||
    availableDepots[0] || { id: "depot", name: "Depot" };

  // Sync depot if entity changes
  useEffect(() => {
    if (!availableDepots.some((d) => d.id === depotId) && availableDepots[0]) {
      setDepotId(availableDepots[0].id);
    }
  }, [entityId, availableDepots, depotId]);

  // If editing an existing observation, load values
  useEffect(() => {
    if (editObservation) {
      setEntityId(editObservation.entityId);
      setDepotId(editObservation.depotId);
      setMonitoringDate(editObservation.monitoringDate);
      setMonitoringArea(editObservation.monitoringArea);
      setMonitorName(editObservation.monitorName);
      setObservation(editObservation.observation);
      setCompliance(editObservation.compliance);
      setSeverity(editObservation.severity);
      setEvidenceList(editObservation.evidence || []);
      setAdditionalRemarks(editObservation.metadataSnapshot?.remarks || "");
      if (editObservation.correctiveAction) {
        setHasAction(true);
        setActionDesc(editObservation.correctiveAction.description);
        setActionOwnerId(editObservation.correctiveAction.ownerId);
        setActionTargetDate(editObservation.correctiveAction.targetDate);
        setActionStatus(editObservation.correctiveAction.status);
      } else {
        setHasAction(false);
      }
    } else {
      // Reset form
      setEntityId(initialEntityId);
      setDepotId(initialDepotId);
      setMonitoringDate(ESG_TODAY.toISOString().slice(0, 10));
      setMonitoringArea("hazardous_waste");
      setMonitorName(defaultMonitor);
      setObservation("");
      setCompliance("compliant");
      setSeverity("low");
      setEvidenceList([]);
      setAdditionalRemarks("");
      setHasAction(false);
      setActionDesc("");
      setActionOwnerId("rohan");
      setActionTargetDate("2026-07-25");
      setActionStatus("open");
    }
  }, [editObservation, open, initialEntityId, initialDepotId, defaultMonitor]);

  // Auto-prompt corrective action if non-compliant or high/critical severity
  useEffect(() => {
    if (
      compliance === "non_compliant" ||
      compliance === "partially_compliant" ||
      severity === "high" ||
      severity === "critical"
    ) {
      setHasAction(true);
    }
  }, [compliance, severity]);

  const handleAddSampleEvidence = () => {
    const newEv: MonitoringEvidence = {
      id: `ev-${Date.now().toString(36)}`,
      name: `site_inspection_photo_${monitoringArea}_${Date.now().toString().slice(-4)}.jpg`,
      type: "photo",
      size: "2.4 MB",
      uploadedAt: new Date().toISOString(),
    };
    setEvidenceList((prev) => [...prev, newEv]);
    toast.success("Inspection photo attached", { description: newEv.name });
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!observation.trim()) {
      toast.error("Please enter observation details before saving.");
      return;
    }

    if (hasAction && (!actionDesc.trim() || !actionOwnerId || !actionTargetDate)) {
      toast.error("Please fill in the corrective action description, owner, and target date.");
      return;
    }

    const areaMeta = monitoringAreaByKey(monitoringArea);
    const ownerObj = PEOPLE.find((p) => p.id === actionOwnerId) || { name: "Assigned Lead" };

    const payload: Omit<SiteObservation, "id" | "createdAt" | "updatedAt"> = {
      entityId,
      depotId,
      depotName: currentDepot.name,
      entityName: currentEntity.name,
      monitoringDate,
      period: derivedPeriod,
      monitorId: "user",
      monitorName,
      monitoringArea,
      areaLabel: areaMeta?.label || "Environmental Monitoring",
      observation: observation.trim(),
      compliance,
      severity,
      evidence: evidenceList,
      correctiveAction: hasAction
        ? {
            id: editObservation?.correctiveAction?.id || `ca-${Date.now().toString(36)}`,
            description: actionDesc.trim(),
            ownerId: actionOwnerId,
            ownerName: ownerObj.name,
            targetDate: actionTargetDate,
            status: actionStatus,
          }
        : undefined,
      metadataSnapshot: {
        remarks: additionalRemarks.trim() || undefined,
      },
    };

    onSave(payload);
    toast.success(
      editObservation ? "Site observation updated" : "Site observation recorded successfully",
      {
        description: `${areaMeta?.shortLabel} observation logged for ${currentDepot.name} (${derivedPeriod}).`,
      },
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[880px] p-0 gap-0 border-border/80 shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 border-b border-border/60 bg-card/95 backdrop-blur px-8 py-5">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-[17px] font-bold text-foreground flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileCheck className="h-4 w-4" />
                  </span>
                  {editObservation ? "Edit Site Observation" : "Record Site Observation"}
                </DialogTitle>
                <DialogDescription className="text-[12.5px] text-muted-foreground">
                  Review Environment Metadata, assess site physical conditions, and capture findings & corrective actions.
                </DialogDescription>
              </div>
              <span className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-1 text-[11.5px] font-bold text-primary">
                Period: {derivedPeriod}
              </span>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* SECTION 01 — MONITORING INFORMATION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="font-mono text-[11px] font-bold text-primary">01</span>
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                Monitoring Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Project */}
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Project / SPV <span className="text-destructive">*</span>
                </Label>
                <Select value={entityId} onValueChange={setEntityId}>
                  <SelectTrigger className="h-9 text-[12.5px] bg-muted/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESG_GROUP.entities.map((e) => (
                      <SelectItem key={e.id} value={e.id} className="text-[12.5px]">
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Site / Depot */}
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Site / Depot <span className="text-destructive">*</span>
                </Label>
                <Select value={depotId} onValueChange={setDepotId}>
                  <SelectTrigger className="h-9 text-[12.5px] bg-muted/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDepots.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-[12.5px]">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Monitoring Date */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[12px] font-semibold text-foreground">
                    Monitoring Date <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Month: {derivedPeriod}
                  </span>
                </div>
                <Input
                  type="date"
                  value={monitoringDate}
                  onChange={(e) => setMonitoringDate(e.target.value)}
                  className="h-9 text-[12.5px] bg-muted/20"
                  required
                />
              </div>
            </div>

            {/* Monitor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[12px] font-semibold text-foreground">
                  Lead Field Monitor / Inspector
                </Label>
                <div className="relative">
                  <Input
                    value={monitorName}
                    onChange={(e) => setMonitorName(e.target.value)}
                    placeholder="Enter Monitor Name"
                    className="h-9 text-[12.5px] pl-8 bg-muted/20"
                  />
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-2 text-[11.5px] text-muted-foreground">
                  Reporting Month auto-derived from date.
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 02 — MONITORING AREA & CONTEXT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="font-mono text-[11px] font-bold text-primary">02</span>
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                Monitoring Area & Contextual Data
              </h3>
            </div>

            <div className="space-y-2">
              <Label className="text-[12px] font-semibold text-foreground">
                Select Environmental Monitoring Area <span className="text-destructive">*</span>
              </Label>
              <Select
                value={monitoringArea}
                onValueChange={(v) => setMonitoringArea(v as MonitoringAreaKey)}
              >
                <SelectTrigger className="h-10 text-[13px] font-semibold bg-muted/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[320px]">
                  {MONITORING_AREAS.map((a) => (
                    <SelectItem key={a.key} value={a.key} className="text-[12.5px] py-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-bold text-foreground">{a.label}</span>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                          {a.badgeText}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* LIVE ENVIRONMENT METADATA REFERENCE CARD */}
            <div className="pt-2">
              <EnvironmentMetadataCard
                entityId={entityId}
                depotId={depotId}
                period={derivedPeriod}
                area={monitoringArea}
              />
            </div>
          </div>

          {/* SECTION 03 — OBSERVATION & ASSESSMENT */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="font-mono text-[11px] font-bold text-primary">03</span>
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                Observation & Compliance Assessment
              </h3>
            </div>

            {/* Observation Textarea */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-[12.5px] font-semibold text-foreground">
                  Field Observation / Finding Details <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Describe physical observations, locations, equipment condition, or gaps
                </span>
              </div>

              {/* Suggestions template chips */}
              {QUICK_OBSERVATION_TEMPLATES[monitoringArea] && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Suggestions:
                  </span>
                  {QUICK_OBSERVATION_TEMPLATES[monitoringArea].map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setObservation(tpl)}
                      className="truncate max-w-[340px] rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1 text-[11px] text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
                      title={tpl}
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              )}

              <Textarea
                rows={4}
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="e.g. Oil leakage observed near charging bay 3 secondary spill containment tray. Secondary containment pallet showed hairline crack; approx 5L gear oil seeped into catchment sump..."
                className="text-[13px] leading-relaxed resize-none p-3.5 min-h-[110px]"
                required
              />
            </div>

            {/* Compliance & Severity Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Compliance Status */}
              <div className="space-y-2.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Compliance Status <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2.5">
                  {COMPLIANCE_OPTIONS.map((opt) => {
                    const isSelected = compliance === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setCompliance(opt.key)}
                        className={cn(
                          "flex flex-col items-start rounded-xl border p-3 text-left transition-all",
                          isSelected
                            ? cn("ring-2 ring-primary/50 font-bold shadow-xs", opt.color)
                            : "border-border/60 bg-card hover:bg-muted/20 text-muted-foreground",
                        )}
                      >
                        <span className="text-[12.5px] font-bold">{opt.label}</span>
                        <span className="text-[10.5px] opacity-80 leading-snug mt-1 line-clamp-2">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Risk / Severity Level */}
              <div className="space-y-2.5">
                <Label className="text-[12px] font-semibold text-foreground">
                  Risk / Severity Level <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2.5">
                  {SEVERITY_OPTIONS.map((opt) => {
                    const isSelected = severity === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setSeverity(opt.key)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border p-3 text-left transition-all",
                          isSelected
                            ? cn("ring-2 ring-primary/50 font-bold shadow-xs", opt.badge)
                            : "border-border/60 bg-card hover:bg-muted/20 text-muted-foreground",
                        )}
                      >
                        <div>
                          <span className="text-[12.5px] font-bold block">{opt.label}</span>
                          <span className="text-[10.5px] opacity-80 block mt-0.5">{opt.desc}</span>
                        </div>
                        <span
                          className={cn(
                            "h-2.5 w-2.5 rounded-full shrink-0 ml-2",
                            opt.key === "low" && "bg-emerald-500",
                            opt.key === "medium" && "bg-blue-500",
                            opt.key === "high" && "bg-amber-500",
                            opt.key === "critical" && "bg-destructive",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 04 — SUPPORTING EVIDENCE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-primary">04</span>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                  Supporting Evidence & Site Photos
                </h3>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-[11.5px]"
                onClick={handleAddSampleEvidence}
              >
                <Camera className="h-4 w-4 text-primary" /> + Attach Photo / File
              </Button>
            </div>

            {evidenceList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 p-5 text-center text-[12px] text-muted-foreground bg-muted/10 space-y-1">
                <Upload className="h-6 w-6 text-muted-foreground/60 mx-auto mb-1" />
                <p className="font-medium text-foreground">No photos or documents attached yet</p>
                <p className="text-[11px]">Click above to attach site photographs, manifests, or lab testing slips.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evidenceList.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-3 text-[12px] shadow-xs"
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
                        <span className="font-semibold text-foreground truncate block">{ev.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {ev.size} · Uploaded {new Date(ev.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(ev.id)}
                      className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Remove attachment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 05 — CORRECTIVE ACTION (CAPA) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-primary">05</span>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                  Corrective & Preventive Action (CAPA)
                </h3>
              </div>
              <Button
                type="button"
                size="sm"
                variant={hasAction ? "secondary" : "outline"}
                className="h-8 text-[11.5px]"
                onClick={() => setHasAction(!hasAction)}
              >
                {hasAction ? "Remove CAPA" : "+ Add Corrective Action"}
              </Button>
            </div>

            <div
              className={cn(
                "rounded-xl border p-5 transition-all space-y-4",
                hasAction
                  ? "border-amber-500/40 bg-amber-500/[0.04] dark:bg-amber-500/[0.06]"
                  : "border-border/60 bg-muted/10",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert
                    className={cn(
                      "h-4 w-4",
                      hasAction ? "text-amber-500" : "text-muted-foreground",
                    )}
                  />
                  <span className="text-[13px] font-bold text-foreground">
                    Action Plan Required?
                  </span>
                </div>

                {(compliance === "non_compliant" ||
                  compliance === "partially_compliant" ||
                  severity === "high" ||
                  severity === "critical") && (
                  <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10.5px] font-bold text-amber-600 dark:text-amber-400">
                    Mandatory for Gaps & High Risk Findings
                  </span>
                )}
              </div>

              {hasAction && (
                <div className="space-y-4 pt-2 border-t border-border/50">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-foreground">
                      Action Description & Containment Measures <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      rows={3}
                      value={actionDesc}
                      onChange={(e) => setActionDesc(e.target.value)}
                      placeholder="Specify corrective steps, replacement equipment, maintenance instructions, or vendor rectification needed..."
                      className="text-[12.5px] leading-relaxed resize-none p-3 bg-card"
                      required={hasAction}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-semibold text-foreground">
                        Action Owner <span className="text-destructive">*</span>
                      </Label>
                      <Select value={actionOwnerId} onValueChange={setActionOwnerId}>
                        <SelectTrigger className="h-9 text-[12.5px] bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PEOPLE.map((p) => (
                            <SelectItem key={p.id} value={p.id} className="text-[12.5px]">
                              {p.name} · {p.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-semibold text-foreground">
                        Target Completion Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={actionTargetDate}
                        onChange={(e) => setActionTargetDate(e.target.value)}
                        className="h-9 text-[12.5px] bg-card"
                        required={hasAction}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[12px] font-semibold text-foreground">
                        Action Status
                      </Label>
                      <Select
                        value={actionStatus}
                        onValueChange={(v) => setActionStatus(v as ActionStatus)}
                      >
                        <SelectTrigger className="h-9 text-[12.5px] bg-card">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open" className="text-[12.5px]">
                            Open
                          </SelectItem>
                          <SelectItem value="in_progress" className="text-[12.5px]">
                            In Progress
                          </SelectItem>
                          <SelectItem value="closed" className="text-[12.5px]">
                            Closed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 06 — ADDITIONAL REMARKS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="font-mono text-[11px] font-bold text-primary">06</span>
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                Additional Remarks & Follow-up Notes
              </h3>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-foreground">
                Handover Notes / Statutory References (Optional)
              </Label>
              <Textarea
                rows={2}
                value={additionalRemarks}
                onChange={(e) => setAdditionalRemarks(e.target.value)}
                placeholder="Add any additional context, external auditor references, permit conditions, or shift handover notes..."
                className="text-[12.5px] leading-relaxed resize-none p-3 bg-muted/20"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <DialogFooter className="sticky bottom-0 z-20 border-t border-border/60 bg-card/95 backdrop-blur px-8 py-4 -mx-8 -mb-8 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-4 text-[12.5px]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-9 px-5 text-[12.5px] gap-2 font-bold shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              {editObservation ? "Save Changes" : "Record Observation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
