import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  Send,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
  AlertTriangle,
  Info,
  Calendar,
  Building2,
  CheckCircle2,
  Lock,
  Upload,
  ChevronDown,
  ChevronUp,
  XCircle,
  FileCheck,
  User,
  History,
  AlertOctagon,
  Printer,
  Eye,
  Download,
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
import { PanelCard, useEsg } from "../primitives";
import { EscalationStatusIndicator } from "../EscalationStatusIndicator";
import { getActiveEscalationForSource } from "@/lib/esg-escalations";

// Type definitions
export type ReportType = "nc" | "amr" | "ghg" | "brsr" | "impact" | "carbon";

export interface ReportDataEntryFormProps {
  reportType: ReportType;
  onCancel: () => void;
  editRecordId?: string | null;
  initialProject?: string;
  initialSite?: string;
  initialPeriod?: string;
}

export const DATA_ENTRY_TABS = [
  "DE - Energy & Fuel",
  "DE - Water",
  "DE - Waste",
  "DE - Fleet & Avoided Emissions",
  "DE - Workforce & Safety",
  "DE - Governance & CSR",
  "Calc - GHG Inventory",
  "GHG Accounting Report",
  "CDP Climate Response"
];

export const MAPPING_MATRIX: Record<string, { person: string; dept: string; freq: string }> = {
  "DE - Energy & Fuel": { person: "Depot / Facility Manager", dept: "Energy Operations", freq: "Monthly" },
  "DE - Water": { person: "Depot Manager", dept: "Administration", freq: "Monthly" },
  "DE - Waste": { person: "EHS Manager", dept: "EHS / HR", freq: "Monthly" },
  "DE - Fleet & Avoided Emissions": { person: "Operations / Fleet Manager", dept: "Fleet Operations", freq: "Monthly" },
  "DE - Workforce & Safety": { person: "HR / EHS Manager", dept: "EHS / HR", freq: "Annual" },
  "DE - Governance & CSR": { person: "Company Secretary / Legal / Finance", dept: "Secretarial & Compliance", freq: "Annual" },
  "Calc - GHG Inventory": { person: "ESG / Sustainability Lead", dept: "Sustainability / ESG", freq: "Monthly Review" },
  "GHG Accounting Report": { person: "ESG / Sustainability Lead", dept: "Sustainability / ESG", freq: "Annual" },
  "CDP Climate Response": { person: "ESG / Sustainability Lead", dept: "Sustainability / ESG", freq: "Annual" }
};

export const INDICATORS = [
  { id: "IND-2026-001", name: "Grid Electricity Consumption", unit: "kWh", formula: "Actual * 0.82 kg CO₂e", factor: 0.82, scope: "Scope 2", maps: ["amr", "ghg", "brsr", "carbon"], amrRef: "AMR-E-01", principle: "Principle 6", section: "Section B", question: "Q1", def: "Total electricity drawn from the grid for charging stations.", siteSpecific: "Yes" },
  { id: "IND-2026-002", name: "Diesel Fuel for Power Backup", unit: "Liters", formula: "Actual * 2.68 kg CO₂e", factor: 2.68, scope: "Scope 1", maps: ["amr", "ghg", "brsr"], amrRef: "AMR-E-02", principle: "Principle 6", section: "Section B", question: "Q2", def: "Diesel consumed in generator sets at depots.", siteSpecific: "Yes" },
  { id: "IND-2026-003", name: "Fresh Water Consumption", unit: "kL", formula: "Actual * 0.34 kg CO₂e", factor: 0.34, scope: "Scope 3", maps: ["amr", "brsr", "impact"], amrRef: "AMR-W-01", principle: "Principle 6", section: "Section B", question: "Q3", def: "Total fresh water used for bus washing and facilities.", baseline: 500, siteSpecific: "Yes" },
  { id: "IND-2026-004", name: "Solar PV Generation", unit: "kWh", formula: "Actual * 0.82 kg CO₂e", factor: 0.82, scope: "Scope 2", maps: ["amr", "brsr", "carbon", "impact"], amrRef: "AMR-E-03", principle: "Principle 6", section: "Section B", question: "Q4", def: "Clean electricity generated from depot solar panels.", baseline: 12000, siteSpecific: "Yes" },
  { id: "IND-2026-005", name: "Employee Safety Training Hours", unit: "Hours", formula: "Summation", factor: 0, scope: "N/A", maps: ["amr", "brsr", "impact"], amrRef: "AMR-S-01", principle: "Principle 3", section: "Section C", question: "Q4", def: "EHS safety training hours delivered to drivers and staff.", baseline: 200, siteSpecific: "No" },
  { id: "IND-2026-006", name: "Board Diversity Ratio", unit: "%", formula: "Female Directors / Total * 100", factor: 0, scope: "N/A", maps: ["brsr", "impact"], amrRef: "N/A", principle: "Principle 1", section: "Section A", question: "Q2", def: "Ratio of female directors on the board.", baseline: 15, siteSpecific: "No" }
];

export const PROJECTS_MAPPING: Record<string, { sites: { id: string; name: string }[]; dept: string; person: string; indicators: string[]; regs: string[] }> = {
  "MBMT Project": {
    sites: [{ id: "bhayandar", name: "Bhayandar Depot" }, { id: "kashimira", name: "Kashimira Depot" }],
    dept: "Energy Operations",
    person: "rohan",
    indicators: ["IND-2026-001", "IND-2026-002", "IND-2026-003", "IND-2026-004", "IND-2026-005"],
    regs: ["Electricity Act 2003", "Water Pollution Act 1974", "Central Motor Vehicles Rules"]
  },
  "Ulhasnagar Project": {
    sites: [{ id: "ulhasnagar", name: "Ulhasnagar Main Depot" }],
    dept: "Depot Operations",
    person: "amit",
    indicators: ["IND-2026-001", "IND-2026-002", "IND-2026-003", "IND-2026-005"],
    regs: ["Electricity Act 2003", "SWM Rules 2016"]
  },
  "Nagpur Project": {
    sites: [{ id: "nagpur_central", name: "Nagpur Central Depot" }, { id: "nagpur_south", name: "Nagpur South Depot" }],
    dept: "Fleet Operations",
    person: "vikram",
    indicators: ["IND-2026-001", "IND-2026-002", "IND-2026-004", "IND-2026-005"],
    regs: ["Electricity Act 2003", "Solar Energy Policy"]
  },
  "Corporate HQ Project": {
    sites: [{ id: "andheri", name: "Andheri HQ" }],
    dept: "Secretarial & Compliance",
    person: "kavita",
    indicators: ["IND-2026-001", "IND-2026-006"],
    regs: ["Companies Act 2013", "SEBI Listing Regulations"]
  }
};

const getPeriodMeta = (p?: string) => {
  switch (p) {
    case "2026-06": return { month: "June", quarter: "Q1", fy: "FY25-26" };
    case "2026-08": return { month: "August", quarter: "Q2", fy: "FY26-27" };
    case "2026-05": return { month: "May", quarter: "Q1", fy: "FY25-26" };
    case "2026-07":
    default:
      return { month: "July", quarter: "Q2", fy: "FY25-26" };
  }
};

const getProjectEntity = (proj?: string) => {
  switch (proj) {
    case "Ulhasnagar Project": return "ulhasnagar";
    case "Nagpur Project": return "nagpur";
    case "Corporate HQ Project": return "corp";
    case "MBMT Project":
    default:
      return "mbmt";
  }
};

