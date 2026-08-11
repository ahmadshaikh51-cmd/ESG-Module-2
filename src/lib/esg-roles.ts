export type EsgRole =
  | "esg_team"
  | "site_manager"
  | "project_manager"
  | "hse"
  | "hr"
  | "operations"
  | "finance"
  | "legal"
  | "reviewer"
  | "approver"
  | "admin";

export interface EsgRoleConfig {
  key: EsgRole;
  label: string;
  tabs: string[]; // Areas they can see in the main ESG segmented controls
  subtabs: {
    projects: string[];
    esms: string[];
  };
  indicators: string[]; // Which indicators they are responsible for entering
  isContributorOnly: boolean; // Tells OverviewTab.tsx to render the "My Workspace" task view
}

export const ESG_ROLES_CONFIG: Record<EsgRole, EsgRoleConfig> = {
  esg_team: {
    key: "esg_team",
    label: "ESG Team / ESG Lead",
    tabs: ["overview", "projects", "esms", "reports", "vendors", "masters"],
    subtabs: {
      projects: ["permits", "site", "nc", "amr", "ghg", "brsr", "impact", "carbon"],
      esms: ["policies", "sops", "grievance", "esap", "lifecycle", "training", "monitoring"],
    },
    indicators: ["IND-2026-001", "IND-2026-002", "IND-2026-003", "IND-2026-004", "IND-2026-005", "IND-2026-006"],
    isContributorOnly: false,
  },
  site_manager: {
    key: "site_manager",
    label: "Site / Depot / Facility Manager",
    tabs: ["overview", "projects"],
    subtabs: {
      projects: ["nc", "amr"],
      esms: [],
    },
    indicators: ["IND-2026-001", "IND-2026-002", "IND-2026-003", "IND-2026-004", "IND-2026-005"],
    isContributorOnly: true,
  },
  project_manager: {
    key: "project_manager",
    label: "Project Manager / Owner",
    tabs: ["overview", "projects", "esms"],
    subtabs: {
      projects: ["permits", "site", "nc"],
      esms: ["esap", "lifecycle", "monitoring"],
    },
    indicators: ["IND-2026-001", "IND-2026-002", "IND-2026-003", "IND-2026-004"],
    isContributorOnly: true,
  },
  hse: {
    key: "hse",
    label: "HSE / EHS User",
    tabs: ["overview", "projects"],
    subtabs: {
      projects: ["nc", "amr"],
      esms: [],
    },
    indicators: ["IND-2026-003", "IND-2026-005"],
    isContributorOnly: true,
  },
  hr: {
    key: "hr",
    label: "HR / People User",
    tabs: ["overview", "projects"],
    subtabs: {
      projects: ["amr"],
      esms: [],
    },
    indicators: ["IND-2026-005", "IND-2026-006"],
    isContributorOnly: true,
  },
  operations: {
    key: "operations",
    label: "Energy / Operations User",
    tabs: ["overview", "projects"],
    subtabs: {
      projects: ["amr", "ghg"],
      esms: [],
    },
    indicators: ["IND-2026-001", "IND-2026-002", "IND-2026-004"],
    isContributorOnly: true,
  },
  finance: {
    key: "finance",
    label: "Finance / Accounts User",
    tabs: ["overview", "projects"],
    subtabs: {
      projects: ["amr"],
      esms: [],
    },
    indicators: ["IND-2026-001", "IND-2026-004"],
    isContributorOnly: true,
  },
  legal: {
    key: "legal",
    label: "Compliance / Legal User",
    tabs: ["overview", "projects", "esms"],
    subtabs: {
      projects: ["permits"],
      esms: ["policies", "sops"],
    },
    indicators: ["IND-2026-006"],
    isContributorOnly: true,
  },
  reviewer: {
    key: "reviewer",
    label: "ESG Reviewer",
    tabs: ["overview", "projects"],
    subtabs: {
      projects: ["nc", "amr"],
      esms: [],
    },
    indicators: ["IND-2026-001", "IND-2026-002", "IND-2026-003", "IND-2026-004", "IND-2026-005", "IND-2026-006"],
    isContributorOnly: true, // Will show a dashboard focused on validation queue
  },
  approver: {
    key: "approver",
    label: "ESG Approver",
    tabs: ["overview", "projects"],
    subtabs: {
      projects: ["nc", "amr"],
      esms: [],
    },
    indicators: ["IND-2026-001", "IND-2026-002", "IND-2026-003", "IND-2026-004", "IND-2026-005", "IND-2026-006"],
    isContributorOnly: true, // Will show a dashboard focused on approval approvals
  },
  admin: {
    key: "admin",
    label: "ESG Administrator",
    tabs: ["overview", "projects", "esms", "reports", "vendors", "masters"],
    subtabs: {
      projects: ["permits", "site", "nc", "amr", "ghg", "brsr", "impact", "carbon"],
      esms: ["policies", "sops", "grievance", "esap", "lifecycle", "training", "monitoring"],
    },
    indicators: ["IND-2026-001", "IND-2026-002", "IND-2026-003", "IND-2026-004", "IND-2026-005", "IND-2026-006"],
    isContributorOnly: false,
  },
};

export function getRoleFromEmail(email: string): EsgRole {
  const normalized = email.toLowerCase().trim();
  if (normalized.includes("lead") || normalized.includes("esg.lead")) return "esg_team";
  if (normalized.includes("depot") || normalized.includes("site") || normalized.includes("depot.manager")) return "site_manager";
  if (normalized.includes("project") || normalized.includes("project.manager")) return "project_manager";
  if (normalized.includes("hse") || normalized.includes("ehs")) return "hse";
  if (normalized.includes("hr") || normalized.includes("people")) return "hr";
  if (normalized.includes("operations") || normalized.includes("energy")) return "operations";
  if (normalized.includes("finance") || normalized.includes("accounts")) return "finance";
  if (normalized.includes("legal") || normalized.includes("compliance")) return "legal";
  if (normalized.includes("reviewer")) return "reviewer";
  if (normalized.includes("approver")) return "approver";
  if (normalized.includes("admin")) return "admin";
  return "esg_team"; // default fallback
}
