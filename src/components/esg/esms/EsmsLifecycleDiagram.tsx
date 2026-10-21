import React, { useState } from "react";
import {
  GitBranch,
  Building2,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Printer,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECT_LIFECYCLES, lifecycleDaysInStage, entityById, type ProjectLifecycle } from "@/lib/esg-data";

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

const STAGE_TO_NODE_ID: Record<string, string> = {
  classification: "classification",
  esdd: "esdd",
  "esap-implement": "implement_esap_esmp",
  "monitor-review": "monitor_review",
  screening: "screening",
  opportunity: "opportunity",
  brownfield: "brownfield",
  greenfield: "greenfield",
  esia: "esia",
  "formulate-esap": "formulate_esap",
  "formulate-esmp": "formulate_esmp",
  "maintain-ops": "maintain_ops",
  "periodic-review": "periodic_review",
};

export interface EsmsLifecycleDiagramProps {
  onSelectProject?: (projectId: string) => void;
}

export function EsmsLifecycleDiagram({ onSelectProject }: EsmsLifecycleDiagramProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const detail = selectedNode ? NODE_DETAILS[selectedNode] : null;

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.65, prev + delta), 1.25));
  };

  const getProjectsAtNode = (nodeId: string): ProjectLifecycle[] => {
    return PROJECT_LIFECYCLES.filter((p) => {
      if (STAGE_TO_NODE_ID[p.currentStage] === nodeId) return true;
      if (p.currentStage === nodeId) return true;
      return false;
    });
  };

  const renderNode = (
    id: string,
    title: string,
    subtext?: string,
    style?: React.CSSProperties,
    extraClassName?: string,
    dataPurpose?: string
  ) => {
    const activeProjects = getProjectsAtNode(id);
    const isSelected = selectedNode === id;
    const hasBlocked = activeProjects.some((p) => p.blocked);

    return (
      <div
        key={id}
        tabIndex={0}
        role="button"
        aria-label={`${title} ${subtext || ""}`}
        data-purpose={dataPurpose}
        onClick={() => setSelectedNode(id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelectedNode(id);
          }
        }}
        className={cn(
          "flow-node",
          extraClassName,
          isSelected && "node-selected"
        )}
        style={style}
      >
        <span>{title}</span>
        {subtext && <span className="subtext">{subtext}</span>}
        {activeProjects.length > 0 && (
          <span
            className={cn(
              "absolute -top-2.5 -right-2 px-1.5 py-0.5 rounded-full text-[9.5px] font-extrabold tracking-tight shadow-md flex items-center gap-1 border border-white dark:border-slate-900 pointer-events-none z-20",
              hasBlocked
                ? "bg-rose-500 text-white animate-pulse"
                : "bg-sky-600 text-white"
            )}
            title={`${activeProjects.length} project(s) at this stage`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
            {activeProjects.length}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4 font-sans text-foreground">
      {/* Scoped Styles identical to provided layout with Dark Mode support */}
      <style>{`
        .flow-canvas {
          position: relative;
          width: 1040px;
          height: 1480px;
          margin: 0 auto;
        }

        .flow-node {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: #ffffff;
          border: 2px solid #64748b;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.35;
          font-weight: 600;
          color: #1e293b;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          user-select: none;
          z-index: 10;
          cursor: pointer;
        }
        .flow-node:hover, .flow-node:focus-visible {
          border-color: #0284c7;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.15);
          transform: translateY(-1px);
          outline: none;
        }
        .flow-node.node-selected {
          border-color: #0284c7;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.25), 0 4px 12px rgba(2, 132, 199, 0.2);
          transform: translateY(-1px);
        }

        .flow-node .subtext {
          font-size: 11px;
          font-weight: 500;
          color: #475569;
          margin-top: 3px;
        }

        .diamond-box {
          position: absolute;
          width: 220px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          cursor: pointer;
        }
        .diamond-shape {
          position: absolute;
          inset: 0;
          background-color: #f59e0b;
          transform: scaleY(0.7) rotate(45deg);
          border-radius: 6px;
          box-shadow: 0 2px 6px rgba(245, 158, 11, 0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .diamond-box:hover .diamond-shape, .diamond-box:focus-visible .diamond-shape {
          transform: scaleY(0.7) rotate(45deg) scale(1.03);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        .diamond-box.active-selected .diamond-shape {
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.6), 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        .diamond-content {
          position: relative;
          z-index: 11;
          font-weight: 600;
          font-size: 13px;
          color: #1e293b;
          text-align: center;
          line-height: 1.25;
        }

        .badge-diamond {
          position: absolute;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          border-radius: 6px;
          z-index: 10;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .badge-diamond:hover, .badge-diamond:focus-visible {
          transform: rotate(45deg) scale(1.08);
          outline: none;
        }
        .badge-diamond.active-selected {
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.6);
        }
        .badge-diamond span {
          transform: rotate(-45deg);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }
        .badge-yes {
          background-color: #dcfce7;
          border: 2px solid #22c55e;
          color: #15803d;
        }
        .badge-no {
          background-color: #f3e8ff;
          border: 2px solid #a855f7;
          color: #7e22ce;
        }

        .node-highlight-orange {
          background-color: #f59e0b !important;
          border: 2px solid #d97706 !important;
          color: #111827 !important;
          font-weight: 700 !important;
        }
        .node-highlight-orange:hover, .node-highlight-orange:focus-visible {
          border-color: #b45309 !important;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4) !important;
        }

        .svg-connectors {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 5;
        }

        /* Dark Mode Extensions */
        .dark .flow-node {
          background: #0f172a;
          border-color: #475569;
          color: #f8fafc;
        }
        .dark .flow-node:hover, .dark .flow-node:focus-visible {
          border-color: #38bdf8;
          box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25);
        }
        .dark .flow-node.node-selected {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.35), 0 4px 12px rgba(56, 189, 248, 0.2);
        }
        .dark .flow-node .subtext {
          color: #94a3b8;
        }
        .dark .badge-yes {
          background-color: rgba(20, 83, 45, 0.7);
          border-color: #22c55e;
          color: #86efac;
        }
        .dark .badge-no {
          background-color: rgba(88, 28, 135, 0.7);
          border-color: #a855f7;
          color: #d8b4fe;
        }
      `}</style>

      {/* BEGIN: Flowchart Header matching provided snippet */}
      <div className="bg-card border border-border/70 rounded-xl sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-slate-800 dark:bg-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
              ES
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[15px] font-bold text-foreground leading-tight">
                  E&amp;S Compliance &amp; Risk Management Flowchart
                </h1>
                <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
                  All Projects Pipeline
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Environmental &amp; Social Due Diligence (ESDD / ESIA) Workflow Model
              </p>
            </div>
          </div>

          {/* Action Controls & Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
            <div className="hidden lg:flex items-center space-x-3 bg-muted/40 px-3 py-1.5 rounded-lg border border-border/60 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Standard Step
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rotate-45 bg-amber-500 inline-block" /> Evaluation
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-500" /> Positive Loop
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Corrective Cycle
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/80 p-1">
              <button
                type="button"
                onClick={() => handleZoom(-0.1)}
                className="grid h-6 w-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="px-1.5 text-[10.5px] font-mono font-bold text-foreground">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => handleZoom(0.1)}
                className="grid h-6 w-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="grid h-6 w-6 place-items-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
                title="Reset Zoom (100%)"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              className="px-3 py-1.5 border border-border/80 rounded-lg bg-card hover:bg-muted/60 text-foreground transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              onClick={() => window.print()}
            >
              <Printer className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Print / Export</span>
            </button>
          </div>
        </div>
      </div>
      {/* END: Flowchart Header */}

      {/* BEGIN: FlowchartStage — flex row: canvas left, detail panel right */}
      <div className="flex gap-0 items-start">
      <div className="flex-1 overflow-x-auto py-6 px-2 flex justify-center items-start bg-slate-100/70 dark:bg-slate-950/40 rounded-xl border border-border/60 min-h-[1550px]">
        <div
          className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-800 p-8 flow-canvas origin-top transition-transform duration-200"
          id="canvasContainer"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* BEGIN: SVGConnectors */}
          <svg className="svg-connectors" viewBox="0 0 1040 1480" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker
                id="arrow"
                markerHeight={6}
                markerWidth={6}
                orient="auto-start-reverse"
                refX={7}
                refY={5}
                viewBox="0 0 10 10"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
              </marker>
            </defs>

            {/* 1. Obligations -> New Project */}
            <path d="M 520 70 L 520 95" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />

            {/* 2. New Project -> Preliminary Screening */}
            <path d="M 520 145 L 520 170" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />

            {/* 3. Preliminary Screening -> Project Type Classification */}
            <path d="M 520 220 L 520 250" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />

            {/* 4. Project Type Classification Branches */}
            {/* Branch Left: to Brownfield */}
            <path d="M 390 275 L 295 275" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />
            {/* Branch Right: to GreenField */}
            <path d="M 650 275 L 745 275" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />

            {/* LEFT PATH (Brownfield) Vertical Connectors */}
            {/* Brownfield -> Comprehensive ESDD */}
            <path d="M 180 300 L 180 435" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />
            {/* Comprehensive ESDD -> Risk Identification & Analysis */}
            <path d="M 180 485 L 180 520" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />
            {/* Risk Identification & Analysis -> Assign Risk Category */}
            <path d="M 180 570 L 180 605" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />
            {/* Assign Risk Category -> Formulate ESAP */}
            <path d="M 180 655 L 180 685" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />

            {/* RIGHT PATH (GreenField) Vertical Connectors */}
            {/* GreenField -> Comprehensive ESIA */}
            <path d="M 860 300 L 860 355" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />
            {/* Comprehensive ESIA -> Risk Identification & Analysis */}
            <path d="M 860 405 L 860 435" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />
            {/* Risk Identification & Analysis -> Potential Impact Analysis */}
            <path d="M 860 485 L 860 520" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />
            {/* Potential Impact Analysis -> Assign Risk Category */}
            <path d="M 860 570 L 860 605" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />
            {/* Assign Risk Category -> Formulate ESMP */}
            <path d="M 860 655 L 860 685" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />

            {/* CONVERGENCE into Implement ESAP & ESMP */}
            {/* From Formulate ESAP (Left): Down to Y=740, right to 520, then down to 770 */}
            <path
              d="M 180 735 L 180 742 Q 180 748 190 748 L 510 748 Q 520 748 520 756 L 520 770"
              fill="none"
              markerEnd="url(#arrow)"
              stroke="#64748b"
              strokeWidth={2.5}
            />
            {/* From Formulate ESMP (Right): Down to Y=740, left to 520, then down to 770 */}
            <path
              d="M 860 735 L 860 742 Q 860 748 850 748 L 520 748"
              fill="none"
              stroke="#64748b"
              strokeWidth={2.5}
            />

            {/* IMPLEMENTATION BRANCHES */}
            {/* Implement ESAP & ESMP -> Left to Monitor & Review Implementation */}
            <path d="M 400 795 L 295 795" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />
            {/* Implement ESAP & ESMP -> Right to ES Monitoring & Reporting Framework */}
            <path d="M 640 795 L 745 795" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />

            {/* ES Monitoring & Reporting Framework -> Reporting Obligations */}
            {/* Drops down, steps left, drops into Reporting Obligations */}
            <path
              d="M 860 820 L 860 842 Q 860 850 850 850 L 735 850 Q 725 850 725 858 L 725 885"
              fill="none"
              markerEnd="url(#arrow)"
              stroke="#64748b"
              strokeWidth={2.5}
            />

            {/* Reporting Obligations Branch Left -> BRSR / AMR / Impact Report */}
            <path d="M 605 910 L 585 910" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />
            {/* Reporting Obligations Branch Right -> IFC Lender Reports / CDP */}
            <path d="M 845 910 L 870 910" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />

            {/* DECISION LOOP FROM MONITOR & REVIEW */}
            {/* Monitor & Review Implementation -> Down to Risk Category Reduced ? */}
            <path
              d="M 180 820 L 180 845 Q 180 870 230 870 L 255 870 Q 255 940 255 985"
              fill="none"
              stroke="#64748b"
              strokeWidth={2.5}
            />
            {/* Direct connection line into top point of Risk Category Reduced Diamond */}
            <path d="M 180 820 L 180 970" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />

            {/* Diamond Decision Branch YES (Left) */}
            {/* From Diamond left vertex (70, 1010) -> Badge YES (20, 1010) */}
            <path d="M 145 1010 L 115 1010" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />
            {/* Badge YES to Maintain Operations */}
            <path
              d="M 70 1032 L 70 1120 Q 70 1130 80 1130 L 210 1130 Q 220 1130 220 1140 L 220 1160"
              fill="none"
              stroke="#64748b"
              strokeWidth={2.5}
            />
            {/* Maintain Operations -> Ongoing Monitoring & Periodic Review */}
            <path d="M 220 1210 L 220 1245" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />

            {/* Diamond Decision Branch NO (Bottom Right) */}
            {/* From Diamond bottom (255, 1050) -> Badge NO (315, 1115) */}
            <path
              d="M 255 1050 L 255 1070 Q 255 1080 265 1080 L 310 1080 Q 320 1080 320 1090 L 320 1095"
              fill="none"
              markerEnd="url(#arrow)"
              stroke="#64748b"
              strokeWidth={2.5}
            />
            {/* Badge NO -> Update ESAP / ESMP & Re - Implement */}
            <path d="M 345 1115 L 430 1115" fill="none" markerEnd="url(#arrow)" stroke="#64748b" strokeWidth={2.5} />

            {/* RE-IMPLEMENT RETURN LOOP */}
            {/* From Update ESAP / ESMP right edge (670, 1115), goes up and loops back into Monitor & Review Implementation / Review flow */}
            <path
              d="M 550 1090 L 550 890 Q 550 875 535 875 L 360 875 Q 350 875 350 860 L 350 840 Q 350 830 335 830 L 290 830"
              fill="none"
              stroke="#64748b"
              strokeWidth={2.5}
            />
            {/* Feeder into Review loop line */}
            <path
              d="M 550 1090 L 550 885 Q 550 875 535 875 L 365 875 Q 350 875 350 850 L 350 830"
              fill="none"
              stroke="#64748b"
              strokeWidth={2.5}
            />
          </svg>
          {/* END: SVGConnectors */}

          {/* BEGIN: ProcessNodes */}
          {/* 1. Obligations & Compliance */}
          {renderNode(
            "obligations",
            "Obligations & Compliance",
            "National Permits,IFCPS,Contractual Scope",
            { top: 20, left: 380, width: 280, height: 50 },
            undefined,
            "root-node"
          )}

          {/* 2. New Project Opportunity */}
          {renderNode(
            "opportunity",
            "New Project Opportunity",
            undefined,
            { top: 95, left: 380, width: 280, height: 50 }
          )}

          {/* 3. Preliminary E & S Screening */}
          {renderNode(
            "screening",
            "Preliminary E & S Screening",
            "(Before Bidding)",
            { top: 170, left: 380, width: 280, height: 50 }
          )}

          {/* 4. Project Type Classification */}
          {renderNode(
            "classification",
            "Project Type Classification",
            undefined,
            { top: 250, left: 390, width: 260, height: 50 }
          )}

          {/* LEFT COLUMN: BROWNFIELD BRANCH */}
          {/* 5. Brownfield */}
          {renderNode(
            "brownfield",
            "Brownfield",
            undefined,
            { top: 250, left: 60, width: 235, height: 50 }
          )}

          {/* 6. Comprehensive ESDD */}
          {renderNode(
            "esdd",
            "Comprehensive ESDD",
            undefined,
            { top: 435, left: 60, width: 240, height: 50 }
          )}

          {/* 7. Risk Identification & Analysis (Left) */}
          {renderNode(
            "risk_analysis_b",
            "Risk Identification & Analysis",
            undefined,
            { top: 520, left: 60, width: 240, height: 50 }
          )}

          {/* 8. Assign Risk Category (Left) */}
          {renderNode(
            "assign_risk_b",
            "Assign Risk Category",
            "(A / B / C / D)",
            { top: 605, left: 60, width: 240, height: 50 }
          )}

          {/* 9. Formulate ESAP */}
          {renderNode(
            "formulate_esap",
            "Formulate ESAP",
            undefined,
            { top: 685, left: 60, width: 240, height: 50 }
          )}

          {/* RIGHT COLUMN: GREENFIELD BRANCH */}
          {/* 10. GreenField */}
          {renderNode(
            "greenfield",
            "GreenField",
            undefined,
            { top: 250, left: 745, width: 235, height: 50 }
          )}

          {/* 11. Comprehensive ESIA */}
          {renderNode(
            "esia",
            "Comprehensive ESIA",
            undefined,
            { top: 355, left: 745, width: 235, height: 50 }
          )}

          {/* 12. Risk Identification & Analysis (Right) */}
          {renderNode(
            "risk_analysis_g",
            "Risk Identification & Analysis",
            undefined,
            { top: 435, left: 745, width: 240, height: 50 }
          )}

          {/* 13. Potential Impact Analysis */}
          {renderNode(
            "impact_analysis",
            "Potential Impact Analysis",
            undefined,
            { top: 520, left: 745, width: 235, height: 50 }
          )}

          {/* 14. Assign Risk Category (Right) */}
          {renderNode(
            "assign_risk_g",
            "Assign Risk Category",
            "(A / B / C / D)",
            { top: 605, left: 745, width: 235, height: 50 }
          )}

          {/* 15. Formulate ESMP */}
          {renderNode(
            "formulate_esmp",
            "Formulate ESMP",
            undefined,
            { top: 685, left: 745, width: 235, height: 50 }
          )}

          {/* CONVERGED IMPLEMENTATION ROW */}
          {/* 16. Monitor & Review Implementation */}
          {renderNode(
            "monitor_review",
            "Monitor & Review Implementation",
            undefined,
            { top: 770, left: 35, width: 260, height: 50 }
          )}

          {/* 17. Implement ESAP & ESMP */}
          {renderNode(
            "implement_esap_esmp",
            "Implement ESAP & ESMP",
            undefined,
            { top: 770, left: 400, width: 240, height: 50 }
          )}

          {/* 18. ES Monitoring & Reporting Framework */}
          {renderNode(
            "es_framework",
            "ES Monitoring & Reporting Framework",
            "Data Collection Via Metadata Format",
            { top: 770, left: 745, width: 240, height: 50 }
          )}

          {/* REPORTING SUITE */}
          {/* 19. BRSR / AMR / Impact Report */}
          {renderNode(
            "brsr_report",
            "BRSR / AMR / Impact Report",
            "National",
            { top: 885, left: 395, width: 190, height: 50 }
          )}

          {/* 20. Reporting Obligations */}
          {renderNode(
            "reporting_obligations",
            "Reporting Obligations",
            undefined,
            { top: 885, left: 605, width: 240, height: 50 }
          )}

          {/* 21. IFC Lender Reports / CDP */}
          {renderNode(
            "ifc_report",
            "IFC Lender Reports / CDP",
            "DFI",
            { top: 885, left: 870, width: 155, height: 50 }
          )}

          {/* DECISION SECTION */}
          {/* 22. Risk Category Reduced ? (Amber Diamond) */}
          <div
            className={cn("diamond-box", selectedNode === "decision_diamond" && "active-selected")}
            data-purpose="decision-diamond"
            style={{ top: 970, left: 145 }}
            tabIndex={0}
            role="button"
            aria-label="Risk Category Reduced ?"
            onClick={() => setSelectedNode("decision_diamond")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedNode("decision_diamond");
              }
            }}
          >
            <div className="diamond-shape" />
            <div className="diamond-content">
              Risk Category<br />Reduced ?
            </div>
          </div>

          {/* 23. Decision Outcome: YES (Green Diamond Badge) */}
          <div
            className={cn("badge-diamond badge-yes", selectedNode === "yes_branch" && "active-selected")}
            style={{ top: 988, left: 60 }}
            tabIndex={0}
            role="button"
            aria-label="Decision Outcome: YES"
            onClick={() => setSelectedNode("yes_branch")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedNode("yes_branch");
              }
            }}
          >
            <span>YES</span>
          </div>

          {/* 24. Decision Outcome: NO (Purple Diamond Badge) */}
          <div
            className={cn("badge-diamond badge-no", selectedNode === "no_branch" && "active-selected")}
            style={{ top: 1093, left: 298 }}
            tabIndex={0}
            role="button"
            aria-label="Decision Outcome: NO"
            onClick={() => setSelectedNode("no_branch")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedNode("no_branch");
              }
            }}
          >
            <span>NO</span>
          </div>

          {/* 25. Update ESAP / ESMP & Re - Implement (Orange Node) */}
          {renderNode(
            "update_esap",
            "Update ESAP / ESMP & Re - Implement",
            undefined,
            { top: 1090, left: 430, width: 240, height: 50 },
            "node-highlight-orange"
          )}

          {/* 26. Maintain Operations */}
          {renderNode(
            "maintain_ops",
            "Maintain Operations",
            "Lower Risk Profile",
            { top: 1160, left: 115, width: 210, height: 50 }
          )}

          {/* 27. Ongoing Monitoring & Periodic Review */}
          {renderNode(
            "periodic_review",
            "Ongoing Monitoring & Periodic Review",
            undefined,
            { top: 1245, left: 115, width: 210, height: 50 }
          )}
          {/* END: ProcessNodes */}
        </div>
      </div>
      {/* END: FlowchartStage canvas */}

      {/* BEGIN: INLINE DETAIL PANEL — matches LifecyclePanel right-side style */}
      {detail && (
        <div className="w-[420px] shrink-0 p-6 space-y-5 bg-card/25 backdrop-blur-xs border-l border-border/60 overflow-y-auto max-h-[calc(1550px+48px)] animate-in slide-in-from-right duration-250">

          {/* Header — mirrors LifecyclePanel header exactly */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                {detail.category}
              </span>
              <h2 className="text-[18px] font-bold text-foreground leading-snug tracking-tight mt-1">
                {detail.title}
              </h2>
              {detail.subtitle && (
                <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-2 pr-4">
                  {detail.subtitle}
                </p>
              )}
              <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-1.5 pr-4">
                {detail.plainEnglishExplanation}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary border border-primary/20">
                {detail.stepNumber}
              </span>
            </div>
          </div>

          {/* STAGE INFORMATION card — mirrors LifecyclePanel exactly */}
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3.5 shadow-xs">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border/40 pb-1.5">STAGE INFORMATION</span>
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-[12px]">
              <div>
                <span className="text-muted-foreground text-[10.5px] block font-medium">Stage</span>
                <span className="text-foreground font-semibold mt-0.5 block">{detail.title}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10.5px] block font-medium">Category</span>
                <span className="text-foreground font-semibold mt-0.5 block">{detail.category}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground text-[10.5px] block font-medium">Process Description</span>
                <span className="text-foreground font-medium mt-0.5 block leading-normal">{detail.description}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10.5px] block font-medium">Responsible Role</span>
                <span className="text-foreground font-semibold mt-0.5 block">{detail.ownerRole}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10.5px] block font-medium">Governing Standard</span>
                <span className="text-foreground font-semibold mt-0.5 block leading-snug">{detail.governingStandard}</span>
              </div>
            </div>
          </div>

          {/* Key Deliverables — same section label pattern as LifecyclePanel */}
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-border/60 pb-2">
              <h4 className="text-[12px] font-bold text-foreground uppercase tracking-wider">KEY DELIVERABLES</h4>
            </div>
            <ul className="space-y-2 pt-0.5">
              {detail.keyOutputs.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[12px] text-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Active Projects at this node */}
          {selectedNode && getProjectsAtNode(selectedNode).length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <h4 className="text-[12px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  ACTIVE PROJECTS ({getProjectsAtNode(selectedNode).length})
                </h4>
                <span className="text-[10px] text-muted-foreground font-mono">Live Pipeline</span>
              </div>
              <div className="space-y-2">
                {getProjectsAtNode(selectedNode).map((proj) => (
                  <div key={proj.projectId} className="rounded-lg border border-border/60 bg-card p-3 space-y-2 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[13px] font-semibold text-foreground">{proj.project}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {entityById(proj.entityId)?.short || proj.entityId} · {proj.branch} · {lifecycleDaysInStage(proj)} days in stage
                        </div>
                      </div>
                      {proj.blocked ? (
                        <span className="rounded-md bg-destructive/12 px-2 py-0.5 text-[9.5px] font-bold text-destructive uppercase tracking-wider">Blocked</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-warning/12 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-warning border border-warning/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
                          In Progress
                        </span>
                      )}
                    </div>
                    {proj.blocked && (
                      <div className="text-[11px] text-destructive bg-destructive/8 p-2 rounded-md border border-destructive/20 flex items-start gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{proj.blocked.reason}</span>
                      </div>
                    )}
                    {onSelectProject && (
                      <button
                        type="button"
                        onClick={() => { onSelectProject(proj.projectId); setSelectedNode(null); }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-[11.5px] font-semibold transition-colors cursor-pointer"
                      >
                        <span>Open {proj.project} Lifecycle</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* END: INLINE DETAIL PANEL */}
      </div>
      {/* END: FlowchartStage flex row */}
    </div>
  );
}