export function ReportDataEntryForm({
  reportType,
  onCancel,
  editRecordId,
  initialProject,
  initialSite,
  initialPeriod
}: ReportDataEntryFormProps) {
  // Common Header State
  const pMeta = getPeriodMeta(initialPeriod);
  const initialEnt = getProjectEntity(initialProject);
  
  const [entity, setEntity] = useState(initialEnt);
  const [company, setCompany] = useState("Transvolt Mobility Private Limited");
  const [businessUnit, setBusinessUnit] = useState(initialEnt === "corp" ? "Corporate Management" : "E-Bus Operations");
  const [project, setProject] = useState(initialProject || "MBMT Project");
  const [site, setSite] = useState(initialSite || "bhayandar");
  const [reportingPeriod, setReportingPeriod] = useState(initialPeriod || "2026-07");
  const [financialYear, setFinancialYear] = useState(pMeta.fy);
  const [quarter, setQuarter] = useState(pMeta.quarter);
  const [month, setMonth] = useState(pMeta.month);
  const [dataEntryTab, setDataEntryTab] = useState(DATA_ENTRY_TABS[0]);
  const [dueDate, setDueDate] = useState("2026-08-07");
  const [status, setStatus] = useState<string>("Draft");
  const [reviewer, setReviewer] = useState("kavita");
  const [notes, setNotes] = useState("");

  // NC Collapsible Sections state
  // NC Collapsible Sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sec1: true,
    sec2: true,
    sec3: true,
    sec4: true,
    sec5: true,
    sec6: true,
    sec7: true,
    sec8: true,
    sec9: true,
    sec10: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Shared states used across multiple compliance forms
  const [location, setLocation] = useState("Bhayandar West, Mumbai");
  const [approver, setApprover] = useState("kavita");
  const [complianceRequirement, setComplianceRequirement] = useState("");
  const [observationTitle, setObservationTitle] = useState("");

  // Active Role Simulation for Access control
  const [activeRole, setActiveRole] = useState<"Responsible Person" | "Reviewer" | "Approver">("Responsible Person");

  // Form Header State
  const [ncNumber, setNcNumber] = useState(`NC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [priority, setPriority] = useState("Medium");
  const [targetClosureDate, setTargetClosureDate] = useState("2026-08-30");

  // Section 1: Project Details State
  const [depot, setDepot] = useState("bhayandar");
  const [department, setDepartment] = useState("Energy Operations");

  // Section 2: Non Conformance Details State
  const [ncTitle, setNcTitle] = useState("");
  const [ncCategory, setNcCategory] = useState("Environmental");
  const [ncType, setNcType] = useState("Minor");
  const [severity, setSeverity] = useState("Medium");
  const [source, setSource] = useState("Site Inspection");
  const [reportedBy, setReportedBy] = useState("rohan");
  const [reportedDate, setReportedDate] = useState("2026-08-06");
  const [requirementViolated, setRequirementViolated] = useState("");
  const [applicableRegulation, setApplicableRegulation] = useState("");
  const [legalRequirement, setLegalRequirement] = useState("");
  const [license, setLicense] = useState("");
  const [permit, setPermit] = useState("");
  const [sop, setSop] = useState("");
  const [policy, setPolicy] = useState("");
  const [standard, setStandard] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [clause, setClause] = useState("");
  const [selectedIndicatorId, setSelectedIndicatorId] = useState("IND-2026-001");

  // Section 3: Description State
  const [observationSummary, setObservationSummary] = useState("");
  const [detailedObservation, setDetailedObservation] = useState("");
  const [actualCondition, setActualCondition] = useState("");
  const [expectedRequirement, setExpectedRequirement] = useState("");
  const [potentialConsequences, setPotentialConsequences] = useState("");
  const [riskDescription, setRiskDescription] = useState("");
  const [businessImpact, setBusinessImpact] = useState("");
  const [environmentalImpact, setEnvironmentalImpact] = useState("");
  const [safetyImpact, setSafetyImpact] = useState("");
  const [complianceImpact, setComplianceImpact] = useState("");
  const [financialImpact, setFinancialImpact] = useState("");
  const [reputationImpact, setReputationImpact] = useState("");
  const [immediateActionTaken, setImmediateActionTaken] = useState("");

  // Section 4: Root Cause Analysis State
  const [rootCauseMethod, setRootCauseMethod] = useState("5 Why");
  const [rootCause, setRootCause] = useState("");
  const [contributingFactors, setContributingFactors] = useState("");
  const [repeatedIssue, setRepeatedIssue] = useState("No");
  const [relatedPreviousNc, setRelatedPreviousNc] = useState("");
  const [linkedAudit, setLinkedAudit] = useState("");
  const [linkedInspection, setLinkedInspection] = useState("");

  // Section 5: Corrective Action State
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [actionOwner, setActionOwner] = useState("amit");
  const [capaDepartment, setCapaDepartment] = useState("Depot Operations");
  const [targetCompletionDate, setTargetCompletionDate] = useState("2026-08-20");
  const [estimatedCompletion, setEstimatedCompletion] = useState("2026-08-20");
  const [resourcesRequired, setResourcesRequired] = useState("");
  const [budgetRequired, setBudgetRequired] = useState("");
  const [riskAfterAction, setRiskAfterAction] = useState("");

  // Section 6: Verification State
  const [verificationRequired, setVerificationRequired] = useState(true);
  const [verifier, setVerifier] = useState("kavita");
  const [verificationDate, setVerificationDate] = useState("");
  const [verificationMethod, setVerificationMethod] = useState("");
  const [evidenceReviewed, setEvidenceReviewed] = useState("");
  const [effectivenessRating, setEffectivenessRating] = useState("Satisfactory");
  const [verificationComments, setVerificationComments] = useState("");
  const [closureRecommendation, setClosureRecommendation] = useState("");

  // Section 8: Comments State
  const [internalComments, setInternalComments] = useState("");
  const [reviewerComments, setReviewerComments] = useState("");
  const [approverComments, setApproverComments] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [futureRecommendations, setFutureRecommendations] = useState("");

  // Section 9 & 10: Workflow & Audit trail
  const [commentsList, setCommentsList] = useState<{ id: string; author: string; text: string; date: string }[]>([]);
  const [newComment, setNewComment] = useState("");
  const [createdBy, setCreatedBy] = useState("Rohan Sharma");
  const [createdDate, setCreatedDate] = useState("2026-08-06T12:00:00Z");
  const [modifiedBy, setModifiedBy] = useState("Rohan Sharma");
  const [modifiedDate, setModifiedDate] = useState("2026-08-06T12:00:00Z");
  const [reviewedBy, setReviewedBy] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [closedBy, setClosedBy] = useState("");
  const [version, setVersion] = useState(1);
  const [activityTimeline, setActivityTimeline] = useState<{ id: string; log: string; date: string }[]>([
    { id: "log-1", log: "Record created as Draft", date: "2026-08-06T12:00:00Z" }
  ]);
  const [statusHistory, setStatusHistory] = useState<{ status: string; updatedBy: string; updatedAt: string }[]>([
    { status: "Draft", updatedBy: "Rohan Sharma", updatedAt: "2026-08-06T12:00:00Z" }
  ]);

  // Responsibility values derived from mapping matrix
  const { person: responsiblePerson, dept: responsibleDept, freq: frequency } = useMemo(() => {
    return MAPPING_MATRIX[dataEntryTab] || { person: "—", dept: "—", freq: "—" };
  }, [dataEntryTab]);

  // Sync Project specific fields automatically
  const projectConfig = useMemo(() => {
    return PROJECTS_MAPPING[project] || { sites: [], dept: "—", person: "—", indicators: [], regs: [] };
  }, [project]);

  // Sync site list and auto-select first site
  useEffect(() => {
    if (projectConfig.sites.length > 0) {
      setSite(projectConfig.sites[0].id);
      setLocation(projectConfig.sites[0].name === "Andheri HQ" ? "HQ Office, Andheri East" : `${projectConfig.sites[0].name}, Industrial Zone`);
    }
  }, [projectConfig]);

  // Filter master indicators list
  const filteredIndicatorsList = useMemo(() => {
    return INDICATORS.filter(ind => projectConfig.indicators.includes(ind.id));
  }, [projectConfig]);

  // Sync selected indicator data
  const selectedIndicator = useMemo(() => {
    return INDICATORS.find(ind => ind.id === selectedIndicatorId) || INDICATORS[0];
  }, [selectedIndicatorId]);

  const escalation = useMemo(() => {
    if (editRecordId) {
      const recordEsc = getActiveEscalationForSource(editRecordId);
      if (recordEsc) return recordEsc;
    }
    if (selectedIndicatorId) {
      const indEsc = getActiveEscalationForSource(selectedIndicatorId);
      if (indEsc) return indEsc;
    }
    return null;
  }, [editRecordId, selectedIndicatorId]);

  // Indicators mapping for non-NC reports
  const reportIndicators = useMemo(() => {
    return INDICATORS.filter(ind => ind.maps.includes(reportType));
  }, [reportType]);

  const [indicatorValues, setIndicatorValues] = useState<Record<string, {
    actual?: string;
    remarks?: string;
    evidence?: string;
    narrative?: string;
    baseline?: string;
    target?: string;
    beneficiaries?: string;
    carbonSaved?: string;
    energySaved?: string;
    fuelSaved?: string;
  }>>({});

  // File list state
  const [attachedFiles, setAttachedFiles] = useState<{ id: string; name: string; size: string; category: string }[]>([]);

  // Load record details if editing
  useEffect(() => {
    if (editRecordId) {
      const records = JSON.parse(localStorage.getItem("voltline-report-records") || "[]");
      const record = records.find((r: any) => r.id === editRecordId);
      if (record) {
        setEntity(record.entity || "mbmt");
        setCompany(record.company || "");
        setBusinessUnit(record.businessUnit || "");
        setProject(record.project || "");
        setSite(record.site || "");
        setReportingPeriod(record.reportingPeriod || "");
        setFinancialYear(record.financialYear || "");
        setMonth(record.month || "");
        setQuarter(record.quarter || "");
        setDataEntryTab(record.dataEntryTab || DATA_ENTRY_TABS[0]);
        setDueDate(record.dueDate || "");
        setStatus(record.status || "Draft");
        setReviewer(record.reviewer || "kavita");
        setNotes(record.notes || "");
        setAttachedFiles(record.files || []);

        if (reportType === "nc" && record.ncFields) {
          const ncf = record.ncFields;
          setNcNumber(ncf.ncNumber || record.id);
          setPriority(ncf.priority || "Medium");
          setTargetClosureDate(ncf.targetClosureDate || "");
          setDepot(ncf.depot || "");
          setDepartment(ncf.department || "");
          setNcTitle(ncf.ncTitle || "");
          setNcCategory(ncf.ncCategory || "Environmental");
          setNcType(ncf.ncType || "Minor");
          setSeverity(ncf.severity || "Medium");
          setSource(ncf.source || "Site Inspection");
          setReportedBy(ncf.reportedBy || "rohan");
          setReportedDate(ncf.reportedDate || "2026-08-06");
          setLocation(ncf.location || "");
          setApprover(ncf.approver || "kavita");
          setApplicableRegulation(ncf.applicableRegulation || "");
          setComplianceRequirement(ncf.complianceRequirement || "");
          setReferenceNumber(ncf.referenceNumber || "");
          setClause(ncf.clause || "");
          setPermit(ncf.permit || "");
          setLicense(ncf.license || "");
          setSop(ncf.sop || "");
          setPolicy(ncf.policy || "");
          setStandard(ncf.standard || "");
          setLegalRequirement(ncf.legalRequirement || "");
          setSelectedIndicatorId(ncf.selectedIndicatorId || "IND-2026-001");
          setObservationSummary(ncf.observationSummary || "");
          setDetailedObservation(ncf.detailedObservation || "");
          setRequirementViolated(ncf.requirementViolated || "");
          setRiskDescription(ncf.riskDescription || "");
          setBusinessImpact(ncf.businessImpact || "");
          setEnvironmentalImpact(ncf.environmentalImpact || "");
          setSafetyImpact(ncf.safetyImpact || "");
          setFinancialImpact(ncf.financialImpact || "");
          setComplianceImpact(ncf.complianceImpact || "");
          setReputationImpact(ncf.reputationImpact || "");
          setImmediateActionTaken(ncf.immediateActionTaken || "");
          setRootCauseMethod(ncf.rootCauseMethod || "5 Why");
          setRootCause(ncf.rootCause || "");
          setContributingFactors(ncf.contributingFactors || "");
          setRepeatedIssue(ncf.repeatedIssue || "No");
          setRelatedPreviousNc(ncf.relatedPreviousNc || "");
          setLinkedAudit(ncf.linkedAudit || "");
          setLinkedInspection(ncf.linkedInspection || "");
          setCorrectiveAction(ncf.correctiveAction || "");
          setPreventiveAction(ncf.preventiveAction || "");
          setActionOwner(ncf.actionOwner || "amit");
          setCapaDepartment(ncf.capaDepartment || "");
          setTargetCompletionDate(ncf.targetCompletionDate || "");
          setEstimatedCompletion(ncf.estimatedCompletion || "");
          setResourcesRequired(ncf.resourcesRequired || "");
          setBudgetRequired(ncf.budgetRequired || "");
          setRiskAfterAction(ncf.riskAfterAction || "");
          setVerificationRequired(ncf.verificationRequired !== false);
          setVerifier(ncf.verifier || "kavita");
          setVerificationDate(ncf.verificationDate || "");
          setVerificationMethod(ncf.verificationMethod || "");
          setEvidenceReviewed(ncf.evidenceReviewed || "");
          setEffectivenessRating(ncf.effectivenessRating || "Satisfactory");
          setVerificationComments(ncf.verificationComments || "");
          setClosureRecommendation(ncf.closureRecommendation || "");
          setInternalComments(ncf.internalComments || "");
          setReviewerComments(ncf.reviewerComments || "");
          setApproverComments(ncf.approverComments || "");
          setLessonsLearned(ncf.lessonsLearned || "");
          setFutureRecommendations(ncf.futureRecommendations || "");
          setCommentsList(ncf.commentsList || []);
          setCreatedBy(ncf.createdBy || "Rohan Sharma");
          setCreatedDate(ncf.createdDate || record.updatedAt || new Date().toISOString());
          setReviewedBy(ncf.reviewedBy || "");
          setApprovedBy(ncf.approvedBy || "");
          setClosedBy(ncf.closedBy || "");
          setVersion((ncf.version || 1) + 1);
          setActivityTimeline([
            ...(ncf.activityTimeline || []),
            { id: `log-${Date.now()}`, log: `Record updated to version ${ncf.version + 1} by Rohan Sharma`, date: new Date().toISOString() }
          ]);
          setStatusHistory(ncf.statusHistory || [
            { status: record.status || "Draft", updatedBy: ncf.createdBy || "Rohan Sharma", updatedAt: record.updatedAt || new Date().toISOString() }
          ]);
        } else if (record.indicatorValues) {
          setIndicatorValues(record.indicatorValues);
        }
      }
    }
  }, [editRecordId, reportType]);

  // Auto-Save Effect (saves draft local copy to localStorage every 10 seconds)
  useEffect(() => {
    if (reportType !== "nc" || status !== "Draft") return;

    const interval = setInterval(() => {
      const draftObj = {
        ncTitle,
        ncCategory,
        ncType,
        severity,
        source,
        project,
        site,
        reportingPeriod,
        observationTitle,
        detailedObservation,
        rootCause,
        correctiveAction,
        preventiveAction
      };
      localStorage.setItem("voltline-nc-autosave-draft", JSON.stringify(draftObj));
    }, 10000);

    return () => clearInterval(interval);
  }, [ncTitle, ncCategory, ncType, severity, source, project, site, reportingPeriod, observationTitle, detailedObservation, rootCause, correctiveAction, preventiveAction, status, reportType]);

  // File Upload Helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileCat: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        category: fileCat,
        version: "v1.0",
        uploadedBy: "Rohan Sharma",
        uploadedDate: new Date().toLocaleDateString(),
        status: "Draft"
      };
      setAttachedFiles(prev => [...prev, newFile]);
      toast.success("Document attached", { description: `${file.name} uploaded under ${fileCat}.` });
    }
  };

  // Add Comment Helper
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comm = {
      id: `comm-${Date.now()}`,
      author: "Rohan Sharma",
      text: newComment,
      date: new Date().toISOString()
    };
    setCommentsList(prev => [...prev, comm]);
    setNewComment("");
    toast.success("Comment posted");
  };

  const handleReset = () => {
    setNcTitle("");
    setObservationTitle("");
    setDetailedObservation("");
    setRootCause("");
    setCorrectiveAction("");
    setPreventiveAction("");
    setAttachedFiles([]);
    setCommentsList([]);
    toast.info("Form fields reset to default.");
  };

  // Submit Handler
  const handleSave = (targetStatus: string) => {
    if (!project) {
      toast.error("Project field is mandatory!");
      return;
    }

    const records = JSON.parse(localStorage.getItem("voltline-report-records") || "[]");

    // Smart Validations for NC
    if (reportType === "nc") {
      // 1. Prevent duplicate NC Number
      const duplicateNum = records.find((r: any) =>
        r.reportType === "nc" &&
        r.ncFields?.ncNumber === ncNumber &&
        r.id !== editRecordId
      );
      if (duplicateNum) {
        toast.error("Duplicate NC Number", {
          description: `An NC report with number ${ncNumber} already exists.`
        });
        return;
      }

      // 2. Prevent duplicate NC for Project, Site, Requirement (Indicator + Regulation), Reporting Period
      const duplicateRequirement = records.find((r: any) =>
        r.project === project &&
        r.site === site &&
        r.reportType === "nc" &&
        r.reportingPeriod === reportingPeriod &&
        r.ncFields?.selectedIndicatorId === selectedIndicatorId &&
        r.ncFields?.applicableRegulation === applicableRegulation &&
        r.id !== editRecordId
      );
      if (duplicateRequirement) {
        toast.error("Duplicate Non-Conformance Entry", {
          description: `An NC report for project "${project}", site "${site}", requirement "${selectedIndicatorId}" in period "${reportingPeriod}" already exists.`
        });
        return;
      }

      // 3. Mandatory fields check for non-Draft submissions
      if (targetStatus !== "Draft") {
        const missing = [];
        if (!ncTitle.trim()) missing.push("NC Title");
        if (!project) missing.push("Project");
        if (!site) missing.push("Site");
        if (!severity) missing.push("Severity");
        if (!ncCategory) missing.push("NC Category");
        if (!reportedBy) missing.push("Responsible Person");
        if (!rootCause.trim()) missing.push("Root Cause");
        if (!correctiveAction.trim()) missing.push("Corrective Action");
        if (!targetCompletionDate) missing.push("Target Completion Date");

        if (missing.length > 0) {
          toast.error("Missing Mandatory Fields", {
            description: `Please fill in: ${missing.join(", ")} before submitting.`
          });
          return;
        }
      }

      // 4. Overdue check warning
      const today = new Date();
      const closureDate = new Date(targetClosureDate);
      if (targetClosureDate && closureDate < today) {
        toast.warning("Closure Overdue Warning", {
          description: `The Target Closure Date (${targetClosureDate}) is in the past.`
        });
      }

      // 5. Document upload warning for High/Critical
      if (targetStatus !== "Draft" && (severity === "High" || severity === "Critical") && attachedFiles.length === 0) {
        toast.warning("Evidence Missing Warning", {
          description: "High and Critical NCs should include supporting evidence/photos."
        });
      }
    }

    const newRecord = {
      id: editRecordId || `rec-${Date.now()}`,
      reportType,
      entity,
      company,
      businessUnit,
      project,
      site,
      reportingPeriod,
      financialYear,
      quarter,
      month,
      dataEntryTab,
      frequency,
      responsibleDept,
      responsiblePerson,
      dueDate,
      status: targetStatus,
      reviewer,
      notes,
      files: attachedFiles,
      updatedAt: new Date().toISOString(),
      ncFields: reportType === "nc" ? {
        ncNumber,
        priority,
        targetClosureDate,
        depot,
        department,
        ncTitle,
        ncCategory,
        ncType,
        severity,
        source,
        reportedBy,
        reportedDate,
        location,
        approver,
        applicableRegulation,
        complianceRequirement,
        referenceNumber,
        clause,
        permit,
        license,
        sop,
        policy,
        standard,
        legalRequirement,
        selectedIndicatorId,
        observationSummary,
        detailedObservation,
        requirementViolated,
        riskDescription,
        businessImpact,
        environmentalImpact,
        safetyImpact,
        financialImpact,
        complianceImpact,
        reputationImpact,
        immediateActionTaken,
        rootCauseMethod,
        rootCause,
        contributingFactors,
        repeatedIssue,
        relatedPreviousNc,
        linkedAudit,
        linkedInspection,
        correctiveAction,
        preventiveAction,
        actionOwner,
        capaDepartment,
        targetCompletionDate,
        estimatedCompletion,
        resourcesRequired,
        budgetRequired,
        riskAfterAction,
        verificationRequired,
        verifier,
        verificationDate,
        verificationMethod,
        evidenceReviewed,
        effectivenessRating,
        verificationComments,
        closureRecommendation,
        internalComments,
        reviewerComments,
        approverComments,
        lessonsLearned,
        futureRecommendations,
        commentsList,
        createdBy,
        createdDate,
        modifiedBy: "Rohan Sharma",
        modifiedDate: new Date().toISOString(),
        reviewedBy: targetStatus === "Submitted" ? "Kavita Rao" : "",
        approvedBy: targetStatus === "Approved" ? "Kavita Rao" : "",
        closedBy: targetStatus === "Closed" ? "Kavita Rao" : "",
        version,
        activityTimeline: [
          ...activityTimeline,
          { id: `log-${Date.now()}`, log: `Status updated to ${targetStatus} by Rohan Sharma`, date: new Date().toISOString() }
        ],
        statusHistory: [
          ...statusHistory,
          { status: targetStatus, updatedBy: "Rohan Sharma", updatedAt: new Date().toISOString() }
        ]
      } : undefined,
      indicatorValues: reportType !== "nc" ? indicatorValues : undefined
    };

    let updatedRecords;
    if (editRecordId) {
      updatedRecords = records.map((r: any) => r.id === editRecordId ? newRecord : r);
    } else {
      updatedRecords = [newRecord, ...records];
    }

    localStorage.setItem("voltline-report-records", JSON.stringify(updatedRecords));

    toast.success(targetStatus === "Draft" ? "Draft Saved" : "Status updated to " + targetStatus, {
      description: `NC report record updated successfully.`
    });

    onCancel();
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground uppercase">
            {editRecordId ? "Edit" : "New"} {reportType === "nc" ? "NC" : reportType.toUpperCase()} Record
          </h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Auto-populated Matrix &amp; Assignment Sign-offs
          </p>
        </div>
        <div className="flex items-center gap-2">
          {escalation && <EscalationStatusIndicator escalation={escalation} />}
          <Button variant="outline" size="sm" onClick={onCancel} className="h-8 rounded-lg text-[12px]">
            Back to List
          </Button>
        </div>
      </div>

      {reportType !== "nc" ? (
        // Non-NC generic fields form
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            <PanelCard>
              <div className="border-b border-border/40 px-4 py-3 bg-muted/10">
                <h4 className="text-[12.5px] font-bold text-foreground uppercase tracking-wider">
                  Common Header Information
                </h4>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Entity</Label>
                  <Select value={entity} onValueChange={setEntity}>
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESG_GROUP.entities.map(e => (
                        <SelectItem key={e.id} value={e.id} className="text-[12px]">
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Company</Label>
                  <Input value={company} readOnly className="h-9 text-[12.5px] bg-muted/20 font-medium" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Business Unit</Label>
                  <Input value={businessUnit} readOnly className="h-9 text-[12.5px] bg-muted/20 font-medium" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] flex items-center gap-1">
                    Project <span className="text-destructive font-bold">*</span>
                  </Label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MBMT Project" className="text-[12px]">MBMT Project</SelectItem>
                      <SelectItem value="Ulhasnagar Project" className="text-[12px]">Ulhasnagar Project</SelectItem>
                      <SelectItem value="Nagpur Project" className="text-[12px]">Nagpur Project</SelectItem>
                      <SelectItem value="Corporate HQ Project" className="text-[12px]">Corporate HQ Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Site / Depot</Label>
                  <Select value={site} onValueChange={setSite}>
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectConfig.sites.map(s => (
                        <SelectItem key={s.id} value={s.id} className="text-[12px]">
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Reporting Period</Label>
                  <Select value={reportingPeriod} onValueChange={setReportingPeriod}>
                    <SelectTrigger className="h-9 text-[12.5px] num">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026-06" className="text-[12px] num">June 2026</SelectItem>
                      <SelectItem value="2026-07" className="text-[12px] num">July 2026</SelectItem>
                      <SelectItem value="2026-08" className="text-[12px] num">August 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Financial Year</Label>
                  <Select value={financialYear} onValueChange={setFinancialYear}>
                    <SelectTrigger className="h-9 text-[12.5px] num">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FY25-26" className="text-[12px] num">FY2025-26</SelectItem>
                      <SelectItem value="FY26-27" className="text-[12px] num">FY2026-27</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2 col-span-1">
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Quarter</Label>
                    <Select value={quarter} onValueChange={setQuarter}>
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1" className="text-[12px]">Q1</SelectItem>
                        <SelectItem value="Q2" className="text-[12px]">Q2</SelectItem>
                        <SelectItem value="Q3" className="text-[12px]">Q3</SelectItem>
                        <SelectItem value="Q4" className="text-[12px]">Q4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Month</Label>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["June", "July", "August", "September"].map(m => (
                          <SelectItem key={m} value={m} className="text-[12px]">{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Data Entry Tab</Label>
                  <Select value={dataEntryTab} onValueChange={setDataEntryTab}>
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_ENTRY_TABS.map(tab => (
                        <SelectItem key={tab} value={tab} className="text-[12px]">
                          {tab}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 bg-muted/10 p-2 rounded-lg border border-border/40 md:col-span-3 grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">Frequency</span>
                    <span className="text-[12px] font-semibold text-foreground mt-0.5 block">{frequency}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">Responsible Dept</span>
                    <span className="text-[12px] font-semibold text-foreground mt-0.5 block truncate" title={responsibleDept}>{responsibleDept}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">Responsible Person</span>
                    <span className="text-[12px] font-semibold text-foreground mt-0.5 block truncate" title={responsiblePerson}>{responsiblePerson}</span>
                  </div>
                </div>
              </div>
            </PanelCard>

            <PanelCard>
              <div className="border-b border-border/40 px-4 py-3 bg-muted/10">
                <h4 className="text-[12.5px] font-bold text-foreground uppercase tracking-wider">
                  Report Indicators &amp; Measurements
                </h4>
              </div>
              <div className="p-4 divide-y divide-border/40 space-y-4">
                {reportIndicators.length === 0 ? (
                  <p className="text-[12.5px] text-muted-foreground text-center py-4">
                    No matching indicators found for report type {reportType.toUpperCase()}.
                  </p>
                ) : (
                  reportIndicators.map(ind => {
                    const values = indicatorValues[ind.id] || {};
                    const handleValChange = (field: string, val: string) => {
                      setIndicatorValues(prev => ({
                        ...prev,
                        [ind.id]: {
                          ...prev[ind.id],
                          [field]: val
                        }
                      }));
                    };

                    return (
                      <div key={ind.id} className="pt-4 first:pt-0 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="inline-flex h-5 items-center rounded bg-primary/10 border border-primary/20 px-1.5 text-[10px] font-bold text-primary mr-2">
                              {ind.id}
                            </span>
                            <span className="text-[12.5px] font-bold text-foreground">{ind.name}</span>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{ind.def}</p>
                          </div>
                          <span className="text-[11px] text-muted-foreground bg-muted/40 border border-border/60 px-2 py-0.5 rounded num">
                            Unit: {ind.unit}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
                          {reportType === "amr" && (
                            <>
                              <div className="md:col-span-3 space-y-1">
                                <Label className="text-[11.5px]">Actual Value</Label>
                                <Input
                                  type="number"
                                  value={values.actual || ""}
                                  onChange={e => handleValChange("actual", e.target.value)}
                                  className="h-8.5 text-[12.5px] num"
                                />
                              </div>
                              <div className="md:col-span-4 space-y-1 bg-muted/5 p-2 rounded border border-border/40">
                                <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider block">Formula / Reference</span>
                                <span className="text-[11.5px] font-medium text-foreground mt-0.5 block">{ind.formula} (Ref: {ind.amrRef})</span>
                              </div>
                              <div className="md:col-span-5 space-y-1">
                                <Label className="text-[11.5px]">Remarks</Label>
                                <Input
                                  value={values.remarks || ""}
                                  onChange={e => handleValChange("remarks", e.target.value)}
                                  className="h-8.5 text-[12.5px]"
                                />
                              </div>
                            </>
                          )}
                          {reportType === "ghg" && (
                            <>
                              <div className="md:col-span-3 space-y-1">
                                <Label className="text-[11.5px]">Activity Value ({ind.unit})</Label>
                                <Input
                                  type="number"
                                  value={values.actual || ""}
                                  onChange={e => handleValChange("actual", e.target.value)}
                                  className="h-8.5 text-[12.5px] num"
                                />
                              </div>
                              <div className="md:col-span-3 bg-muted/10 p-2 rounded border border-border/40 text-[11.5px]">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase block">{ind.scope}</span>
                                <span className="font-semibold text-foreground block mt-0.5">Factor: {ind.factor}</span>
                              </div>
                              <div className="md:col-span-3 bg-primary/5 p-2 rounded border border-primary/20 text-[11.5px]">
                                <span className="text-[9px] font-bold text-primary uppercase block">Calculated Emissions</span>
                                <span className="font-bold text-foreground block mt-0.5 num">
                                  {values.actual ? (Number(values.actual) * ind.factor).toFixed(2) : "0.00"} kg CO₂e
                                </span>
                              </div>
                              <div className="md:col-span-3 space-y-1">
                                <Label className="text-[11.5px]">Remarks</Label>
                                <Input
                                  value={values.remarks || ""}
                                  onChange={e => handleValChange("remarks", e.target.value)}
                                  className="h-8.5 text-[12.5px]"
                                />
                              </div>
                            </>
                          )}
                          {reportType === "brsr" && (
                            <>
                              <div className="md:col-span-2 space-y-1">
                                <Label className="text-[11.5px]">Value</Label>
                                <Input
                                  value={values.actual || ""}
                                  onChange={e => handleValChange("actual", e.target.value)}
                                  className="h-8.5 text-[12.5px] num"
                                />
                              </div>
                              <div className="md:col-span-3 bg-muted/10 p-2 rounded border border-border/40 text-[11px] leading-tight">
                                <span className="font-bold text-muted-foreground uppercase text-[9px] block">{ind.principle}</span>
                                <span className="font-medium text-foreground block mt-0.5">{ind.section} ({ind.question})</span>
                              </div>
                              <div className="md:col-span-4 space-y-1">
                                <Label className="text-[11.5px]">Narrative Response</Label>
                                <Input
                                  value={values.narrative || ""}
                                  onChange={e => handleValChange("narrative", e.target.value)}
                                  className="h-8.5 text-[12.5px]"
                                />
                              </div>
                              <div className="md:col-span-3 space-y-1">
                                <Label className="text-[11.5px]">Remarks</Label>
                                <Input
                                  value={values.remarks || ""}
                                  onChange={e => handleValChange("remarks", e.target.value)}
                                  className="h-8.5 text-[12.5px]"
                                />
                              </div>
                            </>
                          )}
                          {reportType === "impact" && (
                            <>
                              <div className="md:col-span-2 space-y-1">
                                <Label className="text-[11.5px]">Baseline</Label>
                                <Input
                                  value={values.baseline || String(ind.baseline || 0)}
                                  onChange={e => handleValChange("baseline", e.target.value)}
                                  className="h-8.5 text-[12.5px] num"
                                />
                              </div>
                              <div className="md:col-span-2 space-y-1">
                                <Label className="text-[11.5px]">Current Value</Label>
                                <Input
                                  value={values.actual || ""}
                                  onChange={e => handleValChange("actual", e.target.value)}
                                  className="h-8.5 text-[12.5px] num"
                                />
                              </div>
                              <div className="md:col-span-2 space-y-1">
                                <Label className="text-[11.5px]">Target</Label>
                                <Input
                                  value={values.target || ""}
                                  onChange={e => handleValChange("target", e.target.value)}
                                  className="h-8.5 text-[12.5px] num"
                                />
                              </div>
                              <div className="md:col-span-3 space-y-1">
                                <Label className="text-[11.5px]">Beneficiaries</Label>
                                <Input
                                  value={values.beneficiaries || ""}
                                  onChange={e => handleValChange("beneficiaries", e.target.value)}
                                  className="h-8.5 text-[12.5px]"
                                />
                              </div>
                              <div className="md:col-span-3 space-y-1">
                                <Label className="text-[11.5px]">Remarks</Label>
                                <Input
                                  value={values.remarks || ""}
                                  onChange={e => handleValChange("remarks", e.target.value)}
                                  className="h-8.5 text-[12.5px]"
                                />
                              </div>
                            </>
                          )}
                          {reportType === "carbon" && (
                            <>
                              <div className="md:col-span-2 space-y-1">
                                <Label className="text-[11.5px]">Baseline Emission</Label>
                                <Input
                                  value={values.baseline || ""}
                                  onChange={e => handleValChange("baseline", e.target.value)}
                                  className="h-8.5 text-[12.5px] num"
                                />
                              </div>
                              <div className="md:col-span-2 space-y-1">
                                <Label className="text-[11.5px]">Current Emission</Label>
                                <Input
                                  value={values.actual || ""}
                                  onChange={e => handleValChange("actual", e.target.value)}
                                  className="h-8.5 text-[12.5px] num"
                                />
                              </div>
                              <div className="md:col-span-3 bg-success/8 border border-success/20 p-2 rounded text-[11.5px]">
                                <span className="text-[9px] font-bold text-success uppercase block">Carbon Saved (tCO₂e)</span>
                                <span className="font-extrabold text-success block mt-0.5 num">
                                  {values.baseline && values.actual ? (Number(values.baseline) - Number(values.actual)).toFixed(2) : "0.00"}
                                </span>
                              </div>
                              <div className="md:col-span-2 space-y-1">
                                <Label className="text-[11.5px]">Energy Saved</Label>
                                <Input
                                  value={values.energySaved || ""}
                                  onChange={e => handleValChange("energySaved", e.target.value)}
                                  className="h-8.5 text-[12.5px] num"
                                />
                              </div>
                              <div className="md:col-span-3 space-y-1">
                                <Label className="text-[11.5px]">Fuel Saved (L)</Label>
                                <Input
                                  value={values.fuelSaved || ""}
                                  onChange={e => handleValChange("fuelSaved", e.target.value)}
                                  className="h-8.5 text-[12.5px] num"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </PanelCard>
          </div>
          <div className="lg:col-span-4 space-y-4">
            <PanelCard>
              <div className="border-b border-border/40 px-4 py-3 bg-muted/10">
                <h4 className="text-[12.5px] font-bold text-foreground uppercase tracking-wider">
                  Workflow Sign-off
                </h4>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Submission Due Date</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-9 text-[12.5px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Workflow Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft" className="text-[12px]">Draft</SelectItem>
                      <SelectItem value="Submitted" className="text-[12px]">Submitted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Assigned Reviewer</Label>
                  <Select value={reviewer} onValueChange={setReviewer}>
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PEOPLE.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-[12px]">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PanelCard>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
          
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              <div className="text-[12px] font-medium text-foreground">
                <span className="font-bold text-primary uppercase">Sandbox Role Simulation:</span> Choose a simulated active role to test access control privileges and action buttons.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-[11.5px] font-bold uppercase text-muted-foreground">Simulate Active Role</Label>
              <Select
                value={activeRole}
                onValueChange={(v) => {
                  setActiveRole(v as any);
                  toast.info(`Switched simulated role to: ${v}`);
                }}
              >
                <SelectTrigger className="h-8 w-[180px] text-[12px] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Responsible Person" className="text-[12px]">Responsible Person</SelectItem>
                  <SelectItem value="Reviewer" className="text-[12px]">Reviewer (Kavita Rao)</SelectItem>
                  <SelectItem value="Approver" className="text-[12px]">Approver (ESG Lead)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={cn(
            "rounded-2xl border bg-card p-5 shadow-elevated flex flex-wrap items-center justify-between gap-4",
            (severity === "High" || severity === "Critical") ? "border-destructive/30 bg-destructive/3" : "border-border/60"
          )}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">Non-Conformance</span>
                <span className="inline-flex h-5 items-center rounded-md bg-muted px-1.5 text-[10px] font-bold text-muted-foreground num border border-border/40">
                  {ncNumber}
                </span>
                {(severity === "High" || severity === "Critical") && (
                  <span className="inline-flex h-5 items-center rounded bg-destructive/10 border border-destructive/20 px-1.5 py-0.5 text-[9px] font-bold text-destructive uppercase tracking-wider animate-pulse">
                    {severity} RISK
                  </span>
                )}
              </div>
              <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
                {ncTitle || "Untitled Non-Conformance"}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5 text-[12px] shrink-0">
              <div className="border-r border-border/40 pr-3.5">
                <span className="font-bold text-muted-foreground uppercase text-[9px] block">Status</span>
                <span className="inline-flex items-center rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10.5px] font-bold text-primary mt-0.5">
                  {status}
                </span>
              </div>
              <div className="border-r border-border/40 pr-3.5">
                <span className="font-bold text-muted-foreground uppercase text-[9px] block">Severity</span>
                <span className={cn(
                  "font-semibold mt-0.5 block",
                  (severity === "High" || severity === "Critical") ? "text-destructive" : "text-foreground"
                )}>{severity}</span>
              </div>
              <div className="border-r border-border/40 pr-3.5">
                <span className="font-bold text-muted-foreground uppercase text-[9px] block">Priority</span>
                <span className="font-semibold text-foreground mt-0.5 block">{priority}</span>
              </div>
              <div className="border-r border-border/40 pr-3.5">
                <span className="font-bold text-muted-foreground uppercase text-[9px] block">Report Date</span>
                <span className="font-semibold text-foreground mt-0.5 block num">{reportedDate}</span>
              </div>
              <div className="border-r border-border/40 pr-3.5">
                <span className="font-bold text-muted-foreground uppercase text-[9px] block">Due Date</span>
                <span className="font-semibold text-foreground mt-0.5 block num">{dueDate}</span>
              </div>
              <div>
                <span className="font-bold text-muted-foreground uppercase text-[9px] block">Target Closure</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-foreground block num">{targetClosureDate}</span>
                  {targetClosureDate && new Date(targetClosureDate) < new Date() && (
                    <span className="h-2 w-2 rounded-full bg-destructive animate-ping" title="Overdue!" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <PanelCard>
            <button
              type="button"
              onClick={() => toggleSection("sec1")}
              className="w-full flex items-center justify-between border-b border-border/40 px-5 py-3.5 bg-muted/5 font-semibold text-[13px] uppercase tracking-wide text-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-mono font-bold text-[11px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">01</span>
                <span>Section 1: Project Details</span>
              </div>
              {openSections.sec1 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSections.sec1 && (
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-bold">Entity</Label>
                  <Select
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={entity}
                    onValueChange={(v) => {
                      setEntity(v);
                      const ent = ESG_GROUP.entities.find(e => e.id === v);
                      if (ent) {
                        setCompany("Transvolt Mobility Private Limited");
                        setBusinessUnit(ent.id === "corp" ? "Corporate Management" : "E-Bus Operations");
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESG_GROUP.entities.map(e => (
                        <SelectItem key={e.id} value={e.id} className="text-[12px]">{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Company</Label>
                  <Input value={company} readOnly className="h-9 text-[12.5px] bg-muted/20 font-medium" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Business Unit</Label>
                  <Input value={businessUnit} readOnly className="h-9 text-[12.5px] bg-muted/20 font-medium" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-bold flex items-center gap-1">
                    Project <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={project}
                    onValueChange={(v) => {
                      setProject(v);
                      const config = PROJECTS_MAPPING[v];
                      if (config) {
                        if (config.sites.length > 0) {
                          setSite(config.sites[0].id);
                          setDepot(config.sites[0].id);
                          setLocation(config.sites[0].name);
                        }
                        setDepartment(config.dept);
                        setReportedBy(config.person);
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PROJECTS_MAPPING).map(p => (
                        <SelectItem key={p} value={p} className="text-[12px]">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-bold">Site / Depot</Label>
                  <Select
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={site}
                    onValueChange={(v) => {
                      setSite(v);
                      setDepot(v);
                      const activeProj = PROJECTS_MAPPING[project];
                      const activeSite = activeProj?.sites.find(s => s.id === v);
                      if (activeSite) setLocation(activeSite.name);
                    }}
                  >
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(PROJECTS_MAPPING[project]?.sites || []).map(s => (
                        <SelectItem key={s.id} value={s.id} className="text-[12px]">{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Location</Label>
                  <Input
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-9 text-[12.5px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Department</Label>
                  <Input
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="h-9 text-[12.5px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Responsible Department (Auto Tracker)</Label>
                  <Input value={PROJECTS_MAPPING[project]?.dept || "—"} readOnly className="h-9 text-[12.5px] bg-muted/20 font-medium" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-bold">Responsible Person (Auto Tracker)</Label>
                  <Select disabled value={reportedBy}>
                    <SelectTrigger className="h-9 text-[12.5px] bg-muted/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PEOPLE.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-[12px]">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Reviewer</Label>
                  <Select
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={reviewer}
                    onValueChange={setReviewer}
                  >
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PEOPLE.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-[12px]">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Approver</Label>
                  <Select
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={approver}
                    onValueChange={setApprover}
                  >
                    <SelectTrigger className="h-9 text-[12.5px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PEOPLE.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-[12px]">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Reporting Period</Label>
                  <Select
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={reportingPeriod}
                    onValueChange={setReportingPeriod}
                  >
                    <SelectTrigger className="h-9 text-[12.5px] num">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026-06" className="text-[12px] num">June 2026</SelectItem>
                      <SelectItem value="2026-07" className="text-[12px] num">July 2026</SelectItem>
                      <SelectItem value="2026-08" className="text-[12px] num">August 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Financial Year</Label>
                  <Select
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={financialYear}
                    onValueChange={setFinancialYear}
                  >
                    <SelectTrigger className="h-9 text-[12.5px] num">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FY25-26" className="text-[12px] num">FY25-26</SelectItem>
                      <SelectItem value="FY26-27" className="text-[12px] num">FY26-27</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Month</Label>
                    <Select
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={month}
                      onValueChange={setMonth}
                    >
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="June" className="text-[12px]">June</SelectItem>
                        <SelectItem value="July" className="text-[12px]">July</SelectItem>
                        <SelectItem value="August" className="text-[12px]">August</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px]">Quarter</Label>
                    <Select
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={quarter}
                      onValueChange={setQuarter}
                    >
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1" className="text-[12px]">Q1</SelectItem>
                        <SelectItem value="Q2" className="text-[12px]">Q2</SelectItem>
                        <SelectItem value="Q3" className="text-[12px]">Q3</SelectItem>
                        <SelectItem value="Q4" className="text-[12px]">Q4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Frequency</Label>
                  <Input value="Monthly (Assignment Tracker)" readOnly className="h-9 text-[12.5px] bg-muted/20" />
                </div>
              </div>
            )}
          </PanelCard>

          <PanelCard>
            <button
              type="button"
              onClick={() => toggleSection("sec2")}
              className="w-full flex items-center justify-between border-b border-border/40 px-5 py-3.5 bg-muted/5 font-semibold text-[13px] uppercase tracking-wide text-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-mono font-bold text-[11px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">02</span>
                <span>Section 2: Non Conformance Details</span>
              </div>
              {openSections.sec2 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSections.sec2 && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px] font-bold flex items-center gap-1">
                      NC Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={ncTitle}
                      onChange={(e) => setNcTitle(e.target.value)}
                      placeholder="Brief summary of finding"
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px] font-bold">NC Category</Label>
                    <Select
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={ncCategory}
                      onValueChange={setNcCategory}
                    >
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Environmental", "Safety", "Quality", "Regulatory", "Governance", "Social", "Operational", "Documentation"].map(cat => (
                          <SelectItem key={cat} value={cat} className="text-[12px]">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">NC Type</Label>
                    <Select
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={ncType}
                      onValueChange={setNcType}
                    >
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Major", "Minor", "Observation", "Improvement Opportunity"].map(type => (
                          <SelectItem key={type} value={type} className="text-[12px]">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Source</Label>
                    <Select
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={source}
                      onValueChange={setSource}
                    >
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Internal Audit", "External Audit", "Inspection", "Monitoring", "Complaint", "Incident", "Near Miss", "Authority Inspection", "Observation"].map(src => (
                          <SelectItem key={src} value={src} className="text-[12px]">{src}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Requirement Violated</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={requirementViolated}
                      onChange={(e) => setRequirementViolated(e.target.value)}
                      placeholder="e.g. SOP-04 Sec 3.1"
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Applicable Regulation</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={applicableRegulation}
                      onChange={(e) => setApplicableRegulation(e.target.value)}
                      placeholder="e.g. Air Pollution Act 1981"
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Legal Requirement</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={legalRequirement}
                      onChange={(e) => setLegalRequirement(e.target.value)}
                      placeholder="Statutory clause reference"
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">License Reference</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Permit Reference</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={permit}
                      onChange={(e) => setPermit(e.target.value)}
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">SOP Reference</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={sop}
                      onChange={(e) => setSop(e.target.value)}
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Corporate Policy</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={policy}
                      onChange={(e) => setPolicy(e.target.value)}
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Standard (e.g. ISO 14001)</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={standard}
                      onChange={(e) => setStandard(e.target.value)}
                      placeholder="e.g. ISO 9001:2015 Clause 8.2"
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Reference Number</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Clause Number</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={clause}
                      onChange={(e) => setClause(e.target.value)}
                      className="h-9 text-[12.5px]"
                    />
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px] font-bold block text-primary">Applicable Indicator (Master Indicator Register Lookup)</Label>
                    <Select
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={selectedIndicatorId}
                      onValueChange={setSelectedIndicatorId}
                    >
                      <SelectTrigger className="h-9 text-[12.5px] bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INDICATORS.map(ind => (
                          <SelectItem key={ind.id} value={ind.id} className="text-[12px]">{ind.id} — {ind.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-muted/10 border border-border/50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px] text-foreground">
                    <div>
                      <span className="font-bold text-muted-foreground uppercase text-[9.5px] block">Indicator ID</span>
                      <span className="font-semibold mt-0.5 block text-primary">{selectedIndicator.id}</span>
                    </div>
                    <div>
                      <span className="font-bold text-muted-foreground uppercase text-[9.5px] block">Indicator Category</span>
                      <span className="font-semibold mt-0.5 block">{selectedIndicator.scope}</span>
                    </div>
                    <div>
                      <span className="font-bold text-muted-foreground uppercase text-[9.5px] block">Sub Category</span>
                      <span className="font-semibold mt-0.5 block">{selectedIndicator.principle} · {selectedIndicator.section}</span>
                    </div>
                    <div>
                      <span className="font-bold text-muted-foreground uppercase text-[9.5px] block">Frequency</span>
                      <span className="font-semibold mt-0.5 block">{selectedIndicator.maps.includes("amr") ? "Annual" : "Monthly"}</span>
                    </div>
                    <div>
                      <span className="font-bold text-muted-foreground uppercase text-[9.5px] block">Site Applicability</span>
                      <span className="font-semibold mt-0.5 block">{(selectedIndicator as any).siteSpecific || "Yes"}</span>
                    </div>
                    <div>
                      <span className="font-bold text-muted-foreground uppercase text-[9.5px] block">Unit of Measurement</span>
                      <span className="font-semibold mt-0.5 block text-primary font-mono">{selectedIndicator.unit}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-bold text-muted-foreground uppercase text-[9.5px] block">Definition &amp; Range</span>
                      <span className="font-medium mt-0.5 block text-muted-foreground truncate" title={selectedIndicator.def}>{selectedIndicator.def}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </PanelCard>

          <PanelCard>
            <button
              type="button"
              onClick={() => toggleSection("sec3")}
              className="w-full flex items-center justify-between border-b border-border/40 px-5 py-3.5 bg-muted/5 font-semibold text-[13px] uppercase tracking-wide text-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-mono font-bold text-[11px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">03</span>
                <span>Section 3: Description</span>
              </div>
              {openSections.sec3 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSections.sec3 && (
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-bold">Observation Summary</Label>
                  <Input
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={observationSummary}
                    onChange={(e) => setObservationSummary(e.target.value)}
                    placeholder="Provide a quick one-line summary of what was observed"
                    className="h-9 text-[12.5px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-bold">Detailed Description</Label>
                  <Textarea
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={detailedObservation}
                    onChange={(e) => setDetailedObservation(e.target.value)}
                    placeholder="Enter comprehensive findings, measurements, logs, or operational errors"
                    className="min-h-[90px] text-[12.5px] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Actual Condition observed</Label>
                    <Textarea
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={actualCondition}
                      onChange={(e) => setActualCondition(e.target.value)}
                      placeholder="Describe what was found at the site / system"
                      className="min-h-[60px] text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Expected Requirement</Label>
                    <Textarea
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={expectedRequirement}
                      onChange={(e) => setExpectedRequirement(e.target.value)}
                      placeholder="Reference what the SOP or standard mandates"
                      className="min-h-[60px] text-[12.5px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Potential Consequences</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={potentialConsequences}
                      onChange={(e) => setPotentialConsequences(e.target.value)}
                      placeholder="Adverse compliance or operational impacts"
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Risk Description &amp; Classification</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={riskDescription}
                      onChange={(e) => setRiskDescription(e.target.value)}
                      placeholder="e.g. Critical Safety Hazard, Environmental Breach"
                      className="h-9 text-[12.5px]"
                    />
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4 space-y-3">
                  <Label className="text-[12px] font-bold block text-muted-foreground uppercase tracking-wider">Environmental &amp; Business Sub-Impact Analysis (1-10 severity scale or remarks)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Business Impact</Label>
                      <Input
                        disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                        value={businessImpact}
                        onChange={(e) => setBusinessImpact(e.target.value)}
                        className="h-8.5 text-[12px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Environmental Impact</Label>
                      <Input
                        disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                        value={environmentalImpact}
                        onChange={(e) => setEnvironmentalImpact(e.target.value)}
                        className="h-8.5 text-[12px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Safety Impact</Label>
                      <Input
                        disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                        value={safetyImpact}
                        onChange={(e) => setSafetyImpact(e.target.value)}
                        className="h-8.5 text-[12px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Compliance Impact</Label>
                      <Input
                        disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                        value={complianceImpact}
                        onChange={(e) => setComplianceImpact(e.target.value)}
                        className="h-8.5 text-[12px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Financial Impact</Label>
                      <Input
                        disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                        value={financialImpact}
                        onChange={(e) => setFinancialImpact(e.target.value)}
                        className="h-8.5 text-[12px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Reputation Impact</Label>
                      <Input
                        disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                        value={reputationImpact}
                        onChange={(e) => setReputationImpact(e.target.value)}
                        className="h-8.5 text-[12px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-bold">Immediate Action Taken (Containment)</Label>
                  <Input
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={immediateActionTaken}
                    onChange={(e) => setImmediateActionTaken(e.target.value)}
                    placeholder="Actions executed immediately to stop or contain the breach"
                    className="h-9 text-[12.5px]"
                  />
                </div>
              </div>
            )}
          </PanelCard>

          <PanelCard>
            <button
              type="button"
              onClick={() => toggleSection("sec4")}
              className="w-full flex items-center justify-between border-b border-border/40 px-5 py-3.5 bg-muted/5 font-semibold text-[13px] uppercase tracking-wide text-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-mono font-bold text-[11px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">04</span>
                <span>Section 4: Root Cause Analysis (RCA)</span>
              </div>
              {openSections.sec4 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSections.sec4 && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Root Cause Method</Label>
                    <Select
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={rootCauseMethod}
                      onValueChange={setRootCauseMethod}
                    >
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5 Why" className="text-[12px]">5 Why Analysis</SelectItem>
                        <SelectItem value="Fishbone" className="text-[12px]">Fishbone Diagram</SelectItem>
                        <SelectItem value="Manual" className="text-[12px]">Manual Input / Remarks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Repeated Issue?</Label>
                    <Select
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={repeatedIssue}
                      onValueChange={setRepeatedIssue}
                    >
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes" className="text-[12px]">Yes, repeated non-conformance</SelectItem>
                        <SelectItem value="No" className="text-[12px]">No, first occurrence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Related Previous NC Number</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={relatedPreviousNc}
                      onChange={(e) => setRelatedPreviousNc(e.target.value)}
                      placeholder="e.g. NC-2026-1045"
                      className="h-9 text-[12.5px] font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px] font-bold flex items-center gap-1">
                    Root Cause Investigation <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    placeholder="Enter the 5 Why breakdown (Why 1 -> Why 2 -> Why 3...) or Fishbone main cause findings"
                    className="min-h-[80px] text-[12.5px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Contributing Factors</Label>
                  <Input
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={contributingFactors}
                    onChange={(e) => setContributingFactors(e.target.value)}
                    placeholder="Environmental conditions, human error, machine wear, design limitations"
                    className="h-9 text-[12.5px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/45 pt-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Linked Compliance Audit Register</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={linkedAudit}
                      onChange={(e) => setLinkedAudit(e.target.value)}
                      placeholder="Audit reference ID"
                      className="h-9 text-[12.5px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Linked Safety Inspection Report</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={linkedInspection}
                      onChange={(e) => setLinkedInspection(e.target.value)}
                      placeholder="Inspection checklist ID"
                      className="h-9 text-[12.5px]"
                    />
                  </div>
                </div>
              </div>
            )}
          </PanelCard>

          <PanelCard>
            <button
              type="button"
              onClick={() => toggleSection("sec5")}
              className="w-full flex items-center justify-between border-b border-border/40 px-5 py-3.5 bg-muted/5 font-semibold text-[13px] uppercase tracking-wide text-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-mono font-bold text-[11px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">05</span>
                <span>Section 5: Corrective &amp; Preventive Action (CAPA)</span>
              </div>
              {openSections.sec5 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSections.sec5 && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px] font-bold flex items-center gap-1">
                      Corrective Action <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={correctiveAction}
                      onChange={(e) => setCorrectiveAction(e.target.value)}
                      placeholder="Immediate action plan to rectify this issue"
                      className="min-h-[60px] text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Preventive Action</Label>
                    <Textarea
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={preventiveAction}
                      onChange={(e) => setPreventiveAction(e.target.value)}
                      placeholder="Long-term systemic correction to avoid recurrence"
                      className="min-h-[60px] text-[12.5px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Action Owner</Label>
                    <Select
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={actionOwner}
                      onValueChange={setActionOwner}
                    >
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PEOPLE.map(p => (
                          <SelectItem key={p.id} value={p.id} className="text-[12px]">{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Department</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={capaDepartment}
                      onChange={(e) => setCapaDepartment(e.target.value)}
                      placeholder="Owner Department"
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px] font-bold flex items-center gap-1">
                      Target Completion Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      type="date"
                      value={targetCompletionDate}
                      onChange={(e) => setTargetCompletionDate(e.target.value)}
                      className="h-9 text-[12.5px] num"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Estimated Completion</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      type="date"
                      value={estimatedCompletion}
                      onChange={(e) => setEstimatedCompletion(e.target.value)}
                      className="h-9 text-[12.5px] num"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Resources Required</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={resourcesRequired}
                      onChange={(e) => setResourcesRequired(e.target.value)}
                      placeholder="Safety gears, training hours, spare parts"
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Budget Required (INR / USD)</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={budgetRequired}
                      onChange={(e) => setBudgetRequired(e.target.value)}
                      placeholder="e.g. 50,000 INR"
                      className="h-9 text-[12.5px] num"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Risk Analysis After Action (Residual Risk)</Label>
                  <Input
                    disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                    value={riskAfterAction}
                    onChange={(e) => setRiskAfterAction(e.target.value)}
                    placeholder="Evaluate remaining risk level (e.g. Negligible, Low)"
                    className="h-9 text-[12.5px]"
                  />
                </div>
              </div>
            )}
          </PanelCard>

          <PanelCard>
            <button
              type="button"
              onClick={() => toggleSection("sec6")}
              className="w-full flex items-center justify-between border-b border-border/40 px-5 py-3.5 bg-muted/5 font-semibold text-[13px] uppercase tracking-wide text-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-mono font-bold text-[11px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">06</span>
                <span>Section 6: Verification &amp; Effectiveness Sign-Off</span>
              </div>
              {openSections.sec6 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSections.sec6 && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between p-3 border border-border/60 rounded-xl bg-muted/5">
                  <div className="space-y-0.5">
                    <Label className="text-[12.5px] font-bold">Verification Required?</Label>
                    <span className="text-[11px] text-muted-foreground block">Toggle if physical evidence audit or site checks are mandatory.</span>
                  </div>
                  <Switch
                    disabled={status === "Approved" || status === "Closed" || activeRole === "Responsible Person"}
                    checked={verificationRequired}
                    onCheckedChange={setVerificationRequired}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Verifier</Label>
                    <Select
                      disabled={status === "Approved" || status === "Closed" || activeRole === "Responsible Person"}
                      value={verifier}
                      onValueChange={setVerifier}
                    >
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PEOPLE.map(p => (
                          <SelectItem key={p.id} value={p.id} className="text-[12px]">{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Verification Date</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole === "Responsible Person"}
                      type="date"
                      value={verificationDate}
                      onChange={(e) => setVerificationDate(e.target.value)}
                      className="h-9 text-[12.5px] num"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Effectiveness Rating</Label>
                    <Select
                      disabled={status === "Approved" || status === "Closed" || activeRole === "Responsible Person"}
                      value={effectivenessRating}
                      onValueChange={setEffectivenessRating}
                    >
                      <SelectTrigger className="h-9 text-[12.5px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excellent" className="text-[12px]">Excellent (100% Resolved)</SelectItem>
                        <SelectItem value="Satisfactory" className="text-[12px]">Satisfactory (Acceptable Control)</SelectItem>
                        <SelectItem value="Marginal" className="text-[12px]">Marginal (Requires Monitoring)</SelectItem>
                        <SelectItem value="Unsatisfactory" className="text-[12px]">Unsatisfactory (Failure/Open)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Verification Method used</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole === "Responsible Person"}
                      value={verificationMethod}
                      onChange={(e) => setVerificationMethod(e.target.value)}
                      placeholder="e.g. Visual Site Inspection, Document Review, Testing Logs"
                      className="h-9 text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Evidence Reviewed description</Label>
                    <Input
                      disabled={status === "Approved" || status === "Closed" || activeRole === "Responsible Person"}
                      value={evidenceReviewed}
                      onChange={(e) => setEvidenceReviewed(e.target.value)}
                      placeholder="e.g. Safety sign boards installed photo, calibration log report"
                      className="h-9 text-[12.5px]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Verification Comments</Label>
                  <Textarea
                    disabled={status === "Approved" || status === "Closed" || activeRole === "Responsible Person"}
                    value={verificationComments}
                    onChange={(e) => setVerificationComments(e.target.value)}
                    placeholder="Enter detailed reviewer feedback on verification checks"
                    className="min-h-[50px] text-[12.5px]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12.5px]">Closure Recommendation</Label>
                  <Input
                    disabled={status === "Approved" || status === "Closed" || activeRole === "Responsible Person"}
                    value={closureRecommendation}
                    onChange={(e) => setClosureRecommendation(e.target.value)}
                    placeholder="e.g. Recommended for complete closure"
                    className="h-9 text-[12.5px]"
                  />
                </div>
              </div>
            )}
          </PanelCard>

          <PanelCard>
            <button
              type="button"
              onClick={() => toggleSection("sec7")}
              className="w-full flex items-center justify-between border-b border-border/40 px-5 py-3.5 bg-muted/5 font-semibold text-[13px] uppercase tracking-wide text-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-mono font-bold text-[11px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">07</span>
                <span>Section 7: Supporting Documents Upload &amp; Evidence</span>
              </div>
              {openSections.sec7 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSections.sec7 && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Inspection Report", "Photographs", "Permit", "License", "Monitoring Report", "Supporting Evidence", "CAPA Documents", "Utility Documents", "Other Attachments"].map(cat => (
                    <div key={cat} className="flex items-center justify-between gap-3 p-3 border border-border/40 rounded-xl bg-muted/5 text-[12.5px]">
                      <span className="font-semibold text-foreground">{cat}</span>
                      <div>
                        <input
                          disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                          type="file"
                          id={`file-${cat}`}
                          className="hidden"
                          onChange={e => handleFileUpload(e, cat)}
                        />
                        <Button
                          disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`file-${cat}`)?.click()}
                          className="h-8 gap-1 text-[11.5px] rounded-lg border-dashed"
                        >
                          <Upload className="h-3 w-3" /> Upload
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {attachedFiles.length > 0 && (
                  <div className="mt-4 border border-border/60 rounded-xl overflow-hidden divide-y divide-border/40 bg-muted/5 w-full">
                    <div className="grid grid-cols-12 gap-2 p-2.5 text-[11px] font-bold text-muted-foreground bg-muted/20 uppercase tracking-wider">
                      <div className="col-span-3">Document Name</div>
                      <div className="col-span-2">Category</div>
                      <div className="col-span-1">Version</div>
                      <div className="col-span-2">Uploaded By</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-1">Status</div>
                      <div className="col-span-1 text-center">Actions</div>
                    </div>
                    {attachedFiles.map(file => (
                      <div key={file.id} className="grid grid-cols-12 gap-2 p-2.5 text-[11.5px] items-center text-foreground bg-card">
                        <div className="col-span-3 flex items-center gap-2 truncate">
                          <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate font-medium" title={file.name}>{file.name}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9.5px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded font-bold uppercase">{file.category}</span>
                        </div>
                        <div className="col-span-1 font-mono text-[10px]">{(file as any).version || "v1.0"}</div>
                        <div className="col-span-2 truncate">{(file as any).uploadedBy || "Rohan Sharma"}</div>
                        <div className="col-span-2 font-mono">{(file as any).uploadedDate || new Date().toLocaleDateString()}</div>
                        <div className="col-span-1">
                          <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                            ((file as any).status === "Approved" || status === "Approved" || status === "Closed") ? "bg-success/12 text-success" : "bg-warning/14 text-warning"
                          )}>
                            {((file as any).status === "Approved" || status === "Approved" || status === "Closed") ? "Approved" : "Draft"}
                          </span>
                        </div>
                        <div className="col-span-1 flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toast.info(`Simulated Preview: ${file.name}`)}
                            className="text-muted-foreground hover:text-primary p-1 rounded transition-colors"
                            title="Preview Document"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toast.success(`Simulated Download of ${file.name} (${file.size})`)}
                            className="text-muted-foreground hover:text-primary p-1 rounded transition-colors"
                            title="Download Document"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                            onClick={() => setAttachedFiles(prev => prev.filter(f => f.id !== file.id))}
                            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors disabled:opacity-30"
                            title="Delete Document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </PanelCard>

          <PanelCard>
            <button
              type="button"
              onClick={() => toggleSection("sec8")}
              className="w-full flex items-center justify-between border-b border-border/40 px-5 py-3.5 bg-muted/5 font-semibold text-[13px] uppercase tracking-wide text-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-mono font-bold text-[11px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">08</span>
                <span>Section 8: Comments &amp; Lessons Learned</span>
              </div>
              {openSections.sec8 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSections.sec8 && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px] font-bold">Internal Comments</Label>
                    <Textarea
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={internalComments}
                      onChange={(e) => setInternalComments(e.target.value)}
                      placeholder="Responsible Person internal team comments"
                      className="min-h-[70px] text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px] font-bold text-primary">Reviewer Comments</Label>
                    <Textarea
                      disabled={status === "Approved" || status === "Closed" || activeRole === "Responsible Person"}
                      value={reviewerComments}
                      onChange={(e) => setReviewerComments(e.target.value)}
                      placeholder="Review comments (Reviewer only)"
                      className="min-h-[70px] text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px] font-bold text-success">Approver Comments</Label>
                    <Textarea
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Approver"}
                      value={approverComments}
                      onChange={(e) => setApproverComments(e.target.value)}
                      placeholder="Approval or Rejection reasons (Approver only)"
                      className="min-h-[70px] text-[12.5px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/40 pt-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Lessons Learned</Label>
                    <Textarea
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={lessonsLearned}
                      onChange={(e) => setLessonsLearned(e.target.value)}
                      placeholder="Root learnings and mitigation protocols"
                      className="min-h-[60px] text-[12.5px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12.5px]">Future Recommendations</Label>
                    <Textarea
                      disabled={status === "Approved" || status === "Closed" || activeRole !== "Responsible Person"}
                      value={futureRecommendations}
                      onChange={(e) => setFutureRecommendations(e.target.value)}
                      placeholder="System design updates or structural adjustments recommendations"
                      className="min-h-[60px] text-[12.5px]"
                    />
                  </div>
                </div>
              </div>
            )}
          </PanelCard>

          <PanelCard>
            <button
              type="button"
              onClick={() => toggleSection("sec9")}
              className="w-full flex items-center justify-between border-b border-border/40 px-5 py-3.5 bg-muted/5 font-semibold text-[13px] uppercase tracking-wide text-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-mono font-bold text-[11px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">09</span>
                <span>Section 9: Enterprise Workflow Tracker</span>
              </div>
              {openSections.sec9 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSections.sec9 && (
              <div className="p-5 space-y-6">
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 relative md:px-10 py-4">
                  
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/60 -translate-y-1/2 hidden md:block z-0" />
                  
                  {[
                    { key: "Draft", label: "Draft" },
                    { key: "Submitted", label: "Submitted" },
                    { key: "Department Review", label: "Department Review" },
                    { key: "ESG Review", label: "ESG Review" },
                    { key: "Approved", label: "ESG Approved" },
                    { key: "Closed", label: "Closed / Locked" }
                  ].map((node, index) => {
                    const isActive = status === node.key;
                    const isHistory = ["Draft", "Submitted", "Department Review", "ESG Review", "Approved", "Closed"].indexOf(status) >= index;
                    return (
                      <div key={node.key} className="flex flex-col items-center gap-1.5 relative z-10">
                        <div className={cn(
                          "h-8 w-8 rounded-full border flex items-center justify-center font-bold text-[12px] transition-all shadow-sm",
                          isActive
                            ? "bg-primary border-primary text-primary-foreground scale-110 shadow-md ring-4 ring-primary/20"
                            : isHistory
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-background border-border text-muted-foreground"
                        )}>
                          {isActive ? "●" : index + 1}
                        </div>
                        <span className={cn(
                          "text-[10px] md:text-[11px] font-bold text-center uppercase tracking-wide",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}>
                          {node.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-muted/5 border border-border/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border/40">
                    <span className="text-[12px] font-bold text-foreground">Workflow Stage Control Logs</span>
                    <span className="text-[11px] text-muted-foreground font-mono">Current Status: {status}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["Draft", "Submitted", "Under Review", "Approved", "Closed", "Rejected"].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setStatus(s);
                          toast.success(`Simulated status changed to: ${s}`);
                        }}
                        className={cn(
                          "px-2.5 py-1 text-[11px] font-bold border rounded-lg transition-all",
                          status === s
                            ? "bg-primary border-primary text-primary-foreground shadow"
                            : "border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Set {s}
                      </button>
                    ))}
                  </div>

                  {status === "Rejected" && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive text-[12px] p-3 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <div>
                        <span className="font-bold">Returned Loop active:</span> Report returned back to the Responsible Person. Modify fields and click **Resubmit** to route back to review.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </PanelCard>

          <PanelCard>
            <button
              type="button"
              onClick={() => toggleSection("sec10")}
              className="w-full flex items-center justify-between border-b border-border/40 px-5 py-3.5 bg-muted/5 font-semibold text-[13px] uppercase tracking-wide text-foreground"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-mono font-bold text-[11px] bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded">10</span>
                <span>Section 10: Audit Trail &amp; Document History (Read Only)</span>
              </div>
              {openSections.sec10 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {openSections.sec10 && (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-[12px] text-foreground">
                <div className="space-y-2.5 border-r border-border/40 pr-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Created By:</span>
                    <span className="font-semibold">{createdBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Created Date:</span>
                    <span className="font-semibold num">{new Date(createdDate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/30 pt-2.5">
                    <span className="text-muted-foreground font-medium">Modified By:</span>
                    <span className="font-semibold">{modifiedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Modified Date:</span>
                    <span className="font-semibold num">{new Date(modifiedDate).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/30 pt-2.5">
                    <span className="text-muted-foreground font-medium">Reviewed By (Sign-off):</span>
                    <span className="font-semibold">{reviewedBy || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Approved By (Sign-off):</span>
                    <span className="font-semibold">{approvedBy || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Closed By:</span>
                    <span className="font-semibold">{closedBy || "—"}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/30 pt-2.5 font-bold">
                    <span>Document Version:</span>
                    <span className="text-primary num">v{version}.0</span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Activity Logs &amp; Status Transitions</span>
                  
                  <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-2">
                    {activityTimeline.map((item) => (
                      <div key={item.id} className="flex gap-2.5 items-start text-[11px] leading-tight">
                        <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground block">{item.log}</span>
                          <span className="text-[9.5px] text-muted-foreground block num mt-0.5">{new Date(item.date).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-border/30 pt-2.5 mt-1 space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Status Transition History</span>
                      {statusHistory.map((sh, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[10.5px]">
                          <span className="font-bold text-primary">{sh.status}</span>
                          <span className="text-muted-foreground">{sh.updatedBy} · <span className="font-mono text-[9.5px]">{new Date(sh.updatedAt).toLocaleString()}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </PanelCard>
        </div>
      )}

      {/* Sticky footer action toolbar */}
      <div className="sticky bottom-0 z-40 -mx-6 bg-background/90 backdrop-blur-md border-t border-border px-6 py-3 flex flex-wrap items-center justify-between gap-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] mt-4">
        <div className="flex flex-col">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Project Matrix Check
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11.5px] font-semibold text-foreground">Status:</span>
            <span className="inline-flex h-5 items-center rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {reportType === "nc" && (
            <>
              {/* Cancel Button - All Roles */}
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="h-8 gap-1.5 rounded-lg text-[12px] border-border text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>

              {/* Reset Button - Responsible Person Only */}
              {activeRole === "Responsible Person" && status === "Draft" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 gap-1.5 rounded-lg text-[12px] border-border text-muted-foreground hover:text-foreground"
                >
                  Reset Fields
                </Button>
              )}

              {/* Preview Button - All Roles */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Simulating PDF Print Preview...", { description: "Generating report structure." })}
                className="h-8 gap-1.5 rounded-lg text-[12px] border-border text-foreground hover:bg-muted/30"
              >
                Preview
              </Button>

              {/* Print Button - All Roles */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Simulating Print layout...", { description: "Sent to default system printer." })}
                className="h-8 gap-1.5 rounded-lg text-[12px] border-border text-foreground hover:bg-muted/30"
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>

              {/* Action Buttons for Responsible Person */}
              {activeRole === "Responsible Person" && (
                <>
                  <Button
                    disabled={status === "Approved" || status === "Closed"}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave("Draft")}
                    className="h-8 gap-1.5 rounded-lg text-[12px] border-border text-foreground hover:bg-muted/30"
                  >
                    <Save className="h-3.5 w-3.5" /> Save Draft
                  </Button>
                  <Button
                    disabled={status === "Approved" || status === "Closed"}
                    size="sm"
                    onClick={() => handleSave("Submitted")}
                    className="h-8 gap-1.5 rounded-lg text-[12px] bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="h-3.5 w-3.5" /> Submit
                  </Button>
                  <Button
                    disabled={status === "Approved" || status === "Closed"}
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("NC Report assigned to review.")}
                    className="h-8 gap-1.5 rounded-lg text-[12px] border-primary text-primary hover:bg-primary/5"
                  >
                    Assign
                  </Button>
                  <Button
                    disabled={status === "Approved" || status === "Closed"}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const inp = document.getElementById("file-Supporting Evidence");
                      if (inp) inp.click();
                      else toast.info("Go to Section 7 to upload files.");
                    }}
                    className="h-8 gap-1.5 rounded-lg text-[12px]"
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload Evidence
                  </Button>
                </>
              )}

              {/* Action Buttons for Reviewers */}
              {activeRole === "Reviewer" && (
                <>
                  <Button
                    disabled={status !== "Submitted" && status !== "Under Review"}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatus("Rejected");
                      toast.success("NC Report returned to Responsible Person for correction.");
                    }}
                    className="h-8 gap-1.5 rounded-lg text-[12px] border-destructive text-destructive hover:bg-destructive/5"
                  >
                    Return for Correction
                  </Button>
                  <Button
                    disabled={status !== "Submitted" && status !== "Under Review"}
                    size="sm"
                    onClick={() => {
                      setStatus("ESG Review");
                      toast.success("NC Report recommended for ESG Approval.");
                    }}
                    className="h-8 gap-1.5 rounded-lg text-[12px] bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Recommend Approval
                  </Button>
                </>
              )}

              {/* Action Buttons for Approvers */}
              {activeRole === "Approver" && (
                <>
                  <Button
                    disabled={status === "Approved" || status === "Closed"}
                    size="sm"
                    onClick={() => handleSave("Approved")}
                    className="h-8 gap-1.5 rounded-lg text-[12px] bg-success text-success-foreground hover:bg-success/90"
                  >
                    <FileCheck className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button
                    disabled={status === "Approved" || status === "Closed"}
                    size="sm"
                    variant="destructive"
                    onClick={() => handleSave("Rejected")}
                    className="h-8 gap-1.5 rounded-lg text-[12px]"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button
                    disabled={status !== "Approved"}
                    size="sm"
                    onClick={() => handleSave("Closed")}
                    className="h-8 gap-1.5 rounded-lg text-[12px] bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Close NC
                  </Button>
                </>
              )}
            </>
          )}

          {reportType !== "nc" && (
            <>
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
                onClick={onCancel}
                className="h-8 gap-1.5 rounded-lg text-[12px] border-border text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave("Draft")}
                className="h-8 gap-1.5 rounded-lg text-[12px] border-border text-foreground hover:bg-muted/30"
              >
                <Save className="h-3.5 w-3.5" /> Save Draft
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave("Submitted")}
                className="h-8 gap-1.5 rounded-lg text-[12px] bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-3.5 w-3.5" /> Submit Record
              </Button>
            </>
          )}
        </div>
      </div>
      </div>
  );
}
