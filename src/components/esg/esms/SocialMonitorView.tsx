import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  HeartPulse,
  Layers,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportToXlsx } from "@/lib/export-xlsx";
import { cn } from "@/lib/utils";
import { Segmented } from "../Segmented";
import {
  INITIAL_MOCK_ANNUAL_SE_TRACKER_RECORDS,
  INITIAL_MOCK_FIRE_EXTINGUISHER_RECORDS,
  INITIAL_MOCK_FIRST_AID_RECORDS,
  INITIAL_MOCK_GRIEVANCE_RECORDS,
  INITIAL_MOCK_OHS_RECORDS,
  INITIAL_MOCK_PPE_RECORDS,
  INITIAL_MOCK_STAKEHOLDER_TRACKER_RECORDS,
  SOCIAL_CATEGORIES,
  SocialAnnualSeTrackerRecord,
  SocialFireExtinguisherRecord,
  SocialFirstAidRecord,
  SocialGrievanceRecord,
  SocialIncidentRecord,
  SocialOhsRecord,
  SocialPpeRecord,
  SocialRecordItem,
  SocialRegisterType,
  SocialStakeholderTrackerRecord,
} from "./SocialDataEntry";

export const INITIAL_MOCK_INCIDENT_RECORDS: SocialIncidentRecord[] = [
  {
    id: "inc-001",
    registerType: "incident",
    sNo: 1,
    dateTimeOfIncident: "2026-07-26 10:15 AM",
    locationWorkArea: "Charging Bay 3 - Substation Area",
    incidentType: "Near Miss",
    detailsDescription:
      "Isolator handle lock pin was dislodged during pre-shift inspection before charger maintenance.",
    personsInvolved: "Sandeep Kumar (Technician)",
    natureOfInjuryDamage: "No injury; minor scratch on outer handle cover",
    immediateActionTaken:
      "Isolated 415V supply line immediately; deployed warning tag and barrier tape.",
    reportedBy: "Sandeep Kumar (Senior Electrical Technician)",
    safetyOfficerRemarks:
      "Timely reporting prevented potential arc flash risk. Maintenance team notified.",
    capaDescription:
      "Replaced retaining pin with industrial locking cotter pin; updated daily pre-work permit checklist.",
    closureDate: "2026-07-28",
    status: "Closed",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    createdAt: "2026-07-26T10:30:00Z",
  },
  {
    id: "inc-002",
    registerType: "incident",
    sNo: 2,
    dateTimeOfIncident: "2026-07-22 02:45 PM",
    locationWorkArea: "Depot Washing Bay & Catchment Sump",
    incidentType: "Accident",
    detailsDescription:
      "Driver slipped on wet surface near ETP sludge pump tray during routine vehicle inspection.",
    personsInvolved: "Ramesh Pawar (Bus Driver)",
    natureOfInjuryDamage: "First-aid case — mild ankle sprain",
    immediateActionTaken:
      "First aid administered at depot clinic; cold compress & ankle support bandage applied.",
    reportedBy: "Vikas Patil (Depot Supervisor)",
    safetyOfficerRemarks:
      "Washing area anti-skid rubber matting worn out in section 2.",
    capaDescription:
      "Installed heavy-duty anti-slip grip mats across entire washing bay walkway; deployed wet floor signs.",
    closureDate: "2026-07-25",
    status: "Closed",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    createdAt: "2026-07-22T15:00:00Z",
  },
];

interface SocialMonitorViewProps {
  customRecords?: SocialRecordItem[];
  onNewRecordClick?: () => void;
  onStatusChange?: (id: string, newStatus: "Open" | "Closed") => void;
}

