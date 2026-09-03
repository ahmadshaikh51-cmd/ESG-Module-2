import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Flame,
  HeartPulse,
  HelpCircle,
  Layers,
  MapPin,
  Paperclip,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  X,
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
import { ESG_GROUP, PERIODS } from "@/lib/esg-data";
import { cn } from "@/lib/utils";

export type SocialRegisterType =
  | "grievance"
  | "incident"
  | "facility_safety"
  | "stakeholder"
  | "first_aid"
  | "fire_extinguisher"
  | "stakeholder_tracker"
  | "annual_se_tracker";

export interface SocialCategoryMeta {
  key: SocialRegisterType;
  label: string;
  shortLabel: string;
  description: string;
  standard: string;
}

export const SOCIAL_CATEGORIES: SocialCategoryMeta[] = [
  {
    key: "grievance",
    label: "Grievance Register",
    shortLabel: "Grievance Register",
    description:
      "Employee grievance logging, channel tracking, department breakdown & clarification status.",
    standard: "Labour Laws & Grievance Policy",
  },
  {
    key: "incident",
    label: "OH&S Incident Register",
    shortLabel: "OH&S Incident Register",
    description:
      "Workplace accident, near-miss, dangerous occurrence tracking & CAPA closure.",
    standard: "Occupational Safety & Health Rules",
  },
  {
    key: "facility_safety",
    label: "PPE & Safety Audit",
    shortLabel: "PPE & Safety Audit",
    description:
      "PPE issuing register, stock tracking, condition checks & receiver signatures.",
    standard: "Depot PPE & Safety Issue Register",
  },
  {
    key: "stakeholder",
    label: "OHS",
    shortLabel: "OHS",
    description:
      "Depot safety checkpoints, compliance evaluation, risk levels & corrective action tracking.",
    standard: "OHS Inspection Standard",
  },
  {
    key: "first_aid",
    label: "First Aid Register",
    shortLabel: "First Aid Register",
    description:
      "Depot first aid treatment logging, medical supplies used, injury tracking & attendant records.",
    standard: "Factories Act & First Aid Rules",
  },
  {
    key: "fire_extinguisher",
    label: "Fire Extinguisher Checklist",
    shortLabel: "Fire Extinguisher Checklist",
    description:
      "Depot fire extinguisher inspection, pressure, seal integrity, nozzle check & refill due tracking.",
    standard: "IS 2190 & Fire Safety Rules",
  },
  {
    key: "stakeholder_tracker",
    label: "Stakeholder Management Tracker",
    shortLabel: "Stakeholder Management Tracker",
    description:
      "Record stakeholder consultations, community engagement communications, action items & follow-up remarks.",
    standard: "ESMS Stakeholder Plan",
  },
  {
    key: "annual_se_tracker",
    label: "Annual SE Tracker",
    shortLabel: "Annual SE Tracker",
    description:
      "Annual Stakeholder Engagement planned vs completed monthly tracking schedule (Apr-Mar FY).",
    standard: "Annual Stakeholder Plan",
  },
];

// 1. Grievance Record Schema (10 columns)
export type EmployeeStatusType = "Company Roll" | "Contract Roll";

export type GrievanceChannelType =
  | "Grievance Box"
  | "HR Portal"
  | "Direct Supervisor"
  | "Email"
  | "Union Rep"
  | "Verbal";

export type NatureOfIssueType =
  | "Wage & Overtime"
  | "Work Environment & Rest Area"
  | "Safety & PPE Supply"
  | "Health & Sanitation"
  | "Shift Scheduling"
  | "General Inquiry";

export type DepartmentType =
  | "Operations & Drivers"
  | "Depot Maintenance"
  | "Charging Infrastructure"
  | "EHS & Safety"
  | "Administration";

export interface SocialGrievanceRecord {
  id: string;
  registerType: "grievance";
  sNo: number;
  dateOfEntry: string;
  empId: string;
  empName: string;
  employeeStatus: EmployeeStatusType;
  grievanceChannel: GrievanceChannelType;
  natureOfIssue: NatureOfIssueType;
  department: DepartmentType;
  resolutionGiven: string;
  status: "Open" | "Closed";
  entityId: string;
  depotId: string;
  period: string;
  createdAt: string;
}

// 2. Incident Record Schema (12 columns)
export type IncidentClassificationType = "Accident" | "Near Miss" | "Dangerous Occurrence";

export interface SocialIncidentRecord {
  id: string;
  registerType: "incident";
  sNo: number;
  dateTimeOfIncident: string;
  locationWorkArea: string;
  incidentType: IncidentClassificationType;
  detailsDescription: string;
  personsInvolved: string;
  natureOfInjuryDamage: string;
  immediateActionTaken: string;
  reportedBy: string;
  safetyOfficerRemarks: string;
  capaDescription: string;
  closureDate: string;
  status: "Open" | "Closed";
  entityId: string;
  depotId: string;
  period: string;
  createdAt: string;
}

// 3. PPE & Safety Audit Record Schema (12 columns)
export interface SocialPpeRecord {
  id: string;
  registerType: "facility_safety";
  sNo: number;
  date: string;
  employeeName: string;
  empId: string;
  designation: string;
  contractorDepartment: string;
  typeOfPpeIssued: string;
  quantityIssued: string;
  issueCondition: "New" | "Used / Re-issued";
  receiverSig: "Signed" | "Digital Verified" | "Pending";
  issuedBy: string;
  remarks: string;
  status: "Closed" | "Open";
  entityId: string;
  depotId: string;
  period: string;
  createdAt: string;
}

// 4. OHS Inspection Record Schema (11 columns)
export interface SocialOhsRecord {
  id: string;
  registerType: "stakeholder";
  sNo: number;
  inspectionCategory: string;
  checkpointDescription: string;
  compliance: "Yes" | "No";
  observationRemarks: string;
  riskLevel: "Low" | "Medium" | "High";
  correctiveAction: string;
  responsiblePerson: string;
  targetDate: string;
  status: "Open" | "Closed";
  inspectorName: string;
  entityId: string;
  depotId: string;
  period: string;
  createdAt: string;
}

// 5. First Aid Register Record Schema (12 columns)
export interface SocialFirstAidRecord {
  id: string;
  registerType: "first_aid";
  sNo: number;
  dateUsed: string;
  employeeName: string;
  empId: string;
  designation: string;
  contractorDepartment: string;
  injuryDescription: string;
  typeOfAidGiven: string;
  materialsUsed: string;
  receiverSignature: "Signed" | "Digital Verified" | "Pending";
  issuedBy: string;
  remarks: string;
  status: "Closed" | "Open";
  entityId: string;
  depotId: string;
  period: string;
  createdAt: string;
}

// 6. Fire Extinguisher Checklist Record Schema (14 columns)
export interface SocialFireExtinguisherRecord {
  id: string;
  registerType: "fire_extinguisher";
  sNo: number;
  location: string;
  extinguisherType: "ABC" | "CO2" | "Water" | "Foam";
  capacity: string;
  makeIdNo: string;
  safetyPinSeal: "OK" | "Not OK";
  physicalCondition: "OK" | "Damaged";
  hoseNozzleCondition: "OK" | "Worn" | "Damaged";
  mountingAccessibility: "OK" | "Obstructed";
  lastRefillDate: string;
  nextDueDate: string;
  inspectionDate: string;
  inspectedBy: string;
  remarks: string;
  status: "Closed" | "Open";
  entityId: string;
  depotId: string;
  period: string;
  createdAt: string;
}

// 7. Stakeholder Management Tracker Record Schema
export interface SocialStakeholderTrackerRecord {
  id: string;
  registerType: "stakeholder_tracker";
  sNo: number;
  recordingPerson: string;
  detailsOfActionTaken: string;
  dateOfActionTaken: string;
  remarks: string;
  status: "Closed" | "Open";
  entityId: string;
  depotId: string;
  period: string;
  createdAt: string;
}

// 8. Annual SE Tracker Record Schema (Matching exact 12-month P/C structure from reference image)
export interface MonthlySePair {
  planned: number;
  completed: number;
}

