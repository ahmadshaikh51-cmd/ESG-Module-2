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
  Info,
  X,
  ChevronRight,
  ChevronLeft,
  FileCheck,
  Award,
  AlertTriangle,
  RefreshCw,
  Eye,
  Filter,
  Layers3,
  SlidersHorizontal,
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
  "obligations": {
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
  "opportunity": {
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
  "screening": {
    stepNumber: "Step 3",
    title: "Preliminary E & S Screening",
    subtitle: "Before bidding",
    category: "Pre-Bid Screening",
    plainEnglishExplanation: "Desktop and field check prior to bidding to flag major land or environmental risks.",
    description: "Rapid desktop and field appraisal conducted prior to commercial bidding to flag high-level environmental, social, and land issues.",
    keyOutputs: ["Preliminary E&S Screening Checklist", "Red Flag Assessment", "Go/No-Go Decision Note"],
    ownerRole: "E&S Screening Specialist",
    governingStandard: "IFC Guidance Note 1: E&S Assessment",
  },
  "classification": {
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
  "brownfield": {
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
  "esdd": {
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
  "risk_analysis_b": {
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
  "assign_risk_b": {
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
  "formulate_esap": {
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
  "greenfield": {
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
  "esia": {
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
  "risk_analysis_g": {
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
  "impact_analysis": {
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
  "assign_risk_g": {
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
  "formulate_esmp": {
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
  "implement_esap_esmp": {
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
  "monitor_review": {
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
  "es_framework": {
    stepNumber: "Step 6B",
    title: "ES Monitoring & Reporting Framework",
    subtitle: "Data collection via metadata format",
    category: "Data Collection",
    plainEnglishExplanation: "Collect monthly energy, water, GHG Scope 1-3, and safety data via structured forms.",
    description: "Standardized data ingestion pipeline gathering energy, water, GHG Scope 1-3, safety incidents, and social indicators via structured metadata.",
    keyOutputs: ["Monthly ESG Data Book", "Telemetry Data Logs", "KPI Verification Sheets"],
    ownerRole: "ESG Data & Analytics Lead",
    governingStandard: "GRI Standards & BRSR Reporting Framework",
  },
  "reporting_obligations": {
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
  "brsr_report": {
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
  "ifc_report": {
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
  "decision_diamond": {
    stepNumber: "Step 7 Gate",
    title: "Risk Category Reduced?",
    subtitle: "Evaluation Gateway",
    category: "Decision Gate",
    plainEnglishExplanation: "Evaluate if mitigations successfully reduced site risk category to baseline.",
    description: "Evaluates whether implemented ESAP/ESMP mitigations have successfully reduced operational and site risk category to baseline acceptable levels.",
    keyOutputs: ["Risk Re-assessment Certification", "Gate Review Minutes"],
    ownerRole: "ESG Steering Committee",
    governingStandard: "Transvolt Enterprise Risk Framework",
  },
  "maintain_ops": {
    stepNumber: "Step 7-YES",
    title: "Maintain Operations",
    subtitle: "Lower risk profile",
    category: "Stable Operations",
    plainEnglishExplanation: "YES: Risks are low & safe. Maintain normal, low-risk depot operations.",
    description: "Sustained operational phase operating under low-risk steady state with standard ESMP procedures in force.",
    keyOutputs: ["Operational Clearance Certificate", "Steady-State EHS Log"],
    ownerRole: "Depot Operations Manager",
    governingStandard: "ISO 14001 / 45001 Maintenance",
  },
  "periodic_review": {
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
  "update_esap": {
    stepNumber: "Step 7-NO Action",
    title: "Update ESAP / ESMP & re-implement",
    subtitle: "Corrective Action & Return Path",
    category: "Corrective Loop",
    plainEnglishExplanation: "NO: Risks are still high. Revise ESAP/ESMP actions & loop back to re-implement!",
    description: "Triggered when risks remain un-mitigated. Mandates revision of ESAP/ESMP corrective measures and re-implementation under elevated oversight.",
    keyOutputs: ["Revised ESAP Version", "Corrective Action Directive", "Re-Implementation Plan"],
    ownerRole: "Head of ESG & Site General Manager",
    governingStandard: "Corrective & Preventive Action (CAPA) Protocol",
  },
};

export function EsmsLifecycleDiagram() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pathFilter, setPathFilter] = useState<"all" | "brownfield" | "greenfield">("all");
  const [densityMode, setDensityMode] = useState<"compact" | "detailed">("compact");

  const detail = selectedNode ? NODE_DETAILS[selectedNode] : null;

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.75, prev + delta), 1.25));
  };

  const isDimmed = (path: "brownfield" | "greenfield") => {
    if (pathFilter === "all") return false;
    return pathFilter !== path;
  };

  return (
    <div className="w-full space-y-4 font-sans text-foreground">
      {/* Top Header & Interactive Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/90 p-4 backdrop-blur-md shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary font-bold">
              <GitBranch className="h-4 w-4" />
            </span>
            <h2 className="text-[15px] font-bold tracking-tight text-foreground">
              Project E&amp;S Lifecycle &amp; Compliance Workflow
            </h2>
            <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
              Interactive Workflow
            </span>
          </div>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Click any step to view full context, outputs, and governing standards. Use filters to focus on specific development paths.
          </p>
        </div>

        {/* Path Filters & View Density Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Path Focus Filter */}
          <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-background p-1">
            <button
              type="button"
              onClick={() => setPathFilter("all")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer",
                pathFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Paths
            </button>
            <button
              type="button"
              onClick={() => setPathFilter("brownfield")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer",
                pathFilter === "brownfield"
                  ? "bg-amber-500 text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Brownfield
            </button>
            <button
              type="button"
              onClick={() => setPathFilter("greenfield")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer",
                pathFilter === "greenfield"
                  ? "bg-emerald-500 text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Greenfield
            </button>
          </div>

          {/* Compact / Detailed Density Mode */}
          <button
            type="button"
            onClick={() => setDensityMode(densityMode === "compact" ? "detailed" : "compact")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11.5px] font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]",
              densityMode === "compact"
                ? "bg-card border-border/60 text-foreground"
                : "bg-primary/10 border-primary/30 text-primary"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            {densityMode === "compact" ? "Compact View" : "Detailed View"}
          </button>

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
      </div>

      {/* Modern Color Role Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-2 text-[11px]">
        <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
          Stage Legend:
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Governance Baseline
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <span className="h-2.5 w-2.5 rounded-md bg-amber-500" />
            Brownfield Retrofit Path
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <span className="h-2.5 w-2.5 rounded-md bg-emerald-500" />
            Greenfield Development Path
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <span className="h-2.5 w-2.5 rounded-md bg-indigo-500" />
            Monitoring &amp; Disclosures
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <span className="h-2.5 w-2.5 rotate-45 bg-amber-500" />
            Decision Gate
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <span className="h-2.5 w-2.5 rounded-md bg-rose-500" />
            Corrective Feedback Loop
          </span>
        </div>
      </div>

      {/* Main Flowchart Canvas */}
      <div className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-sm overflow-x-auto min-h-[920px]">
        <div
          className="mx-auto max-w-[1100px] transition-transform duration-200 origin-top space-y-5"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* STAGE 1-4: TRUNK SEQUENCE */}
          <div className="flex flex-col items-center">
            <DiagramNode
              id="obligations"
              stepBadge="1"
              title="Obligations & Compliance"
              subtitle="National Permits, IFCPS, Contractual Scope"
              icon={ShieldCheck}
              variant="governance"
              density={densityMode}
              onClick={() => setSelectedNode("obligations")}
            />
            <ConnectorLine />

            <DiagramNode
              id="opportunity"
              stepBadge="2"
              title="New Project Opportunity"
              subtitle="Initiation & Deal Pipeline Entry"
              icon={Building2}
              variant="neutral"
              density={densityMode}
              onClick={() => setSelectedNode("opportunity")}
            />
            <ConnectorLine />

            <DiagramNode
              id="screening"
              stepBadge="3"
              title="Preliminary E & S Screening"
              subtitle="Before bidding"
              icon={Search}
              variant="neutral"
              density={densityMode}
              onClick={() => setSelectedNode("screening")}
            />
            <ConnectorLine />

            <DiagramNode
              id="classification"
              stepBadge="4 Gate"
              title="Project Type Classification"
              subtitle="Site Nature & Scope Split"
              icon={GitBranch}
              variant="decision-header"
              density={densityMode}
              onClick={() => setSelectedNode("classification")}
            />
          </div>

          {/* PARALLEL BRANCHES: Brownfield (Left) vs Greenfield (Right) */}
          <div className="relative mt-2 pt-4 border-t border-dashed border-border/70">
            {/* Branch Column Headers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
              <div
                className={cn(
                  "flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-[12px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider transition-opacity duration-300",
                  isDimmed("brownfield") && "opacity-30"
                )}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-600" />
                  <span>Brownfield Path (Retrofit &amp; ESDD)</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-mono">
                  Path 4A
                </span>
              </div>

              <div
                className={cn(
                  "flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-[12px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider transition-opacity duration-300",
                  isDimmed("greenfield") && "opacity-30"
                )}
              >
                <div className="flex items-center gap-2">
                  <Trees className="h-4 w-4 text-emerald-600" />
                  <span>Greenfield Path (New Site &amp; ESIA)</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono">
                  Path 4B
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* BROWNFIELD COLUMN */}
              <div
                className={cn(
                  "flex flex-col items-center space-y-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/3 p-4 transition-all duration-300",
                  isDimmed("brownfield") && "opacity-30 blur-[0.3px]"
                )}
              >
                <DiagramNode
                  id="brownfield"
                  stepBadge="4A"
                  title="Brownfield"
                  subtitle="Existing Asset Retrofit"
                  icon={Building2}
                  variant="brownfield"
                  density={densityMode}
                  onClick={() => setSelectedNode("brownfield")}
                />
                <ConnectorLine color="amber" />

                <DiagramNode
                  id="esdd"
                  stepBadge="4A-1"
                  title="Comprehensive ESDD"
                  subtitle="Environmental & Social Due Diligence"
                  icon={FileText}
                  variant="brownfield"
                  density={densityMode}
                  onClick={() => setSelectedNode("esdd")}
                />
                <ConnectorLine color="amber" />

                <DiagramNode
                  id="risk_analysis_b"
                  stepBadge="4A-2"
                  title="Risk Identification & Analysis"
                  subtitle="Brownfield Risk Quantification"
                  icon={Activity}
                  variant="brownfield"
                  density={densityMode}
                  onClick={() => setSelectedNode("risk_analysis_b")}
                />
                <ConnectorLine color="amber" />

                <DiagramNode
                  id="assign_risk_b"
                  stepBadge="4A-3"
                  title="Assign Risk Category"
                  subtitle="(A / B / C / D)"
                  icon={Award}
                  variant="brownfield"
                  density={densityMode}
                  onClick={() => setSelectedNode("assign_risk_b")}
                />
                <ConnectorLine color="amber" />

                <DiagramNode
                  id="formulate_esap"
                  stepBadge="4A-4 Plan"
                  title="Formulate ESAP"
                  subtitle="Environmental & Social Action Plan"
                  icon={FileCheck}
                  variant="brownfield-highlight"
                  density={densityMode}
                  onClick={() => setSelectedNode("formulate_esap")}
                />
              </div>

              {/* GREENFIELD COLUMN */}
              <div
                className={cn(
                  "flex flex-col items-center space-y-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/3 p-4 transition-all duration-300",
                  isDimmed("greenfield") && "opacity-30 blur-[0.3px]"
                )}
              >
                <DiagramNode
                  id="greenfield"
                  stepBadge="4B"
                  title="GreenField"
                  subtitle="New Ground-Up Site"
                  icon={Trees}
                  variant="greenfield"
                  density={densityMode}
                  onClick={() => setSelectedNode("greenfield")}
                />
                <ConnectorLine color="emerald" />

                <DiagramNode
                  id="esia"
                  stepBadge="4B-1"
                  title="Comprehensive ESIA"
                  subtitle="Environmental & Social Impact Assessment"
                  icon={FileText}
                  variant="greenfield"
                  density={densityMode}
                  onClick={() => setSelectedNode("esia")}
                />
                <ConnectorLine color="emerald" />

                <DiagramNode
                  id="risk_analysis_g"
                  stepBadge="4B-2"
                  title="Risk Identification & Analysis"
                  subtitle="Greenfield Risk Matrix"
                  icon={Activity}
                  variant="greenfield"
                  density={densityMode}
                  onClick={() => setSelectedNode("risk_analysis_g")}
                />
                <ConnectorLine color="emerald" />

                <DiagramNode
                  id="impact_analysis"
                  stepBadge="4B-3"
                  title="Potential Impact Analysis"
                  subtitle="Severity & Scale Quantification"
                  icon={Layers}
                  variant="greenfield"
                  density={densityMode}
                  onClick={() => setSelectedNode("impact_analysis")}
                />
                <ConnectorLine color="emerald" />

                <DiagramNode
                  id="assign_risk_g"
                  stepBadge="4B-4"
                  title="Assign Risk Category"
                  subtitle="(A / B / C / D)"
                  icon={Award}
                  variant="greenfield"
                  density={densityMode}
                  onClick={() => setSelectedNode("assign_risk_g")}
                />
                <ConnectorLine color="emerald" />

                <DiagramNode
                  id="formulate_esmp"
                  stepBadge="4B-5 Plan"
                  title="Formulate ESMP"
                  subtitle="Environmental & Social Management Plan"
                  icon={FileCheck}
                  variant="greenfield-highlight"
                  density={densityMode}
                  onClick={() => setSelectedNode("formulate_esmp")}
                />
              </div>
            </div>
          </div>

          {/* CONVERGENCE POINT: Implement ESAP & ESMP */}
          <div className="flex flex-col items-center pt-5">
            <div className="flex items-center justify-center gap-2 mb-2 bg-primary/10 border border-primary/20 rounded-full px-3.5 py-0.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              <span className="text-[10.5px] font-bold text-primary uppercase tracking-wider">
                Paths Merge into Core Implementation
              </span>
            </div>

            <DiagramNode
              id="implement_esap_esmp"
              stepBadge="5 Core"
              title="Implement ESAP & ESMP"
              subtitle="Unified Execution Baseline"
              icon={CheckCircle2}
              variant="core-primary"
              density={densityMode}
              onClick={() => setSelectedNode("implement_esap_esmp")}
            />
          </div>

          {/* FAN-OUT TO MONITORING & REPORTING */}
          <div className="relative pt-5 border-t border-border/60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* LEFT FAN-OUT: Monitor & Review Implementation + Decision Diamond */}
              <div className="flex flex-col items-center space-y-4 rounded-2xl border border-primary/20 bg-primary/3 p-4 relative">
                <div className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Operational Monitoring &amp; Decision Gateway
                </div>

                <DiagramNode
                  id="monitor_review"
                  stepBadge="6A"
                  title="Monitor & Review Implementation"
                  subtitle="Audit & Field Oversight"
                  icon={Activity}
                  variant="monitoring"
                  density={densityMode}
                  onClick={() => setSelectedNode("monitor_review")}
                />

                <ConnectorLine color="primary" />

                {/* DECISION DIAMOND: Risk Category Reduced? */}
                <div className="relative my-1 flex flex-col items-center">
                  <div
                    onClick={() => setSelectedNode("decision_diamond")}
                    className="group relative cursor-pointer transform transition-all hover:scale-105 active:scale-95"
                  >
                    <div className="h-28 w-28 rotate-45 rounded-2xl border-2 border-amber-500 bg-amber-500/15 shadow-md flex items-center justify-center transition-all group-hover:border-amber-600 group-hover:shadow-amber-500/20">
                      <div className="-rotate-45 text-center px-2">
                        <span className="block text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5">
                          Gate 7
                        </span>
                        <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-0.5" />
                        <span className="block text-[11px] font-extrabold text-amber-800 dark:text-amber-300 leading-tight">
                          Risk Category Reduced?
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DECISION BRANCHES: YES vs NO */}
                <div className="w-full grid grid-cols-2 gap-3 items-start pt-1">
                  
                  {/* YES BRANCH (Left) */}
                  <div className="flex flex-col items-center space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <span className="rounded-md bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 shadow-2xs uppercase tracking-wider">
                      YES `→` Low Risk
                    </span>

                    <DiagramNode
                      id="maintain_ops"
                      stepBadge="7-YES"
                      title="Maintain Operations"
                      subtitle="Lower risk profile"
                      icon={CheckCircle2}
                      variant="success"
                      density={densityMode}
                      onClick={() => setSelectedNode("maintain_ops")}
                    />

                    <ConnectorLine color="emerald" />

                    <DiagramNode
                      id="periodic_review"
                      stepBadge="7-YES Final"
                      title="Ongoing Monitoring & Periodic Review"
                      subtitle="Continuous Assurance"
                      icon={RefreshCw}
                      variant="success"
                      density={densityMode}
                      onClick={() => setSelectedNode("periodic_review")}
                    />
                  </div>

                  {/* NO BRANCH (Right) with Corrective Action & Return Feedback Loop */}
                  <div className="flex flex-col items-center space-y-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 relative">
                    <span className="rounded-md bg-rose-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 shadow-2xs uppercase tracking-wider">
                      NO `→` High Risk
                    </span>

                    <DiagramNode
                      id="update_esap"
                      stepBadge="7-NO Action"
                      title="Update ESAP / ESMP & re-implement"
                      subtitle="Corrective Action & Return Path"
                      icon={AlertTriangle}
                      variant="alert-action"
                      density={densityMode}
                      onClick={() => setSelectedNode("update_esap")}
                    />

                    {/* Return Feedback Loop Indicator */}
                    <div className="mt-1 w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-rose-500/50 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 text-center">
                      <RotateCcw className="h-3 w-3 animate-spin-slow text-rose-600 shrink-0" />
                      <span>Loops Back to Step 6A</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* RIGHT FAN-OUT: ES Monitoring & Reporting Framework */}
              <div className="flex flex-col items-center space-y-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/3 p-4">
                <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                  Reporting Architecture &amp; Disclosures
                </div>

                <DiagramNode
                  id="es_framework"
                  stepBadge="6B Data"
                  title="ES Monitoring & Reporting Framework"
                  subtitle="Data collection via metadata format"
                  icon={FileSpreadsheet}
                  variant="reporting"
                  density={densityMode}
                  onClick={() => setSelectedNode("es_framework")}
                />

                <ConnectorLine color="indigo" />

                <DiagramNode
                  id="reporting_obligations"
                  stepBadge="6B-1"
                  title="Reporting Obligations"
                  subtitle="Statutory & Financial Disclosures"
                  icon={FileText}
                  variant="reporting"
                  density={densityMode}
                  onClick={() => setSelectedNode("reporting_obligations")}
                />

                <ConnectorLine color="indigo" />

                {/* Reporting Branch Split: National vs DFI */}
                <div className="w-full grid grid-cols-2 gap-3 pt-1">
                  
                  {/* BRSR / AMR / Impact Report — National */}
                  <div className="flex flex-col items-center">
                    <DiagramNode
                      id="brsr_report"
                      stepBadge="6B National"
                      title="BRSR / AMR / Impact Report"
                      subtitle="National"
                      icon={Award}
                      variant="reporting-child"
                      density={densityMode}
                      onClick={() => setSelectedNode("brsr_report")}
                    />
                  </div>

                  {/* IFC Lender Reports / CDP — DFI */}
                  <div className="flex flex-col items-center">
                    <DiagramNode
                      id="ifc_report"
                      stepBadge="6B DFI"
                      title="IFC Lender Reports / CDP"
                      subtitle="DFI"
                      icon={Sparkles}
                      variant="reporting-child"
                      density={densityMode}
                      onClick={() => setSelectedNode("ifc_report")}
                    />
                  </div>

                </div>

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

/**
 * Modern Ultra-Clean Node Card Component
 */
function DiagramNode({
  id,
  stepBadge,
  title,
  subtitle,
  icon: Icon,
  variant = "neutral",
  density = "compact",
  onClick,
}: {
  id: string;
  stepBadge?: string;
  title: string;
  subtitle?: string;
  icon?: any;
  variant?:
    | "governance"
    | "neutral"
    | "decision-header"
    | "brownfield"
    | "brownfield-highlight"
    | "greenfield"
    | "greenfield-highlight"
    | "core-primary"
    | "monitoring"
    | "success"
    | "alert-action"
    | "reporting"
    | "reporting-child";
  density?: "compact" | "detailed";
  onClick?: () => void;
}) {
  const variantStyles = {
    governance:
      "bg-primary/8 border-primary/30 hover:border-primary text-foreground shadow-2xs hover:shadow-sm",
    neutral:
      "bg-card border-border/60 hover:border-primary/50 text-foreground shadow-2xs hover:shadow-sm",
    "decision-header":
      "bg-card border-2 border-primary/60 text-foreground font-bold shadow-xs hover:shadow-sm",
    brownfield:
      "bg-amber-500/6 border-amber-500/25 hover:border-amber-500/60 text-foreground shadow-2xs",
    "brownfield-highlight":
      "bg-amber-500/12 border-2 border-amber-500 text-amber-950 dark:text-amber-100 font-bold shadow-xs",
    greenfield:
      "bg-emerald-500/6 border-emerald-500/25 hover:border-emerald-500/60 text-foreground shadow-2xs",
    "greenfield-highlight":
      "bg-emerald-500/12 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs",
    "core-primary":
      "bg-primary text-primary-foreground border-primary shadow-md hover:bg-primary/90 text-center py-3 max-w-[300px]",
    monitoring:
      "bg-primary/6 border border-primary/25 hover:border-primary/60 text-foreground shadow-2xs",
    success:
      "bg-emerald-500/8 border border-emerald-500/35 hover:border-emerald-500 text-foreground shadow-2xs",
    "alert-action":
      "bg-rose-500/12 border-2 border-rose-500 text-rose-950 dark:text-rose-100 font-bold shadow-xs animate-pulse-subtle",
    reporting:
      "bg-indigo-500/8 border border-indigo-500/35 hover:border-indigo-500 text-foreground shadow-2xs",
    "reporting-child":
      "bg-card border border-indigo-500/25 hover:border-indigo-500/60 text-foreground shadow-2xs text-center",
  };

  const isCorePrimary = variant === "core-primary";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative w-full max-w-[270px] rounded-xl border p-3 transition-all duration-200 cursor-pointer select-none hover:-translate-y-0.5",
        variantStyles[variant]
      )}
    >
      {/* Top Header: Step Badge + Icon */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        {stepBadge ? (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border",
              isCorePrimary
                ? "bg-white text-primary border-white"
                : "bg-muted/80 text-muted-foreground border-border/50 group-hover:border-primary/40 group-hover:text-primary"
            )}
          >
            {stepBadge}
          </span>
        ) : (
          <div />
        )}

        {Icon && (
          <span
            className={cn(
              "grid h-5 w-5 place-items-center rounded-md text-xs transition-colors",
              isCorePrimary
                ? "bg-white/20 text-white"
                : "text-muted-foreground group-hover:text-primary"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {/* Main Title */}
      <span
        className={cn(
          "block text-[12.5px] font-bold leading-tight truncate",
          isCorePrimary ? "text-primary-foreground" : "text-foreground"
        )}
      >
        {title}
      </span>

      {/* Detailed Mode Subtitle */}
      {density === "detailed" && subtitle && (
        <span
          className={cn(
            "block text-[10.5px] leading-tight mt-1 truncate",
            isCorePrimary ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}

/**
 * Connector Line Component
 */
function ConnectorLine({ color = "neutral" }: { color?: "neutral" | "amber" | "emerald" | "primary" | "indigo" }) {
  const colorMap = {
    neutral: "text-border",
    amber: "text-amber-500/50",
    emerald: "text-emerald-500/50",
    primary: "text-primary/50",
    indigo: "text-indigo-500/50",
  };

  return (
    <div className="flex flex-col items-center my-0.5">
      <div className={cn("w-[2px] h-3.5 bg-current opacity-40", colorMap[color])} />
      <ArrowDown className={cn("h-3.5 w-3.5 -mt-1", colorMap[color])} />
    </div>
  );
}
