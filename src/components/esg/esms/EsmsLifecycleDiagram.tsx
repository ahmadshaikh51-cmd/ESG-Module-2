import React, { useState } from "react";
import {
  ShieldCheck,
  FileText,
  Search,
  GitBranch,
  Building2,
  Trees,
  Layers,
  Activity,
  FileSpreadsheet,
  HelpCircle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowDown,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  X,
  Award,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Node Detail Interface for click-to-expand details
 */
interface NodeDetailInfo {
  stepNumber: string;
  title: string;
  subtitle?: string;
  category: string;
  plainEnglishExplanation: string;
  description: string;
  keyOutputs: string[];
  ownerRole: string;
  governingStandard: string;
}

const NODE_DETAILS: Record<string, NodeDetailInfo> = {
  obligations: {
    stepNumber: "Step 1",
    title: "Obligations & Compliance",
    subtitle: "National Permits, IFCPS, Contractual Scope",
    category: "Governance Baseline",
    plainEnglishExplanation: "Review legal requirements, government permits, and investor rules before initiating work.",
    description: "Establishes baseline statutory and lender expectations, including Indian legal acts, IFC Performance Standards 1-8, and project concession agreements.",
    keyOutputs: ["Legal & Regulatory Register", "IFC PS Applicability Matrix", "Contractual E&S Covenants"],
    ownerRole: "Head of ESG & Regulatory Compliance",
    governingStandard: "Companies Act 2013, IFC Performance Standards",
  },
  opportunity: {
    stepNumber: "Step 2",
    title: "New Project Opportunity",
    subtitle: "Initiation & Deal Pipeline Entry",
    category: "Pipeline Entry",
    plainEnglishExplanation: "Formal entry of a new depot or infrastructure site into the project pipeline.",
    description: "Formal entry of a new depot or infrastructure site into the project pipeline, triggering initial E&S risk preliminary evaluation.",
    keyOutputs: ["Project Charter", "Site Location Dossier", "Initial Scope Profile"],
    ownerRole: "Business Development & ESG Lead",
    governingStandard: "Transvolt Project Governance Framework",
  },
  screening: {
    stepNumber: "Step 3",
    title: "Preliminary E & S Screening",
    subtitle: "(Before Bidding)",
    category: "Pre-Bid Screening",
    plainEnglishExplanation: "Desktop and field check prior to bidding to flag major land or environmental risks.",
    description: "Rapid desktop and field appraisal conducted prior to commercial bidding to flag high-level environmental, social, and land issues.",
    keyOutputs: ["Preliminary E&S Screening Checklist", "Red Flag Assessment", "Go/No-Go Decision Note"],
    ownerRole: "E&S Screening Specialist",
    governingStandard: "IFC Guidance Note 1: E&S Assessment",
  },
  classification: {
    stepNumber: "Step 4",
    title: "Project Type Classification",
    subtitle: "Site Nature & Scope Split",
    category: "Path Classification",
    plainEnglishExplanation: "Classify the site as either Brownfield (existing facility) or Greenfield (new build).",
    description: "Evaluates site characteristics to determine whether the development is a Brownfield (existing facility retrofitting) or Greenfield (new ground-up construction).",
    keyOutputs: ["Classification Certificate", "Scoped Study Terms of Reference"],
    ownerRole: "ESG Technical Director",
    governingStandard: "World Bank Group EHS Guidelines",
  },
  brownfield: {
    stepNumber: "Path 4A",
    title: "Brownfield",
    subtitle: "Existing Asset Retrofit",
    category: "Brownfield Branch",
    plainEnglishExplanation: "Existing depot/facility requiring electrical retrofits and equipment upgrades.",
    description: "Applies to existing bus depots or leased property requiring electrical upgrade and equipment installation.",
    keyOutputs: ["Baseline Contamination Log", "Existing Facility Audit"],
    ownerRole: "Depot Infrastructure Lead",
    governingStandard: "State Pollution Control Board Guidelines",
  },
  esdd: {
    stepNumber: "Path 4A-1",
    title: "Comprehensive ESDD",
    subtitle: "Environmental & Social Due Diligence",
    category: "Brownfield Audit",
    plainEnglishExplanation: "ESDD = Deep audit of existing site conditions, old pollution, and structural safety.",
    description: "Deep-dive audit of historical liabilities, structural integrity, soil/water baseline, safety compliance, and labour practices of the existing site.",
    keyOutputs: ["ESDD Audit Report", "Gap Analysis Matrix", "Historical Liability Register"],
    ownerRole: "External ESDD Lead Auditor",
    governingStandard: "IFC ESDD Protocols",
  },
  risk_analysis_b: {
    stepNumber: "Path 4A-2",
    title: "Risk Identification & Analysis",
    subtitle: "Brownfield Risk Quantification",
    category: "Risk Assessment",
    plainEnglishExplanation: "Identify residual operational, hazardous waste, and transformer safety risks.",
    description: "Evaluates residual operational risks, hazardous waste potential, transformer safety, and noise impacts for the brownfield site.",
    keyOutputs: ["Brownfield Risk Matrix", "Hazmat Inventory"],
    ownerRole: "Risk & Safety Officer",
    governingStandard: "ISO 31000 Risk Management",
  },
  assign_risk_b: {
    stepNumber: "Path 4A-3",
    title: "Assign Risk Category",
    subtitle: "(A / B / C / D)",
    category: "Risk Grading",
    plainEnglishExplanation: "Grade project risk level from Category A (High Risk) down to Category D (Low Risk).",
    description: "Assigns institutional E&S risk category (Category A - High, B - Medium, C - Low, D - Minimal) governing approval depth.",
    keyOutputs: ["Category Assignment Letter", "Lender Risk Profile"],
    ownerRole: "ESG Governance Committee",
    governingStandard: "IFC Environmental & Social Categorization",
  },
  formulate_esap: {
    stepNumber: "Path 4A-4",
    title: "Formulate ESAP",
    subtitle: "Environmental & Social Action Plan",
    category: "Action Plan",
    plainEnglishExplanation: "ESAP = Specific Action Plan detailing corrective tasks to fix brownfield gaps.",
    description: "Establishes targeted time-bound corrective action items, budgets, and responsible personnel to cure identified brownfield gaps.",
    keyOutputs: ["ESAP Action Register", "CAPEX Allocation Plan", "CAP Timelines"],
    ownerRole: "ESMS Implementation Manager",
    governingStandard: "IFC PS1 Action Plan Standards",
  },
  greenfield: {
    stepNumber: "Path 4B",
    title: "GreenField",
    subtitle: "New Ground-Up Site",
    category: "Greenfield Branch",
    plainEnglishExplanation: "New land acquired or leased for ground-up depot development.",
    description: "Applies to new land parcels acquired or leased for ground-up depot construction and high-voltage grid connections.",
    keyOutputs: ["Land Acquisition Deed", "Site Survey Plan"],
    ownerRole: "Project Development Director",
    governingStandard: "National Land Acquisition Regulations",
  },
  esia: {
    stepNumber: "Path 4B-1",
    title: "Comprehensive ESIA",
    subtitle: "Environmental & Social Impact Assessment",
    category: "Greenfield Study",
    plainEnglishExplanation: "ESIA = Full environmental baseline (air, water, noise) and community impact study.",
    description: "Full environmental baseline study (air, water, noise, biodiversity) and social impact assessment for new greenfield development.",
    keyOutputs: ["ESIA Final Report", "Public Consultation Minutes", "Biodiversity Baseline"],
    ownerRole: "Certified ESIA Agency / E&S Lead",
    governingStandard: "EIA Notification 2006 & IFC PS1-PS8",
  },
  risk_analysis_g: {
    stepNumber: "Path 4B-2",
    title: "Risk Identification & Analysis",
    subtitle: "Greenfield Risk Matrix",
    category: "Risk Assessment",
    plainEnglishExplanation: "Identify construction safety, drainage, and community health hazards.",
    description: "Comprehensive hazard identification covering construction phase safety, community health, drainage, and grid tie-in risks.",
    keyOutputs: ["Greenfield Hazard Register", "Erosion Control Plan"],
    ownerRole: "Site EHS Manager",
    governingStandard: "ISO 14001 / ISO 45001",
  },
  impact_analysis: {
    stepNumber: "Path 4B-3",
    title: "Potential Impact Analysis",
    subtitle: "Severity & Scale Quantification",
    category: "Impact Evaluation",
    plainEnglishExplanation: "Model cumulative impact on local traffic, water runoff, and power grid tie-in.",
    description: "Models cumulative impacts of site clearing, stormwater runoff, traffic surge, and power sub-station installation.",
    keyOutputs: ["Impact Significance Rating", "Mitigation Hierarchy Table"],
    ownerRole: "E&S Technical Specialist",
    governingStandard: "MoEFCC Impact Assessment Guidelines",
  },
  assign_risk_g: {
    stepNumber: "Path 4B-4",
    title: "Assign Risk Category",
    subtitle: "(A / B / C / D)",
    category: "Risk Grading",
    plainEnglishExplanation: "Grade greenfield risk level (Category A - High Risk to D - Minimal Risk).",
    description: "Assigns greenfield E&S risk category based on severity of potential habitat, community, and operational impacts.",
    keyOutputs: ["Greenfield Category Stamp", "Board Notification Document"],
    ownerRole: "ESG Governance Board",
    governingStandard: "IFC E&S Categorization",
  },
  formulate_esmp: {
    stepNumber: "Path 4B-5",
    title: "Formulate ESMP",
    subtitle: "Environmental & Social Management Plan",
    category: "Management Plan",
    plainEnglishExplanation: "ESMP = Master Management Plan defining operating rules, safety clauses, and protocols.",
    description: "Drafts comprehensive operational protocols, monitoring metrics, contractor safety clauses, and emergency response procedures.",
    keyOutputs: ["ESMP Master Document", "Contractor EHS Guidelines", "Waste Management Plan"],
    ownerRole: "ESMS Program Director",
    governingStandard: "IFC PS1 Management System",
  },
  implement_esap_esmp: {
    stepNumber: "Step 5",
    title: "Implement ESAP & ESMP",
    subtitle: "Unified Execution Baseline",
    category: "Unified Execution",
    plainEnglishExplanation: "Paths merge here. Execute action plans (ESAP) and management protocols (ESMP).",
    description: "Integrated execution of action plan items (ESAP) and management protocols (ESMP) across civil engineering, contractor teams, and depot staff.",
    keyOutputs: ["Execution Readiness Certificate", "Site EHS Charter", "Contractor Sign-offs"],
    ownerRole: "Chief Operating Officer & ESG Manager",
    governingStandard: "Transvolt ESMS Operational Manual",
  },
  monitor_review: {
    stepNumber: "Step 6A",
    title: "Monitor & Review Implementation",
    subtitle: "Audit & Field Oversight",
    category: "Oversight & Audit",
    plainEnglishExplanation: "Conduct field inspections, audits, and contractor EHS compliance reviews.",
    description: "Continuous site inspections, EHS audits, water/noise testing, and contractor compliance tracking during active operations.",
    keyOutputs: ["Monthly EHS Inspection Log", "Internal Audit Findings", "CAP Progress Tracker"],
    ownerRole: "Lead ESMS Auditor",
    governingStandard: "ISO 19011 Audit Standard",
  },
  es_framework: {
    stepNumber: "Step 6B",
    title: "ES Monitoring & Reporting Framework",
    subtitle: "Data Collection Via Metadata Format",
    category: "Data Collection",
    plainEnglishExplanation: "Collect monthly energy, water, GHG Scope 1-3, and safety data via structured forms.",
    description: "Standardized data ingestion pipeline gathering energy, water, GHG Scope 1-3, safety incidents, and social indicators via structured metadata.",
    keyOutputs: ["Monthly ESG Data Book", "Telemetry Data Logs", "KPI Verification Sheets"],
    ownerRole: "ESG Data & Analytics Lead",
    governingStandard: "GRI Standards & BRSR Reporting Framework",
  },
  reporting_obligations: {
    stepNumber: "Step 6B-1",
    title: "Reporting Obligations",
    subtitle: "Statutory & Financial Disclosures",
    category: "Disclosure Hub",
    plainEnglishExplanation: "Consolidate verified metrics into regulatory annual reports and investor disclosures.",
    description: "Consolidates verified metrics into regulatory annual reports, sustainability returns, and investor disclosure packages.",
    keyOutputs: ["Annual Disclosure Register", "Filing Schedule"],
    ownerRole: "Head of Corporate Governance",
    governingStandard: "SEBI LODR & Lender Covenants",
  },
  brsr_report: {
    stepNumber: "Step 6B-2 National",
    title: "BRSR / AMR / Impact Report",
    subtitle: "National",
    category: "National Filings",
    plainEnglishExplanation: "File Indian statutory returns: SEBI BRSR Core and SPCB Form-V returns.",
    description: "Prepares Business Responsibility and Sustainability Report (BRSR) for SEBI compliance and Annual Monitoring Report (AMR) for national authorities.",
    keyOutputs: ["SEBI BRSR Core Filing", "Form-V Environmental Return", "Annual Impact Summary"],
    ownerRole: "ESG Regulatory Officer",
    governingStandard: "SEBI BRSR Core Mandate 2023",
  },
  ifc_report: {
    stepNumber: "Step 6B-2 DFI",
    title: "IFC Lender Reports / CDP",
    subtitle: "DFI",
    category: "Investor Filings",
    plainEnglishExplanation: "File international lender returns (IFC/ADB) and CDP climate disclosure scores.",
    description: "Prepares specialized disclosure returns for international Development Finance Institutions (IFC, ADB) and CDP Carbon Disclosure.",
    keyOutputs: ["IFC AMR Compliance Return", "CDP Climate Response", "DFI Impact Scorecard"],
    ownerRole: "DFI & Investor Relations Lead",
    governingStandard: "IFC Disclosure Policy & CDP Guidelines",
  },
  decision_diamond: {
    stepNumber: "Step 7 Gate",
    title: "Risk Category Reduced ?",
    subtitle: "Evaluation Gateway",
    category: "Decision Gate",
    plainEnglishExplanation: "Evaluate if mitigations successfully reduced site risk category to baseline.",
    description: "Evaluates whether implemented ESAP/ESMP mitigations have successfully reduced operational and site risk category to baseline acceptable levels.",
    keyOutputs: ["Risk Re-assessment Certification", "Gate Review Minutes"],
    ownerRole: "ESG Steering Committee",
    governingStandard: "Transvolt Enterprise Risk Framework",
  },
  yes_branch: {
    stepNumber: "Decision YES",
    title: "YES",
    subtitle: "Low Risk Profile Achieved",
    category: "Gate Passed",
    plainEnglishExplanation: "Mitigation measures successfully reduced operational E&S risks.",
    description: "Confirmed that E&S risks have been mitigated down to acceptable baseline thresholds.",
    keyOutputs: ["Risk Reduction Certificate", "Operational Transition Sign-off"],
    ownerRole: "E&S Lead Auditor",
    governingStandard: "Transvolt E&S Risk Policy",
  },
  no_branch: {
    stepNumber: "Decision NO",
    title: "NO",
    subtitle: "High Risk Remains",
    category: "Gate Action Required",
    plainEnglishExplanation: "Residual risks remain high. Immediate corrective action and re-implementation mandated.",
    description: "E&S risks remain above target thresholds, requiring revised ESAP/ESMP formulation and mandatory re-implementation.",
    keyOutputs: ["Corrective Action Mandate", "Risk Escalation Notice"],
    ownerRole: "Head of ESG & Steering Committee",
    governingStandard: "CAPA Corrective Action Protocol",
  },
  update_esap: {
    stepNumber: "Step 7-NO Action",
    title: "Update ESAP / ESMP & Re - Implement",
    subtitle: "Corrective Action & Return Path",
    category: "Corrective Loop",
    plainEnglishExplanation: "NO: Risks are still high. Revise ESAP/ESMP actions & loop back to re-implement!",
    description: "Triggered when risks remain un-mitigated. Mandates revision of ESAP/ESMP corrective measures and re-implementation under elevated oversight.",
    keyOutputs: ["Revised ESAP Version", "Corrective Action Directive", "Re-Implementation Plan"],
    ownerRole: "Head of ESG & Site General Manager",
    governingStandard: "Corrective & Preventive Action (CAPA) Protocol",
  },
  maintain_ops: {
    stepNumber: "Step 7-YES",
    title: "Maintain Operations",
    subtitle: "Lower Risk Profile",
    category: "Stable Operations",
    plainEnglishExplanation: "YES: Risks are low & safe. Maintain normal, low-risk depot operations.",
    description: "Sustained operational phase operating under low-risk steady state with standard ESMP procedures in force.",
    keyOutputs: ["Operational Clearance Certificate", "Steady-State EHS Log"],
    ownerRole: "Depot Operations Manager",
    governingStandard: "ISO 14001 / 45001 Maintenance",
  },
  periodic_review: {
    stepNumber: "Step 7-YES Final",
    title: "Ongoing Monitoring & Periodic Review",
    subtitle: "Continuous Assurance",
    category: "Continuous Assurance",
    plainEnglishExplanation: "Routine periodic E&S reviews and annual management audits.",
    description: "Routine periodic E&S reviews, annual management reviews, and continuous baseline verification.",
    keyOutputs: ["Annual Management Review Notes", "Continuous Improvement Log"],
    ownerRole: "Chief Sustainability Officer",
    governingStandard: "PDCA (Plan-Do-Check-Act) Cycle",
  },
};

function DownArrowLine() {
  return (
    <div className="flex flex-col items-center my-1">
      <div className="w-[1.5px] h-5 bg-muted-foreground/60" />
      <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/80 -mt-1" />
    </div>
  );
}

function FlowNode({
  id,
  title,
  subtitle,
  variant = "default",
  onClick,
}: {
  id: string;
  title: string;
  subtitle?: string;
  variant?: "default" | "amber-rhombus" | "green-diamond" | "purple-diamond" | "amber-box";
  onClick: () => void;
}) {
  if (variant === "amber-rhombus") {
    return (
      <div
        onClick={onClick}
        className="group relative cursor-pointer transform transition-all hover:scale-105 active:scale-95 my-1"
        title="Click to view details"
      >
        <div className="w-[200px] h-[72px] bg-amber-500 border-2 border-amber-600 text-white font-bold rounded-xl shadow-sm flex items-center justify-center text-center p-2 text-[12px] leading-tight">
          <span>{title}</span>
        </div>
      </div>
    );
  }

  if (variant === "green-diamond") {
    return (
      <div
        onClick={onClick}
        className="group relative cursor-pointer transform transition-all hover:scale-105 active:scale-95"
        title="Click to view details"
      >
        <div className="w-[54px] h-[54px] bg-emerald-500 text-white font-extrabold rounded-lg border-2 border-emerald-600 shadow-sm flex items-center justify-center text-center text-[12px]">
          <span>{title}</span>
        </div>
      </div>
    );
  }

  if (variant === "purple-diamond") {
    return (
      <div
        onClick={onClick}
        className="group relative cursor-pointer transform transition-all hover:scale-105 active:scale-95"
        title="Click to view details"
      >
        <div className="w-[54px] h-[54px] bg-purple-500 text-white font-extrabold rounded-lg border-2 border-purple-600 shadow-sm flex items-center justify-center text-center text-[12px]">
          <span>{title}</span>
        </div>
      </div>
    );
  }

  if (variant === "amber-box") {
    return (
      <div
        onClick={onClick}
        className="group relative cursor-pointer transform transition-all hover:scale-105 active:scale-95"
        title="Click to view details"
      >
        <div className="w-[230px] bg-amber-500 text-slate-900 font-bold rounded-xl border-2 border-amber-600 shadow-sm flex items-center justify-center text-center p-3 text-[12px] leading-snug">
          <span>{title}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative w-[240px] rounded-xl border border-muted-foreground/40 bg-card p-3 shadow-2xs transition-all duration-200 cursor-pointer select-none hover:-translate-y-0.5 hover:border-primary/70 hover:shadow-md text-center flex flex-col items-center justify-center min-h-[54px]",
      )}
    >
      <span className="block text-[12.5px] font-bold text-foreground leading-snug">
        {title}
      </span>
      {subtitle && (
        <span className="block text-[10.5px] text-muted-foreground font-medium leading-tight mt-0.5">
          {subtitle}
        </span>
      )}
    </div>
  );
}

