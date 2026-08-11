import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Trash2,
  History,
  Sparkles,
  Lock,
  Unlock,
  Save,
  Send,
  RefreshCw,
  FileCheck,
  User,
  Info,
  Calendar,
  Building2,
  ShieldCheck,
  Link,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PEOPLE, ESG_GROUP, type Person } from "@/lib/esg-data";
import { A, PanelCard, ProvenanceChip, useEsg } from "../primitives";

// Indicator master data types
interface EsgIndicator {
  id: string;
  name: string;
  category: "Environmental" | "Social" | "Governance";
  subCategory: string;
  definition: string;
  type: "Manual" | "Calculated" | "Imported";
  unit: string;
  dataSource: "Manual" | "API" | "IoT" | "Upload";
  formulaName: string;
  formulaPreview: string;
  emissionFactor: number;
  conversionFactor: number;
  responsibleDept: string;
  mappings: string[];
  previousValue: number;
}

// Pre-defined indicators matching realistic operational data
const INDICATORS_MASTER: EsgIndicator[] = [
  {
    id: "IND-2026-001",
    name: "Grid Electricity Consumption",
    category: "Environmental",
    subCategory: "Energy & Emissions",
    definition:
      "Measures total electricity drawn from the grid for EV charging operations, depots, and administrative offices.",
    type: "Imported",
    unit: "kWh",
    dataSource: "IoT",
    formulaName: "Grid Scope 2 Emission Formula",
    formulaPreview: "Actual Value * Grid Emission Factor",
    emissionFactor: 0.82,
    conversionFactor: 0.00082,
    responsibleDept: "Energy Operations",
    mappings: ["AMR", "BRSR", "CDP", "GHG Accounting", "Carbon Savings"],
    previousValue: 121000,
  },
  {
    id: "IND-2026-002",
    name: "Diesel Fuel for Power Backup",
    category: "Environmental",
    subCategory: "Energy & Emissions",
    definition: "Diesel consumed in generator sets (DG) for depot backup power operations.",
    type: "Manual",
    unit: "Liters",
    dataSource: "Manual",
    formulaName: "Scope 1 Stationary Combustion Formula",
    formulaPreview: "Actual Value * Diesel Emission Factor",
    emissionFactor: 2.68,
    conversionFactor: 0.00268,
    responsibleDept: "Depot Maintenance",
    mappings: ["AMR", "BRSR", "CDP", "GHG Accounting"],
    previousValue: 2450,
  },
  {
    id: "IND-2026-003",
    name: "Fresh Water Consumption",
    category: "Environmental",
    subCategory: "Water & Waste",
    definition: "Total fresh water consumed at depots for bus washing, sanitation, and drinking.",
    type: "Manual",
    unit: "kL",
    dataSource: "Upload",
    formulaName: "Water Cost and Supply Footprint",
    formulaPreview: "Actual Value * Water Supply Intensity",
    emissionFactor: 0.34,
    conversionFactor: 0.00034,
    responsibleDept: "Administration",
    mappings: ["AMR", "BRSR", "Impact Report", "Internal Dashboard"],
    previousValue: 480,
  },
  {
    id: "IND-2026-004",
    name: "Solar PV Generation",
    category: "Environmental",
    subCategory: "Energy & Emissions",
    definition: "Clean electricity generated from on-site rooftop solar photovoltaic panels.",
    type: "Imported",
    unit: "kWh",
    dataSource: "API",
    formulaName: "Scope 2 Avoided Emissions (Solar)",
    formulaPreview: "Actual Value * Solar Displacement Factor",
    emissionFactor: 0.82,
    conversionFactor: 0.00082,
    responsibleDept: "Renewable Energy Team",
    mappings: ["AMR", "BRSR", "CDP", "Carbon Savings", "Impact Report", "Management Reports"],
    previousValue: 15400,
  },
  {
    id: "IND-2026-005",
    name: "Employee Safety Training Hours",
    category: "Social",
    subCategory: "Labour & Human Rights",
    definition: "Total hours of EHS and driver safety training delivered to operations staff.",
    type: "Manual",
    unit: "Hours",
    dataSource: "Manual",
    formulaName: "None (Direct Summation)",
    formulaPreview: "Actual Value",
    emissionFactor: 0,
    conversionFactor: 0,
    responsibleDept: "EHS / HR",
    mappings: ["AMR", "BRSR", "Impact Report", "Internal Dashboard", "Management Reports"],
    previousValue: 340,
  },
  {
    id: "IND-2026-006",
    name: "Board Diversity Ratio",
    category: "Governance",
    subCategory: "Corporate Governance",
    definition: "Percentage of female directors on the company board of directors.",
    type: "Manual",
    unit: "%",
    dataSource: "Manual",
    formulaName: "Percentage Composition",
    formulaPreview: "Female Directors / Total Directors * 100",
    emissionFactor: 0,
    conversionFactor: 0,
    responsibleDept: "Secretarial & Compliance",
    mappings: ["BRSR", "CDP", "Impact Report", "Management Reports"],
    previousValue: 20,
  },
];

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  version: string;
  uploadedBy: string;
  uploadedDate: string;
  status: "Verified" | "Draft" | "Pending Review";
}

interface AuditLog {
  id: string;
  activity: string;
  performedBy: string;
  timestamp: string;
  version: string;
}

