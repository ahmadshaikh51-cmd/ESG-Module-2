import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Droplets,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  Paperclip,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  Users,
  Volume2,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  evaluateParamCompliance,
  ESG_GROUP,
  ESG_TODAY,
  getLabTestType,
  LAB_TEST_TYPES,
  PEOPLE,
  type LabParamDef,
  type LabTestTypeKey,
} from "@/lib/esg-data";
import {
  type ActionStatus,
  type LabTestRecord,
  type MonitoringEvidence,
} from "@/lib/esg-monitoring";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface LabTestDataEntryProps {
  onSaveSuccess: (testId: string) => void;
  onCancel?: () => void;
  onSave: (test: Omit<LabTestRecord, "id" | "createdAt" | "updatedAt">) => void;
  initialEntityId?: string;
  initialDepotId?: string;
  initialPeriod?: string;
  initialTestType?: LabTestTypeKey;
}

const MONTH_OPTIONS = [
  { value: "Aug 2026", label: "August 2026" },
  { value: "Jul 2026", label: "July 2026" },
  { value: "Jun 2026", label: "June 2026" },
  { value: "May 2026", label: "May 2026" },
  { value: "Apr 2026", label: "April 2026" },
  { value: "Mar 2026", label: "March 2026" },
  { value: "Feb 2026", label: "February 2026" },
  { value: "Jan 2026", label: "January 2026" },
  { value: "Sep 2026", label: "September 2026" },
  { value: "Oct 2026", label: "October 2026" },
];

const DRY_WASTE_TYPES = [
  { value: "Plastic Waste", label: "Plastic Waste (Films, Bottles, Wraps)" },
  { value: "Cardboard & Paper", label: "Cardboard & Packaging Paper" },
  { value: "Metal Scrap", label: "Scrap Metal & Fasteners" },
  { value: "Rubber / Tyres", label: "Rubber / Worn Bus Tyres" },
  { value: "Glass Bottles", label: "Glass Bottles & Cullet" },
  { value: "E-Waste / Electrical", label: "Non-Hazardous Electrical Scraps" },
  { value: "Mixed Dry Recyclables", label: "Mixed Dry Recyclables" },
];

const WET_WASTE_TYPES = [
  { value: "Canteen & Food Waste", label: "Canteen Food Scraps & Kitchen Leftovers" },
  { value: "Horticulture Leaves", label: "Horticulture Leaves & Garden Prunings" },
  { value: "Composted Organic Matter", label: "Composted Organic Matter / Bio-waste" },
  { value: "Mixed Biodegradable Waste", label: "Mixed Biodegradable Waste" },
];

const HAZARDOUS_PURPOSES = [
  { value: "Brake & Hydraulic Fluid Service", label: "Brake & Hydraulic Fluid Service" },
  { value: "Coolant Replacement / Flush", label: "Coolant Replacement / Flush" },
  { value: "Battery Bay Servicing & Acid Check", label: "Battery Bay Servicing & Acid Check" },
  { value: "Compressor / Gearbox Oil Change", label: "Compressor / Gearbox Oil Change" },
  { value: "HVAC Degreasing & Filter Cleaning", label: "HVAC Degreasing & Filter Cleaning" },
  { value: "Chassis Washing & Sump Cleaning", label: "Chassis Washing & Sump Cleaning" },
  { value: "Scheduled Periodic Maintenance", label: "Scheduled Periodic Maintenance" },
];

const HAZARDOUS_MATERIALS = [
  { value: "Used Gear / Hydraulic Oil", label: "Used Gear / Hydraulic Oil" },
  { value: "Spent Coolant / Glycol", label: "Spent Coolant / Glycol" },
  { value: "Used Brake Fluid", label: "Used Brake Fluid" },
  { value: "Oil Contaminated Cotton Rags", label: "Oil Contaminated Cotton Rags" },
  { value: "Used Oil Filter Cartridges", label: "Used Oil Filter Cartridges" },
  { value: "Lead Acid Battery Scrap / Residue", label: "Lead Acid Battery Scrap / Residue" },
  { value: "Chemical Degreaser Sludge", label: "Chemical Degreaser Sludge" },
];

const VEHICLE_NUMBERS = [
  { value: "MH-04-GP-1204", label: "MH-04-GP-1204 (Bus #04)" },
  { value: "MH-04-GP-1218", label: "MH-04-GP-1218 (Bus #18)" },
  { value: "MH-04-GP-1225", label: "MH-04-GP-1225 (Bus #25)" },
  { value: "MH-04-GP-1232", label: "MH-04-GP-1232 (Bus #32)" },
  { value: "MH-04-GP-1240", label: "MH-04-GP-1240 (Bus #40)" },
  { value: "MH-04-GP-1245", label: "MH-04-GP-1245 (Bus #45)" },
  { value: "General Depot Maintenance", label: "General Depot Maintenance" },
];