export function EsmsLifecycleDiagram() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const detail = selectedNode ? NODE_DETAILS[selectedNode] : null;

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.75, prev + delta), 1.25));
  };

  return (
    <div className="w-full space-y-4 font-sans text-foreground">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/90 p-4 backdrop-blur-md shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary font-bold">
              <GitBranch className="h-4 w-4" />
            </span>
            <h2 className="text-[15px] font-bold tracking-tight text-foreground">
              Project E&amp;S Lifecycle &amp; Compliance Flowchart
            </h2>
            <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
              Interactive Workflow
            </span>
          </div>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Click any node in the flowchart to view full step details, responsible roles, key outputs, and governing standards.
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-background p-1">
          <button
            type="button"
            onClick={() => handleZoom(-0.1)}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="px-2 text-[11px] font-mono font-bold text-foreground">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => handleZoom(0.1)}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            title="Reset Zoom"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Flowchart Canvas (Exact reproduction of screenshot) */}
      <div className="relative rounded-2xl border border-border/60 bg-card p-8 shadow-sm overflow-x-auto min-h-[1150px]">
        <div
          className="mx-auto max-w-[1000px] transition-transform duration-200 origin-top flex flex-col items-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* STEP 1: Obligations & Compliance */}
          <FlowNode
            id="obligations"
            title="Obligations & Compliance"
            subtitle="National Permits,IFCPS,Contractual Scope"
            onClick={() => setSelectedNode("obligations")}
          />
          <DownArrowLine />

          {/* STEP 2: New Project Opportunity */}
          <FlowNode
            id="opportunity"
            title="New Project Opportunity"
            onClick={() => setSelectedNode("opportunity")}
          />
          <DownArrowLine />

          {/* STEP 3: Preliminary E & S Screening */}
          <FlowNode
            id="screening"
            title="Preliminary E & S Screening"
            subtitle="(Before Bidding)"
            onClick={() => setSelectedNode("screening")}
          />
          <DownArrowLine />

          {/* STEP 4: Project Type Classification */}
          <FlowNode
            id="classification"
            title="Project Type Classification"
            onClick={() => setSelectedNode("classification")}
          />

          {/* SPLIT TO BROWNFIELD (LEFT) & GREENFIELD (RIGHT) */}
          <div className="w-full max-w-[620px] flex flex-col items-center my-1.5">
            <div className="w-[1.5px] h-4 bg-muted-foreground/60" />
            <div className="w-full h-[1.5px] bg-muted-foreground/60 relative">
              <span className="absolute left-0 -translate-x-1/2 -top-2.5 text-[11px] font-bold text-muted-foreground bg-card px-1">
                ←
              </span>
              <span className="absolute right-0 translate-x-1/2 -top-2.5 text-[11px] font-bold text-muted-foreground bg-card px-1">
                →
              </span>
            </div>
            <div className="w-full flex justify-between">
              <div className="w-[1.5px] h-4 bg-muted-foreground/60" />
              <div className="w-[1.5px] h-4 bg-muted-foreground/60" />
            </div>
          </div>

          {/* TWO PARALLEL COLUMNS: Brownfield vs Greenfield */}
          <div className="w-full max-w-[700px] grid grid-cols-2 gap-12 items-start">
            
            {/* BROWNFIELD COLUMN */}
            <div className="flex flex-col items-center">
              <FlowNode
                id="brownfield"
                title="Brownfield"
                onClick={() => setSelectedNode("brownfield")}
              />
              <DownArrowLine />

              <FlowNode
                id="esdd"
                title="Comprehensive ESDD"
                onClick={() => setSelectedNode("esdd")}
              />
              <DownArrowLine />

              <FlowNode
                id="risk_analysis_b"
                title="Risk Identification & Analysis"
                onClick={() => setSelectedNode("risk_analysis_b")}
              />
              <DownArrowLine />

              <FlowNode
                id="assign_risk_b"
                title="Assign Risk Category"
                subtitle="(A / B / C / D)"
                onClick={() => setSelectedNode("assign_risk_b")}
              />
              <DownArrowLine />

              <FlowNode
                id="formulate_esap"
                title="Formulate ESAP"
                onClick={() => setSelectedNode("formulate_esap")}
              />
            </div>

            {/* GREENFIELD COLUMN */}
            <div className="flex flex-col items-center">
              <FlowNode
                id="greenfield"
                title="GreenField"
                onClick={() => setSelectedNode("greenfield")}
              />
              <DownArrowLine />

              <FlowNode
                id="esia"
                title="Comprehensive ESIA"
                onClick={() => setSelectedNode("esia")}
              />
              <DownArrowLine />

              <FlowNode
                id="risk_analysis_g"
                title="Risk Identification & Analysis"
                onClick={() => setSelectedNode("risk_analysis_g")}
              />
              <DownArrowLine />

              <FlowNode
                id="impact_analysis"
                title="Potential Impact Analysis"
                onClick={() => setSelectedNode("impact_analysis")}
              />
              <DownArrowLine />

              <FlowNode
                id="assign_risk_g"
                title="Assign Risk Category"
                subtitle="(A / B / C / D)"
                onClick={() => setSelectedNode("assign_risk_g")}
              />
              <DownArrowLine />

              <FlowNode
                id="formulate_esmp"
                title="Formulate ESMP"
                onClick={() => setSelectedNode("formulate_esmp")}
              />
            </div>

          </div>

          {/* MERGE FROM BOTH BRANCHES INTO IMPLEMENT ESAP & ESMP */}
          <div className="w-full max-w-[620px] flex flex-col items-center my-1.5">
            <div className="w-full flex justify-between">
              <div className="w-[1.5px] h-4 bg-muted-foreground/60" />
              <div className="w-[1.5px] h-4 bg-muted-foreground/60" />
            </div>
            <div className="w-full h-[1.5px] bg-muted-foreground/60" />
            <div className="w-[1.5px] h-4 bg-muted-foreground/60" />
            <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/80 -mt-1" />
          </div>

          {/* CONVERGENCE NODE: Implement ESAP & ESMP */}
          <FlowNode
            id="implement_esap_esmp"
            title="Implement ESAP & ESMP"
            onClick={() => setSelectedNode("implement_esap_esmp")}
          />

          {/* SPLIT TO MONITOR & REVIEW vs ES MONITORING & REPORTING FRAMEWORK */}
          <div className="w-full max-w-[620px] flex flex-col items-center my-1.5">
            <div className="w-[1.5px] h-4 bg-muted-foreground/60" />
            <div className="w-full h-[1.5px] bg-muted-foreground/60 relative">
              <span className="absolute left-0 -translate-x-1/2 -top-2.5 text-[11px] font-bold text-muted-foreground bg-card px-1">
                ←
              </span>
              <span className="absolute right-0 translate-x-1/2 -top-2.5 text-[11px] font-bold text-muted-foreground bg-card px-1">
                →
              </span>
            </div>
            <div className="w-full flex justify-between">
              <div className="w-[1.5px] h-4 bg-muted-foreground/60" />
              <div className="w-[1.5px] h-4 bg-muted-foreground/60" />
            </div>
          </div>

          {/* LOWER SECTION: LEFT MONITORING/DECISION vs RIGHT REPORTING OBLIGATIONS */}
          <div className="w-full max-w-[720px] grid grid-cols-2 gap-12 items-start">
            
            {/* LEFT SUB-BRANCH: Monitor & Review -> Decision Gateway */}
            <div className="flex flex-col items-center space-y-2">
              <FlowNode
                id="monitor_review"
                title="Monitor & Review Implementation"
                onClick={() => setSelectedNode("monitor_review")}
              />
              <DownArrowLine />

              {/* AMBER RHOMBUS: Risk Category Reduced ? */}
              <FlowNode
                id="decision_diamond"
                title="Risk Category Reduced ?"
                variant="amber-rhombus"
                onClick={() => setSelectedNode("decision_diamond")}
              />

              {/* DECISION BRANCHES: YES (Left) vs NO (Right) */}
              <div className="w-full flex items-start justify-between pt-2 relative">
                
                {/* YES BRANCH (Left) */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-bold text-muted-foreground mb-0.5">← YES</div>
                    <FlowNode
                      id="yes_branch"
                      title="YES"
                      variant="green-diamond"
                      onClick={() => setSelectedNode("yes_branch")}
                    />
                  </div>
                  <DownArrowLine />

                  <FlowNode
                    id="maintain_ops"
                    title="Maintain Operations"
                    subtitle="Lower Risk Profile"
                    onClick={() => setSelectedNode("maintain_ops")}
                  />
                  <DownArrowLine />

                  <FlowNode
                    id="periodic_review"
                    title="Ongoing Monitoring & Periodic Review"
                    onClick={() => setSelectedNode("periodic_review")}
                  />
                </div>

                {/* NO BRANCH (Right) with Update ESAP & Re-implement */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-bold text-muted-foreground mb-0.5">NO ↘</div>
                    <FlowNode
                      id="no_branch"
                      title="NO"
                      variant="purple-diamond"
                      onClick={() => setSelectedNode("no_branch")}
                    />
                  </div>
                  <DownArrowLine />

                  <FlowNode
                    id="update_esap"
                    title="Update ESAP / ESMP & Re - Implement"
                    variant="amber-box"
                    onClick={() => setSelectedNode("update_esap")}
                  />

                  <div className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    <RotateCcw className="h-3 w-3 text-amber-600 shrink-0" />
                    <span>Loops Back to Monitor &amp; Review</span>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT SUB-BRANCH: ES Monitoring & Reporting Framework */}
            <div className="flex flex-col items-center space-y-2">
              <FlowNode
                id="es_framework"
                title="ES Monitoring & Reporting Framework"
                subtitle="Data Collection Via Metadata Format"
                onClick={() => setSelectedNode("es_framework")}
              />
              <DownArrowLine />

              <FlowNode
                id="reporting_obligations"
                title="Reporting Obligations"
                onClick={() => setSelectedNode("reporting_obligations")}
              />

              {/* Split to National vs DFI */}
              <div className="w-full flex flex-col items-center my-1">
                <div className="w-[1.5px] h-3.5 bg-muted-foreground/60" />
                <div className="w-full h-[1.5px] bg-muted-foreground/60 relative">
                  <span className="absolute left-0 -translate-x-1/2 -top-2 text-[10px] font-bold text-muted-foreground bg-card px-0.5">
                    ←
                  </span>
                  <span className="absolute right-0 translate-x-1/2 -top-2 text-[10px] font-bold text-muted-foreground bg-card px-0.5">
                    →
                  </span>
                </div>
                <div className="w-full flex justify-between">
                  <div className="w-[1.5px] h-3.5 bg-muted-foreground/60" />
                  <div className="w-[1.5px] h-3.5 bg-muted-foreground/60" />
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3">
                <FlowNode
                  id="brsr_report"
                  title="BRSR / AMR / Impact Report"
                  subtitle="National"
                  onClick={() => setSelectedNode("brsr_report")}
                />
                <FlowNode
                  id="ifc_report"
                  title="IFC Lender Reports / CDP"
                  subtitle="DFI"
                  onClick={() => setSelectedNode("ifc_report")}
                />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* CLICK-TO-EXPAND SLIDE-OVER DRAWER */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-background/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="h-full w-full max-w-[480px] rounded-2xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 overflow-y-auto animate-in slide-in-from-right duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary text-primary-foreground font-bold px-2 py-0.5 text-[10px] uppercase">
                    {detail.stepNumber}
                  </span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {detail.category}
                  </span>
                </div>
                <h3 className="mt-2 text-[18px] font-extrabold text-foreground leading-snug">
                  {detail.title}
                </h3>
                {detail.subtitle && (
                  <p className="text-[12px] font-medium text-muted-foreground mt-0.5">
                    {detail.subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-[12.5px] leading-relaxed text-foreground">
              {/* Plain English Explanation */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  Quick Summary
                </span>
                <p className="text-[12.5px] font-medium text-foreground leading-relaxed">
                  {detail.plainEnglishExplanation}
                </p>
              </div>

              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Process Description
                </span>
                <p className="bg-muted/30 rounded-xl p-3 border border-border/40 text-[12px] text-muted-foreground">
                  {detail.description}
                </p>
              </div>

              <div>
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Key Deliverables &amp; Outputs
                </span>
                <ul className="space-y-1.5">
                  {detail.keyOutputs.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-[12px]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Responsible Role
                  </span>
                  <span className="text-[11.5px] font-semibold text-foreground mt-0.5 block">
                    {detail.ownerRole}
                  </span>
                </div>
                <div className="rounded-xl border border-border/60 bg-card p-3">
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Governing Standard
                  </span>
                  <span className="text-[11.5px] font-semibold text-foreground mt-0.5 block truncate">
                    {detail.governingStandard}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="rounded-xl bg-primary px-4 py-2 text-[12px] font-bold text-primary-foreground transition-all hover:opacity-90 cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