export function EsgDataEntryForm() {
  const { role } = useEsg();

  // Selected indicator state
  const [selectedIndId, setSelectedIndId] = useState<string>(INDICATORS_MASTER[0].id);
  const selectedInd = useMemo(
    () => INDICATORS_MASTER.find((ind) => ind.id === selectedIndId) || INDICATORS_MASTER[0],
    [selectedIndId],
  );

  // Form input states
  const [financialYear, setFinancialYear] = useState<string>("FY 2026-27");
  const [reportingYear, setReportingYear] = useState<string>("2026");
  const [quarter, setQuarter] = useState<string>("Q1");
  const [month, setMonth] = useState<string>("July");
  const [reportingDate, setReportingDate] = useState<string>("2026-07-15");
  const [reportingFrequency, setReportingFrequency] = useState<string>("Monthly");
  const [customRange, setCustomRange] = useState<string>("01 Jul 2026 - 31 Jul 2026");

  // Applicability States
  const [company, setCompany] = useState<string>("mbmt");
  const [businessUnit, setBusinessUnit] = useState<string>("E-Bus Operations");
  const [region, setRegion] = useState<string>("West");
  const [state, setState] = useState<string>("Maharashtra");
  const [city, setCity] = useState<string>("Thane");
  const [site, setSite] = useState<string>("bhayandar");
  const [project, setProject] = useState<string>("MBMT Electrification Phase 1");

  // Specific flags
  const [isSiteSpecific, setIsSiteSpecific] = useState<boolean>(true);
  const [isProjectSpecific, setIsProjectSpecific] = useState<boolean>(true);
  const [isTimelineSpecific, setIsTimelineSpecific] = useState<boolean>(false);

  // Ownership States
  const [responsibleDept, setResponsibleDept] = useState<string>(selectedInd.responsibleDept);
  const [responsiblePerson, setResponsiblePerson] = useState<string>("arjun");
  const [reviewer, setReviewer] = useState<string>("kavita");
  const [approver, setApprover] = useState<string>("priya");
  const [deadline, setDeadline] = useState<string>("2026-08-07");
  const [workflowStatus, setWorkflowStatus] = useState<
    | "Draft"
    | "Submitted"
    | "Department Review"
    | "ESG Review"
    | "Compliance Approval"
    | "Approved"
    | "Locked"
  >("Draft");
  const [reviewerComments, setReviewerComments] = useState<string>("");

  // Values States
  const [actualValue, setActualValue] = useState<string>("124500");
  const [targetValue, setTargetValue] = useState<string>("120000");
  const [baselineValue, setBaselineValue] = useState<string>("130000");
  const [comments, setComments] = useState<string>("");

  // Attachment list state
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: "doc-1",
      name: "bhayandar_utility_bill_july26.pdf",
      type: "Utility Bill",
      size: "1.4 MB",
      version: "V1.0",
      uploadedBy: "Arjun Mehta",
      uploadedDate: "2026-07-15",
      status: "Verified",
    },
    {
      id: "doc-2",
      name: "grid_electricity_calc_sheet.xlsx",
      type: "Calculation Sheet",
      size: "2.1 MB",
      version: "V1.0",
      uploadedBy: "Arjun Mehta",
      uploadedDate: "2026-07-15",
      status: "Draft",
    },
  ]);

  // Collapsible cards toggle states
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({
    1: false, // Indicator Information
    2: false, // Reporting Details
    3: false, // Applicability
    4: false, // Ownership
    5: false, // Indicator Values
    6: false, // Formula & Calculation
    7: false, // Report Mapping (right side)
    8: false, // Supporting Documents
    9: false, // Validation (right side)
    10: false, // Workflow
    11: true, // Audit Trail (initially collapsed)
  });

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "log-1",
      activity: "Draft saved successfully",
      performedBy: "Arjun Mehta (Project Manager)",
      timestamp: "2026-07-15 09:12 AM",
      version: "V1.0",
    },
    {
      id: "log-2",
      activity: "Actual Value entered: 124,500 kWh",
      performedBy: "Arjun Mehta (Project Manager)",
      timestamp: "2026-07-15 09:10 AM",
      version: "V1.0",
    },
    {
      id: "log-3",
      activity: "Record initialized and auto-assigned",
      performedBy: "System Core",
      timestamp: "2026-07-15 09:00 AM",
      version: "V1.0",
    },
  ]);

  // Synchronize department and other defaults when indicator changes
  useEffect(() => {
    setResponsibleDept(selectedInd.responsibleDept);
    // Suggest default values for testing ease
    if (selectedInd.id === "IND-2026-001") {
      setActualValue("124500");
      setTargetValue("120000");
      setBaselineValue("130000");
    } else if (selectedInd.id === "IND-2026-002") {
      setActualValue("2500");
      setTargetValue("2400");
      setBaselineValue("2600");
    } else if (selectedInd.id === "IND-2026-003") {
      setActualValue("490");
      setTargetValue("450");
      setBaselineValue("500");
    } else if (selectedInd.id === "IND-2026-004") {
      setActualValue("16200");
      setTargetValue("15000");
      setBaselineValue("14000");
    } else if (selectedInd.id === "IND-2026-005") {
      setActualValue("360");
      setTargetValue("350");
      setBaselineValue("300");
    } else if (selectedInd.id === "IND-2026-006") {
      setActualValue("25");
      setTargetValue("25");
      setBaselineValue("20");
    }
  }, [selectedInd]);

  // Toggle sections
  const toggleSection = (id: number) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Expand / collapse all helper
  const [allExpanded, setAllExpanded] = useState<boolean>(true);
  const toggleAllSections = () => {
    const nextVal = !allExpanded;
    setAllExpanded(nextVal);
    setCollapsedSections({
      1: nextVal ? false : true,
      2: nextVal ? false : true,
      3: nextVal ? false : true,
      4: nextVal ? false : true,
      5: nextVal ? false : true,
      6: nextVal ? false : true,
      7: nextVal ? false : true,
      8: nextVal ? false : true,
      9: nextVal ? false : true,
      10: nextVal ? false : true,
      11: nextVal ? false : true,
    });
  };

  // Calculated Derived Values
  const numericActual = parseFloat(actualValue) || 0;
  const numericTarget = parseFloat(targetValue) || 0;
  const numericPrevious = selectedInd.previousValue;

  const targetVariance = useMemo(() => {
    if (!numericTarget) return 0;
    return ((numericActual - numericTarget) / numericTarget) * 100;
  }, [numericActual, numericTarget]);

  const previousVariance = useMemo(() => {
    if (!numericPrevious) return 0;
    return ((numericActual - numericPrevious) / numericPrevious) * 100;
  }, [numericActual, numericPrevious]);

  const carbonEquivalent = useMemo(() => {
    if (selectedInd.conversionFactor === 0) return 0;
    return numericActual * selectedInd.conversionFactor;
  }, [numericActual, selectedInd]);

  // Real-time Validations Checks
  const validations = useMemo(() => {
    const isActualNum = !isNaN(Number(actualValue)) && actualValue !== "";
    const isTargetNum = !isNaN(Number(targetValue)) && targetValue !== "";
    const isBaselineNum = !isNaN(Number(baselineValue)) && baselineValue !== "";

    // 1. Mandatory Fields
    const mandatorySuccess =
      selectedIndId &&
      isActualNum &&
      isTargetNum &&
      isBaselineNum &&
      responsibleDept &&
      responsiblePerson;

    // 2. Duplicate Record
    const duplicateSuccess = !(
      selectedIndId === "IND-2026-001" &&
      financialYear === "FY 2026-27" &&
      quarter === "Q1" &&
      month === "July" &&
      site === "bhayandar" &&
      workflowStatus === "Locked"
    );

    // 3. Formula Validation
    const formulaSuccess = isActualNum && Number(actualValue) >= 0;

    // 4. Emission Factor Available
    const efSuccess = selectedInd.category !== "Environmental" || selectedInd.emissionFactor > 0;

    // 5. Reporting Period Check
    const reportingPeriodSuccess = reportingDate.startsWith(reportingYear.slice(0, 4));

    // 6. Unit Validation
    const unitSuccess = selectedInd.unit !== "";

    // 7. Supporting Document Check
    const hasAttachments = attachments.length > 0;
    const documentWarning = isActualNum && Number(actualValue) > 100000 && !hasAttachments;

    return {
      mandatory: mandatorySuccess ? ("Success" as const) : ("Error" as const),
      duplicate: duplicateSuccess ? ("Success" as const) : ("Warning" as const),
      formula: formulaSuccess ? ("Success" as const) : ("Error" as const),
      emissionFactor: efSuccess ? ("Success" as const) : ("Warning" as const),
      reportingPeriod: reportingPeriodSuccess ? ("Success" as const) : ("Warning" as const),
      unit: unitSuccess ? ("Success" as const) : ("Error" as const),
      document: hasAttachments
        ? ("Success" as const)
        : documentWarning
          ? ("Warning" as const)
          : ("Success" as const),
    };
  }, [
    selectedIndId,
    actualValue,
    targetValue,
    baselineValue,
    responsibleDept,
    responsiblePerson,
    financialYear,
    quarter,
    month,
    site,
    workflowStatus,
    reportingDate,
    reportingYear,
    selectedInd,
    attachments,
  ]);

  // Actions
  const handleSaveDraft = () => {
    toast.success("Draft saved", {
      description: `Draft for indicator ${selectedInd.id} saved in your session.`,
    });
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        activity: "Draft manually saved",
        performedBy: "Arjun Mehta (Project Manager)",
        timestamp: new Date().toLocaleString(),
        version: "V1.0",
      },
      ...prev,
    ]);
  };

  const handleSubmit = () => {
    // If there are error validation flags, alert
    const hasErrors =
      validations.mandatory === "Error" ||
      validations.formula === "Error" ||
      validations.unit === "Error";

    if (hasErrors) {
      toast.error("Submission failed", {
        description: "Please correct outstanding validation errors before submitting.",
      });
      return;
    }

    setWorkflowStatus("Submitted");
    toast.success("Indicator Submitted", {
      description: "Data successfully pushed to the verification pipeline.",
    });

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        activity: "Form submitted — transitioned to 'Submitted'",
        performedBy: "Arjun Mehta (Project Manager)",
        timestamp: new Date().toLocaleString(),
        version: "V1.1",
      },
      ...prev,
    ]);
  };

  const handleReset = () => {
    setSelectedIndId(INDICATORS_MASTER[0].id);
    setFinancialYear("FY 2026-27");
    setQuarter("Q1");
    setMonth("July");
    setReportingDate("2026-07-15");
    setActualValue("");
    setTargetValue("");
    setBaselineValue("");
    setComments("");
    toast.success("Form cleared to defaults");
  };

  // Simulated File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc: Attachment = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: type,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        version: `V1.${attachments.length}`,
        uploadedBy: "Arjun Mehta",
        uploadedDate: new Date().toISOString().slice(0, 10),
        status: "Draft",
      };
      setAttachments((prev) => [newDoc, ...prev]);
      toast.success("Evidence uploaded", {
        description: `${file.name} uploaded as ${type}.`,
      });
      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          activity: `Document uploaded: ${file.name}`,
          performedBy: "Arjun Mehta (Project Manager)",
          timestamp: new Date().toLocaleString(),
          version: "V1.0",
        },
        ...prev,
      ]);
    }
  };

  const handleDeleteAttachment = (id: string, name: string) => {
    setAttachments((prev) => prev.filter((doc) => doc.id !== id));
    toast.success("Attachment removed", {
      description: `${name} has been detached from this entry.`,
    });
  };

  // Custom component styles
  const categoryColors = {
    Environmental: {
      accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-950/5",
    },
    Social: {
      accent: "text-sky-500 bg-sky-500/10 border-sky-500/25",
      border: "border-sky-500/30",
      glow: "shadow-sky-950/5",
    },
    Governance: {
      accent: "text-violet-500 bg-violet-500/10 border-violet-500/25",
      border: "border-violet-500/30",
      glow: "shadow-violet-950/5",
    },
  }[selectedInd.category];

  const validationBadge = (status: "Success" | "Warning" | "Error") => {
    switch (status) {
      case "Success":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-success/12 px-1.5 py-0.5 text-[10px] font-semibold text-success uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" /> Success
          </span>
        );
      case "Warning":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-warning/14 px-1.5 py-0.5 text-[10px] font-semibold text-warning uppercase tracking-wider">
            <AlertTriangle className="h-3 w-3" /> Warning
          </span>
        );
      case "Error":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-destructive/12 px-1.5 py-0.5 text-[10px] font-semibold text-destructive uppercase tracking-wider">
            <XCircle className="h-3 w-3" /> Error
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Selection Row */}
      <PanelCard className="p-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-3">
        {/* Search / Select Indicator */}
        <div className="col-span-2 sm:col-span-4 lg:col-span-4 space-y-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Search Indicator
          </Label>
          <Select value={selectedIndId} onValueChange={setSelectedIndId}>
            <SelectTrigger className="h-9 text-[12px] rounded-lg">
              <SelectValue placeholder="Select indicator..." />
            </SelectTrigger>
            <SelectContent className="max-w-[400px]">
              {INDICATORS_MASTER.map((ind) => (
                <SelectItem key={ind.id} value={ind.id} className="text-[12px]">
                  <span className="font-semibold text-muted-foreground mr-1.5">{ind.id}</span>
                  {ind.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Financial Year */}
        <div className="space-y-1 lg:col-span-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Financial Year
          </Label>
          <Select value={financialYear} onValueChange={setFinancialYear}>
            <SelectTrigger className="h-9 text-[12px] rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FY 2024-25" className="text-[12px]">
                FY 2024-25
              </SelectItem>
              <SelectItem value="FY 2025-26" className="text-[12px]">
                FY 2025-26
              </SelectItem>
              <SelectItem value="FY 2026-27" className="text-[12px]">
                FY 2026-27
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quarter */}
        <div className="space-y-1 lg:col-span-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Quarter
          </Label>
          <Select value={quarter} onValueChange={setQuarter}>
            <SelectTrigger className="h-9 text-[12px] rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1" className="text-[12px]">
                Q1
              </SelectItem>
              <SelectItem value="Q2" className="text-[12px]">
                Q2
              </SelectItem>
              <SelectItem value="Q3" className="text-[12px]">
                Q3
              </SelectItem>
              <SelectItem value="Q4" className="text-[12px]">
                Q4
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Month */}
        <div className="space-y-1 lg:col-span-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Month
          </Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="h-9 text-[12px] rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="July" className="text-[12px]">
                July
              </SelectItem>
              <SelectItem value="August" className="text-[12px]">
                August
              </SelectItem>
              <SelectItem value="September" className="text-[12px]">
                September
              </SelectItem>
              <SelectItem value="October" className="text-[12px]">
                October
              </SelectItem>
              <SelectItem value="November" className="text-[12px]">
                November
              </SelectItem>
              <SelectItem value="December" className="text-[12px]">
                December
              </SelectItem>
              <SelectItem value="January" className="text-[12px]">
                January
              </SelectItem>
              <SelectItem value="February" className="text-[12px]">
                February
              </SelectItem>
              <SelectItem value="March" className="text-[12px]">
                March
              </SelectItem>
              <SelectItem value="April" className="text-[12px]">
                April
              </SelectItem>
              <SelectItem value="May" className="text-[12px]">
                May
              </SelectItem>
              <SelectItem value="June" className="text-[12px]">
                June
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Company */}
        <div className="space-y-1 lg:col-span-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Company
          </Label>
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger className="h-9 text-[12px] rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESG_GROUP.entities.map((e) => (
                <SelectItem key={e.id} value={e.id} className="text-[12px]">
                  {e.short}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Business Unit */}
        <div className="space-y-1 lg:col-span-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Unit
          </Label>
          <Select value={businessUnit} onValueChange={setBusinessUnit}>
            <SelectTrigger className="h-9 text-[12px] rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="E-Bus Operations" className="text-[12px]">
                E-Bus Ops
              </SelectItem>
              <SelectItem value="Depot Management" className="text-[12px]">
                Depot Management
              </SelectItem>
              <SelectItem value="Corporate" className="text-[12px]">
                HQ Corporate
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Project */}
        <div className="space-y-1 lg:col-span-2">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Project
          </Label>
          <Select value={project} onValueChange={setProject}>
            <SelectTrigger className="h-9 text-[12px] rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MBMT Electrification Phase 1" className="text-[12px]">
                MBMT Phase 1
              </SelectItem>
              <SelectItem value="Silvassa Smart Transit" className="text-[12px]">
                Silvassa SPV
              </SelectItem>
              <SelectItem value="Corporate HQ Operations" className="text-[12px]">
                Corporate HQ
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-1 lg:col-span-1">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Status
          </Label>
          <div className="h-9 flex items-center px-2.5 rounded-lg border border-border/60 bg-muted/20 text-[11px] font-bold text-primary">
            {workflowStatus}
          </div>
        </div>
      </PanelCard>

      {/* Main Grid: Left Side (Form inputs), Right Side (Mappers, Validations, Logs) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Column (Main Form Sections) */}
        <div className="xl:col-span-8 space-y-4">
          {/* Card 1: Indicator Information */}
          <PanelCard className={cn("border-t-2", categoryColors.border)}>
            <button
              onClick={() => toggleSection(1)}
              className="flex w-full items-center justify-between px-4 py-3 border-b border-border/40 text-left outline-none cursor-pointer"
            >
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                  1. Indicator Information
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Metadata, definitions and type details
                </p>
              </div>
              {collapsedSections[1] ? (
                <ChevronDown className="h-4.5 w-4.5" />
              ) : (
                <ChevronUp className="h-4.5 w-4.5" />
              )}
            </button>

            {!collapsedSections[1] && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div className="space-y-1.5 lg:col-span-1 sm:col-span-1">
                  <Label className="text-[12px]">Indicator ID (Auto Generated)</Label>
                  <Input
                    readOnly
                    value={selectedInd.id}
                    className="h-9 bg-muted/30 text-[12.5px] num font-medium"
                  />
                </div>

                <div className="space-y-1.5 lg:col-span-4 sm:col-span-1">
                  <Label className="text-[12px]">Indicator Name</Label>
                  <Input
                    readOnly
                    value={selectedInd.name}
                    className="h-9 bg-muted/30 text-[12.5px] font-medium"
                  />
                </div>

                <div className="space-y-1.5 lg:col-span-1">
                  <Label className="text-[12px]">ESG Category</Label>
                  <div className="h-9 flex items-center px-3 rounded-lg border border-border/60 bg-muted/20 text-[12px] font-semibold">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-[10.5px] font-bold border",
                        categoryColors.accent,
                      )}
                    >
                      {selectedInd.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 lg:col-span-1">
                  <Label className="text-[12px]">Sub Category</Label>
                  <Input
                    readOnly
                    value={selectedInd.subCategory}
                    className="h-9 bg-muted/30 text-[12.5px]"
                  />
                </div>

                <div className="space-y-1.5 lg:col-span-1">
                  <Label className="text-[12px]">Indicator Type</Label>
                  <div className="h-9 flex items-center px-3 rounded-lg border border-border/60 bg-muted/20 text-[12px] font-medium">
                    <span className="rounded bg-accent/60 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                      {selectedInd.type}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 lg:col-span-1">
                  <Label className="text-[12px]">Unit</Label>
                  <Input
                    readOnly
                    value={selectedInd.unit}
                    className="h-9 bg-muted/30 text-[12.5px] num font-semibold"
                  />
                </div>

                <div className="space-y-1.5 lg:col-span-1">
                  <Label className="text-[12px]">Data Source</Label>
                  <div className="h-9 flex items-center px-3 rounded-lg border border-border/60 bg-muted/20 text-[12px]">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary">
                      {selectedInd.dataSource}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 sm:col-span-2 space-y-1">
                  <Label className="text-[12px]">Indicator Definition (Read Only)</Label>
                  <p className="text-[11.5px] leading-relaxed text-muted-foreground/80 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                    {selectedInd.definition}
                  </p>
                </div>
              </div>
            )}
          </PanelCard>

          {/* Card 2: Reporting Details */}
          <PanelCard>
            <button
              onClick={() => toggleSection(2)}
              className="flex w-full items-center justify-between px-4 py-3 border-b border-border/40 text-left outline-none cursor-pointer"
            >
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                  2. Reporting Details
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Reporting timelines and frequencies
                </p>
              </div>
              {collapsedSections[2] ? (
                <ChevronDown className="h-4.5 w-4.5" />
              ) : (
                <ChevronUp className="h-4.5 w-4.5" />
              )}
            </button>

            {!collapsedSections[2] && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Reporting Financial Year</Label>
                  <Select value={financialYear} onValueChange={setFinancialYear}>
                    <SelectTrigger className="h-9 text-[12.5px] rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FY 2024-25" className="text-[12px]">
                        FY 2024-25
                      </SelectItem>
                      <SelectItem value="FY 2025-26" className="text-[12px]">
                        FY 2025-26
                      </SelectItem>
                      <SelectItem value="FY 2026-27" className="text-[12px]">
                        FY 2026-27
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px]">Reporting Year</Label>
                  <Select value={reportingYear} onValueChange={setReportingYear}>
                    <SelectTrigger className="h-9 text-[12.5px] rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024" className="text-[12px]">
                        2024
                      </SelectItem>
                      <SelectItem value="2025" className="text-[12px]">
                        2025
                      </SelectItem>
                      <SelectItem value="2026" className="text-[12px]">
                        2026
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px]">Reporting Frequency</Label>
                  <Select value={reportingFrequency} onValueChange={setReportingFrequency}>
                    <SelectTrigger className="h-9 text-[12.5px] rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly" className="text-[12px]">
                        Monthly
                      </SelectItem>
                      <SelectItem value="Quarterly" className="text-[12px]">
                        Quarterly
                      </SelectItem>
                      <SelectItem value="Half-Yearly" className="text-[12px]">
                        Half-Yearly
                      </SelectItem>
                      <SelectItem value="Annual" className="text-[12px]">
                        Annual
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px]">Reporting Quarter</Label>
                  <Select value={quarter} onValueChange={setQuarter}>
                    <SelectTrigger className="h-9 text-[12.5px] rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1" className="text-[12px]">
                        Q1
                      </SelectItem>
                      <SelectItem value="Q2" className="text-[12px]">
                        Q2
                      </SelectItem>
                      <SelectItem value="Q3" className="text-[12px]">
                        Q3
                      </SelectItem>
                      <SelectItem value="Q4" className="text-[12px]">
                        Q4
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px]">Reporting Month</Label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="h-9 text-[12.5px] rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="July" className="text-[12px]">
                        July
                      </SelectItem>
                      <SelectItem value="August" className="text-[12px]">
                        August
                      </SelectItem>
                      <SelectItem value="September" className="text-[12px]">
                        September
                      </SelectItem>
                      <SelectItem value="October" className="text-[12px]">
                        October
                      </SelectItem>
                      <SelectItem value="November" className="text-[12px]">
                        November
                      </SelectItem>
                      <SelectItem value="December" className="text-[12px]">
                        December
                      </SelectItem>
                      <SelectItem value="January" className="text-[12px]">
                        January
                      </SelectItem>
                      <SelectItem value="February" className="text-[12px]">
                        February
                      </SelectItem>
                      <SelectItem value="March" className="text-[12px]">
                        March
                      </SelectItem>
                      <SelectItem value="April" className="text-[12px]">
                        April
                      </SelectItem>
                      <SelectItem value="May" className="text-[12px]">
                        May
                      </SelectItem>
                      <SelectItem value="June" className="text-[12px]">
                        June
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px]">Reporting Date</Label>
                  <Input
                    type="date"
                    value={reportingDate}
                    onChange={(e) => setReportingDate(e.target.value)}
                    className="h-9 text-[12.5px]"
                  />
                </div>

                {isTimelineSpecific && (
                  <div className="md:col-span-3 space-y-1.5 transition-all duration-300">
                    <Label className="text-[12px]">Custom Reporting Period</Label>
                    <Input
                      value={customRange}
                      onChange={(e) => setCustomRange(e.target.value)}
                      placeholder="e.g. 01 Jul 2026 - 31 Jul 2026"
                      className="h-9 text-[12.5px]"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Required because Timeline Specific is enabled
                    </p>
                  </div>
                )}
              </div>
            )}
          </PanelCard>

          {/* Card 3: Applicability */}
          <PanelCard>
            <button
              onClick={() => toggleSection(3)}
              className="flex w-full items-center justify-between px-4 py-3 border-b border-border/40 text-left outline-none cursor-pointer"
            >
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                  3. Applicability
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Scoped entity, unit, and site applicability rules
                </p>
              </div>
              {collapsedSections[3] ? (
                <ChevronDown className="h-4.5 w-4.5" />
              ) : (
                <ChevronUp className="h-4.5 w-4.5" />
              )}
            </button>

            {!collapsedSections[3] && (
              <div className="p-4 space-y-3.5">
                {/* Dropdowns & Switches Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Site Specific</Label>
                    <div className="h-9 flex items-center justify-between px-3 rounded-lg border border-border/60 bg-muted/10">
                      <span className="text-[11.5px] text-muted-foreground">Enabled</span>
                      <Switch
                        id="site-specific"
                        checked={isSiteSpecific}
                        onCheckedChange={setIsSiteSpecific}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Project Specific</Label>
                    <div className="h-9 flex items-center justify-between px-3 rounded-lg border border-border/60 bg-muted/10">
                      <span className="text-[11.5px] text-muted-foreground">Enabled</span>
                      <Switch
                        id="project-specific"
                        checked={isProjectSpecific}
                        onCheckedChange={setIsProjectSpecific}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Timeline Specific</Label>
                    <div className="h-9 flex items-center justify-between px-3 rounded-lg border border-border/60 bg-muted/10">
                      <span className="text-[11.5px] text-muted-foreground">Enabled</span>
                      <Switch
                        id="timeline-specific"
                        checked={isTimelineSpecific}
                        onCheckedChange={setIsTimelineSpecific}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Company</Label>
                    <Select value={company} onValueChange={setCompany}>
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESG_GROUP.entities.map((e) => (
                          <SelectItem key={e.id} value={e.id} className="text-[12px]">
                            {e.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Business Unit</Label>
                    <Select value={businessUnit} onValueChange={setBusinessUnit}>
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="E-Bus Operations" className="text-[12px]">
                          E-Bus Operations
                        </SelectItem>
                        <SelectItem value="Depot Management" className="text-[12px]">
                          Depot Management
                        </SelectItem>
                        <SelectItem value="Corporate" className="text-[12px]">
                          Corporate Administration
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Region</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="West" className="text-[12px]">
                          West Region
                        </SelectItem>
                        <SelectItem value="North" className="text-[12px]">
                          North Region
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px]">State</Label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px]">City</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  {isSiteSpecific && (
                    <div className="space-y-1.5">
                      <Label className="text-[12px]">Site</Label>
                      <Select value={site} onValueChange={setSite}>
                        <SelectTrigger className="h-9 text-[12.5px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bhayandar" className="text-[12px]">
                            Bhayandar Depot
                          </SelectItem>
                          <SelectItem value="kashimira" className="text-[12px]">
                            Kashimira Depot
                          </SelectItem>
                          <SelectItem value="silvassa-depot" className="text-[12px]">
                            Silvassa Depot
                          </SelectItem>
                          <SelectItem value="hq" className="text-[12px]">
                            Andheri HQ
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {isProjectSpecific && (
                    <div
                      className={cn(
                        "space-y-1.5",
                        isSiteSpecific ? "md:col-span-3" : "md:col-span-1",
                      )}
                    >
                      <Label className="text-[12px]">Project</Label>
                      <Select value={project} onValueChange={setProject}>
                        <SelectTrigger className="h-9 text-[12.5px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MBMT Electrification Phase 1" className="text-[12px]">
                            MBMT Electrification Phase 1
                          </SelectItem>
                          <SelectItem value="Silvassa Smart Transit" className="text-[12px]">
                            Silvassa Smart Transit
                          </SelectItem>
                          <SelectItem value="Corporate HQ Operations" className="text-[12px]">
                            Corporate HQ Operations
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </PanelCard>

          {/* Card 4: Ownership */}
          <PanelCard>
            <button
              onClick={() => toggleSection(4)}
              className="flex w-full items-center justify-between px-4 py-3 border-b border-border/40 text-left outline-none cursor-pointer"
            >
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                  4. Ownership
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Responsibility assignments and workflows
                </p>
              </div>
              {collapsedSections[4] ? (
                <ChevronDown className="h-4.5 w-4.5" />
              ) : (
                <ChevronUp className="h-4.5 w-4.5" />
              )}
            </button>

            {!collapsedSections[4] && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Responsible Department</Label>
                  <Input
                    value={responsibleDept}
                    onChange={(e) => setResponsibleDept(e.target.value)}
                    className="h-9 text-[12.5px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px]">Responsible Person</Label>
                  <Select value={responsiblePerson} onValueChange={setResponsiblePerson}>
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PEOPLE.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-[12px]">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px]">Reviewer</Label>
                  <Select value={reviewer} onValueChange={setReviewer}>
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PEOPLE.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-[12px]">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px]">Approver</Label>
                  <Select value={approver} onValueChange={setApprover}>
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PEOPLE.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-[12px]">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px]">Submission Deadline</Label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="h-9 text-[12.5px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px]">Current Workflow Status</Label>
                  <div className="h-9 flex items-center px-3 rounded-lg border border-border/60 bg-muted/20 text-[12px] font-bold text-primary">
                    {workflowStatus}
                  </div>
                </div>
              </div>
            )}
          </PanelCard>

          {/* Card 5: Indicator Values */}
          <PanelCard>
            <button
              onClick={() => toggleSection(5)}
              className="flex w-full items-center justify-between px-4 py-3 border-b border-border/40 text-left outline-none cursor-pointer"
            >
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                  5. Indicator Values
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Input metrics, baseline comparisons and comments
                </p>
              </div>
              {collapsedSections[5] ? (
                <ChevronDown className="h-4.5 w-4.5" />
              ) : (
                <ChevronUp className="h-4.5 w-4.5" />
              )}
            </button>

            {!collapsedSections[5] && (
              <div className="p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">
                      Actual Value <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={actualValue}
                        onChange={(e) => setActualValue(e.target.value)}
                        className="h-9 text-[13px] num font-semibold pr-12"
                      />
                      <span className="absolute right-3 top-2 text-[11px] font-semibold text-muted-foreground select-none">
                        {selectedInd.unit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px]">
                      Target Value <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        className="h-9 text-[13px] num pr-12"
                      />
                      <span className="absolute right-3 top-2 text-[11px] text-muted-foreground select-none">
                        {selectedInd.unit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px]">
                      Baseline Value <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={baselineValue}
                        onChange={(e) => setBaselineValue(e.target.value)}
                        className="h-9 text-[13px] num pr-12"
                      />
                      <span className="absolute right-3 top-2 text-[11px] text-muted-foreground select-none">
                        {selectedInd.unit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Previous Value (Read Only)</Label>
                    <div className="h-9 flex items-center justify-between px-3 rounded-lg border border-border/60 bg-muted/20 text-[12.5px] num font-medium text-muted-foreground">
                      <span>{selectedInd.previousValue.toLocaleString()}</span>
                      <span className="text-[10px] font-semibold">{selectedInd.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Variance Outputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Variance vs Target
                      </div>
                      <div className="text-[10px] text-muted-foreground/80">
                        Calculated comparison in %
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-bold num",
                        targetVariance > 0
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                      )}
                    >
                      {targetVariance > 0 ? "+" : ""}
                      {targetVariance.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Variance vs Previous
                      </div>
                      <div className="text-[10px] text-muted-foreground/80">
                        Period-over-period variance
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-bold num",
                        previousVariance > 0
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                      )}
                    >
                      {previousVariance > 0 ? "+" : ""}
                      {previousVariance.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px]">Comments &amp; Remarks</Label>
                  <Textarea
                    placeholder="Enter any qualitative context, anomalies, or calculation assumptions..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="min-h-[70px] text-[12.5px] leading-relaxed resize-none"
                  />
                </div>
              </div>
            )}
          </PanelCard>

          {/* Card 6: Formula & Calculation */}
          <PanelCard className="bg-muted/10 border-dashed border-border/80">
            <button
              onClick={() => toggleSection(6)}
              className="flex w-full items-center justify-between px-4 py-3 border-b border-border/40 text-left outline-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 grid place-items-center bg-primary/10 rounded text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                    6. Formula &amp; Calculation (Read Only)
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Carbon conversion coefficients and emission outputs
                  </p>
                </div>
              </div>
              {collapsedSections[6] ? (
                <ChevronDown className="h-4.5 w-4.5" />
              ) : (
                <ChevronUp className="h-4.5 w-4.5" />
              )}
            </button>

            {!collapsedSections[6] && (
              <div className="p-4 space-y-3.5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="bg-card p-3 rounded-lg border border-border/60">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">
                      Formula Name
                    </span>
                    <span className="text-[12px] font-semibold text-foreground mt-1 block truncate">
                      {selectedInd.formulaName}
                    </span>
                  </div>

                  <div className="bg-card p-3 rounded-lg border border-border/60">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">
                      Emission Factor
                    </span>
                    <span className="text-[12px] font-semibold text-foreground mt-1 block num">
                      {selectedInd.emissionFactor} kg CO₂e/{selectedInd.unit}
                    </span>
                  </div>

                  <div className="bg-card p-3 rounded-lg border border-border/60">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">
                      Conversion Factor
                    </span>
                    <span className="text-[12px] font-semibold text-foreground mt-1 block num">
                      {selectedInd.conversionFactor} t CO₂e/{selectedInd.unit}
                    </span>
                  </div>
                </div>

                {/* Calculation Info Component */}
                <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 p-3 rounded-lg">
                  <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      Formula Preview
                    </div>
                    <div className="text-[11.5px] font-medium text-foreground italic">
                      {selectedInd.formulaPreview}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Coefficients are pulled automatically from system Masters and updated in
                      accordance with IPCC Guidelines.
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-4 border-t border-border/40 pt-4">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Auto Calculated Result
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-[20px] font-bold text-foreground num leading-none">
                        {carbonEquivalent.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                      </span>
                      <span className="text-[11px] font-semibold text-muted-foreground">tCO₂e</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Calculation Status
                      </span>
                      <span className="text-[11px] font-semibold text-foreground">Complete</span>
                    </div>
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 text-[11px] font-bold text-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Calculated
                    </span>
                  </div>
                </div>
              </div>
            )}
          </PanelCard>

          {/* Card 8: Supporting Documents */}
          <PanelCard>
            <button
              onClick={() => toggleSection(8)}
              className="flex w-full items-center justify-between px-4 py-3 border-b border-border/40 text-left outline-none cursor-pointer"
            >
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                  8. Supporting Documents
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Upload bills, calculations sheets and compliance evidence
                </p>
              </div>
              {collapsedSections[8] ? (
                <ChevronDown className="h-4.5 w-4.5" />
              ) : (
                <ChevronUp className="h-4.5 w-4.5" />
              )}
            </button>

            {!collapsedSections[8] && (
              <div className="p-4 space-y-4">
                {/* Upload Buttons Box */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {[
                    "Upload Evidence",
                    "Upload Utility Bill",
                    "Upload Compliance Document",
                    "Upload Calculation Sheet",
                    "Upload Images",
                    "Upload Other Files",
                  ].map((label) => (
                    <div key={label} className="relative">
                      <input
                        type="file"
                        id={`file-${label}`}
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, label.replace("Upload ", ""))}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById(`file-${label}`)?.click()}
                        className="flex w-full h-8 items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-2 text-[11px] text-muted-foreground transition-all hover:border-primary/45 hover:text-foreground hover:bg-muted/30"
                      >
                        <Upload className="h-3 w-3 shrink-0" />
                        <span className="truncate">{label.replace("Upload ", "")}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Attachments Table */}
                <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/40 text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-2">Document Name</th>
                          <th className="px-3 py-2">Type</th>
                          <th className="px-3 py-2">Version</th>
                          <th className="px-3 py-2">Uploaded By</th>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 text-[11.5px]">
                        {attachments.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                              No documents uploaded yet. Upload a bill or compliance document above.
                            </td>
                          </tr>
                        ) : (
                          attachments.map((doc) => (
                            <tr key={doc.id} className="hover:bg-muted/10">
                              <td className="px-4 py-2 font-medium flex items-center gap-2 max-w-[200px]">
                                <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span className="truncate" title={doc.name}>
                                  {doc.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground/80 num">
                                  ({doc.size})
                                </span>
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{doc.type}</td>
                              <td className="px-3 py-2 num font-semibold">{doc.version}</td>
                              <td className="px-3 py-2">{doc.uploadedBy}</td>
                              <td className="px-3 py-2 num">{doc.uploadedDate}</td>
                              <td className="px-3 py-2">
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-500 uppercase tracking-wide">
                                  {doc.status}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAttachment(doc.id, doc.name)}
                                  className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                                  title="Delete attachment"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </PanelCard>

          {/* Card 10: Workflow */}
          <PanelCard>
            <button
              onClick={() => toggleSection(10)}
              className="flex w-full items-center justify-between px-4 py-3 border-b border-border/40 text-left outline-none cursor-pointer"
            >
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                  10. Workflow Stage
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Sign-off trail and dynamic validation comments
                </p>
              </div>
              {collapsedSections[10] ? (
                <ChevronDown className="h-4.5 w-4.5" />
              ) : (
                <ChevronUp className="h-4.5 w-4.5" />
              )}
            </button>

            {!collapsedSections[10] && (
              <div className="p-4 space-y-4">
                {/* Stepper Timeline */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-y-3 gap-x-1.5 bg-muted/15 p-3 rounded-lg border border-border/40">
                  {[
                    "Draft",
                    "Submitted",
                    "Department Review",
                    "ESG Review",
                    "Compliance Approval",
                    "Approved",
                    "Locked",
                  ].map((stage, idx) => {
                    const isPassed =
                      stage === workflowStatus ||
                      [
                        "Draft",
                        "Submitted",
                        "Department Review",
                        "ESG Review",
                        "Compliance Approval",
                        "Approved",
                        "Locked",
                      ].indexOf(workflowStatus) > idx;

                    const isActive = stage === workflowStatus;

                    return (
                      <React.Fragment key={stage}>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "grid h-6 w-6 place-items-center rounded-full text-[10.5px] font-bold border transition-colors",
                              isActive
                                ? "bg-primary border-primary text-primary-foreground"
                                : isPassed
                                  ? "bg-primary/10 border-primary/45 text-primary"
                                  : "bg-card border-border/60 text-muted-foreground",
                            )}
                          >
                            {idx + 1}
                          </span>
                          <span
                            className={cn(
                              "text-[11.5px] font-semibold tracking-tight whitespace-nowrap",
                              isActive
                                ? "text-foreground"
                                : isPassed
                                  ? "text-primary"
                                  : "text-muted-foreground",
                            )}
                          >
                            {stage}
                          </span>
                        </div>
                        {idx < 6 && (
                          <div
                            className={cn(
                              "hidden lg:block h-[1.5px] flex-1 bg-border/50",
                              isPassed ? "bg-primary/40" : "",
                            )}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px]">Reviewer comments &amp; Feedback</Label>
                  <Textarea
                    placeholder="Approver/Reviewer comments appear here..."
                    value={reviewerComments}
                    onChange={(e) => setReviewerComments(e.target.value)}
                    className="min-h-[60px] text-[12.5px] leading-relaxed resize-none bg-muted/10"
                  />
                </div>
              </div>
            )}
          </PanelCard>
        </div>

        {/* Right Column (Report Mapping, Validations, Audit Logs) */}
        <div className="xl:col-span-4 space-y-4">
          {/* Card 7: Report Mapping */}
          <PanelCard>
            <button
              onClick={() => toggleSection(7)}
              className="flex w-full items-center justify-between px-4 py-3 border-b border-border/40 text-left outline-none cursor-pointer"
            >
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                  7. Report Mapping
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Auto-mapped reporting frameworks
                </p>
              </div>
              {collapsedSections[7] ? (
                <ChevronDown className="h-4.5 w-4.5" />
              ) : (
                <ChevronUp className="h-4.5 w-4.5" />
              )}
            </button>

            {!collapsedSections[7] && (
              <div className="p-4 space-y-2.5">
                <div className="flex flex-wrap gap-1.5">
                  {selectedInd.mappings.map((mapping) => (
                    <span
                      key={mapping}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/8 px-2 py-0.5 text-[10.5px] font-bold text-primary"
                    >
                      <Link className="h-3 w-3 shrink-0" />
                      {mapping}
                    </span>
                  ))}
                  {["Internal Dashboard", "Management Reports"].map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  These mappings are hardcoded from Master Config data to prevent configuration
                  errors.
                </p>
              </div>
            )}
          </PanelCard>

          {/* Card 9: Validation Engine */}
          <PanelCard>
            <button
              onClick={() => toggleSection(9)}
              className="flex w-full items-center justify-between px-4 py-3 border-b border-border/40 text-left outline-none cursor-pointer"
            >
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                  9. Validation Check
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Real-time data integrity monitoring
                </p>
              </div>
              {collapsedSections[9] ? (
                <ChevronDown className="h-4.5 w-4.5" />
              ) : (
                <ChevronUp className="h-4.5 w-4.5" />
              )}
            </button>

            {!collapsedSections[9] && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/10">
                    <span className="font-semibold text-foreground text-[11px] truncate mr-1.5">
                      Mandatory Fields
                    </span>
                    {validationBadge(validations.mandatory)}
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/10">
                    <span className="font-semibold text-foreground text-[11px] truncate mr-1.5">
                      Duplicate Record
                    </span>
                    {validationBadge(validations.duplicate)}
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/10">
                    <span className="font-semibold text-foreground text-[11px] truncate mr-1.5">
                      Formula Validation
                    </span>
                    {validationBadge(validations.formula)}
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/10">
                    <span className="font-semibold text-foreground text-[11px] truncate mr-1.5">
                      Emission Factor
                    </span>
                    {validationBadge(validations.emissionFactor)}
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/10">
                    <span className="font-semibold text-foreground text-[11px] truncate mr-1.5">
                      Reporting Period
                    </span>
                    {validationBadge(validations.reportingPeriod)}
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/10">
                    <span className="font-semibold text-foreground text-[11px] truncate mr-1.5">
                      Unit Validation
                    </span>
                    {validationBadge(validations.unit)}
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/10 sm:col-span-2">
                    <span className="font-semibold text-foreground text-[11px] truncate mr-1.5">
                      Supporting Document
                    </span>
                    {validationBadge(validations.document)}
                  </div>
                </div>

                {validations.document === "Warning" && (
                  <div className="flex gap-2 bg-warning/10 border border-warning/20 p-2 rounded text-[10.5px] text-warning font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>
                      High value entered without evidence attachment. It is recommended to upload a
                      supporting utility bill.
                    </span>
                  </div>
                )}
              </div>
            )}
          </PanelCard>

          {/* Card 11: Audit Trail */}
          <PanelCard>
            <button
              onClick={() => toggleSection(11)}
              className="flex w-full items-center justify-between px-4 py-3.5 border-b border-border/40 text-left outline-none cursor-pointer"
            >
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-wider text-foreground">
                  11. Audit Trail (Read Only)
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Immutable record alteration history
                </p>
              </div>
              {collapsedSections[11] ? (
                <ChevronDown className="h-4.5 w-4.5" />
              ) : (
                <ChevronUp className="h-4.5 w-4.5" />
              )}
            </button>

            {!collapsedSections[11] && (
              <div className="p-4 space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-[11.5px] border-b border-border/40 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                      Created By
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-foreground block">Arjun Mehta</span>
                      <span className="text-muted-foreground text-[10px] num">
                        15 Jul 26 • 09:00 AM
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider">
                      Modified By
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-foreground block">Arjun Mehta</span>
                      <span className="text-muted-foreground text-[10px] num">
                        15 Jul 26 • 10:30 AM
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-muted-foreground font-bold uppercase text-[9px] tracking-wider block">
                    Activity Log
                  </span>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex gap-2 text-[11px] leading-snug border-l border-primary/20 pl-2"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{log.activity}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                            <span>{log.performedBy}</span>
                            <span>•</span>
                            <span className="num">{log.timestamp}</span>
                            <span>•</span>
                            <span className="num font-semibold text-primary">{log.version}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </PanelCard>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 z-40 -mx-6 bg-background/90 backdrop-blur-md border-t border-border px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] mt-4">
        <div className="flex flex-col">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Compliance Validation
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11.5px] font-semibold text-foreground">Form Status:</span>
            <span className="inline-flex h-5 items-center rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {workflowStatus}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAllSections}
            className="h-8 gap-1.5 rounded-lg text-[12px] border-border hover:bg-muted/40"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {allExpanded ? "Collapse All" : "Expand All"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 gap-1.5 rounded-lg text-[12px] border-border text-muted-foreground hover:text-foreground"
          >
            Reset Fields
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.search = "area=projects";
            }}
            className="h-8 gap-1.5 rounded-lg text-[12px] border-border text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            className="h-8 gap-1.5 rounded-lg text-[12px] border-border text-foreground hover:bg-muted/30"
          >
            <Save className="h-3.5 w-3.5" /> Save Draft
          </Button>

          <Button
            size="sm"
            onClick={handleSubmit}
            className="h-8 gap-1.5 rounded-lg text-[12px] bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-3.5 w-3.5" /> Submit Record
          </Button>
        </div>
      </div>
    </div>
  );
}