export interface SocialAnnualSeTrackerRecord {
  id: string;
  registerType: "annual_se_tracker";
  sNo: number;
  stakeholderActivity: string;
  financialYear: string;
  apr: MonthlySePair;
  may: MonthlySePair;
  jun: MonthlySePair;
  jul: MonthlySePair;
  aug: MonthlySePair;
  sept: MonthlySePair;
  oct: MonthlySePair;
  nov: MonthlySePair;
  dec: MonthlySePair;
  jan: MonthlySePair;
  feb: MonthlySePair;
  mar: MonthlySePair;
  remarks: string;
  status: "Closed" | "Open";
  entityId: string;
  depotId: string;
  period: string;
  createdAt: string;
}

export type SocialRecordItem =
  | SocialGrievanceRecord
  | SocialIncidentRecord
  | SocialPpeRecord
  | SocialOhsRecord
  | SocialFirstAidRecord
  | SocialFireExtinguisherRecord
  | SocialStakeholderTrackerRecord
  | SocialAnnualSeTrackerRecord;

export const INITIAL_MOCK_GRIEVANCE_RECORDS: SocialGrievanceRecord[] = [
  {
    id: "soc-001",
    registerType: "grievance",
    sNo: 1,
    dateOfEntry: "2026-07-28",
    empId: "EMP-1042",
    empName: "Rahul Sharma",
    employeeStatus: "Contract Roll",
    grievanceChannel: "Grievance Box",
    natureOfIssue: "Work Environment & Rest Area",
    department: "Operations & Drivers",
    resolutionGiven:
      "Approved procurement of 1x 50L RO water cooler & canopy extension near Bay 4 rest area.",
    status: "Closed",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    createdAt: "2026-07-28T10:00:00Z",
  },
  {
    id: "soc-002",
    registerType: "grievance",
    sNo: 2,
    dateOfEntry: "2026-07-24",
    empId: "EMP-2105",
    empName: "Sanjay Verma",
    employeeStatus: "Company Roll",
    grievanceChannel: "HR Portal",
    natureOfIssue: "Wage & Overtime",
    department: "Depot Maintenance",
    resolutionGiven:
      "Overtime hours verified from biometric attendance log; adjusted in July payroll cycle (+14 hrs).",
    status: "Closed",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    createdAt: "2026-07-24T14:20:00Z",
  },
];

export const INITIAL_MOCK_PPE_RECORDS: SocialPpeRecord[] = [
  {
    id: "ppe-001",
    registerType: "facility_safety",
    sNo: 1,
    date: "2026-07-28",
    employeeName: "Rajesh Gupta",
    empId: "EMP-4091",
    designation: "Senior Electrical Technician",
    contractorDepartment: "Depot Maintenance / Transvolt",
    typeOfPpeIssued: "10kV Electrical Insulation Gloves & Arc Flash Visor",
    quantityIssued: "1 Set",
    issueCondition: "New",
    receiverSig: "Digital Verified",
    issuedBy: "Suresh Patil (EHS Officer)",
    remarks: "Issued prior to 415V substation preventative maintenance cycle.",
    status: "Closed",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    createdAt: "2026-07-28T10:00:00Z",
  },
];

export const INITIAL_MOCK_OHS_RECORDS: SocialOhsRecord[] = [
  {
    id: "ohs-001",
    registerType: "stakeholder",
    sNo: 1,
    inspectionCategory: "Electrical & High Voltage Safety",
    checkpointDescription: "415V Substation Isolator handle lock pin & earthing continuity",
    compliance: "No",
    observationRemarks: "Isolator lock pin dislodged on Bay 3 charger during pre-shift inspection",
    riskLevel: "High",
    correctiveAction: "Procure and replace retaining pin with industrial locking cotter pin",
    responsiblePerson: "Sandeep Kumar (Electrical Lead)",
    targetDate: "2026-08-05",
    status: "Open",
    inspectorName: "Rohan Desai (Lead EHS Auditor)",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    createdAt: "2026-07-28T10:00:00Z",
  },
];

export const INITIAL_MOCK_FIRST_AID_RECORDS: SocialFirstAidRecord[] = [
  {
    id: "fa-001",
    registerType: "first_aid",
    sNo: 1,
    dateUsed: "2026-07-27",
    employeeName: "Ramesh Pawar",
    empId: "EMP-2104",
    designation: "Bus Driver",
    contractorDepartment: "Operations & Drivers",
    injuryDescription: "Mild ankle sprain due to slipping on wet washing bay surface",
    typeOfAidGiven: "First Aid Cold Compress & Support Bandage Dressing",
    materialsUsed: "Ice Compress Pack, Elastic Crepe Bandage 10cm, Pain Relief Gel",
    receiverSignature: "Signed",
    issuedBy: "Dr. Sunita Rao (Depot First Aid Officer)",
    remarks: "Advised 24 hrs rest & cold compress application; no fracture detected.",
    status: "Closed",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    createdAt: "2026-07-27T11:15:00Z",
  },
];

export const INITIAL_MOCK_FIRE_EXTINGUISHER_RECORDS: SocialFireExtinguisherRecord[] = [
  {
    id: "fe-001",
    registerType: "fire_extinguisher",
    sNo: 1,
    location: "Substation Bay 3 - Main Incomer Switchgear",
    extinguisherType: "CO2",
    capacity: "4.5 kg",
    makeIdNo: "FE-CO2-012 / Ceasefire",
    safetyPinSeal: "OK",
    physicalCondition: "OK",
    hoseNozzleCondition: "OK",
    mountingAccessibility: "OK",
    lastRefillDate: "2026-02-15",
    nextDueDate: "2027-02-15",
    inspectionDate: "2026-07-28",
    inspectedBy: "Vikas Patil (Fire Safety Officer)",
    remarks: "Pressure gauge in green zone; tamper seal intact.",
    status: "Closed",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    createdAt: "2026-07-28T10:00:00Z",
  },
];

export const INITIAL_MOCK_STAKEHOLDER_TRACKER_RECORDS: SocialStakeholderTrackerRecord[] = [
  {
    id: "stk-001",
    registerType: "stakeholder_tracker",
    sNo: 1,
    recordingPerson: "Ananya Deshmukh (Community Relations Lead)",
    detailsOfActionTaken:
      "Conducted Q3 Local Community Consultation meeting with Kashimira resident welfare association regarding depot night charging sound levels & illumination.",
    dateOfActionTaken: "2026-07-26",
    remarks:
      "Agreed to adjust Bay 4 lighting angle by 15 degrees downward and deploy acoustic barrier wall by Q4.",
    status: "Closed",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    createdAt: "2026-07-26T14:00:00Z",
  },
];

export const INITIAL_MOCK_ANNUAL_SE_TRACKER_RECORDS: SocialAnnualSeTrackerRecord[] = [
  {
    id: "ase-001",
    registerType: "annual_se_tracker",
    sNo: 1,
    stakeholderActivity: "Local Community Consultation & Noise Audits",
    financialYear: "FY 2026-27",
    apr: { planned: 1, completed: 1 },
    may: { planned: 1, completed: 1 },
    jun: { planned: 1, completed: 1 },
    jul: { planned: 1, completed: 1 },
    aug: { planned: 1, completed: 0 },
    sept: { planned: 1, completed: 0 },
    oct: { planned: 1, completed: 0 },
    nov: { planned: 1, completed: 0 },
    dec: { planned: 1, completed: 0 },
    jan: { planned: 1, completed: 0 },
    feb: { planned: 1, completed: 0 },
    mar: { planned: 1, completed: 0 },
    remarks: "Monthly resident welfare association meeting per ESMS SEP schedule.",
    status: "Open",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    createdAt: "2026-07-28T10:00:00Z",
  },
  {
    id: "ase-002",
    registerType: "annual_se_tracker",
    sNo: 2,
    stakeholderActivity: "MSEDCL Utility Co-ordination & Feeder Audits",
    financialYear: "FY 2026-27",
    apr: { planned: 2, completed: 2 },
    may: { planned: 2, completed: 2 },
    jun: { planned: 2, completed: 2 },
    jul: { planned: 2, completed: 2 },
    aug: { planned: 2, completed: 0 },
    sept: { planned: 2, completed: 0 },
    oct: { planned: 2, completed: 0 },
    nov: { planned: 2, completed: 0 },
    dec: { planned: 2, completed: 0 },
    jan: { planned: 2, completed: 0 },
    feb: { planned: 2, completed: 0 },
    mar: { planned: 2, completed: 0 },
    remarks: "Bi-monthly grid stability and TOD tariff review with MSEDCL engineers.",
    status: "Open",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    createdAt: "2026-07-20T11:00:00Z",
  },
];