export function SocialMonitorView({
  customRecords = [],
  onNewRecordClick,
  onStatusChange,
}: SocialMonitorViewProps) {
  const [activeRegister, setActiveRegister] = useState<SocialRegisterType>("grievance");
  const [localRecords, setLocalRecords] = useState<SocialRecordItem[]>([]);

  const allRecords = useMemo(() => {
    return [...customRecords, ...localRecords];
  }, [customRecords, localRecords]);

  // Separate records by register type
  const grievanceRecords = useMemo(() => {
    const customGrievances = allRecords.filter(
      (r): r is SocialGrievanceRecord => r.registerType === "grievance",
    );
    return [...customGrievances, ...INITIAL_MOCK_GRIEVANCE_RECORDS];
  }, [allRecords]);

  const incidentRecords = useMemo(() => {
    const customIncidents = allRecords.filter(
      (r): r is SocialIncidentRecord => r.registerType === "incident",
    );
    return [...customIncidents, ...INITIAL_MOCK_INCIDENT_RECORDS];
  }, [allRecords]);

  const ppeRecords = useMemo(() => {
    const customPpe = allRecords.filter(
      (r): r is SocialPpeRecord => r.registerType === "facility_safety",
    );
    return [...customPpe, ...INITIAL_MOCK_PPE_RECORDS];
  }, [allRecords]);

  const ohsRecords = useMemo(() => {
    const customOhs = allRecords.filter(
      (r): r is SocialOhsRecord => r.registerType === "stakeholder",
    );
    return [...customOhs, ...INITIAL_MOCK_OHS_RECORDS];
  }, [allRecords]);

  const firstAidRecords = useMemo(() => {
    const customFa = allRecords.filter(
      (r): r is SocialFirstAidRecord => r.registerType === "first_aid",
    );
    return [...customFa, ...INITIAL_MOCK_FIRST_AID_RECORDS];
  }, [allRecords]);

  const fireExtinguisherRecords = useMemo(() => {
    const customFe = allRecords.filter(
      (r): r is SocialFireExtinguisherRecord => r.registerType === "fire_extinguisher",
    );
    return [...customFe, ...INITIAL_MOCK_FIRE_EXTINGUISHER_RECORDS];
  }, [allRecords]);

  const stakeholderTrackerRecords = useMemo(() => {
    const customStk = allRecords.filter(
      (r): r is SocialStakeholderTrackerRecord => r.registerType === "stakeholder_tracker",
    );
    return [...customStk, ...INITIAL_MOCK_STAKEHOLDER_TRACKER_RECORDS];
  }, [allRecords]);

  const annualSeTrackerRecords = useMemo(() => {
    const customAse = allRecords.filter(
      (r): r is SocialAnnualSeTrackerRecord => r.registerType === "annual_se_tracker",
    );
    return [...customAse, ...INITIAL_MOCK_ANNUAL_SE_TRACKER_RECORDS];
  }, [allRecords]);

  // Shared Filter & Search state
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filtered Grievance Records
  const filteredGrievances = useMemo(() => {
    return grievanceRecords.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterType !== "all" && r.department !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.empName.toLowerCase().includes(q);
        const matchId = r.empId.toLowerCase().includes(q);
        const matchIssue = r.natureOfIssue.toLowerCase().includes(q);
        const matchRes = r.resolutionGiven.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchIssue && !matchRes) return false;
      }
      return true;
    });
  }, [grievanceRecords, filterStatus, filterType, searchQuery]);

  // Filtered Incident Records
  const filteredIncidents = useMemo(() => {
    return incidentRecords.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterType !== "all" && r.incidentType !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchLoc = r.locationWorkArea.toLowerCase().includes(q);
        const matchDesc = r.detailsDescription.toLowerCase().includes(q);
        const matchRep = r.reportedBy.toLowerCase().includes(q);
        const matchPersons = r.personsInvolved.toLowerCase().includes(q);
        if (!matchLoc && !matchDesc && !matchRep && !matchPersons) return false;
      }
      return true;
    });
  }, [incidentRecords, filterStatus, filterType, searchQuery]);

  // Filtered PPE Records
  const filteredPpeRecords = useMemo(() => {
    return ppeRecords.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterType !== "all" && r.issueCondition !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.employeeName.toLowerCase().includes(q);
        const matchId = r.empId.toLowerCase().includes(q);
        const matchPpe = r.typeOfPpeIssued.toLowerCase().includes(q);
        const matchDept = r.contractorDepartment.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchPpe && !matchDept) return false;
      }
      return true;
    });
  }, [ppeRecords, filterStatus, filterType, searchQuery]);

  // Filtered OHS Records
  const filteredOhsRecords = useMemo(() => {
    return ohsRecords.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterType !== "all" && r.riskLevel !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCat = r.inspectionCategory.toLowerCase().includes(q);
        const matchDesc = r.checkpointDescription.toLowerCase().includes(q);
        const matchResp = r.responsiblePerson.toLowerCase().includes(q);
        const matchInsp = r.inspectorName.toLowerCase().includes(q);
        if (!matchCat && !matchDesc && !matchResp && !matchInsp) return false;
      }
      return true;
    });
  }, [ohsRecords, filterStatus, filterType, searchQuery]);

  // Filtered First Aid Records
  const filteredFirstAidRecords = useMemo(() => {
    return firstAidRecords.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.employeeName.toLowerCase().includes(q);
        const matchId = r.empId.toLowerCase().includes(q);
        const matchInjury = r.injuryDescription.toLowerCase().includes(q);
        const matchAid = r.typeOfAidGiven.toLowerCase().includes(q);
        const matchMat = r.materialsUsed.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchInjury && !matchAid && !matchMat) return false;
      }
      return true;
    });
  }, [firstAidRecords, filterStatus, searchQuery]);

  // Filtered Fire Extinguisher Records
  const filteredFireExtinguisherRecords = useMemo(() => {
    return fireExtinguisherRecords.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchLoc = r.location.toLowerCase().includes(q);
        const matchMake = r.makeIdNo.toLowerCase().includes(q);
        const matchType = r.extinguisherType.toLowerCase().includes(q);
        const matchInsp = r.inspectedBy.toLowerCase().includes(q);
        if (!matchLoc && !matchMake && !matchType && !matchInsp) return false;
      }
      return true;
    });
  }, [fireExtinguisherRecords, filterStatus, searchQuery]);

  // Filtered Stakeholder Tracker Records
  const filteredStakeholderTrackerRecords = useMemo(() => {
    return stakeholderTrackerRecords.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchPerson = r.recordingPerson.toLowerCase().includes(q);
        const matchDetails = r.detailsOfActionTaken.toLowerCase().includes(q);
        const matchRemarks = r.remarks.toLowerCase().includes(q);
        if (!matchPerson && !matchDetails && !matchRemarks) return false;
      }
      return true;
    });
  }, [stakeholderTrackerRecords, filterStatus, searchQuery]);

  // Filtered Annual SE Tracker Records
  const filteredAnnualSeTrackerRecords = useMemo(() => {
    return annualSeTrackerRecords.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchActivity = r.stakeholderActivity.toLowerCase().includes(q);
        const matchRemarks = r.remarks.toLowerCase().includes(q);
        if (!matchActivity && !matchRemarks) return false;
      }
      return true;
    });
  }, [annualSeTrackerRecords, filterStatus, searchQuery]);

  // Grievance KPIs
  const grievanceStats = useMemo(() => {
    const total = grievanceRecords.length;
    const openCount = grievanceRecords.filter((r) => r.status === "Open").length;
    const closedCount = grievanceRecords.filter((r) => r.status === "Closed").length;
    const rate = total > 0 ? Math.round((closedCount / total) * 100) : 100;
    return { total, openCount, closedCount, rate };
  }, [grievanceRecords]);

  // Incident KPIs
  const incidentStats = useMemo(() => {
    const total = incidentRecords.length;
    const openCount = incidentRecords.filter((r) => r.status === "Open").length;
    const closedCount = incidentRecords.filter((r) => r.status === "Closed").length;
    const nearMissCount = incidentRecords.filter((r) => r.incidentType === "Near Miss").length;
    return { total, openCount, closedCount, nearMissCount };
  }, [incidentRecords]);

  // PPE KPIs
  const ppeStats = useMemo(() => {
    const total = ppeRecords.length;
    const newCount = ppeRecords.filter((r) => r.issueCondition === "New").length;
    const signedCount = ppeRecords.filter((r) => r.receiverSig !== "Pending").length;
    const signedRate = total > 0 ? Math.round((signedCount / total) * 100) : 100;
    return { total, newCount, signedCount, signedRate };
  }, [ppeRecords]);

  // OHS KPIs
  const ohsStats = useMemo(() => {
    const total = ohsRecords.length;
    const compliantCount = ohsRecords.filter((r) => r.compliance === "Yes").length;
    const highRiskCount = ohsRecords.filter((r) => r.riskLevel === "High").length;
    const openCapaCount = ohsRecords.filter((r) => r.status === "Open").length;
    const complianceRate = total > 0 ? Math.round((compliantCount / total) * 100) : 100;
    return { total, compliantCount, highRiskCount, openCapaCount, complianceRate };
  }, [ohsRecords]);

  // First Aid KPIs
  const firstAidStats = useMemo(() => {
    const total = firstAidRecords.length;
    const signedCount = firstAidRecords.filter((r) => r.receiverSignature !== "Pending").length;
    const closedCount = firstAidRecords.filter((r) => r.status === "Closed").length;
    const signedRate = total > 0 ? Math.round((signedCount / total) * 100) : 100;
    return { total, signedCount, closedCount, signedRate };
  }, [firstAidRecords]);

  // Fire Extinguisher KPIs
  const fireExtinguisherStats = useMemo(() => {
    const total = fireExtinguisherRecords.length;
    const sealOkCount = fireExtinguisherRecords.filter((r) => r.safetyPinSeal === "OK").length;
    const closedCount = fireExtinguisherRecords.filter((r) => r.status === "Closed").length;
    const openAlerts = fireExtinguisherRecords.filter((r) => r.status === "Open").length;
    const passRate = total > 0 ? Math.round((closedCount / total) * 100) : 100;
    return { total, sealOkCount, closedCount, openAlerts, passRate };
  }, [fireExtinguisherRecords]);

  // Stakeholder Tracker KPIs
  const stakeholderTrackerStats = useMemo(() => {
    const total = stakeholderTrackerRecords.length;
    const closedCount = stakeholderTrackerRecords.filter((r) => r.status === "Closed").length;
    const openCount = stakeholderTrackerRecords.filter((r) => r.status === "Open").length;
    const resolutionRate = total > 0 ? Math.round((closedCount / total) * 100) : 100;
    return { total, closedCount, openCount, resolutionRate };
  }, [stakeholderTrackerRecords]);

  // Annual SE Tracker KPIs & Column Totals
  const annualSeStats = useMemo(() => {
    let totalPlanned = 0;
    let totalCompleted = 0;

    const totalsObj = {
      aprP: 0, aprC: 0,
      mayP: 0, mayC: 0,
      junP: 0, junC: 0,
      julP: 0, julC: 0,
      augP: 0, augC: 0,
      septP: 0, septC: 0,
      octP: 0, octC: 0,
      novP: 0, novC: 0,
      decP: 0, decC: 0,
      janP: 0, janC: 0,
      febP: 0, febC: 0,
      marP: 0, marC: 0,
    };

    annualSeTrackerRecords.forEach((r) => {
      totalsObj.aprP += r.apr.planned; totalsObj.aprC += r.apr.completed;
      totalsObj.mayP += r.may.planned; totalsObj.mayC += r.may.completed;
      totalsObj.junP += r.jun.planned; totalsObj.junC += r.jun.completed;
      totalsObj.julP += r.jul.planned; totalsObj.julC += r.jul.completed;
      totalsObj.augP += r.aug.planned; totalsObj.augC += r.aug.completed;
      totalsObj.septP += r.sept.planned; totalsObj.septC += r.sept.completed;
      totalsObj.octP += r.oct.planned; totalsObj.octC += r.oct.completed;
      totalsObj.novP += r.nov.planned; totalsObj.novC += r.nov.completed;
      totalsObj.decP += r.dec.planned; totalsObj.decC += r.dec.completed;
      totalsObj.janP += r.jan.planned; totalsObj.janC += r.jan.completed;
      totalsObj.febP += r.feb.planned; totalsObj.febC += r.feb.completed;
      totalsObj.marP += r.mar.planned; totalsObj.marC += r.mar.completed;

      const pSum =
        r.apr.planned + r.may.planned + r.jun.planned + r.jul.planned +
        r.aug.planned + r.sept.planned + r.oct.planned + r.nov.planned +
        r.dec.planned + r.jan.planned + r.feb.planned + r.mar.planned;

      const cSum =
        r.apr.completed + r.may.completed + r.jun.completed + r.jul.completed +
        r.aug.completed + r.sept.completed + r.oct.completed + r.nov.completed +
        r.dec.completed + r.jan.completed + r.feb.completed + r.mar.completed;

      totalPlanned += pSum;
      totalCompleted += cSum;
    });

    const completionRate = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 100;

    return { totalPlanned, totalCompleted, completionRate, totalsObj };
  }, [annualSeTrackerRecords]);

  const toggleStatus = (id: string, current: "Open" | "Closed") => {
    const next: "Open" | "Closed" = current === "Open" ? "Closed" : "Open";
    if (onStatusChange) {
      onStatusChange(id, next);
    } else {
      setLocalRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: next } : r)),
      );
    }
    toast.success(`Record status updated to ${next}`);
  };

  const handleExport = () => {
    if (activeRegister === "grievance") {
      const exportRows = filteredGrievances.map((r) => ({
        sNo: r.sNo,
        dateOfEntry: r.dateOfEntry,
        empId: r.empId,
        empName: r.empName,
        employeeStatus: r.employeeStatus,
        grievancesCameThrough: r.grievanceChannel,
        natureOfIssue: r.natureOfIssue,
        department: r.department,
        resolutionGiven: r.resolutionGiven,
        status: r.status,
      }));

      exportToXlsx(
        `grievance-register-${new Date().toISOString().slice(0, 10)}`,
        [
          { key: "sNo", header: "S-No" },
          { key: "dateOfEntry", header: "Date of Entry" },
          { key: "empId", header: "Emp-Id" },
          { key: "empName", header: "Emp-Name" },
          { key: "employeeStatus", header: "Employee Status (Company/Contract Roll)" },
          { key: "grievancesCameThrough", header: "Grievances came through" },
          { key: "natureOfIssue", header: "Nature of Issue" },
          { key: "department", header: "Department" },
          { key: "resolutionGiven", header: "Clarification/Resolution given" },
          { key: "status", header: "Resolved (Open / Closed)" },
        ],
        exportRows,
        "Grievance Register",
      );

      toast.success("Grievance Register Exported", {
        description: `${exportRows.length} records exported to Excel.`,
      });
    } else if (activeRegister === "incident") {
      const exportRows = filteredIncidents.map((r) => ({
        sNo: r.sNo,
        dateTimeOfIncident: r.dateTimeOfIncident,
        locationWorkArea: r.locationWorkArea,
        incidentType: r.incidentType,
        detailsDescription: r.detailsDescription,
        personsInvolved: r.personsInvolved,
        natureOfInjuryDamage: r.natureOfInjuryDamage,
        immediateActionTaken: r.immediateActionTaken,
        reportedBy: r.reportedBy,
        safetyOfficerRemarks: r.safetyOfficerRemarks,
        capaDescription: r.capaDescription,
        closureDate: r.closureDate,
        status: r.status,
      }));

      exportToXlsx(
        `ohs-incident-register-${new Date().toISOString().slice(0, 10)}`,
        [
          { key: "sNo", header: "Sr. No" },
          { key: "dateTimeOfIncident", header: "Date & Time of Incident" },
          { key: "locationWorkArea", header: "Location / Work Area" },
          { key: "incidentType", header: "Type (Accident / Near Miss / Dangerous Occurrence)" },
          { key: "detailsDescription", header: "Details of Incident / Description" },
          { key: "personsInvolved", header: "Name(s) of Injured / Persons Involved" },
          { key: "natureOfInjuryDamage", header: "Nature of Injury / Damage" },
          { key: "immediateActionTaken", header: "Immediate Action Taken" },
          { key: "reportedBy", header: "Reported By (Name & Designation)" },
          { key: "safetyOfficerRemarks", header: "Supervisor / Safety Officer Remarks" },
          { key: "capaDescription", header: "Corrective & Preventive Action (CAPA)" },
          { key: "closureDate", header: "Closure Date" },
        ],
        exportRows,
        "OHS Incident Register",
      );

      toast.success("OH&S Incident Register Exported", {
        description: `${exportRows.length} incident records exported to Excel.`,
      });
    } else if (activeRegister === "facility_safety") {
      const exportRows = filteredPpeRecords.map((r) => ({
        sNo: r.sNo,
        date: r.date,
        employeeName: r.employeeName,
        empId: r.empId,
        designation: r.designation,
        contractorDepartment: r.contractorDepartment,
        typeOfPpeIssued: r.typeOfPpeIssued,
        quantityIssued: r.quantityIssued,
        issueCondition: r.issueCondition,
        receiverSig: r.receiverSig,
        issuedBy: r.issuedBy,
        remarks: r.remarks,
      }));

      exportToXlsx(
        `ppe-safety-audit-register-${new Date().toISOString().slice(0, 10)}`,
        [
          { key: "sNo", header: "Sr. No." },
          { key: "date", header: "Date" },
          { key: "employeeName", header: "Employee Name" },
          { key: "empId", header: "Emp ID" },
          { key: "designation", header: "Designation" },
          { key: "contractorDepartment", header: "Contractor / Department" },
          { key: "typeOfPpeIssued", header: "Type of PPE Issued" },
          { key: "quantityIssued", header: "Quantity Issued" },
          { key: "issueCondition", header: "Issue Condition (New/Used)" },
          { key: "receiverSig", header: "Receiver Sig" },
          { key: "issuedBy", header: "Issued By (Name & Designation)" },
          { key: "remarks", header: "Remarks" },
        ],
        exportRows,
        "PPE & Safety Audit",
      );

      toast.success("PPE & Safety Audit Register Exported", {
        description: `${exportRows.length} PPE issue records exported to Excel.`,
      });
    } else if (activeRegister === "stakeholder") {
      const exportRows = filteredOhsRecords.map((r) => ({
        sNo: r.sNo,
        inspectionCategory: r.inspectionCategory,
        checkpointDescription: r.checkpointDescription,
        compliance: r.compliance,
        observationRemarks: r.observationRemarks,
        riskLevel: r.riskLevel,
        correctiveAction: r.correctiveAction,
        responsiblePerson: r.responsiblePerson,
        targetDate: r.targetDate,
        status: r.status,
        inspectorName: r.inspectorName,
      }));

      exportToXlsx(
        `ohs-inspection-register-${new Date().toISOString().slice(0, 10)}`,
        [
          { key: "sNo", header: "Sr No" },
          { key: "inspectionCategory", header: "Inspection Category" },
          { key: "checkpointDescription", header: "Checkpoint / Description" },
          { key: "compliance", header: "Compliance (Yes/No)" },
          { key: "observationRemarks", header: "Observation / Remarks" },
          { key: "riskLevel", header: "Risk Level (Low/Medium/High)" },
          { key: "correctiveAction", header: "Corrective Action Required" },
          { key: "responsiblePerson", header: "Responsible Person" },
          { key: "targetDate", header: "Target Date" },
          { key: "status", header: "Status" },
          { key: "inspectorName", header: "Inspector Name" },
        ],
        exportRows,
        "OHS Register",
      );

      toast.success("OHS Inspection Register Exported", {
        description: `${exportRows.length} OHS checkpoint records exported to Excel.`,
      });
    } else if (activeRegister === "first_aid") {
      const exportRows = filteredFirstAidRecords.map((r) => ({
        sNo: r.sNo,
        dateUsed: r.dateUsed,
        employeeName: r.employeeName,
        empId: r.empId,
        designation: r.designation,
        contractorDepartment: r.contractorDepartment,
        injuryDescription: r.injuryDescription,
        typeOfAidGiven: r.typeOfAidGiven,
        materialsUsed: r.materialsUsed,
        receiverSignature: r.receiverSignature,
        issuedBy: r.issuedBy,
        remarks: r.remarks,
      }));

      exportToXlsx(
        `first-aid-register-${new Date().toISOString().slice(0, 10)}`,
        [
          { key: "sNo", header: "Sr. No." },
          { key: "dateUsed", header: "Date used" },
          { key: "employeeName", header: "Employee Name" },
          { key: "empId", header: "Emp ID" },
          { key: "designation", header: "Designation" },
          { key: "contractorDepartment", header: "Contractor / Department" },
          { key: "injuryDescription", header: "Injury Description" },
          { key: "typeOfAidGiven", header: "Type of Aid given" },
          { key: "materialsUsed", header: "Materials used" },
          { key: "receiverSignature", header: "Receiver Signature" },
          { key: "issuedBy", header: "Issued By (Name & Sign)" },
          { key: "remarks", header: "Remarks" },
        ],
        exportRows,
        "First Aid Register",
      );

      toast.success("First Aid Register Exported", {
        description: `${exportRows.length} first aid treatment records exported to Excel.`,
      });
    } else if (activeRegister === "fire_extinguisher") {
      const exportRows = filteredFireExtinguisherRecords.map((r) => ({
        sNo: r.sNo,
        location: r.location,
        extinguisherType: r.extinguisherType,
        capacity: r.capacity,
        makeIdNo: r.makeIdNo,
        safetyPinSeal: r.safetyPinSeal,
        physicalCondition: r.physicalCondition,
        hoseNozzleCondition: r.hoseNozzleCondition,
        mountingAccessibility: r.mountingAccessibility,
        lastRefillDate: r.lastRefillDate,
        nextDueDate: r.nextDueDate,
        inspectionDate: r.inspectionDate,
        inspectedBy: r.inspectedBy,
        remarks: r.remarks,
      }));

      exportToXlsx(
        `fire-extinguisher-checklist-${new Date().toISOString().slice(0, 10)}`,
        [
          { key: "sNo", header: "Sr. No." },
          { key: "location", header: "Location" },
          { key: "extinguisherType", header: "Extinguisher Type (ABC/CO2/Water/Foam)" },
          { key: "capacity", header: "Capacity" },
          { key: "makeIdNo", header: "Make / ID No." },
          { key: "safetyPinSeal", header: "Safety Pin & Seal (OK/Not OK)" },
          { key: "physicalCondition", header: "Physical Condition (OK/Damaged)" },
          { key: "hoseNozzleCondition", header: "Hose / Nozzle Condition" },
          { key: "mountingAccessibility", header: "Mounting / Accessibility" },
          { key: "lastRefillDate", header: "Last Refill Date" },
          { key: "nextDueDate", header: "Next Due Date" },
          { key: "inspectionDate", header: "Inspection Date" },
          { key: "inspectedBy", header: "Inspected By" },
          { key: "remarks", header: "Remarks" },
        ],
        exportRows,
        "Fire Extinguisher Checklist",
      );

      toast.success("Fire Extinguisher Checklist Exported", {
        description: `${exportRows.length} fire extinguisher inspection records exported to Excel.`,
      });
    } else if (activeRegister === "stakeholder_tracker") {
      const exportRows = filteredStakeholderTrackerRecords.map((r) => ({
        sNo: r.sNo,
        dateOfActionTaken: r.dateOfActionTaken,
        recordingPerson: r.recordingPerson,
        detailsOfActionTaken: r.detailsOfActionTaken,
        remarks: r.remarks,
        status: r.status,
      }));

      exportToXlsx(
        `stakeholder-management-tracker-${new Date().toISOString().slice(0, 10)}`,
        [
          { key: "sNo", header: "S-No" },
          { key: "dateOfActionTaken", header: "Date of Action Taken / Communication" },
          { key: "recordingPerson", header: "Name of Recording Person" },
          { key: "detailsOfActionTaken", header: "Details of Action Taken" },
          { key: "remarks", header: "Remarks" },
          { key: "status", header: "Status (Open / Closed)" },
        ],
        exportRows,
        "Stakeholder Tracker",
      );

      toast.success("Stakeholder Management Tracker Exported", {
        description: `${exportRows.length} stakeholder tracker records exported to Excel.`,
      });
    } else if (activeRegister === "annual_se_tracker") {
      const exportRows = filteredAnnualSeTrackerRecords.map((r) => ({
        sNo: r.sNo,
        stakeholderActivity: r.stakeholderActivity,
        aprP: r.apr.planned, aprC: r.apr.completed,
        mayP: r.may.planned, mayC: r.may.completed,
        junP: r.jun.planned, junC: r.jun.completed,
        julP: r.jul.planned, julC: r.jul.completed,
        augP: r.aug.planned, augC: r.aug.completed,
        septP: r.sept.planned, septC: r.sept.completed,
        octP: r.oct.planned, octC: r.oct.completed,
        novP: r.nov.planned, novC: r.nov.completed,
        decP: r.dec.planned, decC: r.dec.completed,
        janP: r.jan.planned, janC: r.jan.completed,
        febP: r.feb.planned, febC: r.feb.completed,
        marP: r.mar.planned, marC: r.mar.completed,
        remarks: r.remarks,
        status: r.status,
      }));

      exportToXlsx(
        `annual-se-tracker-${new Date().toISOString().slice(0, 10)}`,
        [
          { key: "sNo", header: "S-No" },
          { key: "stakeholderActivity", header: "Stakeholder / Activity" },
          { key: "aprP", header: "Apr (P)" }, { key: "aprC", header: "Apr (C)" },
          { key: "mayP", header: "May (P)" }, { key: "mayC", header: "May (C)" },
          { key: "junP", header: "Jun (P)" }, { key: "junC", header: "Jun (C)" },
          { key: "julP", header: "Jul (P)" }, { key: "julC", header: "Jul (C)" },
          { key: "augP", header: "Aug (P)" }, { key: "augC", header: "Aug (C)" },
          { key: "septP", header: "Sept (P)" }, { key: "septC", header: "Sept (C)" },
          { key: "octP", header: "Oct (P)" }, { key: "octC", header: "Oct (C)" },
          { key: "novP", header: "Nov (P)" }, { key: "novC", header: "Nov (C)" },
          { key: "decP", header: "Dec (P)" }, { key: "decC", header: "Dec (C)" },
          { key: "janP", header: "Jan (P)" }, { key: "janC", header: "Jan (C)" },
          { key: "febP", header: "Feb (P)" }, { key: "febC", header: "Feb (C)" },
          { key: "marP", header: "Mar (P)" }, { key: "marC", header: "Mar (C)" },
          { key: "remarks", header: "Remarks" },
          { key: "status", header: "Status" },
        ],
        exportRows,
        "Annual SE Tracker",
      );

      toast.success("Annual SE Tracker Exported", {
        description: `${exportRows.length} annual SE schedules exported to Excel.`,
      });
    }
  };

  const activeFilteredList =
    activeRegister === "grievance"
      ? filteredGrievances
      : activeRegister === "incident"
      ? filteredIncidents
      : activeRegister === "facility_safety"
      ? filteredPpeRecords
      : activeRegister === "stakeholder"
      ? filteredOhsRecords
      : activeRegister === "first_aid"
      ? filteredFirstAidRecords
      : activeRegister === "fire_extinguisher"
      ? filteredFireExtinguisherRecords
      : activeRegister === "stakeholder_tracker"
      ? filteredStakeholderTrackerRecords
      : filteredAnnualSeTrackerRecords;

  const totalPages = Math.ceil(activeFilteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return activeFilteredList.slice(start, start + pageSize);
  }, [activeFilteredList, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar: Segmented Register Switcher & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
        <Segmented<SocialRegisterType>
          ariaLabel="Social Register Selection"
          size="md"
          emphasis
          value={activeRegister}
          onChange={(v) => {
            setActiveRegister(v);
            setCurrentPage(1);
          }}
          options={[
            { key: "grievance", label: "Grievance Register (10 Columns)", Icon: FileText },
            { key: "incident", label: "OH&S Incident Register (12 Columns)", Icon: ShieldAlert },
            { key: "facility_safety", label: "PPE & Safety Audit (12 Columns)", Icon: ShieldCheck },
            { key: "stakeholder", label: "OHS (11 Columns)", Icon: Activity },
            { key: "first_aid", label: "First Aid Register (12 Columns)", Icon: HeartPulse },
            { key: "fire_extinguisher", label: "Fire Extinguisher Checklist (14 Columns)", Icon: Flame },
            { key: "stakeholder_tracker", label: "Stakeholder Management Tracker", Icon: Users },
            { key: "annual_se_tracker", label: "Annual SE Tracker", Icon: Calendar },
          ]}
        />

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 text-[12.5px]"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" /> Export Excel
          </Button>
          {onNewRecordClick && (
            <Button
              size="sm"
              className="h-9 gap-1.5 font-bold text-[12.5px] shadow-sm px-4"
              onClick={onNewRecordClick}
            >
              <Plus className="h-4 w-4" /> + Log Entry
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards based on active register */}
      {activeRegister === "grievance" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 font-bold">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Grievances
              </div>
              <div className="text-[20px] font-extrabold text-foreground num">
                {grievanceStats.total}
              </div>
              <div className="text-[11px] text-muted-foreground">10 Table Columns</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Open Grievances
              </div>
              <div className="text-[20px] font-extrabold text-amber-600 num">
                {grievanceStats.openCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Clarifications pending</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Resolved & Closed
              </div>
              <div className="text-[20px] font-extrabold text-emerald-600 num">
                {grievanceStats.closedCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Resolutions provided</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Resolution SLA
              </div>
              <div className="text-[20px] font-extrabold text-primary num">
                {grievanceStats.rate}%
              </div>
              <div className="text-[11px] text-muted-foreground">Employee Welfare Index</div>
            </div>
          </div>
        </div>
      ) : activeRegister === "incident" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive font-bold">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                OH&S Incident Logs
              </div>
              <div className="text-[20px] font-extrabold text-foreground num">
                {incidentStats.total}
              </div>
              <div className="text-[11px] text-muted-foreground">12 Table Columns</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Near Miss Cases
              </div>
              <div className="text-[20px] font-extrabold text-amber-600 num">
                {incidentStats.nearMissCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Proactive hazard alerts</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                CAPA Closed
              </div>
              <div className="text-[20px] font-extrabold text-emerald-600 num">
                {incidentStats.closedCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Preventive actions completed</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Open Incident CAPAs
              </div>
              <div className="text-[20px] font-extrabold text-orange-600 num">
                {incidentStats.openCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Target dates tracked</div>
            </div>
          </div>
        </div>
      ) : activeRegister === "facility_safety" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total PPE Issued
              </div>
              <div className="text-[20px] font-extrabold text-foreground num">
                {ppeStats.total}
              </div>
              <div className="text-[11px] text-muted-foreground">12 Table Columns</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 font-bold">
              <FileCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                New PPE Issued
              </div>
              <div className="text-[20px] font-extrabold text-blue-600 num">
                {ppeStats.newCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Fresh safety gear distribution</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Signed Receipts
              </div>
              <div className="text-[20px] font-extrabold text-purple-600 num">
                {ppeStats.signedCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Worker acknowledgements</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Receipt Rate
              </div>
              <div className="text-[20px] font-extrabold text-primary num">
                {ppeStats.signedRate}%
              </div>
              <div className="text-[11px] text-muted-foreground">Audit Compliance Level</div>
            </div>
          </div>
        </div>
      ) : activeRegister === "stakeholder" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 font-bold">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                OHS Checkpoints
              </div>
              <div className="text-[20px] font-extrabold text-foreground num">
                {ohsStats.total}
              </div>
              <div className="text-[11px] text-muted-foreground">11 Table Columns</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Compliant Checks
              </div>
              <div className="text-[20px] font-extrabold text-emerald-600 num">
                {ohsStats.compliantCount}{" "}
                <span className="text-[12px] font-medium text-emerald-600">
                  ({ohsStats.complianceRate}%)
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">Safety rules satisfied</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive font-bold">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                High Risk Actions
              </div>
              <div className="text-[20px] font-extrabold text-destructive num">
                {ohsStats.highRiskCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Immediate priority CAPA</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Open CAPAs
              </div>
              <div className="text-[20px] font-extrabold text-amber-600 num">
                {ohsStats.openCapaCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Action targets tracked</div>
            </div>
          </div>
        </div>
      ) : activeRegister === "first_aid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 font-bold">
              <HeartPulse className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                First Aid Treatments
              </div>
              <div className="text-[20px] font-extrabold text-foreground num">
                {firstAidStats.total}
              </div>
              <div className="text-[11px] text-muted-foreground">12 Table Columns</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Cases Resolved
              </div>
              <div className="text-[20px] font-extrabold text-emerald-600 num">
                {firstAidStats.closedCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Worker rest & recovery</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 font-bold">
              <FileCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Signed Receipts
              </div>
              <div className="text-[20px] font-extrabold text-purple-600 num">
                {firstAidStats.signedCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Worker signatures</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Signature SLA
              </div>
              <div className="text-[20px] font-extrabold text-primary num">
                {firstAidStats.signedRate}%
              </div>
              <div className="text-[11px] text-muted-foreground">Medical Register Index</div>
            </div>
          </div>
        </div>
      ) : activeRegister === "fire_extinguisher" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold">
              <Flame className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Extinguishers Inspected
              </div>
              <div className="text-[20px] font-extrabold text-foreground num">
                {fireExtinguisherStats.total}
              </div>
              <div className="text-[11px] text-muted-foreground">14 Table Columns</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Seals OK
              </div>
              <div className="text-[20px] font-extrabold text-emerald-600 num">
                {fireExtinguisherStats.sealOkCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Tamper pin verified</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive font-bold">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Refill / Repair Open
              </div>
              <div className="text-[20px] font-extrabold text-destructive num">
                {fireExtinguisherStats.openAlerts}
              </div>
              <div className="text-[11px] text-muted-foreground">Defect action required</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pass Compliance Rate
              </div>
              <div className="text-[20px] font-extrabold text-primary num">
                {fireExtinguisherStats.passRate}%
              </div>
              <div className="text-[11px] text-muted-foreground">Fire Safety Index</div>
            </div>
          </div>
        </div>
      ) : activeRegister === "stakeholder_tracker" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 font-bold">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Stakeholder Actions
              </div>
              <div className="text-[20px] font-extrabold text-foreground num">
                {stakeholderTrackerStats.total}
              </div>
              <div className="text-[11px] text-muted-foreground">Recorded Consultations</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Actions Closed
              </div>
              <div className="text-[20px] font-extrabold text-emerald-600 num">
                {stakeholderTrackerStats.closedCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Commitments fulfilled</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Actions Open
              </div>
              <div className="text-[20px] font-extrabold text-amber-600 num">
                {stakeholderTrackerStats.openCount}
              </div>
              <div className="text-[11px] text-muted-foreground">Follow-up pending</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Resolution Rate
              </div>
              <div className="text-[20px] font-extrabold text-primary num">
                {stakeholderTrackerStats.resolutionRate}%
              </div>
              <div className="text-[11px] text-muted-foreground">Engagement Index</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 font-bold">
              <Calendar className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Planned SEs
              </div>
              <div className="text-[20px] font-extrabold text-foreground num">
                {annualSeStats.totalPlanned}
              </div>
              <div className="text-[11px] text-muted-foreground">Apr-Mar Annual Schedule</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Completed SEs
              </div>
              <div className="text-[20px] font-extrabold text-emerald-600 num">
                {annualSeStats.totalCompleted}
              </div>
              <div className="text-[11px] text-muted-foreground">YTD Executed SE Events</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 font-bold">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                FY Completion Rate
              </div>
              <div className="text-[20px] font-extrabold text-purple-600 num">
                {annualSeStats.completionRate}%
              </div>
              <div className="text-[11px] text-muted-foreground">Annual SEP Progress</div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Active Schedules
              </div>
              <div className="text-[20px] font-extrabold text-primary num">
                {annualSeTrackerRecords.length}
              </div>
              <div className="text-[11px] text-muted-foreground">27 Table Columns</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Category, Checkpoint, Inspector..."
              className="pl-8 h-9 text-[12.5px] bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 w-[140px] text-[12.5px] bg-background font-medium">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12.5px]">
                All Status
              </SelectItem>
              <SelectItem value="Closed" className="text-[12.5px] text-emerald-600 font-bold">
                🟢 Closed / Compliant
              </SelectItem>
              <SelectItem value="Open" className="text-[12.5px] text-amber-600 font-bold">
                🟠 Open / Pending Action
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 1. Grievance Register Table */}
      {activeRegister === "grievance" && (
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-border bg-orange-500/10 text-[11.5px] font-bold text-foreground uppercase tracking-wider">
                  <th className="px-3.5 py-3 text-center w-14 border-r border-border/50">S-No</th>
                  <th className="px-3.5 py-3 whitespace-nowrap border-r border-border/50">Date of Entry</th>
                  <th className="px-3.5 py-3 whitespace-nowrap border-r border-border/50">Emp-Id</th>
                  <th className="px-3.5 py-3 whitespace-nowrap border-r border-border/50">Emp-Name</th>
                  <th className="px-3.5 py-3 border-r border-border/50">
                    Employee Status <br />
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Company Roll / Contract Roll
                    </span>
                  </th>
                  <th className="px-3.5 py-3 border-r border-border/50">Grievances came through</th>
                  <th className="px-3.5 py-3 border-r border-border/50">Nature of Issue</th>
                  <th className="px-3.5 py-3 border-r border-border/50">Department</th>
                  <th className="px-4 py-3 border-r border-border/50 min-w-[220px]">
                    Clarification / Resolution given
                  </th>
                  <th className="px-3.5 py-3 text-center whitespace-nowrap">
                    Resolved <br />
                    <span className="text-[10px] text-muted-foreground font-normal">(Open / Closed)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                      No grievance records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  (paginatedList as SocialGrievanceRecord[]).map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3.5 py-3 text-center font-bold text-muted-foreground border-r border-border/40 num">
                        {r.sNo}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap font-medium text-foreground border-r border-border/40 num">
                        {r.dateOfEntry}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap border-r border-border/40">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-[11.5px] font-bold text-foreground">
                          {r.empId}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 font-bold text-foreground border-r border-border/40">
                        {r.empName}
                      </td>
                      <td className="px-3.5 py-3 border-r border-border/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                            r.employeeStatus === "Company Roll"
                              ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                              : "bg-purple-500/10 text-purple-600 border border-purple-500/20",
                          )}
                        >
                          {r.employeeStatus}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 font-medium text-foreground border-r border-border/40">
                        {r.grievanceChannel}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-foreground border-r border-border/40">
                        {r.natureOfIssue}
                      </td>
                      <td className="px-3.5 py-3 text-muted-foreground border-r border-border/40">
                        {r.department}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground border-r border-border/40 max-w-[280px]">
                        {r.resolutionGiven}
                      </td>
                      <td className="px-3.5 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleStatus(r.id, r.status)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-transform active:scale-95 cursor-pointer",
                            r.status === "Closed"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-amber-500/12 text-amber-600 border border-amber-500/30",
                          )}
                        >
                          {r.status === "Closed" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Closed
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" /> Open
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. OH&S Incident Register Table */}
      {activeRegister === "incident" && (
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-border bg-destructive/10 text-[11px] font-bold text-foreground uppercase tracking-wider">
                  <th className="px-3 py-3 text-center w-12 border-r border-border/50">Sr. No</th>
                  <th className="px-3 py-3 whitespace-nowrap border-r border-border/50">Date & Time of Incident</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[160px]">Location / Work Area</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[140px]">
                    Type <br />
                    <span className="text-[9.5px] text-muted-foreground font-normal">
                      Accident / Near Miss / Occurrence
                    </span>
                  </th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[220px]">
                    Details of Incident / Description
                  </th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[150px]">
                    Name(s) of Injured / Persons Involved
                  </th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[150px]">Nature of Injury / Damage</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[160px]">Immediate Action Taken</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[150px]">
                    Reported By <br />
                    <span className="text-[9.5px] text-muted-foreground font-normal">(Name & Designation)</span>
                  </th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[160px]">
                    Supervisor / Safety Officer Remarks
                  </th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[200px]">
                    Corrective & Preventive Action (CAPA)
                  </th>
                  <th className="px-3 py-3 text-center whitespace-nowrap">Closure Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center text-muted-foreground">
                      No incident records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  (paginatedList as SocialIncidentRecord[]).map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-3 text-center font-bold text-muted-foreground border-r border-border/40 num">
                        {r.sNo}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-medium text-foreground border-r border-border/40 num">
                        {r.dateTimeOfIncident}
                      </td>
                      <td className="px-3 py-3 font-semibold text-foreground border-r border-border/40">
                        {r.locationWorkArea}
                      </td>
                      <td className="px-3 py-3 border-r border-border/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                            r.incidentType === "Accident"
                              ? "bg-destructive/12 text-destructive border border-destructive/30"
                              : r.incidentType === "Near Miss"
                              ? "bg-amber-500/12 text-amber-600 border border-amber-500/30"
                              : "bg-blue-500/12 text-blue-600 border border-blue-500/30",
                          )}
                        >
                          {r.incidentType}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-muted-foreground border-r border-border/40">
                        {r.detailsDescription}
                      </td>
                      <td className="px-3 py-3 font-medium text-foreground border-r border-border/40">
                        {r.personsInvolved}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground border-r border-border/40">
                        {r.natureOfInjuryDamage}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground border-r border-border/40">
                        {r.immediateActionTaken}
                      </td>
                      <td className="px-3 py-3 font-medium text-foreground border-r border-border/40">
                        {r.reportedBy}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground border-r border-border/40">
                        {r.safetyOfficerRemarks}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-foreground border-r border-border/40">
                        {r.capaDescription}
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleStatus(r.id, r.status)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-transform active:scale-95 cursor-pointer",
                            r.status === "Closed"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-amber-500/12 text-amber-600 border border-amber-500/30",
                          )}
                        >
                          {r.status === "Closed" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> {r.closureDate}
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" /> {r.closureDate}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PPE & Safety Audit Table */}
      {activeRegister === "facility_safety" && (
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-border bg-emerald-500/10 text-[11px] font-bold text-foreground uppercase tracking-wider">
                  <th className="px-3 py-3 text-center w-12 border-r border-border/50">Sr. No.</th>
                  <th className="px-3 py-3 whitespace-nowrap border-r border-border/50">Date</th>
                  <th className="px-3 py-3 whitespace-nowrap border-r border-border/50">Employee Name</th>
                  <th className="px-3 py-3 whitespace-nowrap border-r border-border/50">Emp ID</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[150px]">Designation</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[160px]">Contractor / Department</th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[200px]">Type of PPE Issued</th>
                  <th className="px-3 py-3 border-r border-border/50 whitespace-nowrap">Quantity Issued</th>
                  <th className="px-3 py-3 border-r border-border/50 whitespace-nowrap">
                    Issue Condition <br />
                    <span className="text-[9.5px] text-muted-foreground font-normal">(New/Used)</span>
                  </th>
                  <th className="px-3 py-3 border-r border-border/50 text-center whitespace-nowrap">Receiver Sig</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[160px]">
                    Issued By <br />
                    <span className="text-[9.5px] text-muted-foreground font-normal">(Name & Designation)</span>
                  </th>
                  <th className="px-3.5 py-3 min-w-[180px]">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center text-muted-foreground">
                      No PPE & Safety Audit records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  (paginatedList as SocialPpeRecord[]).map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-3 text-center font-bold text-muted-foreground border-r border-border/40 num">
                        {r.sNo}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-medium text-foreground border-r border-border/40 num">
                        {r.date}
                      </td>
                      <td className="px-3 py-3 font-bold text-foreground border-r border-border/40">
                        {r.employeeName}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap border-r border-border/40">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-[11.5px] font-bold text-foreground">
                          {r.empId}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-foreground border-r border-border/40">
                        {r.designation}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground border-r border-border/40">
                        {r.contractorDepartment}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-foreground border-r border-border/40">
                        {r.typeOfPpeIssued}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-foreground border-r border-border/40 num">
                        {r.quantityIssued}
                      </td>
                      <td className="px-3 py-3 border-r border-border/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                            r.issueCondition === "New"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-purple-500/12 text-purple-600 border border-purple-500/30",
                          )}
                        >
                          {r.issueCondition}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center border-r border-border/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
                            r.receiverSig === "Digital Verified"
                              ? "bg-blue-500/12 text-blue-600 border border-blue-500/30"
                              : r.receiverSig === "Signed"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-amber-500/12 text-amber-600 border border-amber-500/30",
                          )}
                        >
                          {r.receiverSig}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-foreground border-r border-border/40">
                        {r.issuedBy}
                      </td>
                      <td className="px-3.5 py-3 text-muted-foreground">
                        {r.remarks}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. OHS Register Table */}
      {activeRegister === "stakeholder" && (
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-border bg-blue-500/10 text-[11px] font-bold text-foreground uppercase tracking-wider">
                  <th className="px-3 py-3 text-center w-12 border-r border-border/50">Sr No</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[170px]">Inspection Category</th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[220px]">Checkpoint / Description</th>
                  <th className="px-3 py-3 border-r border-border/50 text-center whitespace-nowrap">
                    Compliance <br />
                    <span className="text-[9.5px] text-muted-foreground font-normal">(Yes/No)</span>
                  </th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[200px]">Observation / Remarks</th>
                  <th className="px-3 py-3 border-r border-border/50 text-center whitespace-nowrap">
                    Risk Level <br />
                    <span className="text-[9.5px] text-muted-foreground font-normal">(Low/Medium/High)</span>
                  </th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[220px]">Corrective Action Required</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[150px]">Responsible Person</th>
                  <th className="px-3 py-3 border-r border-border/50 whitespace-nowrap">Target Date</th>
                  <th className="px-3 py-3 border-r border-border/50 text-center whitespace-nowrap">Status</th>
                  <th className="px-3.5 py-3 min-w-[160px]">Inspector Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-muted-foreground">
                      No OHS inspection records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  (paginatedList as SocialOhsRecord[]).map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-3 text-center font-bold text-muted-foreground border-r border-border/40 num">
                        {r.sNo}
                      </td>
                      <td className="px-3 py-3 font-bold text-foreground border-r border-border/40">
                        {r.inspectionCategory}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-foreground border-r border-border/40">
                        {r.checkpointDescription}
                      </td>
                      <td className="px-3 py-3 text-center border-r border-border/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
                            r.compliance === "Yes"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-destructive/12 text-destructive border border-destructive/30",
                          )}
                        >
                          {r.compliance === "Yes" ? "✅ Yes" : "❌ No"}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-muted-foreground border-r border-border/40">
                        {r.observationRemarks}
                      </td>
                      <td className="px-3 py-3 text-center border-r border-border/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
                            r.riskLevel === "High"
                              ? "bg-destructive/12 text-destructive border border-destructive/30"
                              : r.riskLevel === "Medium"
                              ? "bg-amber-500/12 text-amber-600 border border-amber-500/30"
                              : "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30",
                          )}
                        >
                          {r.riskLevel}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 font-medium text-foreground border-r border-border/40">
                        {r.correctiveAction}
                      </td>
                      <td className="px-3 py-3 font-medium text-foreground border-r border-border/40">
                        {r.responsiblePerson}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-mono text-muted-foreground border-r border-border/40 num">
                        {r.targetDate}
                      </td>
                      <td className="px-3 py-3 text-center border-r border-border/40">
                        <button
                          type="button"
                          onClick={() => toggleStatus(r.id, r.status)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold transition-transform active:scale-95 cursor-pointer",
                            r.status === "Closed"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-amber-500/12 text-amber-600 border border-amber-500/30",
                          )}
                        >
                          {r.status === "Closed" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Closed
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" /> Open
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-3.5 py-3 text-muted-foreground">
                        {r.inspectorName}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. First Aid Register Table */}
      {activeRegister === "first_aid" && (
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-border bg-red-500/10 text-[11px] font-bold text-foreground uppercase tracking-wider">
                  <th className="px-3 py-3 text-center w-12 border-r border-border/50">Sr. No.</th>
                  <th className="px-3 py-3 whitespace-nowrap border-r border-border/50">Date used</th>
                  <th className="px-3 py-3 whitespace-nowrap border-r border-border/50">Employee Name</th>
                  <th className="px-3 py-3 whitespace-nowrap border-r border-border/50">Emp ID</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[150px]">Designation</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[160px]">Contractor / Department</th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[200px]">Injury Description</th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[190px]">Type of Aid given</th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[200px]">Materials used</th>
                  <th className="px-3 py-3 border-r border-border/50 text-center whitespace-nowrap">Receiver Signature</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[170px]">
                    Issued By <br />
                    <span className="text-[9.5px] text-muted-foreground font-normal">(Name & Sign)</span>
                  </th>
                  <th className="px-3.5 py-3 min-w-[180px]">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center text-muted-foreground">
                      No first aid records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  (paginatedList as SocialFirstAidRecord[]).map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-3 text-center font-bold text-muted-foreground border-r border-border/40 num">
                        {r.sNo}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-medium text-foreground border-r border-border/40 num">
                        {r.dateUsed}
                      </td>
                      <td className="px-3 py-3 font-bold text-foreground border-r border-border/40">
                        {r.employeeName}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap border-r border-border/40">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-[11.5px] font-bold text-foreground">
                          {r.empId}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-foreground border-r border-border/40">
                        {r.designation}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground border-r border-border/40">
                        {r.contractorDepartment}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-foreground border-r border-border/40">
                        {r.injuryDescription}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-foreground border-r border-border/40">
                        {r.typeOfAidGiven}
                      </td>
                      <td className="px-3.5 py-3 text-muted-foreground border-r border-border/40">
                        {r.materialsUsed}
                      </td>
                      <td className="px-3 py-3 text-center border-r border-border/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
                            r.receiverSignature === "Digital Verified"
                              ? "bg-blue-500/12 text-blue-600 border border-blue-500/30"
                              : r.receiverSignature === "Signed"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-amber-500/12 text-amber-600 border border-amber-500/30",
                          )}
                        >
                          {r.receiverSignature}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-foreground border-r border-border/40">
                        {r.issuedBy}
                      </td>
                      <td className="px-3.5 py-3 text-muted-foreground">
                        {r.remarks}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Fire Extinguisher Checklist Table */}
      {activeRegister === "fire_extinguisher" && (
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-border bg-amber-500/10 text-[11px] font-bold text-foreground uppercase tracking-wider">
                  <th className="px-3 py-3 text-center w-12 border-r border-border/50">Sr. No.</th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[200px]">Location</th>
                  <th className="px-3 py-3 border-r border-border/50 min-w-[160px]">
                    Extinguisher Type <br />
                    <span className="text-[9.5px] text-muted-foreground font-normal">(ABC/CO2/Water/Foam)</span>
                  </th>
                  <th className="px-3 py-3 border-r border-border/50 whitespace-nowrap">Capacity</th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[170px]">Make / ID No.</th>
                  <th className="px-3 py-3 border-r border-border/50 text-center whitespace-nowrap">
                    Safety Pin & Seal <br />
                    <span className="text-[9.5px] text-muted-foreground font-normal">(OK/Not OK)</span>
                  </th>
                  <th className="px-3 py-3 border-r border-border/50 text-center whitespace-nowrap">
                    Physical Condition <br />
                    <span className="text-[9.5px] text-muted-foreground font-normal">(OK/Damaged)</span>
                  </th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[160px]">Hose / Nozzle Condition</th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[160px]">Mounting / Accessibility</th>
                  <th className="px-3 py-3 border-r border-border/50 whitespace-nowrap">Last Refill Date</th>
                  <th className="px-3 py-3 border-r border-border/50 whitespace-nowrap">Next Due Date</th>
                  <th className="px-3 py-3 border-r border-border/50 whitespace-nowrap">Inspection Date</th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[160px]">Inspected By</th>
                  <th className="px-3.5 py-3 min-w-[180px]">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-6 py-12 text-center text-muted-foreground">
                      No fire extinguisher records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  (paginatedList as SocialFireExtinguisherRecord[]).map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-3 text-center font-bold text-muted-foreground border-r border-border/40 num">
                        {r.sNo}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-foreground border-r border-border/40">
                        {r.location}
                      </td>
                      <td className="px-3 py-3 border-r border-border/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                            r.extinguisherType === "CO2"
                              ? "bg-blue-500/12 text-blue-600 border border-blue-500/30"
                              : r.extinguisherType === "ABC"
                              ? "bg-amber-500/12 text-amber-600 border border-amber-500/30"
                              : "bg-purple-500/12 text-purple-600 border border-purple-500/30",
                          )}
                        >
                          {r.extinguisherType}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-foreground border-r border-border/40 num">
                        {r.capacity}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap border-r border-border/40">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-[11.5px] font-bold text-foreground">
                          {r.makeIdNo}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center border-r border-border/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
                            r.safetyPinSeal === "OK"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-destructive/12 text-destructive border border-destructive/30",
                          )}
                        >
                          {r.safetyPinSeal === "OK" ? "✅ OK" : "❌ Not OK"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center border-r border-border/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
                            r.physicalCondition === "OK"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-destructive/12 text-destructive border border-destructive/30",
                          )}
                        >
                          {r.physicalCondition === "OK" ? "✅ OK" : "🔴 Damaged"}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 border-r border-border/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
                            r.hoseNozzleCondition === "OK"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-amber-500/12 text-amber-600 border border-amber-500/30",
                          )}
                        >
                          {r.hoseNozzleCondition}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 border-r border-border/40">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
                            r.mountingAccessibility === "OK"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-destructive/12 text-destructive border border-destructive/30",
                          )}
                        >
                          {r.mountingAccessibility}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-mono text-muted-foreground border-r border-border/40 num">
                        {r.lastRefillDate}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-mono font-bold text-foreground border-r border-border/40 num">
                        {r.nextDueDate}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap font-mono text-muted-foreground border-r border-border/40 num">
                        {r.inspectionDate}
                      </td>
                      <td className="px-3.5 py-3 font-medium text-foreground border-r border-border/40">
                        {r.inspectedBy}
                      </td>
                      <td className="px-3.5 py-3 text-muted-foreground">
                        {r.remarks}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Stakeholder Management Tracker Table */}
      {activeRegister === "stakeholder_tracker" && (
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-border bg-purple-500/10 text-[11px] font-bold text-foreground uppercase tracking-wider">
                  <th className="px-3.5 py-3 text-center w-14 border-r border-border/50">S-No</th>
                  <th className="px-3.5 py-3 whitespace-nowrap border-r border-border/50">
                    Date of Action Taken / Communication
                  </th>
                  <th className="px-3.5 py-3 border-r border-border/50 min-w-[180px]">
                    Name of Recording Person
                  </th>
                  <th className="px-4 py-3 border-r border-border/50 min-w-[280px]">
                    Details of Action Taken
                  </th>
                  <th className="px-4 py-3 border-r border-border/50 min-w-[240px]">Remarks</th>
                  <th className="px-3.5 py-3 text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No stakeholder tracker records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  (paginatedList as SocialStakeholderTrackerRecord[]).map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3.5 py-3 text-center font-bold text-muted-foreground border-r border-border/40 num">
                        {r.sNo}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap font-medium font-mono text-foreground border-r border-border/40 num">
                        {r.dateOfActionTaken}
                      </td>
                      <td className="px-3.5 py-3 font-bold text-foreground border-r border-border/40">
                        {r.recordingPerson}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground border-r border-border/40 max-w-[320px]">
                        {r.detailsOfActionTaken}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground border-r border-border/40 max-w-[280px]">
                        {r.remarks}
                      </td>
                      <td className="px-3.5 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleStatus(r.id, r.status)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-transform active:scale-95 cursor-pointer",
                            r.status === "Closed"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-amber-500/12 text-amber-600 border border-amber-500/30",
                          )}
                        >
                          {r.status === "Closed" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Closed
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" /> Open
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Annual SE Tracker Table (Matching Exact 27 Columns & Total Row from Reference Image) */}
      {activeRegister === "annual_se_tracker" && (
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11.5px]">
              <thead>
                <tr className="border-b border-border bg-blue-500/10 text-[10.5px] font-bold text-foreground uppercase tracking-wider">
                  <th className="px-3 py-2.5 text-center w-12 border-r border-border/50 sticky left-0 bg-blue-500/10 z-10">
                    S-No
                  </th>
                  <th className="px-3.5 py-2.5 border-r border-border/50 min-w-[200px] sticky left-12 bg-blue-500/10 z-10">
                    Stakeholder / Activity
                  </th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px]">Apr (P)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px] text-emerald-600">Apr (C)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px]">May (P)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px] text-emerald-600">May (C)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px]">Jun (P)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px] text-emerald-600">Jun (C)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px]">Jul (P)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px] text-emerald-600">Jul (C)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px]">Aug (P)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px] text-emerald-600">Aug (C)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px]">Sept (P)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px] text-emerald-600">Sept (C)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px]">Oct (P)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px] text-emerald-600">Oct (C)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px]">Nov (P)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px] text-emerald-600">Nov (C)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px]">Dec (P)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px] text-emerald-600">Dec (C)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px]">Jan (P)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px] text-emerald-600">Jan (C)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px]">Feb (P)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px] text-emerald-600">Feb (C)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px]">Mar (P)</th>
                  <th className="px-2 py-2.5 text-center border-r border-border/50 min-w-[55px] text-emerald-600">Mar (C)</th>
                  <th className="px-3.5 py-2.5 border-r border-border/50 min-w-[200px]">Remarks</th>
                  <th className="px-3 py-2.5 text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono text-[11px]">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={28} className="px-6 py-12 text-center text-muted-foreground font-sans">
                      No annual SE tracker records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  (paginatedList as SocialAnnualSeTrackerRecord[]).map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-2.5 text-center font-bold text-muted-foreground border-r border-border/40 sticky left-0 bg-card z-10">
                        {r.sNo}
                      </td>
                      <td className="px-3.5 py-2.5 font-bold font-sans text-foreground border-r border-border/40 sticky left-12 bg-card z-10">
                        {r.stakeholderActivity}
                      </td>
                      <td className="px-2 py-2.5 text-center font-medium text-foreground border-r border-border/40">{r.apr.planned}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-emerald-600 border-r border-border/40">{r.apr.completed}</td>
                      <td className="px-2 py-2.5 text-center font-medium text-foreground border-r border-border/40">{r.may.planned}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-emerald-600 border-r border-border/40">{r.may.completed}</td>
                      <td className="px-2 py-2.5 text-center font-medium text-foreground border-r border-border/40">{r.jun.planned}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-emerald-600 border-r border-border/40">{r.jun.completed}</td>
                      <td className="px-2 py-2.5 text-center font-medium text-foreground border-r border-border/40">{r.jul.planned}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-emerald-600 border-r border-border/40">{r.jul.completed}</td>
                      <td className="px-2 py-2.5 text-center font-medium text-foreground border-r border-border/40">{r.aug.planned}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-emerald-600 border-r border-border/40">{r.aug.completed}</td>
                      <td className="px-2 py-2.5 text-center font-medium text-foreground border-r border-border/40">{r.sept.planned}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-emerald-600 border-r border-border/40">{r.sept.completed}</td>
                      <td className="px-2 py-2.5 text-center font-medium text-foreground border-r border-border/40">{r.oct.planned}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-emerald-600 border-r border-border/40">{r.oct.completed}</td>
                      <td className="px-2 py-2.5 text-center font-medium text-foreground border-r border-border/40">{r.nov.planned}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-emerald-600 border-r border-border/40">{r.nov.completed}</td>
                      <td className="px-2 py-2.5 text-center font-medium text-foreground border-r border-border/40">{r.dec.planned}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-emerald-600 border-r border-border/40">{r.dec.completed}</td>
                      <td className="px-2 py-2.5 text-center font-medium text-foreground border-r border-border/40">{r.jan.planned}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-emerald-600 border-r border-border/40">{r.jan.completed}</td>
                      <td className="px-2 py-2.5 text-center font-medium text-foreground border-r border-border/40">{r.feb.planned}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-emerald-600 border-r border-border/40">{r.feb.completed}</td>
                      <td className="px-2 py-2.5 text-center font-medium text-foreground border-r border-border/40">{r.mar.planned}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-emerald-600 border-r border-border/40">{r.mar.completed}</td>
                      <td className="px-3.5 py-2.5 font-sans text-muted-foreground border-r border-border/40 max-w-[200px] truncate">{r.remarks}</td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap font-sans">
                        <button
                          type="button"
                          onClick={() => toggleStatus(r.id, r.status)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold transition-transform active:scale-95 cursor-pointer",
                            r.status === "Closed"
                              ? "bg-emerald-500/12 text-emerald-600 border border-emerald-500/30"
                              : "bg-amber-500/12 text-amber-600 border border-amber-500/30",
                          )}
                        >
                          {r.status === "Closed" ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Closed
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" /> Open
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}

                {/* BOTTOM TOTAL SUMMARY ROW MATCHING REFERENCE IMAGE */}
                {annualSeTrackerRecords.length > 0 && (
                  <tr className="bg-muted/80 font-bold border-t-2 border-border text-[11px] text-foreground">
                    <td className="px-3 py-2.5 text-center sticky left-0 bg-muted/90 z-10 border-r border-border/60">
                      -
                    </td>
                    <td className="px-3.5 py-2.5 font-sans uppercase tracking-wider sticky left-12 bg-muted/90 z-10 border-r border-border/60">
                      Total
                    </td>
                    <td className="px-2 py-2.5 text-center border-r border-border/60">{annualSeStats.totalsObj.aprP}</td>
                    <td className="px-2 py-2.5 text-center text-emerald-600 border-r border-border/60">{annualSeStats.totalsObj.aprC}</td>
                    <td className="px-2 py-2.5 text-center border-r border-border/60">{annualSeStats.totalsObj.mayP}</td>
                    <td className="px-2 py-2.5 text-center text-emerald-600 border-r border-border/60">{annualSeStats.totalsObj.mayC}</td>
                    <td className="px-2 py-2.5 text-center border-r border-border/60">{annualSeStats.totalsObj.junP}</td>
                    <td className="px-2 py-2.5 text-center text-emerald-600 border-r border-border/60">{annualSeStats.totalsObj.junC}</td>
                    <td className="px-2 py-2.5 text-center border-r border-border/60">{annualSeStats.totalsObj.julP}</td>
                    <td className="px-2 py-2.5 text-center text-emerald-600 border-r border-border/60">{annualSeStats.totalsObj.julC}</td>
                    <td className="px-2 py-2.5 text-center border-r border-border/60">{annualSeStats.totalsObj.augP}</td>
                    <td className="px-2 py-2.5 text-center text-emerald-600 border-r border-border/60">{annualSeStats.totalsObj.augC}</td>
                    <td className="px-2 py-2.5 text-center border-r border-border/60">{annualSeStats.totalsObj.septP}</td>
                    <td className="px-2 py-2.5 text-center text-emerald-600 border-r border-border/60">{annualSeStats.totalsObj.septC}</td>
                    <td className="px-2 py-2.5 text-center border-r border-border/60">{annualSeStats.totalsObj.octP}</td>
                    <td className="px-2 py-2.5 text-center text-emerald-600 border-r border-border/60">{annualSeStats.totalsObj.octC}</td>
                    <td className="px-2 py-2.5 text-center border-r border-border/60">{annualSeStats.totalsObj.novP}</td>
                    <td className="px-2 py-2.5 text-center text-emerald-600 border-r border-border/60">{annualSeStats.totalsObj.novC}</td>
                    <td className="px-2 py-2.5 text-center border-r border-border/60">{annualSeStats.totalsObj.decP}</td>
                    <td className="px-2 py-2.5 text-center text-emerald-600 border-r border-border/60">{annualSeStats.totalsObj.decC}</td>
                    <td className="px-2 py-2.5 text-center border-r border-border/60">{annualSeStats.totalsObj.janP}</td>
                    <td className="px-2 py-2.5 text-center text-emerald-600 border-r border-border/60">{annualSeStats.totalsObj.janC}</td>
                    <td className="px-2 py-2.5 text-center border-r border-border/60">{annualSeStats.totalsObj.febP}</td>
                    <td className="px-2 py-2.5 text-center text-emerald-600 border-r border-border/60">{annualSeStats.totalsObj.febC}</td>
                    <td className="px-2 py-2.5 text-center border-r border-border/60">{annualSeStats.totalsObj.marP}</td>
                    <td className="px-2 py-2.5 text-center text-emerald-600 border-r border-border/60">{annualSeStats.totalsObj.marC}</td>
                    <td className="px-3.5 py-2.5 font-sans text-muted-foreground border-r border-border/60">Annual Summary</td>
                    <td className="px-3 py-2.5 text-center font-sans font-bold text-primary">FY Summary</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-[12px]">
        <div className="text-muted-foreground">
          Showing <strong className="text-foreground">{paginatedList.length}</strong> of{" "}
          <strong className="text-foreground">{activeFilteredList.length}</strong> entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-foreground px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