export function LabTestDataEntry({
  onSaveSuccess,
  onCancel,
  onSave,
  initialEntityId = "mbmt",
  initialDepotId = "kashimira",
  initialPeriod = "2026-07",
  initialTestType = "vehicle_data",
}: LabTestDataEntryProps) {
  const currentUser = getCurrentUser();
  const defaultMonitor = currentUser?.name || "Rahul Patil";

  // STEP 1 — WHERE?
  const [entityId, setEntityId] = useState<string>(initialEntityId);
  const [depotId, setDepotId] = useState<string>(initialDepotId);

  // STEP 2 — WHAT TEST?
  const [selectedTestType, setSelectedTestType] = useState<LabTestTypeKey>(initialTestType);
  const [testDate, setTestDate] = useState<string>("2026-08-01");
  const [monitorName, setMonitorName] = useState<string>("Fleet Operations Lead");
  const [testRemarks, setTestRemarks] = useState<string>("");

  // STEP 3 — RESULTS (Map of paramKey -> string value)
  const [results, setResults] = useState<Record<string, string>>(() => {
    return {
      month: "Aug 2026",
      vehicle_count: "45",
      run_km: "386060",
      energy_kwh: "455150",
      month_date: "Aug 2026",
      people_count: "120",
      qty_litres: "3600",
      date: "2026-08-10",
      waste_type: "Plastic Waste",
      qty_kg: "450",
      vehicle_no: "MH-04-GP-1204",
      purpose: "Brake & Hydraulic Fluid Service",
      material_used: "Used Gear / Hydraulic Oil",
      sludge_qty: "350",
    };
  });

  // STEP 4 — EVIDENCE
  const [evidenceList, setEvidenceList] = useState<MonitoringEvidence[]>([
    {
      id: "ev-init-1",
      name: "Aug_Fleet_Energy_Report.pdf",
      type: "document",
      size: "2.1 MB",
      uploadedAt: "2026-08-01T10:00:00Z",
    },
  ]);

  // STEP 5 — CORRECTIVE ACTION (CAPA)
  const [actionDesc, setActionDesc] = useState<string>("");
  const [actionOwnerId, setActionOwnerId] = useState<string>("rohan");
  const [actionTargetDate, setActionTargetDate] = useState<string>("2026-07-28");

  // Derive Reporting Period from Date
  const derivedPeriod = testDate ? testDate.slice(0, 7) : initialPeriod;

  // Selected Entity and Available Depots
  const currentEntity = ESG_GROUP.entities.find((e) => e.id === entityId) || ESG_GROUP.entities[0];
  const availableDepots = currentEntity.depots;
  const currentDepot =
    availableDepots.find((d) => d.id === depotId) ||
    availableDepots[0] || { id: "depot", name: "Depot" };

  // Sync depot when entity changes
  useEffect(() => {
    if (!availableDepots.some((d) => d.id === depotId) && availableDepots[0]) {
      setDepotId(availableDepots[0].id);
    }
  }, [entityId, availableDepots, depotId]);

  // Active Lab Test Type metadata & parameters
  const currentTestMeta = getLabTestType(selectedTestType) || LAB_TEST_TYPES[0];

  // When test type changes, populate default clean placeholder values
  const handleSelectTestType = (typeKey: LabTestTypeKey) => {
    setSelectedTestType(typeKey);
    const meta = getLabTestType(typeKey);
    if (!meta) return;

    const newResults: Record<string, string> = {};
    if (typeKey === "vehicle_data") {
      newResults.month = "Aug 2026";
      newResults.vehicle_count = "45";
      newResults.run_km = "386060";
      newResults.energy_kwh = "455150";
    } else if (typeKey === "drinking_water") {
      newResults.month_date = "Aug 2026";
      newResults.people_count = "120";
      newResults.qty_litres = "3600";
    } else if (typeKey === "dry_waste") {
      newResults.date = "2026-08-10";
      newResults.waste_type = "Plastic Waste";
      newResults.qty_kg = "450";
    } else if (typeKey === "wet_waste") {
      newResults.date = "2026-08-08";
      newResults.waste_type = "Canteen & Food Waste";
      newResults.qty_kg = "280";
    } else if (typeKey === "hazardous_waste") {
      newResults.date = "2026-08-05";
      newResults.vehicle_no = "MH-04-GP-1204";
      newResults.purpose = "Brake & Hydraulic Fluid Service";
      newResults.material_used = "Used Gear / Hydraulic Oil";
      newResults.qty_litres = "45";
      newResults.qty_kg = "0";
    } else if (typeKey === "waste_water") {
      newResults.month_date = "Aug 2026";
      newResults.qty_litres = "12500";
      newResults.sludge_qty = "350";
    } else if (typeKey === "soil_runoff") {
      newResults.tph = "32";
      newResults.lead_heavy_metals = "0.02";
    }
    setResults(newResults);
  };

  // Evaluate Compliance for all active parameters
  const evaluationStats = useMemo(() => {
    let testedCount = 0;
    let withinCount = 0;
    let exceedCount = 0;
    const evaluatedParams: {
      param: LabParamDef;
      rawValue: string;
      numValue: number | null;
      status: "within" | "exceeds" | "no_data";
    }[] = [];

    for (const param of currentTestMeta.parameters) {
      const raw = results[param.key] ?? "";

      if (
        param.key === "month" ||
        param.key === "month_date" ||
        param.key === "date" ||
        param.key === "waste_type" ||
        param.key === "vehicle_no" ||
        param.key === "purpose" ||
        param.key === "material_used"
      ) {
        if (raw.trim() !== "") {
          testedCount++;
          withinCount++;
        }
        evaluatedParams.push({
          param,
          rawValue: raw,
          numValue: null,
          status: raw.trim() !== "" ? "within" : "no_data",
        });
        continue;
      }

      const num = raw.trim() === "" ? null : Number(raw);
      const status = evaluateParamCompliance(param, num);

      if (num != null && !Number.isNaN(num)) {
        testedCount++;
        if (status === "within") withinCount++;
        else if (status === "exceeds") exceedCount++;
      }

      evaluatedParams.push({
        param,
        rawValue: raw,
        numValue: num,
        status,
      });
    }

    const overallCompliance: "within_limits" | "attention_required" =
      exceedCount > 0 ? "attention_required" : "within_limits";

    return {
      testedCount,
      withinCount,
      exceedCount,
      evaluatedParams,
      overallCompliance,
    };
  }, [currentTestMeta, results]);

  const handleResultChange = (paramKey: string, val: string) => {
    setResults((prev) => ({ ...prev, [paramKey]: val }));
  };

  const handleAddSampleEvidence = () => {
    const newEv: MonitoringEvidence = {
      id: `ev-lab-${Date.now().toString(36)}`,
      name: `${selectedTestType}_NABL_Lab_Report_${Date.now().toString().slice(-4)}.pdf`,
      type: "document",
      size: "2.4 MB",
      uploadedAt: new Date().toISOString(),
    };
    setEvidenceList((prev) => [...prev, newEv]);
    toast.success("Lab Certificate attached", { description: newEv.name });
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (evaluationStats.testedCount === 0) {
      toast.error("Please enter results for at least one parameter.");
      return;
    }

    if (
      evaluationStats.overallCompliance === "attention_required" &&
      (!actionDesc.trim() || !actionOwnerId || !actionTargetDate)
    ) {
      toast.error(
        "Limits exceeded! Please provide corrective action details, owner, and target date.",
      );
      return;
    }

    // Convert string results to number | string | null
    const finalResults: Record<string, number | string | null> = {};
    for (const p of currentTestMeta.parameters) {
      const raw = results[p.key];
      if (!raw || raw.trim() === "") {
        finalResults[p.key] = null;
      } else if (!Number.isNaN(Number(raw))) {
        finalResults[p.key] = Number(raw);
      } else {
        finalResults[p.key] = raw;
      }
    }

    const ownerObj = PEOPLE.find((p) => p.id === actionOwnerId) || { name: "Assigned Lead" };

    const payload: Omit<LabTestRecord, "id" | "createdAt" | "updatedAt"> = {
      entityId,
      depotId,
      entityName: currentEntity.name,
      depotName: currentDepot.name,
      testType: selectedTestType,
      testLabel: currentTestMeta.label,
      testDate,
      period: derivedPeriod,
      monitorName,
      results: finalResults,
      evidence: evidenceList,
      overallCompliance: evaluationStats.overallCompliance,
      testedCount: evaluationStats.testedCount,
      withinCount: evaluationStats.withinCount,
      exceedCount: evaluationStats.exceedCount,
      remarks: testRemarks.trim() || undefined,
      correctiveAction:
        evaluationStats.overallCompliance === "attention_required"
          ? {
              id: `ca-lab-${Date.now().toString(36)}`,
              description: actionDesc.trim(),
              ownerId: actionOwnerId,
              ownerName: ownerObj.name,
              targetDate: actionTargetDate,
              status: "open",
            }
          : undefined,
    };

    onSave(payload);
    toast.success("Lab test results recorded successfully", {
      description: `${currentTestMeta.shortLabel} results saved for ${currentDepot.name} (${derivedPeriod}).`,
    });
    onSaveSuccess(selectedTestType);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ========================================================================= */}
      {/* STEP 1 & 2: WHERE & WHAT TEST (CONVERSATIONAL GUIDED HEADER) */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-elevated space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-[14px]">
              01
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-foreground">
                Where and What Was Tested?
              </h3>
              <p className="text-[12px] text-muted-foreground">
                Select your project site, test category, and sampling date.
              </p>
            </div>
          </div>
          <span className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-1 text-[11.5px] font-bold text-primary">
            Period: {derivedPeriod}
          </span>
        </div>

        {/* STEP 1 — WHERE? */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Project */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Project / SPV
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
            <Label className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" /> Site / Depot
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

          {/* Test Date */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Test / Sampling Date
            </Label>
            <Input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="h-9 text-[12.5px] bg-muted/20"
              required
            />
          </div>

          {/* Monitor */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" /> Lead Monitor / Chemist
            </Label>
            <Input
              value={monitorName}
              onChange={(e) => setMonitorName(e.target.value)}
              placeholder="e.g. Rahul Patil"
              className="h-9 text-[12.5px] bg-muted/20"
              required
            />
          </div>
        </div>

        {/* STEP 2 — WHAT TEST? (VISUAL SELECTION CARDS) */}
        <div className="space-y-3 pt-2">
          <Label className="text-[12px] font-semibold text-foreground block">
            Select Test Category <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {LAB_TEST_TYPES.map((type) => {
              const isSelected = selectedTestType === type.key;
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => handleSelectTestType(type.key)}
                  className={cn(
                    "flex flex-col items-start rounded-xl border p-4 text-left transition-all relative space-y-1.5 shadow-xs cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/[0.08] ring-2 ring-primary/40 font-semibold"
                      : "border-border/60 bg-card hover:bg-muted/30 text-muted-foreground",
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={cn(
                        "text-[13px] font-bold",
                        isSelected ? "text-primary" : "text-foreground",
                      )}
                    >
                      {type.shortLabel}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-border" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                    {type.description}
                  </p>
                  <span className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground mt-1">
                    {type.standard}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 3: TEST-SPECIFIC PARAMETER CARDS (EASY & UNDERSTANDABLE ENTRY) */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-elevated space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-[14px]">
              02
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-foreground">
                  {selectedTestType === "vehicle_data"
                    ? "Enter Operational Parameters — Vehicle Data"
                    : selectedTestType === "drinking_water"
                    ? "Enter Drinking Water Consumption Log"
                    : selectedTestType === "waste_water"
                    ? "Enter Waste Water & Effluent Log — Waste Water"
                    : selectedTestType === "dry_waste"
                    ? "Enter Non-Hazardous Waste Log — Dry Waste"
                    : selectedTestType === "wet_waste"
                    ? "Enter Organic Waste Log — Wet Waste"
                    : selectedTestType === "hazardous_waste"
                    ? "Enter Hazardous Waste & Maintenance Log"
                    : `Enter Laboratory Results — ${currentTestMeta.label}`}
                </h3>
                <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
                  {currentTestMeta.parameters.length} Parameters
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground">
                {selectedTestType === "vehicle_data"
                  ? "Record monthly operational fleet statistics: active buses, total kilometers run, and traction energy consumption."
                  : selectedTestType === "drinking_water"
                  ? "Record depot potable drinking water consumption, workforce headcount, and volume in litres."
                  : selectedTestType === "waste_water"
                  ? "Record wash-bay and depot effluent volume (Litres) and sludge generated (Weight/Volume)."
                  : selectedTestType === "dry_waste"
                  ? "Record recyclable packaging, paper, scrap metal, and plastic waste generated."
                  : selectedTestType === "wet_waste"
                  ? "Record cafeteria food scraps, compostable wet organics, and garden sweepings."
                  : selectedTestType === "hazardous_waste"
                  ? "Log hazardous maintenance materials (engine oil, coolants, battery acid) by vehicle number and task."
                  : `Enter physical/chemical readings against statutory standards (${currentTestMeta.standard}).`}
              </p>
            </div>
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluationStats.evaluatedParams.map(({ param, rawValue, status }) => (
            <div
              key={param.key}
              className={cn(
                "rounded-xl border p-4.5 transition-all space-y-3 shadow-xs",
                status === "within" && "border-success/40 bg-success/[0.02]",
                status === "exceeds" && "border-destructive/40 bg-destructive/[0.03]",
                status === "no_data" && "border-border/60 bg-card",
              )}
            >
              {/* Parameter Title & Standard Ref */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-bold text-foreground">
                      {param.name}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                      {param.code}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5">
                    {param.description}
                  </p>
                </div>

                {/* Real-time Status Badge */}
                {param.key === "month" || param.key === "date" || param.key === "month_date" ? (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary shrink-0">
                    <Calendar className="h-3.5 w-3.5" /> Selected
                  </span>
                ) : param.key === "people_count" ? (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary shrink-0">
                    <Users className="h-3.5 w-3.5" /> Headcount
                  </span>
                ) : param.key === "sludge_qty" ? (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary shrink-0">
                    <Layers className="h-3.5 w-3.5" /> Sludge
                  </span>
                ) : param.key === "waste_type" || param.key === "material_used" ? (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary shrink-0">
                    <Layers className="h-3.5 w-3.5" /> Stream
                  </span>
                ) : param.key === "vehicle_no" ? (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary shrink-0">
                    <Zap className="h-3.5 w-3.5" /> Vehicle
                  </span>
                ) : param.key === "purpose" ? (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary shrink-0">
                    <Activity className="h-3.5 w-3.5" /> Task
                  </span>
                ) : selectedTestType === "vehicle_data" ||
                  selectedTestType === "drinking_water" ||
                  selectedTestType === "waste_water" ||
                  selectedTestType === "dry_waste" ||
                  selectedTestType === "wet_waste" ||
                  selectedTestType === "hazardous_waste" ? (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Logged
                  </span>
                ) : status === "within" ? (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Within Limit
                  </span>
                ) : status === "exceeds" ? (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-[11px] font-bold text-destructive shrink-0 animate-pulse">
                    <AlertTriangle className="h-3.5 w-3.5" /> Exceeds Limit
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground shrink-0">
                    Enter Result
                  </span>
                )}
              </div>

              {/* Input + Unit + Allowed Limit Row */}
              <div className="grid grid-cols-3 gap-3 items-center pt-1 border-t border-border/40">
                {/* Result Input or Select */}
                <div className="space-y-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">
                    {param.key === "month" || param.key === "month_date"
                      ? "Select Month/Date"
                      : param.key === "date"
                      ? "Select Date"
                      : param.key === "people_count"
                      ? "Enter Headcount"
                      : param.key === "sludge_qty"
                      ? "Enter Sludge (Weight/Volume)"
                      : param.key === "waste_type"
                      ? "Select Stream"
                      : param.key === "vehicle_no"
                      ? "Select Vehicle"
                      : param.key === "purpose"
                      ? "Select Purpose"
                      : param.key === "material_used"
                      ? "Select Material"
                      : param.key === "qty_litres"
                      ? "Enter Litres"
                      : param.key === "qty_kg"
                      ? "Enter Kg"
                      : "Your Result"}
                  </span>
                  {param.key === "month" || param.key === "month_date" ? (
                    <Select
                      value={rawValue || "Aug 2026"}
                      onValueChange={(v) => handleResultChange(param.key, v)}
                    >
                      <SelectTrigger className="h-10 text-[13px] font-bold bg-card border-border/70">
                        <SelectValue placeholder="Select Month/Date" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_OPTIONS.map((m) => (
                          <SelectItem key={m.value} value={m.value} className="text-[12.5px]">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : param.key === "sludge_qty" ? (
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={rawValue}
                      onChange={(e) => handleResultChange("sludge_qty", e.target.value)}
                      placeholder="e.g. 350"
                      className="num h-10 text-[13.5px] font-bold bg-card border-border/70"
                    />
                  ) : param.key === "people_count" ? (
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={rawValue}
                      onChange={(e) => handleResultChange("people_count", e.target.value)}
                      placeholder="e.g. 120"
                      className="num h-10 text-[13.5px] font-bold bg-card border-border/70"
                    />
                  ) : param.key === "date" ? (
                    <Input
                      type="date"
                      value={rawValue || testDate}
                      onChange={(e) => handleResultChange("date", e.target.value)}
                      className="h-10 text-[13px] font-bold bg-card border-border/70"
                    />
                  ) : param.key === "waste_type" ? (
                    <Select
                      value={
                        rawValue ||
                        (selectedTestType === "wet_waste"
                          ? "Canteen & Food Waste"
                          : "Plastic Waste")
                      }
                      onValueChange={(v) => handleResultChange("waste_type", v)}
                    >
                      <SelectTrigger className="h-10 text-[13px] font-bold bg-card border-border/70">
                        <SelectValue placeholder="Select Stream" />
                      </SelectTrigger>
                      <SelectContent>
                        {(selectedTestType === "wet_waste"
                          ? WET_WASTE_TYPES
                          : DRY_WASTE_TYPES
                        ).map((w) => (
                          <SelectItem key={w.value} value={w.value} className="text-[12.5px]">
                            {w.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : param.key === "vehicle_no" ? (
                    <Select
                      value={rawValue || "MH-04-GP-1204"}
                      onValueChange={(v) => handleResultChange("vehicle_no", v)}
                    >
                      <SelectTrigger className="h-10 text-[13px] font-bold bg-card border-border/70">
                        <SelectValue placeholder="Select Vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_NUMBERS.map((v) => (
                          <SelectItem key={v.value} value={v.value} className="text-[12.5px]">
                            {v.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : param.key === "purpose" ? (
                    <Select
                      value={rawValue || "Brake & Hydraulic Fluid Service"}
                      onValueChange={(v) => handleResultChange("purpose", v)}
                    >
                      <SelectTrigger className="h-10 text-[13px] font-bold bg-card border-border/70">
                        <SelectValue placeholder="Select Purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {HAZARDOUS_PURPOSES.map((p) => (
                          <SelectItem key={p.value} value={p.value} className="text-[12.5px]">
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : param.key === "material_used" ? (
                    <Select
                      value={rawValue || "Used Gear / Hydraulic Oil"}
                      onValueChange={(v) => handleResultChange("material_used", v)}
                    >
                      <SelectTrigger className="h-10 text-[13px] font-bold bg-card border-border/70">
                        <SelectValue placeholder="Select Material" />
                      </SelectTrigger>
                      <SelectContent>
                        {HAZARDOUS_MATERIALS.map((m) => (
                          <SelectItem key={m.value} value={m.value} className="text-[12.5px]">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="number"
                      step="any"
                      value={rawValue}
                      onChange={(e) => handleResultChange(param.key, e.target.value)}
                      placeholder="0.00"
                      className={cn(
                        "num h-10 text-[14px] font-bold bg-card",
                        status === "within" && "text-success border-success/50",
                        status === "exceeds" && "text-destructive border-destructive/50 font-extrabold",
                      )}
                    />
                  )}
                </div>

                {/* Unit */}
                <div className="space-y-1">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    Unit
                  </span>
                  <div className="h-10 flex items-center px-3 rounded-lg border border-border/50 bg-muted/20 text-[12.5px] font-medium text-foreground">
                    {param.unit}
                  </div>
                </div>

                {/* Allowed Limit / Context */}
                <div className="space-y-1">
                  <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    {selectedTestType === "vehicle_data" ||
                    selectedTestType === "drinking_water" ||
                    selectedTestType === "waste_water" ||
                    selectedTestType === "dry_waste" ||
                    selectedTestType === "wet_waste" ||
                    selectedTestType === "hazardous_waste"
                      ? "Context"
                      : "Allowed Limit"}
                  </span>
                  <div className="h-10 flex items-center px-3 rounded-lg border border-border/50 bg-muted/20 text-[12px] font-bold text-foreground">
                    {param.limitDisplay}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* STEP 4: SUMMARY & DERIVED METRICS */}
        {/* ========================================================================= */}
        {selectedTestType === "vehicle_data" ? (
          <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-5 transition-all shadow-sm space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Operational Fleet Summary
                  </span>
                  <p className="text-[14.5px] font-bold text-foreground">
                    Derived Energy Efficiency:{" "}
                    <strong className="text-primary">
                      {Number(results["run_km"]) > 0
                        ? (Number(results["energy_kwh"]) / Number(results["run_km"])).toFixed(2)
                        : "0.00"}{" "}
                      kWh/Km
                    </strong>
                  </p>
                </div>
              </div>

              {/* Metric Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  Fleet: {Number(results["vehicle_count"]) || 0} Buses
                </span>
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  Run: {(Number(results["run_km"]) || 0).toLocaleString()} Km
                </span>
                <span className="rounded-lg bg-primary/15 border border-primary/30 px-3 py-1.5 text-[12px] font-bold text-primary">
                  Energy: {(Number(results["energy_kwh"]) || 0).toLocaleString()} kWh
                </span>
              </div>
            </div>
          </div>
        ) : selectedTestType === "drinking_water" ? (
          <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-5 transition-all shadow-sm space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Droplets className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Drinking Water Consumption Summary
                  </span>
                  <p className="text-[14.5px] font-bold text-foreground">
                    Derived Per-Capita Consumption:{" "}
                    <strong className="text-primary">
                      {Number(results["people_count"]) > 0
                        ? (Number(results["qty_litres"]) / Number(results["people_count"])).toFixed(1)
                        : "0.0"}{" "}
                      Litres / Person
                    </strong>
                  </p>
                </div>
              </div>

              {/* Metric Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  Headcount: {Number(results["people_count"]) || 0} People
                </span>
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  Total Volume: {(Number(results["qty_litres"]) || 0).toLocaleString()} Litres
                </span>
                <span className="rounded-lg bg-primary/15 border border-primary/30 px-3 py-1.5 text-[12px] font-bold text-primary">
                  Est. Daily:{" "}
                  {Number(results["people_count"]) > 0
                    ? (Number(results["qty_litres"]) / Number(results["people_count"]) / 30).toFixed(2)
                    : "0.00"}{" "}
                  L/Person/Day
                </span>
              </div>
            </div>
          </div>
        ) : selectedTestType === "waste_water" ? (
          <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-5 transition-all shadow-sm space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Waste Water & Sludge Treatment Summary
                  </span>
                  <p className="text-[14.5px] font-bold text-foreground">
                    Sludge Generation Ratio:{" "}
                    <strong className="text-primary">
                      {Number(results["qty_litres"]) > 0
                        ? (
                            Number(results["sludge_qty"]) /
                            (Number(results["qty_litres"]) / 1000)
                          ).toFixed(2)
                        : "0.00"}{" "}
                      Kg / kL effluent
                    </strong>
                  </p>
                </div>
              </div>

              {/* Metric Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  Effluent: {(Number(results["qty_litres"]) || 0).toLocaleString()} Litres
                </span>
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  Sludge Output: {(Number(results["sludge_qty"]) || 0).toLocaleString()} Kg
                </span>
                <span className="rounded-lg bg-primary/15 border border-primary/30 px-3 py-1.5 text-[12px] font-bold text-primary">
                  Treatment Efficiency: 98.5% Compliant
                </span>
              </div>
            </div>
          </div>
        ) : selectedTestType === "dry_waste" ? (
          <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-5 transition-all shadow-sm space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Non-Hazardous Dry Waste Summary
                  </span>
                  <p className="text-[14.5px] font-bold text-foreground">
                    Dispatched Quantity:{" "}
                    <strong className="text-primary font-bold">
                      {(Number(results["qty_kg"]) || 0).toLocaleString()} kg
                    </strong>
                  </p>
                </div>
              </div>

              {/* Metric Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  Stream: {results["waste_type"] || "Plastic Waste"}
                </span>
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  Date: {results["date"] || testDate}
                </span>
                <span className="rounded-lg bg-primary/15 border border-primary/30 px-3 py-1.5 text-[12px] font-bold text-primary">
                  Weight: {(Number(results["qty_kg"]) || 0).toLocaleString()} kg
                </span>
              </div>
            </div>
          </div>
        ) : selectedTestType === "wet_waste" ? (
          <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-5 transition-all shadow-sm space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Non-Hazardous Wet Waste Summary
                  </span>
                  <p className="text-[14.5px] font-bold text-foreground">
                    Composted / Dispatched Quantity:{" "}
                    <strong className="text-primary font-bold">
                      {(Number(results["qty_kg"]) || 0).toLocaleString()} kg
                    </strong>
                  </p>
                </div>
              </div>

              {/* Metric Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  Stream: {results["waste_type"] || "Canteen & Food Waste"}
                </span>
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  Date: {results["date"] || testDate}
                </span>
                <span className="rounded-lg bg-primary/15 border border-primary/30 px-3 py-1.5 text-[12px] font-bold text-primary">
                  Weight: {(Number(results["qty_kg"]) || 0).toLocaleString()} kg
                </span>
              </div>
            </div>
          </div>
        ) : selectedTestType === "hazardous_waste" ? (
          <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-5 transition-all shadow-sm space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Hazardous Waste & Maintenance Summary
                  </span>
                  <p className="text-[14.5px] font-bold text-foreground">
                    Logged Quantity:{" "}
                    <strong className="text-primary font-bold">
                      {Number(results["qty_litres"]) > 0
                        ? `${Number(results["qty_litres"])} Litres`
                        : `${Number(results["qty_kg"]) || 0} Kg`}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Metric Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  Vehicle: {results["vehicle_no"] || "MH-04-GP-1204"}
                </span>
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  Material: {results["material_used"] || "Used Gear / Hydraulic Oil"}
                </span>
                <span className="rounded-lg bg-primary/15 border border-primary/30 px-3 py-1.5 text-[12px] font-bold text-primary">
                  {results["purpose"] || "Maintenance Task"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-xl border p-5 transition-all shadow-sm space-y-3",
              evaluationStats.overallCompliance === "within_limits"
                ? "border-success/35 bg-success/[0.04]"
                : "border-destructive/35 bg-destructive/[0.04]",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {evaluationStats.overallCompliance === "within_limits" ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Automated Assessment Summary
                  </span>
                  <p
                    className={cn(
                      "text-[15px] font-bold",
                      evaluationStats.overallCompliance === "within_limits"
                        ? "text-success"
                        : "text-destructive",
                    )}
                  >
                    {evaluationStats.overallCompliance === "within_limits"
                      ? "✓ ALL PARAMETERS WITHIN STATUTORY LIMITS"
                      : "⚠ ATTENTION REQUIRED — 1 OR MORE LIMITS EXCEEDED"}
                  </p>
                </div>
              </div>

              {/* Counts */}
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-card border border-border/60 px-3 py-1.5 text-[12px] font-bold text-foreground">
                  {evaluationStats.testedCount} Tested
                </span>
                <span className="rounded-lg bg-success/15 border border-success/30 px-3 py-1.5 text-[12px] font-bold text-success">
                  ✓ {evaluationStats.withinCount} Within Limit
                </span>
                {evaluationStats.exceedCount > 0 && (
                  <span className="rounded-lg bg-destructive/15 border border-destructive/30 px-3 py-1.5 text-[12px] font-bold text-destructive">
                    ⚠ {evaluationStats.exceedCount} Exceeding
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* STEP 5: EVIDENCE & LAB CERTIFICATE UPLOAD (ONLY FOR CHEMICAL/LAB TESTS) */}
      {/* ========================================================================= */}
      {selectedTestType !== "vehicle_data" &&
        selectedTestType !== "drinking_water" &&
        selectedTestType !== "waste_water" &&
        selectedTestType !== "dry_waste" &&
        selectedTestType !== "wet_waste" &&
        selectedTestType !== "hazardous_waste" && (
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-elevated space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-[14px]">
                  03
                </span>
                <div>
                  <h3 className="text-[15px] font-bold text-foreground">
                    Lab Certificate & Supporting Evidence
                  </h3>
                  <p className="text-[12px] text-muted-foreground">
                    Attach NABL accredited lab testing certificate, calibration slips, or sampling photographs.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-[12px] gap-1.5"
                onClick={handleAddSampleEvidence}
              >
                <Upload className="h-4 w-4 text-primary" /> + Attach Lab Report
              </Button>
            </div>

            {evidenceList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-[12px] text-muted-foreground bg-muted/10">
                <FileText className="h-6 w-6 text-muted-foreground/60 mx-auto mb-1" />
                <p className="font-medium text-foreground">No lab report attached</p>
                <p className="text-[11px]">Click above to attach PDF reports or testing slips.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evidenceList.map((ev) => (
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
                        <span className="text-[11px] text-muted-foreground">
                          {ev.size} · Attached
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(ev.id)}
                      className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* ========================================================================= */}
      {/* STEP 6: ACTION ONLY WHEN REQUIRED (ONLY FOR CHEMICAL/LAB TESTS) */}
      {/* ========================================================================= */}
      {selectedTestType !== "vehicle_data" &&
        selectedTestType !== "drinking_water" &&
        selectedTestType !== "waste_water" &&
        selectedTestType !== "dry_waste" &&
        selectedTestType !== "wet_waste" &&
        selectedTestType !== "hazardous_waste" && (
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-elevated space-y-4">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-[14px]">
                04
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-foreground">
                  Corrective Action (CAPA)
                </h3>
                <p className="text-[12px] text-muted-foreground">
                  Required only when a parameter exceeds regulatory limits.
                </p>
              </div>
            </div>

            {evaluationStats.overallCompliance === "within_limits" ? (
              <div className="rounded-xl border border-success/30 bg-success/[0.04] p-4.5 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <div>
                  <span className="text-[13px] font-bold text-success block">
                    No Corrective Action Required
                  </span>
                  <p className="text-[12px] text-muted-foreground">
                    All test results are within permissible regulatory limits. You can save the record directly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-destructive/40 bg-destructive/[0.03] p-5 space-y-4">
                <div className="flex items-center gap-2 text-destructive font-bold text-[13px]">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Corrective Action Plan Required — Exceedances Found</span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold text-foreground">
                    What needs to be fixed? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    rows={3}
                    value={actionDesc}
                    onChange={(e) => setActionDesc(e.target.value)}
                    placeholder="e.g. Inspect ETP bio-culture dosing pump, clean primary clarifier weir, and re-sample within 7 days..."
                    className="text-[12.5px] leading-relaxed resize-none p-3 bg-card"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] font-semibold text-foreground">
                      Who will handle it? <span className="text-destructive">*</span>
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
                      By when? <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={actionTargetDate}
                      onChange={(e) => setActionTargetDate(e.target.value)}
                      className="h-9 text-[12.5px] bg-card"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional General Remarks */}
            <div className="space-y-1.5 pt-2">
              <Label className="text-[12px] font-semibold text-foreground">
                Additional Test Remarks / Sampling Observations (Optional)
              </Label>
              <Textarea
                rows={2}
                value={testRemarks}
                onChange={(e) => setTestRemarks(e.target.value)}
                placeholder="e.g. Weather sunny, ambient temp 31°C, continuous 24-hr sampling performed using calibrated high-volume sampler..."
                className="text-[12px] leading-relaxed resize-none p-3 bg-muted/20"
              />
            </div>
          </div>
        )}

      {/* ========================================================================= */}
      {/* FORM ACTIONS */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 text-[12.5px] px-5"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="h-10 text-[13px] px-6 font-bold gap-2 shadow-sm"
        >
          <Save className="h-4 w-4" />{" "}
          {selectedTestType === "vehicle_data"
            ? "Save Vehicle Data"
            : selectedTestType === "drinking_water"
            ? "Save Drinking Water Record"
            : selectedTestType === "waste_water"
            ? "Save Waste Water Record"
            : selectedTestType === "dry_waste"
            ? "Save Dry Waste Record"
            : selectedTestType === "wet_waste"
            ? "Save Wet Waste Record"
            : selectedTestType === "hazardous_waste"
            ? "Save Hazardous Waste Record"
            : "Save Lab Test Record"}
        </Button>
      </div>
    </form>
  );
}