interface SocialDataEntryProps {
  onSaveSuccess?: (typeKey?: SocialRegisterType) => void;
  onCancel?: () => void;
  onSaveRecord?: (record: SocialRecordItem) => void;
  initialEntityId?: string;
  initialDepotId?: string;
  initialPeriod?: string;
  initialRegisterType?: SocialRegisterType;
  nextGrievanceSNo?: number;
  nextIncidentSNo?: number;
  nextPpeSNo?: number;
  nextOhsSNo?: number;
  nextFirstAidSNo?: number;
  nextFireExtinguisherSNo?: number;
  nextStakeholderTrackerSNo?: number;
  nextAnnualSeTrackerSNo?: number;
}

export function SocialDataEntry({
  onSaveSuccess,
  onCancel,
  onSaveRecord,
  initialEntityId,
  initialDepotId,
  initialPeriod,
  initialRegisterType = "grievance",
  nextGrievanceSNo = 1,
  nextIncidentSNo = 1,
  nextPpeSNo = 1,
  nextOhsSNo = 1,
  nextFirstAidSNo = 1,
  nextFireExtinguisherSNo = 1,
  nextStakeholderTrackerSNo = 1,
  nextAnnualSeTrackerSNo = 1,
}: SocialDataEntryProps) {
  const [selectedTestType, setSelectedTestType] = useState<SocialRegisterType>(initialRegisterType);
  const [entityId, setEntityId] = useState<string>(initialEntityId || ESG_GROUP.entities[0].id);

  const currentEntity = useMemo(
    () => ESG_GROUP.entities.find((e) => e.id === entityId) || ESG_GROUP.entities[0],
    [entityId],
  );

  const availableDepots = currentEntity.depots;
  const [depotId, setDepotId] = useState<string>(initialDepotId || availableDepots[0]?.id || "depot");

  useEffect(() => {
    if (!availableDepots.some((d) => d.id === depotId) && availableDepots[0]) {
      setDepotId(availableDepots[0].id);
    }
  }, [entityId, availableDepots, depotId]);

  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [monitorName, setMonitorName] = useState("Rohan Desai (Lead EHS Auditor)");

  const derivedPeriod = useMemo(() => (testDate ? testDate.slice(0, 7) : initialPeriod || "2026-08"), [testDate, initialPeriod]);

  // Grievance Form State (10 columns)
  const [empId, setEmpId] = useState(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [empName, setEmpName] = useState("");
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatusType>("Contract Roll");
  const [grievanceChannel, setGrievanceChannel] = useState<GrievanceChannelType>("Grievance Box");
  const [natureOfIssue, setNatureOfIssue] = useState<NatureOfIssueType>("Work Environment & Rest Area");
  const [department, setDepartment] = useState<DepartmentType>("Operations & Drivers");
  const [resolutionGiven, setResolutionGiven] = useState("");
  const [grievanceStatus, setGrievanceStatus] = useState<"Open" | "Closed">("Open");

  // Incident Form State (12 columns)
  const [dateTimeOfIncident, setDateTimeOfIncident] = useState(`${testDate} 10:30 AM`);
  const [locationWorkArea, setLocationWorkArea] = useState("Charging Bay 3 - Substation Area");
  const [incidentType, setIncidentType] = useState<IncidentClassificationType>("Near Miss");
  const [detailsDescription, setDetailsDescription] = useState("");
  const [personsInvolved, setPersonsInvolved] = useState("");
  const [natureOfInjuryDamage, setNatureOfInjuryDamage] = useState("");
  const [immediateActionTaken, setImmediateActionTaken] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [safetyOfficerRemarks, setSafetyOfficerRemarks] = useState("");
  const [capaDescription, setCapaDescription] = useState("");
  const [closureDate, setClosureDate] = useState("Pending");
  const [incidentStatus, setIncidentStatus] = useState<"Open" | "Closed">("Open");

  // PPE Form State (12 columns)
  const [ppeEmployeeName, setPpeEmployeeName] = useState("");
  const [ppeEmpId, setPpeEmpId] = useState(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [designation, setDesignation] = useState("Senior Electrical Technician");
  const [contractorDepartment, setContractorDepartment] = useState("Depot Maintenance / Transvolt");
  const [typeOfPpeIssued, setTypeOfPpeIssued] = useState("10kV Electrical Insulation Gloves & Arc Flash Visor");
  const [quantityIssued, setQuantityIssued] = useState("1 Set");
  const [issueCondition, setIssueCondition] = useState<"New" | "Used / Re-issued">("New");
  const [receiverSig, setReceiverSig] = useState<"Signed" | "Digital Verified" | "Pending">("Signed");
  const [issuedBy, setIssuedBy] = useState("Suresh Patil (EHS Officer)");
  const [ppeRemarks, setPpeRemarks] = useState("");

  // OHS Inspection Form State (11 columns)
  const [inspectionCategory, setInspectionCategory] = useState("Electrical & High Voltage Safety");
  const [checkpointDescription, setCheckpointDescription] = useState("");
  const [compliance, setCompliance] = useState<"Yes" | "No">("Yes");
  const [observationRemarks, setObservationRemarks] = useState("");
  const [riskLevel, setRiskLevel] = useState<"Low" | "Medium" | "High">("Low");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState("Sandeep Kumar (EHS Lead)");
  const [targetDate, setTargetDate] = useState("2026-08-15");
  const [ohsStatus, setOhsStatus] = useState<"Open" | "Closed">("Open");
  const [inspectorName, setInspectorName] = useState("Rohan Desai (Lead EHS Auditor)");

  // First Aid Form State (12 columns)
  const [faEmployeeName, setFaEmployeeName] = useState("");
  const [faEmpId, setFaEmpId] = useState(`EMP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [faDesignation, setFaDesignation] = useState("Bus Driver");
  const [faContractorDepartment, setFaContractorDepartment] = useState("Operations & Drivers");
  const [injuryDescription, setInjuryDescription] = useState("");
  const [typeOfAidGiven, setTypeOfAidGiven] = useState("First Aid Dressing & Cold Compress");
  const [materialsUsed, setMaterialsUsed] = useState("Betadine 5%, Crepe Bandage, Ice Pack");
  const [faReceiverSignature, setFaReceiverSignature] = useState<"Signed" | "Digital Verified" | "Pending">("Signed");
  const [faIssuedBy, setFaIssuedBy] = useState("Dr. Sunita Rao (Depot First Aid Officer)");
  const [faRemarks, setFaRemarks] = useState("");

  // Fire Extinguisher Form State (14 columns)
  const [feLocation, setFeLocation] = useState("Substation Bay 3 - Switchgear Room");
  const [extinguisherType, setExtinguisherType] = useState<"ABC" | "CO2" | "Water" | "Foam">("ABC");
  const [feCapacity, setFeCapacity] = useState("6 kg");
  const [makeIdNo, setMakeIdNo] = useState("FE-ABC-102 / Ceasefire");
  const [safetyPinSeal, setSafetyPinSeal] = useState<"OK" | "Not OK">("OK");
  const [physicalCondition, setPhysicalCondition] = useState<"OK" | "Damaged">("OK");
  const [hoseNozzleCondition, setHoseNozzleCondition] = useState<"OK" | "Worn" | "Damaged">("OK");
  const [mountingAccessibility, setMountingAccessibility] = useState<"OK" | "Obstructed">("OK");
  const [lastRefillDate, setLastRefillDate] = useState("2026-02-15");
  const [nextDueDate, setNextDueDate] = useState("2027-02-15");
  const [feInspectedBy, setFeInspectedBy] = useState("Vikas Patil (Fire Safety Officer)");
  const [feRemarks, setFeRemarks] = useState("");

  // Stakeholder Management Tracker Form State
  const [recordingPerson, setRecordingPerson] = useState("Ananya Deshmukh (Community Relations Lead)");
  const [detailsOfActionTaken, setDetailsOfActionTaken] = useState("");
  const [dateOfActionTaken, setDateOfActionTaken] = useState(testDate);
  const [stkRemarks, setStkRemarks] = useState("");
  const [stkStatus, setStkStatus] = useState<"Open" | "Closed">("Closed");

  // Annual SE Tracker Form State (12 P/C month pairs matching reference image)
  const [stakeholderActivity, setStakeholderActivity] = useState("Local Community Consultation & Noise Audits");
  const [financialYear, setFinancialYear] = useState("FY 2026-27");
  const [aprP, setAprP] = useState(1);
  const [aprC, setAprC] = useState(1);
  const [mayP, setMayP] = useState(1);
  const [mayC, setMayC] = useState(1);
  const [junP, setJunP] = useState(1);
  const [junC, setJunC] = useState(1);
  const [julP, setJulP] = useState(1);
  const [julC, setJulC] = useState(1);
  const [augP, setAugP] = useState(1);
  const [augC, setAugC] = useState(0);
  const [septP, setSeptP] = useState(1);
  const [septC, setSeptC] = useState(0);
  const [octP, setOctP] = useState(1);
  const [octC, setOctC] = useState(0);
  const [novP, setNovP] = useState(1);
  const [novC, setNovC] = useState(0);
  const [decP, setDecP] = useState(1);
  const [decC, setDecC] = useState(0);
  const [janP, setJanP] = useState(1);
  const [janC, setJanC] = useState(0);
  const [febP, setFebP] = useState(1);
  const [febC, setFebC] = useState(0);
  const [marP, setMarP] = useState(1);
  const [marC, setMarC] = useState(0);
  const [aseRemarks, setAseRemarks] = useState("");
  const [aseStatus, setAseStatus] = useState<"Open" | "Closed">("Open");

  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);

  const currentDepot = availableDepots.find((d) => d.id === depotId) || availableDepots[0] || { name: "Depot" };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newAtt = Array.from(files).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
    }));
    setAttachments((prev) => [...prev, ...newAtt]);
    toast.success(`${files.length} attachment(s) added.`);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTestType === "grievance") {
      if (!empName.trim()) {
        toast.error("Please enter Employee Name.");
        return;
      }
      if (!empId.trim()) {
        toast.error("Please enter Employee ID.");
        return;
      }

      const newRecord: SocialGrievanceRecord = {
        id: `grv-${Date.now()}`,
        registerType: "grievance",
        sNo: nextGrievanceSNo,
        dateOfEntry: testDate,
        empId: empId.trim(),
        empName: empName.trim(),
        employeeStatus,
        grievanceChannel,
        natureOfIssue,
        department,
        resolutionGiven: resolutionGiven.trim() || "Under review by HR & EHS team",
        status: grievanceStatus,
        entityId,
        depotId,
        period: derivedPeriod,
        createdAt: new Date().toISOString(),
      };

      if (onSaveRecord) onSaveRecord(newRecord);
      toast.success("Grievance Record Saved", {
        description: `Record #${newRecord.sNo} (${newRecord.empName}) saved for ${currentDepot.name}.`,
      });
    } else if (selectedTestType === "incident") {
      if (!detailsDescription.trim()) {
        toast.error("Please enter Details of Incident / Description.");
        return;
      }

      const newRecord: SocialIncidentRecord = {
        id: `inc-${Date.now()}`,
        registerType: "incident",
        sNo: nextIncidentSNo,
        dateTimeOfIncident: dateTimeOfIncident || `${testDate} 10:30 AM`,
        locationWorkArea: locationWorkArea.trim(),
        incidentType,
        detailsDescription: detailsDescription.trim(),
        personsInvolved: personsInvolved.trim() || "None / Property Only",
        natureOfInjuryDamage: natureOfInjuryDamage.trim() || "Near miss / No structural damage",
        immediateActionTaken: immediateActionTaken.trim() || "Site isolated & supervisor notified",
        reportedBy: reportedBy.trim() || monitorName || "Duty Safety Inspector",
        safetyOfficerRemarks: safetyOfficerRemarks.trim() || "Logged for depot monthly EHS review",
        capaDescription: capaDescription.trim() || "CAPA action plan pending completion",
        closureDate: closureDate.trim() || (incidentStatus === "Closed" ? testDate : "Pending"),
        status: incidentStatus,
        entityId,
        depotId,
        period: derivedPeriod,
        createdAt: new Date().toISOString(),
      };

      if (onSaveRecord) onSaveRecord(newRecord);
      toast.success("OH&S Incident Record Saved", {
        description: `Incident #${newRecord.sNo} (${newRecord.incidentType}) saved for ${currentDepot.name}.`,
      });
    } else if (selectedTestType === "facility_safety") {
      if (!ppeEmployeeName.trim()) {
        toast.error("Please enter Employee Name.");
        return;
      }

      const newRecord: SocialPpeRecord = {
        id: `ppe-${Date.now()}`,
        registerType: "facility_safety",
        sNo: nextPpeSNo,
        date: testDate,
        employeeName: ppeEmployeeName.trim(),
        empId: ppeEmpId.trim(),
        designation: designation.trim() || "Technician",
        contractorDepartment: contractorDepartment.trim() || "Depot Maintenance",
        typeOfPpeIssued: typeOfPpeIssued.trim() || "Safety Gear Set",
        quantityIssued: quantityIssued.trim() || "1 Set",
        issueCondition,
        receiverSig,
        issuedBy: issuedBy.trim() || monitorName || "EHS Safety Officer",
        remarks: ppeRemarks.trim() || "Issued during routine safety inspection cycle",
        status: receiverSig === "Pending" ? "Open" : "Closed",
        entityId,
        depotId,
        period: derivedPeriod,
        createdAt: new Date().toISOString(),
      };

      if (onSaveRecord) onSaveRecord(newRecord);
      toast.success("PPE & Safety Audit Record Saved", {
        description: `PPE issue record #${newRecord.sNo} (${newRecord.employeeName}) saved for ${currentDepot.name}.`,
      });
    } else if (selectedTestType === "stakeholder") {
      if (!checkpointDescription.trim()) {
        toast.error("Please enter Checkpoint / Description.");
        return;
      }

      const newRecord: SocialOhsRecord = {
        id: `ohs-${Date.now()}`,
        registerType: "stakeholder",
        sNo: nextOhsSNo,
        inspectionCategory,
        checkpointDescription: checkpointDescription.trim(),
        compliance,
        observationRemarks: observationRemarks.trim() || "Inspection completed per safety checklist",
        riskLevel,
        correctiveAction: correctiveAction.trim() || "CAPA tracking initiated",
        responsiblePerson: responsiblePerson.trim() || "Depot EHS Officer",
        targetDate,
        status: ohsStatus,
        inspectorName: inspectorName.trim() || monitorName,
        entityId,
        depotId,
        period: derivedPeriod,
        createdAt: new Date().toISOString(),
      };

      if (onSaveRecord) onSaveRecord(newRecord);
      toast.success("OHS Inspection Record Saved", {
        description: `OHS Checkpoint #${newRecord.sNo} (${newRecord.inspectionCategory}) saved for ${currentDepot.name}.`,
      });
    } else if (selectedTestType === "first_aid") {
      if (!faEmployeeName.trim()) {
        toast.error("Please enter Employee Name.");
        return;
      }
      if (!injuryDescription.trim()) {
        toast.error("Please enter Injury Description.");
        return;
      }

      const newRecord: SocialFirstAidRecord = {
        id: `fa-${Date.now()}`,
        registerType: "first_aid",
        sNo: nextFirstAidSNo,
        dateUsed: testDate,
        employeeName: faEmployeeName.trim(),
        empId: faEmpId.trim(),
        designation: faDesignation.trim() || "Technician / Driver",
        contractorDepartment: faContractorDepartment.trim() || "Operations",
        injuryDescription: injuryDescription.trim(),
        typeOfAidGiven: typeOfAidGiven.trim() || "First Aid Treatment",
        materialsUsed: materialsUsed.trim() || "Standard First Aid Medical Kit Supplies",
        receiverSignature: faReceiverSignature,
        issuedBy: faIssuedBy.trim() || monitorName || "First Aid Officer",
        remarks: faRemarks.trim() || "Treatment administered & worker rested",
        status: faReceiverSignature === "Pending" ? "Open" : "Closed",
        entityId,
        depotId,
        period: derivedPeriod,
        createdAt: new Date().toISOString(),
      };

      if (onSaveRecord) onSaveRecord(newRecord);
      toast.success("First Aid Record Saved", {
        description: `First Aid Record #${newRecord.sNo} (${newRecord.employeeName}) saved for ${currentDepot.name}.`,
      });
    } else if (selectedTestType === "fire_extinguisher") {
      if (!feLocation.trim()) {
        toast.error("Please enter Location / Work Area.");
        return;
      }
      if (!makeIdNo.trim()) {
        toast.error("Please enter Make / ID No.");
        return;
      }

      const isCompliant =
        safetyPinSeal === "OK" &&
        physicalCondition === "OK" &&
        hoseNozzleCondition === "OK" &&
        mountingAccessibility === "OK";

      const newRecord: SocialFireExtinguisherRecord = {
        id: `fe-${Date.now()}`,
        registerType: "fire_extinguisher",
        sNo: nextFireExtinguisherSNo,
        location: feLocation.trim(),
        extinguisherType,
        capacity: feCapacity.trim() || "6 kg",
        makeIdNo: makeIdNo.trim(),
        safetyPinSeal,
        physicalCondition,
        hoseNozzleCondition,
        mountingAccessibility,
        lastRefillDate,
        nextDueDate,
        inspectionDate: testDate,
        inspectedBy: feInspectedBy.trim() || monitorName || "Fire Safety Officer",
        remarks: feRemarks.trim() || "Monthly safety audit completed",
        status: isCompliant ? "Closed" : "Open",
        entityId,
        depotId,
        period: derivedPeriod,
        createdAt: new Date().toISOString(),
      };

      if (onSaveRecord) onSaveRecord(newRecord);
      toast.success("Fire Extinguisher Record Saved", {
        description: `Fire Extinguisher #${newRecord.sNo} (${newRecord.makeIdNo}) saved for ${currentDepot.name}.`,
      });
    } else if (selectedTestType === "stakeholder_tracker") {
      if (!recordingPerson.trim()) {
        toast.error("Please enter Name of Recording Person.");
        return;
      }
      if (!detailsOfActionTaken.trim()) {
        toast.error("Please enter Details of Action Taken.");
        return;
      }

      const newRecord: SocialStakeholderTrackerRecord = {
        id: `stk-${Date.now()}`,
        registerType: "stakeholder_tracker",
        sNo: nextStakeholderTrackerSNo,
        recordingPerson: recordingPerson.trim(),
        detailsOfActionTaken: detailsOfActionTaken.trim(),
        dateOfActionTaken: dateOfActionTaken || testDate,
        remarks: stkRemarks.trim() || "Stakeholder action item logged",
        status: stkStatus,
        entityId,
        depotId,
        period: derivedPeriod,
        createdAt: new Date().toISOString(),
      };

      if (onSaveRecord) onSaveRecord(newRecord);
      toast.success("Stakeholder Management Tracker Record Saved", {
        description: `Tracker Record #${newRecord.sNo} (${newRecord.recordingPerson}) saved for ${currentDepot.name}.`,
      });
    } else if (selectedTestType === "annual_se_tracker") {
      if (!stakeholderActivity.trim()) {
        toast.error("Please enter Stakeholder / Activity Name.");
        return;
      }

      const newRecord: SocialAnnualSeTrackerRecord = {
        id: `ase-${Date.now()}`,
        registerType: "annual_se_tracker",
        sNo: nextAnnualSeTrackerSNo,
        stakeholderActivity: stakeholderActivity.trim(),
        financialYear: financialYear.trim() || "FY 2026-27",
        apr: { planned: aprP, completed: aprC },
        may: { planned: mayP, completed: mayC },
        jun: { planned: junP, completed: junC },
        jul: { planned: julP, completed: julC },
        aug: { planned: augP, completed: augC },
        sept: { planned: septP, completed: septC },
        oct: { planned: octP, completed: octC },
        nov: { planned: novP, completed: novC },
        dec: { planned: decP, completed: decC },
        jan: { planned: janP, completed: janC },
        feb: { planned: febP, completed: febC },
        mar: { planned: marP, completed: marC },
        remarks: aseRemarks.trim() || "Annual SE schedule updated",
        status: aseStatus,
        entityId,
        depotId,
        period: derivedPeriod,
        createdAt: new Date().toISOString(),
      };

      if (onSaveRecord) onSaveRecord(newRecord);
      toast.success("Annual SE Tracker Record Saved", {
        description: `Annual SE Activity #${newRecord.sNo} (${newRecord.stakeholderActivity}) saved for ${currentDepot.name}.`,
      });
    }

    if (onSaveSuccess) onSaveSuccess(selectedTestType);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* STEP 1 & 2: WHERE & WHAT TEST (CONVERSATIONAL GUIDED HEADER) */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-elevated space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-[14px]">
              01
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-foreground">
                Where and What Was Tested / Audited?
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
          {/* Project / SPV */}
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
              <User className="h-3.5 w-3.5 text-primary" /> Lead Monitor / Auditor
            </Label>
            <Input
              value={monitorName}
              onChange={(e) => setMonitorName(e.target.value)}
              placeholder="e.g. Rohan Desai (Lead EHS Auditor)"
              className="h-9 text-[12.5px] bg-muted/20"
              required
            />
          </div>
        </div>

        {/* STEP 2 — WHAT TEST? (VISUAL SELECTION CARDS MATCHING BENCHMARK LOOK) */}
        <div className="space-y-3 pt-2">
          <Label className="text-[12px] font-semibold text-foreground block">
            Select Test Category <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SOCIAL_CATEGORIES.map((type) => {
              const isSelected = selectedTestType === type.key;
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setSelectedTestType(type.key)}
                  className={cn(
                    "flex flex-col justify-between items-start rounded-xl border p-4 text-left transition-all relative space-y-2 shadow-xs cursor-pointer min-h-[125px]",
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
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11.5px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {type.description}
                  </p>
                  <span className="inline-flex w-fit rounded-md bg-muted/60 px-2 py-0.5 text-[10.5px] font-mono text-muted-foreground mt-1">
                    {type.standard}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* STEP 3: CATEGORY-SPECIFIC PARAMETER CARDS */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-elevated space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-[14px]">
              02
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-foreground">
                {selectedTestType === "grievance"
                  ? "Enter Grievance Register Details (10 Table Columns)"
                  : selectedTestType === "incident"
                  ? "Enter OH&S Incident Register Details (12 Table Columns)"
                  : selectedTestType === "facility_safety"
                  ? "Enter PPE & Safety Audit Register Details (12 Table Columns)"
                  : selectedTestType === "stakeholder"
                  ? "Enter OHS Inspection Checkpoint Details (11 Table Columns)"
                  : selectedTestType === "first_aid"
                  ? "Enter First Aid Register Details (12 Table Columns)"
                  : selectedTestType === "fire_extinguisher"
                  ? "Enter Fire Extinguisher Checklist Details (14 Table Columns)"
                  : selectedTestType === "stakeholder_tracker"
                  ? "Enter Stakeholder Management Tracker Details"
                  : "Enter Annual SE Tracker Details (Apr-Mar Monthly Schedule)"}
              </h3>
              <p className="text-[12px] text-muted-foreground">
                Capture exact parameter values and statutory disclosures for this audit cycle.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel} className="h-9">
                Cancel
              </Button>
            )}
            <Button type="submit" size="sm" className="h-9 gap-1.5 font-bold shadow-sm px-4">
              <Save className="h-4 w-4" /> Save Record
            </Button>
          </div>
        </div>

        {/* 1. Grievance Register Form */}
        {selectedTestType === "grievance" && (
          <div className="space-y-5 rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
            <div className="flex items-center justify-between border-b border-orange-500/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-orange-500" />
                <h4 className="text-[14px] font-bold text-foreground">
                  Grievance Register Entry (10 Table Columns)
                </h4>
              </div>
              <span className="text-[11.5px] font-bold text-muted-foreground">
                S-No: #{nextGrievanceSNo}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Date of Entry</Label>
                <Input
                  type="date"
                  className="bg-background text-[12.5px]"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Emp-Id</Label>
                <Input
                  className="bg-background text-[12.5px] font-mono"
                  placeholder="e.g. EMP-1042"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Emp-Name</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Rahul Sharma"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">
                  Employee Status (Company Roll / Contract Roll)
                </Label>
                <Select
                  value={employeeStatus}
                  onValueChange={(v) => setEmployeeStatus(v as EmployeeStatusType)}
                >
                  <SelectTrigger className="bg-background text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Company Roll">🏢 Company Roll</SelectItem>
                    <SelectItem value="Contract Roll">📄 Contract Roll</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Grievances came through</Label>
                <Select
                  value={grievanceChannel}
                  onValueChange={(v) => setGrievanceChannel(v as GrievanceChannelType)}
                >
                  <SelectTrigger className="bg-background text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grievance Box">📮 Grievance Box</SelectItem>
                    <SelectItem value="HR Portal">💻 HR Portal</SelectItem>
                    <SelectItem value="Direct Supervisor">👤 Direct Supervisor</SelectItem>
                    <SelectItem value="Email">📧 Email</SelectItem>
                    <SelectItem value="Union Rep">🤝 Union Rep</SelectItem>
                    <SelectItem value="Verbal">🗣️ Direct Verbal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Nature of Issue</Label>
                <Select
                  value={natureOfIssue}
                  onValueChange={(v) => setNatureOfIssue(v as NatureOfIssueType)}
                >
                  <SelectTrigger className="bg-background text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wage & Overtime">💰 Wage & Overtime</SelectItem>
                    <SelectItem value="Work Environment & Rest Area">
                      🏢 Work Environment & Rest Area
                    </SelectItem>
                    <SelectItem value="Safety & PPE Supply">🥾 Safety & PPE Supply</SelectItem>
                    <SelectItem value="Health & Sanitation">🩹 Health & Sanitation</SelectItem>
                    <SelectItem value="Shift Scheduling">⏰ Shift Scheduling</SelectItem>
                    <SelectItem value="General Inquiry">❓ General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Department</Label>
                <Select
                  value={department}
                  onValueChange={(v) => setDepartment(v as DepartmentType)}
                >
                  <SelectTrigger className="bg-background text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operations & Drivers">🚌 Operations & Drivers</SelectItem>
                    <SelectItem value="Depot Maintenance">🔧 Depot Maintenance</SelectItem>
                    <SelectItem value="Charging Infrastructure">⚡ Charging Infrastructure</SelectItem>
                    <SelectItem value="EHS & Safety">🛡️ EHS & Safety</SelectItem>
                    <SelectItem value="Administration">📁 Administration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Resolved (Open / Closed)</Label>
                <Select
                  value={grievanceStatus}
                  onValueChange={(v) => setGrievanceStatus(v as "Open" | "Closed")}
                >
                  <SelectTrigger className="bg-background text-[12.5px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open" className="text-orange-600 font-bold">
                      🟠 Open
                    </SelectItem>
                    <SelectItem value="Closed" className="text-emerald-600 font-bold">
                      🟢 Closed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold">Clarification / Resolution given</Label>
              <Textarea
                rows={3}
                className="bg-background text-[12.5px]"
                placeholder="Enter resolution notes, clarifications provided, or corrective action steps taken..."
                value={resolutionGiven}
                onChange={(e) => setResolutionGiven(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* 2. OH&S Incident Register Form */}
        {selectedTestType === "incident" && (
          <div className="space-y-5 rounded-xl border border-destructive/20 bg-destructive/5 p-5">
            <div className="flex items-center justify-between border-b border-destructive/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-destructive" />
                <h4 className="text-[14px] font-bold text-foreground">
                  OH&S Incident Register Entry (12 Table Columns)
                </h4>
              </div>
              <span className="text-[11.5px] font-bold text-muted-foreground">
                Sr. No: #{nextIncidentSNo}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Date & Time of Incident</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. 2026-07-28 10:30 AM"
                  value={dateTimeOfIncident}
                  onChange={(e) => setDateTimeOfIncident(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Location / Work Area</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Charging Bay 3 - Substation Area"
                  value={locationWorkArea}
                  onChange={(e) => setLocationWorkArea(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">
                  Type (Accident / Near Miss / Dangerous Occurrence)
                </Label>
                <Select
                  value={incidentType}
                  onValueChange={(v) => setIncidentType(v as IncidentClassificationType)}
                >
                  <SelectTrigger className="bg-background text-[12.5px] font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Near Miss">⚠️ Near Miss</SelectItem>
                    <SelectItem value="Accident">🔴 Accident</SelectItem>
                    <SelectItem value="Dangerous Occurrence">⚡ Dangerous Occurrence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold">Details of Incident / Description</Label>
              <Textarea
                rows={3}
                className="bg-background text-[12.5px]"
                placeholder="Detail what happened, sequence of events, equipment involved..."
                value={detailsDescription}
                onChange={(e) => setDetailsDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">
                  Name(s) of Injured / Persons Involved
                </Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Sandeep Kumar (Technician)"
                  value={personsInvolved}
                  onChange={(e) => setPersonsInvolved(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Nature of Injury / Damage</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. First aid abrasion / minor handle scratch"
                  value={natureOfInjuryDamage}
                  onChange={(e) => setNatureOfInjuryDamage(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Immediate Action Taken</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Isolated 415V line & applied lockout tag"
                  value={immediateActionTaken}
                  onChange={(e) => setImmediateActionTaken(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">
                  Reported By (Name & Designation)
                </Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Sandeep Kumar (Sr Technician)"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">
                  Supervisor / Safety Officer Remarks
                </Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Timely reporting prevented arc flash risk"
                  value={safetyOfficerRemarks}
                  onChange={(e) => setSafetyOfficerRemarks(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">
                  Corrective & Preventive Action (CAPA)
                </Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Replaced locking pin & updated checklist"
                  value={capaDescription}
                  onChange={(e) => setCapaDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Closure Date</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. 2026-07-28 or Pending"
                  value={closureDate}
                  onChange={(e) => setClosureDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Resolved (Open / Closed)</Label>
                <Select
                  value={incidentStatus}
                  onValueChange={(v) => setIncidentStatus(v as "Open" | "Closed")}
                >
                  <SelectTrigger className="bg-background text-[12.5px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open" className="text-orange-600 font-bold">
                      🟠 Open
                    </SelectItem>
                    <SelectItem value="Closed" className="text-emerald-600 font-bold">
                      🟢 Closed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* 3. PPE & Safety Audit Register Form */}
        {selectedTestType === "facility_safety" && (
          <div className="space-y-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                <h4 className="text-[14px] font-bold text-foreground">
                  PPE & Safety Audit Register Entry (12 Table Columns)
                </h4>
              </div>
              <span className="text-[11.5px] font-bold text-muted-foreground">
                Sr. No.: #{nextPpeSNo}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Date</Label>
                <Input
                  type="date"
                  className="bg-background text-[12.5px]"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Employee Name</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Rajesh Gupta"
                  value={ppeEmployeeName}
                  onChange={(e) => setPpeEmployeeName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Emp ID</Label>
                <Input
                  className="bg-background text-[12.5px] font-mono"
                  placeholder="e.g. EMP-4091"
                  value={ppeEmpId}
                  onChange={(e) => setPpeEmpId(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Designation</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Senior Electrical Technician"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Contractor / Department</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Depot Maintenance / Transvolt"
                  value={contractorDepartment}
                  onChange={(e) => setContractorDepartment(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Type of PPE Issued</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. 10kV Insulation Gloves & Visor"
                  value={typeOfPpeIssued}
                  onChange={(e) => setTypeOfPpeIssued(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Quantity Issued</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. 1 Set / 2 Pairs"
                  value={quantityIssued}
                  onChange={(e) => setQuantityIssued(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Issue Condition (New/Used)</Label>
                <Select
                  value={issueCondition}
                  onValueChange={(v) => setIssueCondition(v as "New" | "Used / Re-issued")}
                >
                  <SelectTrigger className="bg-background text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">✨ New</SelectItem>
                    <SelectItem value="Used / Re-issued">🔄 Used / Re-issued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Receiver Sig</Label>
                <Select
                  value={receiverSig}
                  onValueChange={(v) => setReceiverSig(v as "Signed" | "Digital Verified" | "Pending")}
                >
                  <SelectTrigger className="bg-background text-[12.5px] font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Signed">✍️ Signed</SelectItem>
                    <SelectItem value="Digital Verified">📲 Digital Verified</SelectItem>
                    <SelectItem value="Pending">⏳ Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Issued By (Name & Designation)</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Suresh Patil (EHS Officer)"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Remarks</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Replaced worn out gloves during Q3 audit"
                  value={ppeRemarks}
                  onChange={(e) => setPpeRemarks(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. OHS Register Entry Form */}
        {selectedTestType === "stakeholder" && (
          <div className="space-y-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
            <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-blue-600" />
                <h4 className="text-[14px] font-bold text-foreground">
                  OHS Inspection Register Entry (11 Table Columns)
                </h4>
              </div>
              <span className="text-[11.5px] font-bold text-muted-foreground">
                Sr No: #{nextOhsSNo}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Inspection Category</Label>
                <Select value={inspectionCategory} onValueChange={setInspectionCategory}>
                  <SelectTrigger className="bg-background text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electrical & High Voltage Safety">⚡ Electrical & High Voltage Safety</SelectItem>
                    <SelectItem value="Fire Protection & Emergency Response">🧯 Fire Protection & Emergency Response</SelectItem>
                    <SelectItem value="Slips, Trips & Surface Safety">👢 Slips, Trips & Surface Safety</SelectItem>
                    <SelectItem value="Chemical & Hazardous Material Storage">🧪 Chemical & Hazardous Material Storage</SelectItem>
                    <SelectItem value="PPE & Ergonomics">🥾 PPE & Ergonomics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[12px] font-semibold">Checkpoint / Description</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. 415V Substation Isolator handle lock pin & earthing continuity"
                  value={checkpointDescription}
                  onChange={(e) => setCheckpointDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Compliance (Yes/No)</Label>
                <Select value={compliance} onValueChange={(v) => setCompliance(v as "Yes" | "No")}>
                  <SelectTrigger className="bg-background text-[12.5px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes" className="text-emerald-600 font-bold">
                      ✅ Yes (Compliant)
                    </SelectItem>
                    <SelectItem value="No" className="text-destructive font-bold">
                      ❌ No (Non-Compliant)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Risk Level (Low/Medium/High)</Label>
                <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as "Low" | "Medium" | "High")}>
                  <SelectTrigger className="bg-background text-[12.5px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low" className="text-emerald-600 font-bold">🟢 Low Risk</SelectItem>
                    <SelectItem value="Medium" className="text-amber-600 font-bold">🟠 Medium Risk</SelectItem>
                    <SelectItem value="High" className="text-destructive font-bold">🔴 High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Status (Open / Closed)</Label>
                <Select value={ohsStatus} onValueChange={(v) => setOhsStatus(v as "Open" | "Closed")}>
                  <SelectTrigger className="bg-background text-[12.5px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open" className="text-amber-600 font-bold">🟠 Open</SelectItem>
                    <SelectItem value="Closed" className="text-emerald-600 font-bold">🟢 Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold">Observation / Remarks</Label>
              <Textarea
                rows={2}
                className="bg-background text-[12.5px]"
                placeholder="Enter specific audit observations, defects found, or safety findings..."
                value={observationRemarks}
                onChange={(e) => setObservationRemarks(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Corrective Action Required</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Replace retaining pin with industrial cotter pin"
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Responsible Person</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Sandeep Kumar (Electrical Lead)"
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Target Date</Label>
                <Input
                  type="date"
                  className="bg-background text-[12.5px]"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Inspector Name</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Rohan Desai (Lead EHS Auditor)"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. First Aid Register Entry Form */}
        {selectedTestType === "first_aid" && (
          <div className="space-y-5 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex items-center justify-between border-b border-red-500/10 pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4.5 w-4.5 text-red-600" />
                <h4 className="text-[14px] font-bold text-foreground">
                  First Aid Register Entry (12 Table Columns)
                </h4>
              </div>
              <span className="text-[11.5px] font-bold text-muted-foreground">
                Sr. No.: #{nextFirstAidSNo}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Date used</Label>
                <Input
                  type="date"
                  className="bg-background text-[12.5px]"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Employee Name</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Ramesh Pawar"
                  value={faEmployeeName}
                  onChange={(e) => setFaEmployeeName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Emp ID</Label>
                <Input
                  className="bg-background text-[12.5px] font-mono"
                  placeholder="e.g. EMP-2104"
                  value={faEmpId}
                  onChange={(e) => setFaEmpId(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Designation</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Bus Driver / Maintenance Fitter"
                  value={faDesignation}
                  onChange={(e) => setFaDesignation(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Contractor / Department</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Operations & Drivers"
                  value={faContractorDepartment}
                  onChange={(e) => setFaContractorDepartment(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Injury Description</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Mild ankle sprain due to wet slip"
                  value={injuryDescription}
                  onChange={(e) => setInjuryDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Type of Aid given</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Cold Compress & Support Bandage"
                  value={typeOfAidGiven}
                  onChange={(e) => setTypeOfAidGiven(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Materials used</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Crepe Bandage, Betadine 5%, Gauze"
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Receiver Signature</Label>
                <Select
                  value={faReceiverSignature}
                  onValueChange={(v) => setFaReceiverSignature(v as "Signed" | "Digital Verified" | "Pending")}
                >
                  <SelectTrigger className="bg-background text-[12.5px] font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Signed">✍️ Signed</SelectItem>
                    <SelectItem value="Digital Verified">📲 Digital Verified</SelectItem>
                    <SelectItem value="Pending">⏳ Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Issued By (Name & Sign)</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Dr. Sunita Rao (First Aid Officer)"
                  value={faIssuedBy}
                  onChange={(e) => setFaIssuedBy(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Remarks</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Advised rest; vitals stable"
                  value={faRemarks}
                  onChange={(e) => setFaRemarks(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. Fire Extinguisher Checklist Entry Form */}
        {selectedTestType === "fire_extinguisher" && (
          <div className="space-y-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4.5 w-4.5 text-amber-600" />
                <h4 className="text-[14px] font-bold text-foreground">
                  Fire Extinguisher Checklist Entry (14 Table Columns)
                </h4>
              </div>
              <span className="text-[11.5px] font-bold text-muted-foreground">
                Sr. No.: #{nextFireExtinguisherSNo}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Location / Work Area</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Substation Bay 3 - Switchgear Room"
                  value={feLocation}
                  onChange={(e) => setFeLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Extinguisher Type</Label>
                <Select
                  value={extinguisherType}
                  onValueChange={(v) => setExtinguisherType(v as "ABC" | "CO2" | "Water" | "Foam")}
                >
                  <SelectTrigger className="bg-background text-[12.5px] font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ABC">🧯 ABC Dry Powder</SelectItem>
                    <SelectItem value="CO2">⚡ CO2 Carbon Dioxide</SelectItem>
                    <SelectItem value="Water">💧 Water Type</SelectItem>
                    <SelectItem value="Foam">🫧 AFFF Foam Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Capacity</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. 6 kg / 4.5 kg / 9 L"
                  value={feCapacity}
                  onChange={(e) => setFeCapacity(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Make / ID No.</Label>
                <Input
                  className="bg-background text-[12.5px] font-mono"
                  placeholder="e.g. FE-ABC-102 / Ceasefire"
                  value={makeIdNo}
                  onChange={(e) => setMakeIdNo(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Safety Pin & Seal (OK/Not OK)</Label>
                <Select
                  value={safetyPinSeal}
                  onValueChange={(v) => setSafetyPinSeal(v as "OK" | "Not OK")}
                >
                  <SelectTrigger className="bg-background text-[12.5px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OK" className="text-emerald-600 font-bold">
                      ✅ OK (Seal Intact)
                    </SelectItem>
                    <SelectItem value="Not OK" className="text-destructive font-bold">
                      ❌ Not OK (Broken / Missing)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Physical Condition (OK/Damaged)</Label>
                <Select
                  value={physicalCondition}
                  onValueChange={(v) => setPhysicalCondition(v as "OK" | "Damaged")}
                >
                  <SelectTrigger className="bg-background text-[12.5px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OK" className="text-emerald-600 font-bold">
                      ✅ OK (Normal)
                    </SelectItem>
                    <SelectItem value="Damaged" className="text-destructive font-bold">
                      🔴 Damaged (Dent/Corrosion)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Hose / Nozzle Condition</Label>
                <Select
                  value={hoseNozzleCondition}
                  onValueChange={(v) => setHoseNozzleCondition(v as "OK" | "Worn" | "Damaged")}
                >
                  <SelectTrigger className="bg-background text-[12.5px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OK" className="text-emerald-600 font-bold">
                      ✅ OK (Clear & Flexible)
                    </SelectItem>
                    <SelectItem value="Worn" className="text-amber-600 font-bold">
                      🟠 Worn (Minor Cracks)
                    </SelectItem>
                    <SelectItem value="Damaged" className="text-destructive font-bold">
                      🔴 Damaged (Blocked/Split)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Mounting / Accessibility</Label>
                <Select
                  value={mountingAccessibility}
                  onValueChange={(v) => setMountingAccessibility(v as "OK" | "Obstructed")}
                >
                  <SelectTrigger className="bg-background text-[12.5px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OK" className="text-emerald-600 font-bold">
                      ✅ OK (Clear & Mounted)
                    </SelectItem>
                    <SelectItem value="Obstructed" className="text-destructive font-bold">
                      🚫 Obstructed / Unmounted
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Last Refill Date</Label>
                <Input
                  type="date"
                  className="bg-background text-[12.5px]"
                  value={lastRefillDate}
                  onChange={(e) => setLastRefillDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Next Due Date</Label>
                <Input
                  type="date"
                  className="bg-background text-[12.5px]"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Inspection Date</Label>
                <Input
                  type="date"
                  className="bg-background text-[12.5px]"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Inspected By</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Vikas Patil (Fire Safety Officer)"
                  value={feInspectedBy}
                  onChange={(e) => setFeInspectedBy(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold">Remarks</Label>
              <Textarea
                rows={2}
                className="bg-background text-[12.5px]"
                placeholder="Enter inspection remarks, gauge pressure notes, or refill requirement comments..."
                value={feRemarks}
                onChange={(e) => setFeRemarks(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* 7. Stakeholder Management Tracker Entry Form */}
        {selectedTestType === "stakeholder_tracker" && (
          <div className="space-y-5 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
            <div className="flex items-center justify-between border-b border-purple-500/10 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-purple-600" />
                <h4 className="text-[14px] font-bold text-foreground">
                  Stakeholder Management Tracker Entry
                </h4>
              </div>
              <span className="text-[11.5px] font-bold text-muted-foreground">
                S-No: #{nextStakeholderTrackerSNo}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[12px] font-semibold">Name of Recording Person</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Ananya Deshmukh (Community Relations Lead)"
                  value={recordingPerson}
                  onChange={(e) => setRecordingPerson(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Date of Action Taken / Communication</Label>
                <Input
                  type="date"
                  className="bg-background text-[12.5px]"
                  value={dateOfActionTaken}
                  onChange={(e) => setDateOfActionTaken(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold">Details of Action Taken</Label>
              <Textarea
                rows={3}
                className="bg-background text-[12.5px]"
                placeholder="Enter detailed summary of stakeholder meeting, consultation outcomes, community feedback, or official communications..."
                value={detailsOfActionTaken}
                onChange={(e) => setDetailsOfActionTaken(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[12px] font-semibold">Remarks</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="Enter follow-up commitments, action item target dates, or additional remarks..."
                  value={stkRemarks}
                  onChange={(e) => setStkRemarks(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Status (Open / Closed)</Label>
                <Select
                  value={stkStatus}
                  onValueChange={(v) => setStkStatus(v as "Open" | "Closed")}
                >
                  <SelectTrigger className="bg-background text-[12.5px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Closed" className="text-emerald-600 font-bold">
                      🟢 Closed / Resolved
                    </SelectItem>
                    <SelectItem value="Open" className="text-amber-600 font-bold">
                      🟠 Open / Action Pending
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* 8. Annual SE Tracker Entry Form (Matching exact 12-month P/C structure from reference image) */}
        {selectedTestType === "annual_se_tracker" && (
          <div className="space-y-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
            <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-blue-600" />
                <h4 className="text-[14px] font-bold text-foreground">
                  Annual SE Tracker Entry (Monthly Schedule: Apr-Mar)
                </h4>
              </div>
              <span className="text-[11.5px] font-bold text-muted-foreground">
                S-No: #{nextAnnualSeTrackerSNo}
              </span>
            </div>

            {/* Stakeholder Activity & FY */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[12px] font-semibold">
                  Stakeholder / Activity Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="e.g. Local Community Consultation & Noise Audits"
                  value={stakeholderActivity}
                  onChange={(e) => setStakeholderActivity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Financial Year</Label>
                <Select value={financialYear} onValueChange={setFinancialYear}>
                  <SelectTrigger className="bg-background text-[12.5px] font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FY 2026-27">FY 2026-27</SelectItem>
                    <SelectItem value="FY 2025-26">FY 2025-26</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 12 Months Grid: Planned (P) vs Completed (C) for Apr to Mar */}
            <div className="space-y-3 pt-2">
              <Label className="text-[12px] font-bold text-foreground block">
                Monthly Planned (P) & Completed (C) Breakdown (Apr - Mar)
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* Apr */}
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-primary text-center">Apr</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Apr (P)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold"
                        value={aprP}
                        onChange={(e) => setAprP(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Apr (C)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold text-emerald-600"
                        value={aprC}
                        onChange={(e) => setAprC(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* May */}
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-primary text-center">May</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">May (P)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold"
                        value={mayP}
                        onChange={(e) => setMayP(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">May (C)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold text-emerald-600"
                        value={mayC}
                        onChange={(e) => setMayC(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Jun */}
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-primary text-center">Jun</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Jun (P)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold"
                        value={junP}
                        onChange={(e) => setJunP(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Jun (C)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold text-emerald-600"
                        value={junC}
                        onChange={(e) => setJunC(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Jul */}
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-primary text-center">Jul</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Jul (P)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold"
                        value={julP}
                        onChange={(e) => setJulP(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Jul (C)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold text-emerald-600"
                        value={julC}
                        onChange={(e) => setJulC(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Aug */}
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-primary text-center">Aug</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Aug (P)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold"
                        value={augP}
                        onChange={(e) => setAugP(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Aug (C)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold text-emerald-600"
                        value={augC}
                        onChange={(e) => setAugC(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Sept */}
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-primary text-center">Sept</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Sept (P)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold"
                        value={septP}
                        onChange={(e) => setSeptP(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Sept (C)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold text-emerald-600"
                        value={septC}
                        onChange={(e) => setSeptC(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Oct */}
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-primary text-center">Oct</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Oct (P)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold"
                        value={octP}
                        onChange={(e) => setOctP(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Oct (C)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold text-emerald-600"
                        value={octC}
                        onChange={(e) => setOctC(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Nov */}
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-primary text-center">Nov</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Nov (P)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold"
                        value={novP}
                        onChange={(e) => setNovP(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Nov (C)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold text-emerald-600"
                        value={novC}
                        onChange={(e) => setNovC(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Dec */}
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-primary text-center">Dec</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Dec (P)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold"
                        value={decP}
                        onChange={(e) => setDecP(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Dec (C)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold text-emerald-600"
                        value={decC}
                        onChange={(e) => setDecC(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Jan */}
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-primary text-center">Jan</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Jan (P)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold"
                        value={janP}
                        onChange={(e) => setJanP(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Jan (C)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold text-emerald-600"
                        value={janC}
                        onChange={(e) => setJanC(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Feb */}
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-primary text-center">Feb</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Feb (P)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold"
                        value={febP}
                        onChange={(e) => setFebP(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Feb (C)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold text-emerald-600"
                        value={febC}
                        onChange={(e) => setFebC(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* Mar */}
                <div className="rounded-lg border border-border/60 bg-card p-2.5 space-y-1.5">
                  <div className="text-[11.5px] font-bold text-primary text-center">Mar</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Mar (P)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold"
                        value={marP}
                        onChange={(e) => setMarP(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground block text-center">Mar (C)</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-[11.5px] text-center font-bold text-emerald-600"
                        value={marC}
                        onChange={(e) => setMarC(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[12px] font-semibold">Remarks</Label>
                <Input
                  className="bg-background text-[12.5px]"
                  placeholder="Enter schedule remarks, target audience, or compliance notes..."
                  value={aseRemarks}
                  onChange={(e) => setAseRemarks(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold">Status (Open / Closed)</Label>
                <Select
                  value={aseStatus}
                  onValueChange={(v) => setAseStatus(v as "Open" | "Closed")}
                >
                  <SelectTrigger className="bg-background text-[12.5px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open" className="text-amber-600 font-bold">
                      🟠 Open (Schedule Ongoing)
                    </SelectItem>
                    <SelectItem value="Closed" className="text-emerald-600 font-bold">
                      🟢 Closed (FY Plan Completed)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* File Attachments */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <Label className="text-[12.5px] font-bold text-foreground">
              Supporting Evidence Attachments (Site Photos, Signed Inspection Report PDF, Reports)
            </Label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-border/60 bg-muted/40 px-3 py-1 text-[11.5px] font-semibold hover:bg-muted transition-colors">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" /> Add File
              <input type="file" multiple className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          {attachments.length === 0 ? (
            <p className="text-[11.5px] text-muted-foreground italic">
              No evidence files attached. Upload photo or signed inspection report PDF if available.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-1.5 text-[12px]"
                >
                  <FileCheck className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-foreground truncate max-w-[180px]">
                    {att.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">({att.size})</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
