/**
 * ESG module — stub data layer (UI-only build).
 *
 * Everything here is placeholder data behind the interface. Where the real
 * system will compute/fetch/enforce, this file returns static values with the
 * same shape so screens can be built with honest empty/loading/error states.
 * Provenance stamps mark values that will later arrive from source systems.
 */

export const ESG_TODAY = new Date("2026-07-15T09:00:00+05:30");

/* ---------------------------------- scope --------------------------------- */

export type Depot = { id: string; name: string };
export type Entity = { id: string; name: string; short: string; depots: Depot[] };

export const ESG_GROUP = {
  id: "transvolt",
  name: "Transvolt Mobility",
  entities: [
    {
      id: "mbmt",
      name: "MBMT E-Bus Operations",
      short: "MBMT",
      depots: [
        { id: "bhayandar", name: "Bhayandar Depot" },
        { id: "kashimira", name: "Kashimira Depot" },
      ],
    },
    {
      id: "silvassa",
      name: "Silvassa City SPV",
      short: "Silvassa",
      depots: [{ id: "silvassa-depot", name: "Silvassa Depot" }],
    },
    {
      id: "corp",
      name: "Corporate (HQ)",
      short: "Corporate",
      depots: [{ id: "hq", name: "Andheri HQ" }],
    },
  ] as Entity[],
};

export type ScopeSel = { entityId?: string; depotId?: string };

export function scopeLabel(sel: ScopeSel): string {
  if (!sel.entityId) return ESG_GROUP.name;
  const e = ESG_GROUP.entities.find((x) => x.id === sel.entityId);
  if (!e) return ESG_GROUP.name;
  if (!sel.depotId) return e.name;
  const d = e.depots.find((x) => x.id === sel.depotId);
  return d ? `${e.short} · ${d.name}` : e.name;
}

/* --------------------------------- people --------------------------------- */

export type Person = { id: string; name: string; role: string };

export const PEOPLE: Person[] = [
  { id: "priya", name: "Priya Nair", role: "ESG Executive" },
  { id: "kavita", name: "Kavita Rao", role: "ESG Lead" },
  { id: "arjun", name: "Arjun Mehta", role: "Project Manager · MBMT" },
  { id: "rohan", name: "Rohan Desai", role: "Depot Manager · Kashimira" },
  { id: "sunil", name: "Sunil Patil", role: "Admin & Liaison" },
  { id: "rahul", name: "Rahul Patil", role: "Environmental Compliance Officer" },
  { id: "madhavi", name: "Madhavi Deshpande", role: "POSH Officer" },
  { id: "amit", name: "Amit Kulkarni", role: "Factory Compliance Manager" },
  { id: "prakash", name: "Prakash Joshi", role: "Fire & Safety Officer" },
  { id: "sandeep", name: "Sandeep Sharma", role: "Contractor Compliance Officer" },
  { id: "neha", name: "Neha Verma", role: "Principal Employer Compliance Officer" },
];

export const personById = (id: string) => PEOPLE.find((p) => p.id === id);

/* -------------------------------- glossary -------------------------------- */

export const GLOSSARY: Record<string, { full: string; note?: string }> = {
  ESG: { full: "Environmental, Social & Governance" },
  ESMS: { full: "Environmental & Social Management System" },
  ESDD: { full: "Environmental & Social Due Diligence", note: "Study for brownfield projects." },
  ESIA: {
    full: "Environmental & Social Impact Assessment",
    note: "Study for greenfield projects.",
  },
  ESAP: {
    full: "Environmental & Social Action Plan",
    note: "Corrective actions from ESDD / ESIA findings.",
  },
  AMR: {
    full: "Annual Monitoring Report",
    note: "Lender-defined input fields, reported periodically.",
  },
  GHG: { full: "Greenhouse Gas", note: "Scope 1 / 2 / 3 emission accounting." },
  BRSR: {
    full: "Business Responsibility & Sustainability Reporting",
    note: "SEBI disclosure format.",
  },
  NOC: { full: "No Objection Certificate" },
  CTO: { full: "Consent to Operate", note: "State pollution control board consent." },
  CTE: { full: "Consent to Establish" },
  COE: { full: "Certificate of Establishment", note: "Shops & Establishment registration." },
  ROC: { full: "Registrar of Companies" },
  "MOA/AOA": { full: "Memorandum & Articles of Association" },
  SWM: { full: "Solid Waste Management" },
  STP: { full: "Sewage Treatment Plant" },
  ETP: { full: "Effluent Treatment Plant" },
  PCC: { full: "Pollution Control Committee", note: "UT-level consent authority (Silvassa)." },
  ISO: { full: "International Organization for Standardization" },
  SPV: { full: "Special Purpose Vehicle" },
  DG: { full: "Diesel Generator" },
  CEA: { full: "Central Electricity Authority", note: "Publishes the grid emission factor." },
  DEFRA: {
    full: "UK Dept. for Environment, Food & Rural Affairs",
    note: "Emission-factor dataset.",
  },
  EV: { full: "Electric Vehicle" },
  MBMT: { full: "Mira Bhayandar Municipal Transport" },
  DMS: { full: "Document Management System" },
  tCO2e: { full: "Tonnes of CO₂ equivalent" },
  SEBI: { full: "Securities and Exchange Board of India" },
  "O&M": { full: "Operations & Maintenance" },
  NC: {
    full: "Non-Conformity",
    note: "An audit or monitoring finding outside a defined requirement.",
  },
  ESMP: {
    full: "Environmental & Social Management Plan",
    note: "Greenfield equivalent of the ESAP.",
  },
  IFC: {
    full: "International Finance Corporation",
    note: "Publishes the Performance Standards lenders benchmark against.",
  },
  DFI: {
    full: "Development Finance Institution",
    note: "Development lender whose requirements shape ESMS scope.",
  },
  "E&S": { full: "Environmental & Social" },
  EHS: { full: "Environment, Health & Safety" },
  CAPA: {
    full: "Corrective & Preventive Action",
    note: "The action a non-conformity is closed with.",
  },
  TNA: { full: "Training Needs Assessment" },
};

/* ------------------------------- type master ------------------------------ */

export type ComplianceCategory = "permit" | "site";

export type ComplianceType = {
  key: string;
  label: string;
  category: ComplianceCategory;
  leadDays: number; // renewal alert window before expiry
  ownerRole: string;
};

export const TYPE_MASTER: ComplianceType[] = [
  {
    key: "incorporation",
    label: "Certificate of Incorporation",
    category: "permit",
    leadDays: 0,
    ownerRole: "Company Secretary",
  },
  // Renewal-bearing licence types raised to a 90-day (3-month) floor per the
  // stakeholder requirement; perpetual instruments (no expiry) are unaffected.
  {
    key: "roc-filing",
    label: "ROC Annual Filing",
    category: "permit",
    leadDays: 90,
    ownerRole: "Company Secretary",
  },
  {
    key: "moa-aoa",
    label: "MOA/AOA",
    category: "permit",
    leadDays: 0,
    ownerRole: "Company Secretary",
  },
  {
    key: "cto",
    label: "CTO — Consent to Operate",
    category: "permit",
    leadDays: 90,
    ownerRole: "ESG Executive",
  },
  {
    key: "coe",
    label: "COE — Certificate of Establishment",
    category: "permit",
    leadDays: 90,
    ownerRole: "Admin",
  },
  {
    key: "trade-licence",
    label: "Trade Licence",
    category: "permit",
    leadDays: 90,
    ownerRole: "Admin",
  },
  {
    key: "fire-noc",
    label: "Fire NOC",
    category: "site",
    leadDays: 60,
    ownerRole: "Depot Manager",
  },
  {
    key: "swm",
    label: "SWM Authorisation",
    category: "site",
    leadDays: 60,
    ownerRole: "ESG Executive",
  },
  {
    key: "stp",
    label: "STP Compliance Certificate",
    category: "site",
    leadDays: 45,
    ownerRole: "Depot Manager",
  },
  { key: "etp", label: "ETP Consent", category: "site", leadDays: 45, ownerRole: "Depot Manager" },
  { key: "pcc", label: "PCC Consent", category: "site", leadDays: 60, ownerRole: "ESG Executive" },
  {
    key: "iso-14001",
    label: "ISO 14001 (Environment)",
    category: "site",
    leadDays: 90,
    ownerRole: "ESG Lead",
  },
  {
    key: "iso-45001",
    label: "ISO 45001 (Health & Safety)",
    category: "site",
    leadDays: 90,
    ownerRole: "ESG Lead",
  },
  {
    key: "iso-9001",
    label: "ISO 9001 (Quality) — certification in progress",
    category: "site",
    leadDays: 90,
    ownerRole: "ESG Lead",
  },
  {
    key: "battery-disposal",
    label: "Battery Disposal Authorisation",
    category: "site",
    leadDays: 60,
    ownerRole: "ESG Executive",
  },
];

export const typeByKey = (k: string) => TYPE_MASTER.find((t) => t.key === k);

/* ------------------------------ compliance rec ----------------------------- */

export type Provenance = { source: string; fetchedAt: string; error?: string };

export type ComplianceRecord = {
  id: string;
  typeKey: string;
  entityId: string;
  depotId?: string;
  authority: string;
  refNo: string;
  issueDate: string; // ISO date
  expiryDate?: string; // undefined = perpetual (incorporation, MOA)
  ownerId: string;
  doc: { name: string; size: string; uploadedAt: string };
  autoFields?: { label: string; value: string; prov: Provenance }[];
  withheldExternal?: boolean; // curated out of external views by default
  remarks?: string; // mandatory when non-compliant
  renewal?: "none" | "initiated";
};

export const RECORDS: ComplianceRecord[] = [
  // ---- overdue (the risk stock) ----
  {
    id: "r-fire-kash",
    typeKey: "fire-noc",
    entityId: "mbmt",
    depotId: "kashimira",
    authority: "Maharashtra Fire Services",
    refNo: "FN/KSH/2025/118",
    issueDate: "2025-06-28",
    expiryDate: "2026-06-28",
    ownerId: "rohan",
    doc: { name: "fire-noc-kashimira-2025.pdf", size: "1.2 MB", uploadedAt: "2025-07-02" },
    withheldExternal: true,
    remarks:
      "Renewal application filed 30 Jun; fire dept inspection pending — hydrant pressure test failed on first visit, pump replacement ordered (ETA 22 Jul).",
    renewal: "initiated",
  },
  {
    id: "r-stp-bhy",
    typeKey: "stp",
    entityId: "mbmt",
    depotId: "bhayandar",
    authority: "MPCB",
    refNo: "STP/BHY/2025/44",
    issueDate: "2025-07-04",
    expiryDate: "2026-07-04",
    ownerId: "rohan",
    doc: { name: "stp-cert-bhayandar.pdf", size: "840 KB", uploadedAt: "2025-07-06" },
    withheldExternal: true,
    remarks:
      "Lab re-test of treated water sample scheduled 18 Jul; certificate renewal blocked until report.",
    renewal: "none",
  },
  {
    id: "r-roc-corp",
    typeKey: "roc-filing",
    entityId: "corp",
    depotId: "hq",
    authority: "MCA / ROC Mumbai",
    refNo: "AOC-4/2025-26",
    issueDate: "2025-07-31",
    expiryDate: "2026-06-30",
    ownerId: "sunil",
    doc: { name: "roc-aoc4-fy25.pdf", size: "2.1 MB", uploadedAt: "2025-08-02" },
    withheldExternal: true,
    remarks: "FY25-26 filing pending auditor sign-off; CS engaged, target 25 Jul.",
    renewal: "initiated",
  },
  {
    id: "r-ewaste-silv",
    typeKey: "battery-disposal",
    entityId: "silvassa",
    depotId: "silvassa-depot",
    authority: "DNH & DD PCC",
    refNo: "BD/SLV/2025/09",
    issueDate: "2025-05-30",
    expiryDate: "2026-06-30",
    ownerId: "priya",
    doc: { name: "battery-auth-silvassa.pdf", size: "660 KB", uploadedAt: "2025-06-01" },
    withheldExternal: true,
    remarks:
      "Authorised recycler contract lapsed with the permit; renewal filed together on 08 Jul.",
    renewal: "initiated",
  },
  // ---- expiring soon (inside lead window) ----
  {
    id: "r-fire-bhy",
    typeKey: "fire-noc",
    entityId: "mbmt",
    depotId: "bhayandar",
    authority: "Maharashtra Fire Services",
    refNo: "FN/BHY/2025/204",
    issueDate: "2025-08-05",
    expiryDate: "2026-08-05",
    ownerId: "rohan",
    doc: { name: "fire-noc-bhayandar-2025.pdf", size: "1.1 MB", uploadedAt: "2025-08-08" },
    renewal: "none",
  },
  {
    id: "r-cto-mbmt",
    typeKey: "cto",
    entityId: "mbmt",
    authority: "MPCB",
    refNo: "CTO/TH/2024/7761",
    issueDate: "2024-08-20",
    expiryDate: "2026-08-20",
    ownerId: "priya",
    doc: { name: "cto-mbmt-2024.pdf", size: "3.4 MB", uploadedAt: "2024-08-25" },
    autoFields: [
      {
        label: "Consented capacity (buses)",
        value: "220",
        prov: { source: "Asset register", fetchedAt: "2026-07-14T22:10:00Z" },
      },
    ],
    renewal: "initiated",
  },
  {
    id: "r-iso14001",
    typeKey: "iso-14001",
    entityId: "corp",
    authority: "TÜV SÜD",
    refNo: "ISO14K/IN/22-885",
    issueDate: "2023-09-10",
    expiryDate: "2026-09-10",
    ownerId: "kavita",
    doc: { name: "iso14001-cert.pdf", size: "540 KB", uploadedAt: "2023-09-15" },
    renewal: "none",
  },
  {
    id: "r-swm-silv",
    typeKey: "swm",
    entityId: "silvassa",
    depotId: "silvassa-depot",
    authority: "DNH & DD PCC",
    refNo: "SWM/SLV/2025/21",
    issueDate: "2025-08-30",
    expiryDate: "2026-08-30",
    ownerId: "priya",
    doc: { name: "swm-auth-silvassa.pdf", size: "720 KB", uploadedAt: "2025-09-01" },
    renewal: "none",
  },
  {
    id: "r-pcc-silv",
    typeKey: "pcc",
    entityId: "silvassa",
    authority: "DNH & DD PCC",
    refNo: "PCC/SLV/2024/133",
    issueDate: "2024-09-01",
    expiryDate: "2026-09-01",
    ownerId: "priya",
    doc: { name: "pcc-consent-silvassa.pdf", size: "1.6 MB", uploadedAt: "2024-09-04" },
    renewal: "none",
  },
  {
    id: "r-trade-bhy",
    typeKey: "trade-licence",
    entityId: "mbmt",
    depotId: "bhayandar",
    authority: "MBMC",
    refNo: "TL/2025/5521",
    issueDate: "2025-08-25",
    expiryDate: "2026-08-25",
    ownerId: "sunil",
    doc: { name: "trade-licence-bhy.pdf", size: "380 KB", uploadedAt: "2025-08-28" },
    renewal: "none",
  },
  // ---- valid ----
  {
    id: "r-fire-slv",
    typeKey: "fire-noc",
    entityId: "silvassa",
    depotId: "silvassa-depot",
    authority: "DNH Fire & Emergency",
    refNo: "FN/SLV/2026/031",
    issueDate: "2026-02-14",
    expiryDate: "2027-02-14",
    ownerId: "priya",
    doc: { name: "fire-noc-silvassa-2026.pdf", size: "980 KB", uploadedAt: "2026-02-16" },
  },
  {
    id: "r-cto-silv",
    typeKey: "cto",
    entityId: "silvassa",
    authority: "DNH & DD PCC",
    refNo: "CTO/SLV/2025/402",
    issueDate: "2025-11-12",
    expiryDate: "2027-11-12",
    ownerId: "priya",
    doc: { name: "cto-silvassa.pdf", size: "2.8 MB", uploadedAt: "2025-11-15" },
  },
  {
    id: "r-coe-hq",
    typeKey: "coe",
    entityId: "corp",
    depotId: "hq",
    authority: "BMC (Shops & Estab.)",
    refNo: "COE/MUM/2025/8812",
    issueDate: "2025-12-01",
    expiryDate: "2026-11-30",
    ownerId: "sunil",
    doc: { name: "coe-hq.pdf", size: "410 KB", uploadedAt: "2025-12-03" },
  },
  {
    id: "r-coe-bhy",
    typeKey: "coe",
    entityId: "mbmt",
    depotId: "bhayandar",
    authority: "MBMC (Shops & Estab.)",
    refNo: "COE/MBM/2026/112",
    issueDate: "2026-01-15",
    expiryDate: "2027-01-14",
    ownerId: "sunil",
    doc: { name: "coe-bhayandar.pdf", size: "395 KB", uploadedAt: "2026-01-17" },
  },
  {
    id: "r-etp-kash",
    typeKey: "etp",
    entityId: "mbmt",
    depotId: "kashimira",
    authority: "MPCB",
    refNo: "ETP/KSH/2026/07",
    issueDate: "2026-03-20",
    expiryDate: "2027-03-20",
    ownerId: "rohan",
    doc: { name: "etp-consent-kashimira.pdf", size: "1.0 MB", uploadedAt: "2026-03-22" },
    autoFields: [
      {
        label: "Effluent flow (KLD, monthly avg)",
        value: "8.4",
        prov: { source: "Depot water meter", fetchedAt: "2026-07-14T21:40:00Z" },
      },
    ],
  },
  {
    id: "r-swm-bhy",
    typeKey: "swm",
    entityId: "mbmt",
    depotId: "bhayandar",
    authority: "MPCB",
    refNo: "SWM/BHY/2026/18",
    issueDate: "2026-04-02",
    expiryDate: "2027-04-02",
    ownerId: "priya",
    doc: { name: "swm-auth-bhayandar.pdf", size: "700 KB", uploadedAt: "2026-04-05" },
  },
  {
    id: "r-iso45001",
    typeKey: "iso-45001",
    entityId: "corp",
    authority: "TÜV SÜD",
    refNo: "ISO45K/IN/24-102",
    issueDate: "2024-11-20",
    expiryDate: "2027-11-20",
    ownerId: "kavita",
    doc: { name: "iso45001-cert.pdf", size: "530 KB", uploadedAt: "2024-11-22" },
  },
  {
    id: "r-inc-corp",
    typeKey: "incorporation",
    entityId: "corp",
    authority: "MCA",
    refNo: "CIN U34300MH2021PTC366702",
    issueDate: "2021-09-14",
    ownerId: "sunil",
    doc: { name: "certificate-of-incorporation.pdf", size: "290 KB", uploadedAt: "2021-09-20" },
  },
  {
    id: "r-moa-corp",
    typeKey: "moa-aoa",
    entityId: "corp",
    authority: "MCA",
    refNo: "MOA/AOA v3 (2024 amendment)",
    issueDate: "2024-02-08",
    ownerId: "sunil",
    doc: { name: "moa-aoa-2024.pdf", size: "4.8 MB", uploadedAt: "2024-02-12" },
  },
  {
    id: "r-trade-kash",
    typeKey: "trade-licence",
    entityId: "mbmt",
    depotId: "kashimira",
    authority: "MBMC",
    refNo: "TL/2026/1108",
    issueDate: "2026-03-01",
    expiryDate: "2027-02-28",
    ownerId: "sunil",
    doc: { name: "trade-licence-kash.pdf", size: "365 KB", uploadedAt: "2026-03-03" },
  },
  {
    id: "r-etp-slv",
    typeKey: "etp",
    entityId: "silvassa",
    depotId: "silvassa-depot",
    authority: "DNH & DD PCC",
    refNo: "ETP/SLV/2026/03",
    issueDate: "2026-05-10",
    expiryDate: "2027-05-10",
    ownerId: "priya",
    doc: { name: "etp-consent-silvassa.pdf", size: "930 KB", uploadedAt: "2026-05-12" },
  },
  {
    id: "r-stp-kash",
    typeKey: "stp",
    entityId: "mbmt",
    depotId: "kashimira",
    authority: "MPCB",
    refNo: "STP/KSH/2026/12",
    issueDate: "2026-06-05",
    expiryDate: "2027-06-05",
    ownerId: "rohan",
    doc: { name: "stp-cert-kashimira.pdf", size: "810 KB", uploadedAt: "2026-06-06" },
  },
];

/* ------------------------------ state machine ----------------------------- */

export type EsgState = "valid" | "expiring" | "overdue";

export const STATE_META: Record<EsgState, { label: string; color: string; text: string }> = {
  valid: { label: "Valid", color: "var(--color-success)", text: "text-success" },
  expiring: { label: "Expiring", color: "var(--color-warning)", text: "text-warning" },
  overdue: { label: "Overdue", color: "var(--color-destructive)", text: "text-destructive" },
};

export function daysUntil(iso: string, today = ESG_TODAY): number {
  const d = new Date(`${iso}T00:00:00+05:30`);
  return Math.ceil((d.getTime() - today.getTime()) / 86_400_000);
}

export function recordState(r: ComplianceRecord, today = ESG_TODAY): EsgState {
  if (!r.expiryDate) return "valid"; // perpetual instruments
  const d = daysUntil(r.expiryDate, today);
  if (d < 0) return "overdue";
  const lead = typeByKey(r.typeKey)?.leadDays ?? 60;
  return d <= lead ? "expiring" : "valid";
}

export function fmtDate(iso?: string): string {
  if (!iso) return "Perpetual";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function countdownLabel(r: ComplianceRecord): string {
  if (!r.expiryDate) return "No expiry";
  const d = daysUntil(r.expiryDate);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return "Expires today";
  return `${d}d left`;
}

export function inScope(r: { entityId: string; depotId?: string }, sel: ScopeSel): boolean {
  if (sel.entityId && r.entityId !== sel.entityId) return false;
  if (sel.depotId && r.depotId !== sel.depotId) return false;
  return true;
}

export const entityById = (id: string) => ESG_GROUP.entities.find((e) => e.id === id);

export function recordPlace(r: ComplianceRecord): string {
  const e = entityById(r.entityId);
  if (!e) return r.entityId;
  if (!r.depotId) return e.short;
  const d = e.depots.find((x) => x.id === r.depotId);
  if (!d) return e.short;
  const depotShort = d.name.replace(" Depot", "");
  return depotShort === e.short ? e.short : `${e.short} · ${depotShort}`;
}

/* ------------------------------- ESMS content ------------------------------ */

/**
 * A single uploaded revision of a policy. Approval of the latest version is the
 * gate a policy must pass before its actions enter the ESAP/ESMP Register.
 */
export type PolicyVersion = {
  version: string; // "v3.0"
  uploadedAt: string;
  uploadedBy: string; // person id
  status: "draft" | "submitted" | "approved" | "rejected";
  approvedBy?: string; // person id
  approvedOn?: string;
  doc: { name: string; size: string };
};

export type Policy = {
  id: string;
  name: string;
  entityId: string;
  /** Convenience mirror of `currentVersion` — kept for existing list rendering. */
  version: string;
  status: "approved" | "under-review" | "draft";
  updated: string;
  ownerId: string;
  currentVersion: string;
  reviewDue: string; // annual review date
  versions: PolicyVersion[];
};

const policyDoc = (name: string, version: string, size: string) => ({
  name: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${version}.pdf`,
  size,
});

export const POLICIES: Policy[] = [
  {
    id: "p-esg",
    name: "ESG Policy",
    entityId: "corp",
    version: "v3.0",
    status: "approved",
    updated: "2026-01-20",
    ownerId: "kavita",
    currentVersion: "v3.0",
    reviewDue: "2026-08-30", // inside the 60-day review window
    versions: [
      {
        version: "v3.0",
        uploadedAt: "2026-01-14",
        uploadedBy: "kavita",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2026-01-20",
        doc: policyDoc("ESG Policy", "v3.0", "1.4 MB"),
      },
      {
        version: "v2.0",
        uploadedAt: "2025-01-10",
        uploadedBy: "kavita",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2025-01-18",
        doc: policyDoc("ESG Policy", "v2.0", "1.2 MB"),
      },
      {
        version: "v1.0",
        uploadedAt: "2024-02-02",
        uploadedBy: "priya",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2024-02-12",
        doc: policyDoc("ESG Policy", "v1.0", "980 KB"),
      },
    ],
  },
  {
    id: "p-ehs",
    name: "Environment, Health & Safety Policy",
    entityId: "corp",
    version: "v2.4",
    status: "approved",
    updated: "2025-11-05",
    ownerId: "kavita",
    currentVersion: "v2.4",
    reviewDue: "2026-06-01", // overdue for annual review
    versions: [
      {
        version: "v2.4",
        uploadedAt: "2025-10-28",
        uploadedBy: "kavita",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2025-11-05",
        doc: policyDoc("EHS Policy", "v2.4", "1.1 MB"),
      },
      {
        version: "v2.0",
        uploadedAt: "2024-10-20",
        uploadedBy: "priya",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2024-11-02",
        doc: policyDoc("EHS Policy", "v2.0", "1.0 MB"),
      },
    ],
  },
  {
    id: "p-hr",
    name: "Human Rights & Labour Policy",
    entityId: "corp",
    version: "v1.2",
    status: "under-review",
    updated: "2026-06-28",
    ownerId: "kavita",
    currentVersion: "v1.1",
    reviewDue: "2026-12-15",
    versions: [
      // v1.2 sits in review — the approved current version is still v1.1
      {
        version: "v1.2",
        uploadedAt: "2026-06-28",
        uploadedBy: "priya",
        status: "submitted",
        doc: policyDoc("Human Rights Policy", "v1.2", "760 KB"),
      },
      {
        version: "v1.1",
        uploadedAt: "2025-06-10",
        uploadedBy: "kavita",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2025-06-20",
        doc: policyDoc("Human Rights Policy", "v1.1", "740 KB"),
      },
      {
        version: "v1.0",
        uploadedAt: "2024-06-05",
        uploadedBy: "kavita",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2024-06-14",
        doc: policyDoc("Human Rights Policy", "v1.0", "700 KB"),
      },
    ],
  },
  {
    id: "p-grv",
    name: "Community Grievance Policy",
    entityId: "mbmt",
    version: "v1.0",
    status: "approved",
    updated: "2025-09-14",
    ownerId: "priya",
    currentVersion: "v1.0",
    reviewDue: "2026-09-14",
    versions: [
      {
        version: "v1.0",
        uploadedAt: "2025-09-06",
        uploadedBy: "priya",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2025-09-14",
        doc: policyDoc("Community Grievance Policy", "v1.0", "540 KB"),
      },
    ],
  },
  {
    id: "p-sup",
    name: "Supplier Code of Conduct",
    entityId: "corp",
    version: "v1.0",
    status: "under-review",
    updated: "2026-07-08",
    ownerId: "priya",
    currentVersion: "v1.0",
    reviewDue: "2027-01-31",
    versions: [
      // A brand-new policy awaiting its first approval — no approved version yet, so
      // it is NOT in the ESAP/ESMP Register until an approver signs off.
      {
        version: "v1.0",
        uploadedAt: "2026-07-08",
        uploadedBy: "priya",
        status: "submitted",
        doc: policyDoc("Supplier Code of Conduct", "v1.0", "600 KB"),
      },
    ],
  },
  {
    id: "p-form-v",
    name: "FORM V: Environmental Statement",
    entityId: "corp",
    version: "v1.0",
    status: "approved",
    updated: "2025-06-15",
    ownerId: "rahul",
    currentVersion: "v1.0",
    reviewDue: "2026-06-15",
    versions: [
      {
        version: "v1.0",
        uploadedAt: "2025-06-10",
        uploadedBy: "rahul",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2025-06-15",
        doc: policyDoc("FORM V Environmental Statement", "v1.0", "1.2 MB"),
      },
    ],
  },
  {
    id: "p-posh",
    name: "Annual Return under POSH Act, 2013",
    entityId: "corp",
    version: "v2.0",
    status: "approved",
    updated: "2026-01-20",
    ownerId: "madhavi",
    currentVersion: "v2.0",
    reviewDue: "2027-01-20",
    versions: [
      {
        version: "v2.0",
        uploadedAt: "2026-01-15",
        uploadedBy: "madhavi",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2026-01-20",
        doc: policyDoc("Annual Return under POSH Act 2013", "v2.0", "850 KB"),
      },
    ],
  },
  {
    id: "p-factory-act",
    name: "Annual Return under Factory Act, 1948",
    entityId: "silvassa",
    version: "v1.1",
    status: "under-review",
    updated: "2026-07-10",
    ownerId: "amit",
    currentVersion: "v1.0",
    reviewDue: "2026-08-30",
    versions: [
      {
        version: "v1.1",
        uploadedAt: "2026-07-10",
        uploadedBy: "amit",
        status: "submitted",
        doc: policyDoc("Annual Return under Factory Act 1948", "v1.1", "2.1 MB"),
      },
      {
        version: "v1.0",
        uploadedAt: "2025-07-20",
        uploadedBy: "amit",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2025-07-25",
        doc: policyDoc("Annual Return under Factory Act 1948", "v1.0", "1.9 MB"),
      },
    ],
  },
  {
    id: "p-fire-audit",
    name: "Fire Equipment Inspection Test Report / Fire System Audit Report (Renewal of Fire NOC)",
    entityId: "mbmt",
    version: "v3.0",
    status: "approved",
    updated: "2025-09-30",
    ownerId: "prakash",
    currentVersion: "v3.0",
    reviewDue: "2026-07-10",
    versions: [
      {
        version: "v3.0",
        uploadedAt: "2025-09-25",
        uploadedBy: "prakash",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2025-09-30",
        doc: policyDoc("Fire Equipment Inspection Test Report", "v3.0", "3.4 MB"),
      },
    ],
  },
  {
    id: "p-clra-contractor",
    name: "Half-Yearly Return by Contractor (Transvolt) under CLRA, 1970",
    entityId: "corp",
    version: "v1.0",
    status: "under-review",
    updated: "2026-07-25",
    ownerId: "sandeep",
    currentVersion: "v1.0",
    reviewDue: "2026-10-31",
    versions: [
      {
        version: "v1.0",
        uploadedAt: "2026-07-25",
        uploadedBy: "sandeep",
        status: "draft",
        doc: policyDoc("Half-Yearly Return by Contractor CLRA 1970", "v1.0", "1.1 MB"),
      },
    ],
  },
  {
    id: "p-clra-employer",
    name: "Annual Return by Principal Employer (Authority/Client) under CLRA, 1970",
    entityId: "corp",
    version: "v1.2",
    status: "approved",
    updated: "2025-12-15",
    ownerId: "neha",
    currentVersion: "v1.2",
    reviewDue: "2026-08-01",
    versions: [
      {
        version: "v1.2",
        uploadedAt: "2025-12-10",
        uploadedBy: "neha",
        status: "approved",
        approvedBy: "kavita",
        approvedOn: "2025-12-15",
        doc: policyDoc("Annual Return by Principal Employer CLRA 1970", "v1.2", "1.5 MB"),
      },
    ],
  },
];

export const policyById = (id: string) => POLICIES.find((p) => p.id === id);

export type Sop = {
  id: string;
  name: string;
  entityId: string;
  activity: string;
  version: string;
  status: "approved" | "under-review" | "draft";
  updated: string;
};

export const SOPS: Sop[] = [
  {
    id: "s-bat",
    name: "HV Battery Handling & Storage",
    entityId: "mbmt",
    activity: "Workshop",
    version: "v2.1",
    status: "approved",
    updated: "2026-03-11",
  },
  {
    id: "s-chg",
    name: "Overnight Charging Bay Operations",
    entityId: "mbmt",
    activity: "Charging",
    version: "v1.4",
    status: "approved",
    updated: "2026-02-02",
  },
  {
    id: "s-spill",
    name: "Coolant & Oil Spill Response",
    entityId: "mbmt",
    activity: "Depot Ops",
    version: "v1.0",
    status: "under-review",
    updated: "2026-06-20",
  },
  {
    id: "s-fire",
    name: "Fire Drill & Evacuation",
    entityId: "silvassa",
    activity: "Depot Ops",
    version: "v1.2",
    status: "approved",
    updated: "2026-04-18",
  },
  {
    id: "s-waste",
    name: "Segregated Waste Handling",
    entityId: "silvassa",
    activity: "Depot Ops",
    version: "v1.0",
    status: "draft",
    updated: "2026-07-01",
  },
];

export type Assessment = {
  id: string;
  kind: "ESDD" | "ESIA";
  project: string;
  entityId: string;
  projectType: "brownfield" | "greenfield";
  status: "complete" | "in-progress";
  completedOn?: string;
  params: { name: string; result: "ok" | "gap" | "pending" }[];
  reportDoc?: string;
};

export const ASSESSMENTS: Assessment[] = [
  {
    id: "a-esdd-mbmt",
    kind: "ESDD",
    project: "MBMT depot electrification (brownfield)",
    entityId: "mbmt",
    projectType: "brownfield",
    status: "complete",
    completedOn: "2025-10-30",
    params: [
      { name: "Land title & lease review", result: "ok" },
      { name: "Fire safety adequacy", result: "gap" },
      { name: "Stormwater & drainage", result: "gap" },
      { name: "Labour accommodation audit", result: "ok" },
      { name: "Battery storage risk", result: "ok" },
    ],
    reportDoc: "esdd-mbmt-2025.pdf",
  },
  {
    id: "a-esia-silv",
    kind: "ESIA",
    project: "Silvassa greenfield depot",
    entityId: "silvassa",
    projectType: "greenfield",
    status: "complete",
    completedOn: "2025-06-15",
    params: [
      { name: "Baseline air & noise survey", result: "ok" },
      { name: "Tree cover & green belt plan", result: "gap" },
      { name: "Community consultation", result: "ok" },
      { name: "Traffic impact study", result: "ok" },
    ],
    reportDoc: "esia-silvassa-2025.pdf",
  },
  {
    id: "a-esdd-noida",
    kind: "ESDD",
    project: "Depot acquisition — due diligence (pipeline)",
    entityId: "corp",
    projectType: "brownfield",
    status: "in-progress",
    params: [
      { name: "Land title & lease review", result: "pending" },
      { name: "Fire safety adequacy", result: "pending" },
      { name: "Soil contamination screen", result: "pending" },
    ],
  },
  {
    id: "a-esia-mbmt-expansion",
    kind: "ESIA",
    project: "MBMT depot greenfield expansion (Phase 2)",
    entityId: "mbmt",
    projectType: "greenfield",
    status: "in-progress",
    params: [
      { name: "Baseline air & noise survey", result: "pending" },
      { name: "Tree cover & green belt plan", result: "pending" },
      { name: "Community consultation", result: "pending" },
    ],
  },
];

/**
 * Where an ESAP action originated. ESAP is the convergence point for corrective
 * actions from four sources — assessments, internal audits, external audits, and
 * approved policies — so the action carries a discriminated source rather than a
 * hard-bound assessment id. This keeps one action register instead of four.
 */
export type EsapSource =
  | { kind: "assessment"; id: string } // ESDD / ESIA finding
  | { kind: "internal-audit"; id: string } // AuditFinding id
  | { kind: "external-audit"; id: string } // AuditFinding id
  | { kind: "policy"; id: string }; // action arising from an approved policy

export type EsapAction = {
  id: string;
  source: EsapSource;
  finding: string;
  action: string;
  ownerId: string;
  due: string;
  status: "open" | "in-progress" | "closed";
  closedOn?: string;
  ncRef?: string; // human-readable NC number, e.g. "NC-2026-014"
  severity?: "major" | "minor" | "observation";
};

export const ESAP_ACTIONS: EsapAction[] = [
  {
    id: "e-1",
    source: { kind: "assessment", id: "a-esdd-mbmt" },
    finding: "Fire safety adequacy — hydrant coverage short at Kashimira",
    action: "Install 2 additional hydrant points; re-run pressure test",
    ownerId: "rohan",
    due: "2026-07-10",
    status: "in-progress",
  },
  {
    id: "e-2",
    source: { kind: "assessment", id: "a-esdd-mbmt" },
    finding: "Stormwater & drainage — wash-bay runoff uncontained",
    action: "Construct interceptor channel + oil-water separator",
    ownerId: "arjun",
    due: "2026-08-15",
    status: "open",
  },
  {
    id: "e-3",
    source: { kind: "assessment", id: "a-esia-silv" },
    finding: "Green belt plan — 120 saplings pending vs. commitment",
    action: "Complete monsoon plantation drive, geo-tag saplings",
    ownerId: "priya",
    due: "2026-07-31",
    status: "in-progress",
  },
  {
    id: "e-4",
    source: { kind: "assessment", id: "a-esdd-mbmt" },
    finding: "Battery storage — quarantine bay signage & SOP display",
    action: "Install signage; laminate SOP at bay entrance",
    ownerId: "rohan",
    due: "2026-05-30",
    status: "closed",
    closedOn: "2026-05-21",
  },
  {
    id: "e-5",
    source: { kind: "assessment", id: "a-esia-silv" },
    finding: "Community consultation — grievance register digitisation",
    action: "Move paper register to shared tracker; monthly review",
    ownerId: "priya",
    due: "2026-06-30",
    status: "open",
  },
  {
    id: "e-6",
    source: { kind: "assessment", id: "a-esdd-mbmt" },
    finding: "Labour — contractor PF/ESIC evidence collection",
    action: "Collect quarterly challans from all 4 contractors",
    ownerId: "sunil",
    due: "2026-09-30",
    status: "open",
  },
  // ---- audit-sourced corrective actions (seeded for Phase 3 / 4 backlinks) ----
  {
    id: "e-7",
    source: { kind: "internal-audit", id: "af-int-2" },
    finding: "ISO 14001 §8.1 — spill kit at wash bay not replenished after use",
    action: "Restock spill kits; add monthly checklist to depot SOP",
    ownerId: "rohan",
    due: "2026-07-05",
    status: "in-progress",
    ncRef: "NC-2026-011",
    severity: "minor",
  },
  {
    id: "e-8",
    source: { kind: "external-audit", id: "af-ext-2" },
    finding: "ISO 45001 §7.2 — competence records incomplete for 3 charging-bay staff",
    action: "Collect training evidence; update competence matrix",
    ownerId: "kavita",
    due: "2026-08-20",
    status: "open",
    ncRef: "NC-2026-014",
    severity: "major",
  },
];

export function esapState(a: EsapAction): "closed" | "overdue" | "open" {
  if (a.status === "closed") return "closed";
  return daysUntil(a.due) < 0 ? "overdue" : "open";
}

/**
 * Resolves an ESAP source into a display label and a deep-link target, so the
 * register can render a backlink for any source without branching in the UI.
 */
export function esapSourceLabel(s: EsapSource): {
  label: string;
  area: string;
  sub: string;
  id: string;
} {
  switch (s.kind) {
    case "assessment": {
      const a = ASSESSMENTS.find((x) => x.id === s.id);
      return {
        label: a ? `${a.kind} — ${a.project}` : "Assessment",
        area: "esms",
        sub: a?.kind === "ESIA" ? "esia" : "esdd",
        id: s.id,
      };
    }
    case "internal-audit": {
      const f = AUDIT_FINDINGS.find((x) => x.id === s.id);
      const audit = f ? AUDITS.find((x) => x.id === f.auditId) : undefined;
      return {
        label: audit ? `Internal audit — ${audit.title}` : "Internal audit",
        area: "esms",
        sub: "audit-internal",
        id: audit?.id ?? s.id,
      };
    }
    case "external-audit": {
      const f = AUDIT_FINDINGS.find((x) => x.id === s.id);
      const audit = f ? AUDITS.find((x) => x.id === f.auditId) : undefined;
      return {
        label: audit ? `External audit — ${audit.title}` : "External audit",
        area: "esms",
        sub: "audit-external",
        id: audit?.id ?? s.id,
      };
    }
    case "policy": {
      const p = policyById(s.id);
      return {
        label: p ? `Policy — ${p.name}` : "Policy",
        area: "esms",
        sub: "policies",
        id: s.id,
      };
    }
  }
}

/** Entity an ESAP action rolls up to, resolved through its source. Used for scoping. */
export function esapActionEntityId(a: EsapAction): string | undefined {
  const s = a.source;
  if (s.kind === "assessment") return ASSESSMENTS.find((x) => x.id === s.id)?.entityId;
  if (s.kind === "policy") return policyById(s.id)?.entityId;
  const f = AUDIT_FINDINGS.find((x) => x.id === s.id);
  return f ? AUDITS.find((x) => x.id === f.auditId)?.entityId : undefined;
}

/**
 * The rollout action a policy contributes to the ESAP/ESMP Register once its latest
 * version is approved. Approval is the gate: an unapproved policy has no action.
 * Pass live versions (session edits) or omit for the static baseline.
 */
export function policyEsapAction(
  p: Policy,
  versions: PolicyVersion[] = p.versions,
): EsapAction | null {
  // The action tracks the most recent APPROVED version — so uploading a new draft
  // does not drop an already-approved policy out of the register.
  const approved = versions.find((v) => v.status === "approved");
  if (!approved) return null;
  return {
    id: `pol-${p.id}`,
    source: { kind: "policy", id: p.id },
    finding: `${p.name} ${approved.version} approved`,
    action: `Roll out ${p.name} ${approved.version} — brief owners, refresh linked SOPs & controls`,
    ownerId: p.ownerId,
    due: p.reviewDue,
    status: "open",
  };
}

/** Baseline policy-sourced ESAP actions from the static POLICIES data. */
export function policyEsapActions(): EsapAction[] {
  return POLICIES.map((p) => policyEsapAction(p)).filter((a): a is EsapAction => a !== null);
}

/* ---------------------------------- audits --------------------------------- */

export type AuditKind = "internal" | "external";
export type FindingResult = "compliant" | "nc" | "observation";

export type AuditFinding = {
  id: string;
  auditId: string;
  clause: string; // e.g. "ISO 14001 §8.1" or "Fire safety — hydrant coverage"
  area: string; // functional area observed
  result: FindingResult;
  severity?: "major" | "minor";
  remarks?: string; // MANDATORY when result === "nc"
  actionId?: string; // link into ESAP_ACTIONS
};

export type Audit = {
  id: string;
  kind: AuditKind;
  title: string;
  entityId: string;
  depotId?: string;
  standard?: string; // "ISO 14001" | "ISO 45001" | internal programme
  auditorName: string;
  auditorOrg?: string; // external only
  scheduledOn: string;
  conductedOn?: string;
  status: "planned" | "in-progress" | "closed";
  recordId?: string; // certification record this audit maintains (external, ISO)
  reportDoc?: { name: string; size: string; uploadedAt: string };
};

export const AUDITS: Audit[] = [
  {
    id: "aud-int-mbmt-q2",
    kind: "internal",
    title: "MBMT depot internal EHS audit — Q2",
    entityId: "mbmt",
    depotId: "kashimira",
    standard: "ISO 14001 (internal programme)",
    auditorName: "Priya Nair",
    scheduledOn: "2026-06-18",
    conductedOn: "2026-06-20",
    status: "in-progress",
    reportDoc: { name: "internal-audit-mbmt-q2.pdf", size: "1.3 MB", uploadedAt: "2026-06-24" },
  },
  {
    id: "aud-int-silv-q2",
    kind: "internal",
    title: "Silvassa depot internal audit — Q2",
    entityId: "silvassa",
    depotId: "silvassa-depot",
    standard: "ISO 14001 (internal programme)",
    auditorName: "Kavita Rao",
    scheduledOn: "2026-08-05",
    status: "planned",
  },
  {
    id: "aud-ext-iso45001",
    kind: "external",
    title: "ISO 45001 surveillance audit",
    entityId: "corp",
    standard: "ISO 45001",
    auditorName: "R. Krishnan",
    auditorOrg: "TÜV SÜD",
    scheduledOn: "2026-06-30",
    conductedOn: "2026-07-01",
    status: "in-progress",
    recordId: "r-iso45001",
    reportDoc: {
      name: "tuv-iso45001-surveillance-2026.pdf",
      size: "2.0 MB",
      uploadedAt: "2026-07-04",
    },
  },
  {
    id: "aud-ext-iso14001",
    kind: "external",
    title: "ISO 14001 recertification audit",
    entityId: "corp",
    standard: "ISO 14001",
    auditorName: "S. Iyer",
    auditorOrg: "TÜV SÜD",
    scheduledOn: "2026-08-25",
    status: "planned",
    recordId: "r-iso14001",
  },
];

export const AUDIT_FINDINGS: AuditFinding[] = [
  // aud-int-mbmt-q2 — one compliant, one NC (linked, overdue action), one observation
  {
    id: "af-int-1",
    auditId: "aud-int-mbmt-q2",
    clause: "ISO 14001 §7.5 — documented information",
    area: "Charging bay",
    result: "compliant",
  },
  {
    id: "af-int-2",
    auditId: "aud-int-mbmt-q2",
    clause: "ISO 14001 §8.1 — operational control",
    area: "Wash bay",
    result: "nc",
    severity: "minor",
    remarks: "Spill kit at wash bay found empty after last use; no replenishment log maintained.",
    actionId: "e-7",
  },
  {
    id: "af-int-3",
    auditId: "aud-int-mbmt-q2",
    clause: "ISO 14001 §9.1 — monitoring & measurement",
    area: "Depot ops",
    result: "observation",
    remarks: "Noise readings recorded on paper; recommend moving to the monitoring register.",
  },
  {
    // An NC with NO corrective action yet — surfaces the unlinked-NC warning.
    id: "af-int-4",
    auditId: "aud-int-mbmt-q2",
    clause: "ISO 14001 §7.2 — competence & training",
    area: "Battery workshop",
    result: "nc",
    severity: "minor",
    remarks: "Two technicians handling HV batteries have lapsed certification.",
  },
  // aud-ext-iso45001 — one compliant, one NC (external, linked, open)
  {
    id: "af-ext-1",
    auditId: "aud-ext-iso45001",
    clause: "ISO 45001 §6.1 — hazard identification",
    area: "HV workshop",
    result: "compliant",
  },
  {
    id: "af-ext-2",
    auditId: "aud-ext-iso45001",
    clause: "ISO 45001 §7.2 — competence",
    area: "Charging bay",
    result: "nc",
    severity: "major",
    remarks: "Training/competence evidence missing for 3 charging-bay operators.",
    actionId: "e-8",
  },
];

/* --------------------------------- training -------------------------------- */

export type Attendee = { id: string; name: string; role: string; present: boolean };

export type Training = {
  id: string;
  topic: string;
  entityId: string;
  depotId?: string;
  scheduledAt: string; // ISO datetime — date AND time
  durationMins: number;
  trainerId: string; // person id
  status: "scheduled" | "completed" | "cancelled";
  attendees: Attendee[];
  notes?: string;
};

const attendeesFrom = (present: number): Attendee[] =>
  PEOPLE.map((p, i) => ({ id: p.id, name: p.name, role: p.role, present: i < present }));

export const TRAININGS: Training[] = [
  {
    id: "tr-fire-jul",
    topic: "Fire drill & evacuation refresher",
    entityId: "mbmt",
    depotId: "bhayandar",
    scheduledAt: "2026-07-09T10:30:00+05:30",
    durationMins: 90,
    trainerId: "rohan",
    status: "completed",
    attendees: attendeesFrom(3), // partial attendance (3 of 5)
    notes: "Two depot staff on leave; reschedule make-up session.",
  },
  {
    id: "tr-battery-jul",
    topic: "HV battery handling & spill response",
    entityId: "mbmt",
    depotId: "kashimira",
    scheduledAt: "2026-07-24T14:00:00+05:30",
    durationMins: 120,
    trainerId: "kavita",
    status: "scheduled",
    attendees: attendeesFrom(0),
  },
  {
    id: "tr-grievance-jun",
    topic: "Community grievance handling",
    entityId: "silvassa",
    depotId: "silvassa-depot",
    scheduledAt: "2026-06-19T11:00:00+05:30",
    durationMins: 60,
    trainerId: "priya",
    status: "completed",
    attendees: attendeesFrom(5), // full attendance
  },
];

/* ----------------------------- site monitoring ----------------------------- */

export type MonitoringCategory = "air" | "water" | "noise" | "waste";

export type MonitoringParam = {
  key: string;
  label: string;
  unit: string;
  limit?: number; // regulatory threshold
  category: MonitoringCategory;
};

export const MONITORING_PARAMS: MonitoringParam[] = [
  { key: "pm10", label: "PM₁₀ (ambient)", unit: "µg/m³", limit: 100, category: "air" },
  { key: "pm25", label: "PM₂.₅ (ambient)", unit: "µg/m³", limit: 60, category: "air" },
  { key: "so2", label: "SO₂", unit: "µg/m³", limit: 80, category: "air" },
  { key: "ph", label: "Treated water pH", unit: "pH", limit: 8.5, category: "water" },
  { key: "bod", label: "BOD (treated effluent)", unit: "mg/L", limit: 30, category: "water" },
  { key: "cod", label: "COD (treated effluent)", unit: "mg/L", limit: 250, category: "water" },
  { key: "noise-day", label: "Noise — daytime", unit: "dB(A)", limit: 75, category: "noise" },
  { key: "noise-night", label: "Noise — nighttime", unit: "dB(A)", limit: 70, category: "noise" },
  {
    key: "haz-waste",
    label: "Hazardous waste to authorised recycler",
    unit: "kg",
    category: "waste",
  },
];

export const monitoringParamByKey = (key: string) => MONITORING_PARAMS.find((p) => p.key === key);

/* ----------------------------- Lab Test Types & Parameters ---------------------------- */

export type LabTestTypeKey =
  | "vehicle_data"
  | "drinking_water"
  | "waste_water"
  | "dry_waste"
  | "wet_waste"
  | "hazardous_waste"
  | "noise"
  | "soil_runoff";

export interface LabParamDef {
  key: string;
  testType: LabTestTypeKey;
  name: string;
  code: string;
  description: string;
  unit: string;
  limitMin?: number;
  limitMax?: number;
  limitDisplay: string; // e.g. "6.5 – 8.5", "≤ 30 mg/L", "≤ 100 µg/m³"
  standardRef: string; // e.g. "CPCB ETP Norms", "NAAQS 2009", "IS 10500:2012"
}

export interface LabTestTypeMeta {
  key: LabTestTypeKey;
  label: string;
  shortLabel: string;
  description: string;
  standard: string;
  defaultFrequency: string;
  parameters: LabParamDef[];
}

export const LAB_TEST_TYPES: LabTestTypeMeta[] = [
  {
    key: "vehicle_data",
    label: "Vehicle Data",
    shortLabel: "Vehicle Data",
    description: "Monthly fleet operational tracking: vehicle count, distance run, and charging power draw.",
    standard: "Fleet Operational Metrics",
    defaultFrequency: "Monthly Reporting",
    parameters: [
      {
        key: "month",
        testType: "vehicle_data",
        name: "Month",
        code: "MONTH",
        description: "Operational reporting month and year",
        unit: "Cycle",
        limitDisplay: "Reporting Period",
        standardRef: "Billing Cycle",
      },
      {
        key: "vehicle_count",
        testType: "vehicle_data",
        name: "Vehicle Count",
        code: "COUNT",
        description: "Total active operational electric buses",
        unit: "Count",
        limitDisplay: "Active Fleet",
        standardRef: "Depot Allocation",
      },
      {
        key: "run_km",
        testType: "vehicle_data",
        name: "Run (Km)",
        code: "KM",
        description: "Total fleet distance run during the month",
        unit: "Km",
        limitDisplay: "Fleet Distance",
        standardRef: "Operational Schedule",
      },
      {
        key: "energy_kwh",
        testType: "vehicle_data",
        name: "Energy (KWh) Consumption",
        code: "KWH",
        description: "Total charging power consumption drawn from depot chargers",
        unit: "kWh",
        limitDisplay: "Energy Consumed",
        standardRef: "Energy Meter Log",
      },
    ],
  },
  {
    key: "dry_waste",
    label: "Dry Waste",
    shortLabel: "Dry Waste",
    description: "Depot non-hazardous recyclable solid waste: plastic waste, paper cartons, scrap metal, and tyres.",
    standard: "Solid Waste Management Rules 2016",
    defaultFrequency: "Monthly Manifest Log",
    parameters: [
      {
        key: "date",
        testType: "dry_waste",
        name: "Date",
        code: "DATE",
        description: "Collection and dispatch date",
        unit: "Date",
        limitDisplay: "Logged Date",
        standardRef: "Gate Pass Log",
      },
      {
        key: "waste_type",
        testType: "dry_waste",
        name: "Waste Type",
        code: "TYPE",
        description: "Category of recyclable dry waste (e.g. Plastic, Cardboard, Metal)",
        unit: "Category",
        limitDisplay: "Segregated Stream",
        standardRef: "SWM Guidelines",
      },
      {
        key: "qty_kg",
        testType: "dry_waste",
        name: "QTY (kg)",
        code: "KG",
        description: "Total measured weight collected or dispatched for recycling",
        unit: "kg",
        limitDisplay: "Weight Collected",
        standardRef: "Weighbridge Slip",
      },
    ],
  },
  {
    key: "wet_waste",
    label: "Wet Waste",
    shortLabel: "Wet Waste",
    description: "Depot organic biodegradable waste: food/canteen scraps, horticultural leaves, and compost processing.",
    standard: "Solid Waste Management Rules 2016",
    defaultFrequency: "Daily / Weekly Manifest Log",
    parameters: [
      {
        key: "date",
        testType: "wet_waste",
        name: "Date",
        code: "DATE",
        description: "Collection, weighing, or composting batch date",
        unit: "Date",
        limitDisplay: "Logged Date",
        standardRef: "Depot Daily Log",
      },
      {
        key: "waste_type",
        testType: "wet_waste",
        name: "Waste Type",
        code: "TYPE",
        description: "Category of organic wet waste (e.g. Canteen Food Waste, Horticultural Leaves)",
        unit: "Category",
        limitDisplay: "Organic Stream",
        standardRef: "SWM Guidelines",
      },
      {
        key: "qty_kg",
        testType: "wet_waste",
        name: "QTY (kg)",
        code: "KG",
        description: "Total measured weight of organic waste collected or composted",
        unit: "kg",
        limitDisplay: "Weight Generated",
        standardRef: "Weighing Scale Log",
      },
    ],
  },
  {
    key: "hazardous_waste",
    label: "Hazardous Waste",
    shortLabel: "Hazardous Waste",
    description: "Depot maintenance hazardous materials: used oils, contaminated cotton/filters, coolant, and battery chemical residues.",
    standard: "Hazardous Waste Management Rules 2016",
    defaultFrequency: "Daily Manifest & Gate Pass Log",
    parameters: [
      {
        key: "date",
        testType: "hazardous_waste",
        name: "Date",
        code: "DATE",
        description: "Maintenance log and waste generation date",
        unit: "Date",
        limitDisplay: "Logged Date",
        standardRef: "Maintenance Log",
      },
      {
        key: "vehicle_no",
        testType: "hazardous_waste",
        name: "Vehicle No",
        code: "VEHICLE",
        description: "Electric bus registration number or depot asset tag",
        unit: "Asset",
        limitDisplay: "Vehicle Reg",
        standardRef: "Fleet Allocation",
      },
      {
        key: "purpose",
        testType: "hazardous_waste",
        name: "Purpose",
        code: "PURPOSE",
        description: "Maintenance activity or service purpose",
        unit: "Activity",
        limitDisplay: "Maintenance Task",
        standardRef: "Job Card Ref",
      },
      {
        key: "material_used",
        testType: "hazardous_waste",
        name: "Material Used",
        code: "MATERIAL",
        description: "Hazardous material type (e.g. Used Oil, Coolant, Oil Rags, Battery Acid)",
        unit: "Material",
        limitDisplay: "Hazard Stream",
        standardRef: "Schedule I Rules",
      },
      {
        key: "qty_litres",
        testType: "hazardous_waste",
        name: "QTY Litres",
        code: "LITRES",
        description: "Liquid hazardous waste/material volume (e.g. oils, fluids)",
        unit: "Litres",
        limitDisplay: "Volume (L)",
        standardRef: "Liquid Manifest",
      },
      {
        key: "qty_kg",
        testType: "hazardous_waste",
        name: "QTY Kg",
        code: "KG",
        description: "Solid hazardous waste/material weight (e.g. rags, filters, batteries)",
        unit: "Kg",
        limitDisplay: "Weight (Kg)",
        standardRef: "Solid Manifest",
      },
    ],
  },
  {
    key: "drinking_water",
    label: "Drinking Water",
    shortLabel: "Drinking Water",
    description: "Depot drinking water supply, workforce headcount, and volume consumption tracking.",
    standard: "IS 10500:2012 Drinking Water Specification",
    defaultFrequency: "Monthly / Daily Log",
    parameters: [
      {
        key: "month_date",
        testType: "drinking_water",
        name: "Month/Date",
        code: "PERIOD",
        description: "Drinking water consumption period or logging date",
        unit: "Period",
        limitDisplay: "Logged Period",
        standardRef: "Depot Register",
      },
      {
        key: "people_count",
        testType: "drinking_water",
        name: "Number of People",
        code: "PEOPLE",
        description: "Total depot workforce, crew, and visitor headcount served",
        unit: "Persons",
        limitDisplay: "Depot Headcount",
        standardRef: "Attendance Log",
      },
      {
        key: "qty_litres",
        testType: "drinking_water",
        name: "QTY Litres",
        code: "LITRES",
        description: "Total drinking water supplied / drawn from dispensers in litres",
        unit: "Litres",
        limitDisplay: "Volume (L)",
        standardRef: "Dispenser Log",
      },
    ],
  },
  {
    key: "waste_water",
    label: "Waste Water",
    shortLabel: "Waste Water",
    description: "Depot effluent / wash-bay waste water treatment, recycling, and sludge management.",
    standard: "CPCB Effluent Standards & SWM Rules",
    defaultFrequency: "Monthly / Daily Log",
    parameters: [
      {
        key: "month_date",
        testType: "waste_water",
        name: "Month/Date",
        code: "PERIOD",
        description: "Effluent treatment or waste water logging cycle / date",
        unit: "Period",
        limitDisplay: "Logged Period",
        standardRef: "ETP Log Sheet",
      },
      {
        key: "qty_litres",
        testType: "waste_water",
        name: "QTY Litres",
        code: "LITRES",
        description: "Total wash-bay and yard effluent generated or treated in litres",
        unit: "Litres",
        limitDisplay: "Volume (L)",
        standardRef: "Flow Meter / Pit Log",
      },
      {
        key: "sludge_qty",
        testType: "waste_water",
        name: "Sludge (Weight/Volume)",
        code: "SLUDGE",
        description: "Total dried sludge cake or sediment cleared from interceptor sump / filter press",
        unit: "Kg / L",
        limitDisplay: "Sludge Output",
        standardRef: "Sludge Drying Bed Log",
      },
    ],
  },
];

export const getLabTestType = (key: string): LabTestTypeMeta | undefined =>
  LAB_TEST_TYPES.find((t) => t.key === key);

export const getLabParamDef = (paramKey: string): LabParamDef | undefined => {
  for (const t of LAB_TEST_TYPES) {
    const found = t.parameters.find((p) => p.key === paramKey);
    if (found) return found;
  }
  return undefined;
};

/** Evaluate if a single parameter value breaches allowed limits */
export function evaluateParamCompliance(
  param: LabParamDef,
  value: number | string | null | undefined,
): "within" | "exceeds" | "no_data" {
  if (value == null) return "no_data";
  if (typeof value === "string") {
    return value.trim() !== "" ? "within" : "no_data";
  }
  if (Number.isNaN(value)) return "no_data";
  if (param.limitMin != null && value < param.limitMin) return "exceeds";
  if (param.limitMax != null && value > param.limitMax) return "exceeds";
  return "within";
}

/* ----------------------------- Vehicle Data Records ---------------------------- */

export interface VehicleDataRecord {
  id: string;
  entityId: string;
  depotId: string;
  entityName: string;
  depotName: string;
  month: string; // e.g. "Aug 2026", "Jul 2026", "Jun 2026"
  vehicleCount: number;
  runKm: number;
  energyKwh: number;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_VEHICLE_DATA_RECORDS: VehicleDataRecord[] = [
  {
    id: "veh-1",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    month: "Aug 2026",
    vehicleCount: 45,
    runKm: 386060,
    energyKwh: 455150,
    createdAt: "2026-08-15T09:00:00Z",
    updatedAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "veh-2",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    month: "Jul 2026",
    vehicleCount: 50,
    runKm: 412380,
    energyKwh: 486120,
    createdAt: "2026-07-15T09:00:00Z",
    updatedAt: "2026-07-15T09:00:00Z",
  },
  {
    id: "veh-3",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    month: "Jun 2026",
    vehicleCount: 48,
    runKm: 398720,
    energyKwh: 470490,
    createdAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-06-15T09:00:00Z",
  },
  {
    id: "veh-4",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    month: "May 2026",
    vehicleCount: 46,
    runKm: 382150,
    energyKwh: 450930,
    createdAt: "2026-05-15T09:00:00Z",
    updatedAt: "2026-05-15T09:00:00Z",
  },
  {
    id: "veh-5",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    month: "Apr 2026",
    vehicleCount: 44,
    runKm: 365400,
    energyKwh: 431170,
    createdAt: "2026-04-15T09:00:00Z",
    updatedAt: "2026-04-15T09:00:00Z",
  },
  {
    id: "veh-6",
    entityId: "mbmt",
    depotId: "bhayandar",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Bhayandar Depot",
    month: "Aug 2026",
    vehicleCount: 35,
    runKm: 290400,
    energyKwh: 342670,
    createdAt: "2026-08-15T09:00:00Z",
    updatedAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "veh-7",
    entityId: "mbmt",
    depotId: "bhayandar",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Bhayandar Depot",
    month: "Jul 2026",
    vehicleCount: 35,
    runKm: 288100,
    energyKwh: 339950,
    createdAt: "2026-07-15T09:00:00Z",
    updatedAt: "2026-07-15T09:00:00Z",
  },
  {
    id: "veh-8",
    entityId: "dnhdd",
    depotId: "silvassa-depot",
    entityName: "DNHDD (Silvassa)",
    depotName: "Silvassa Depot",
    month: "Aug 2026",
    vehicleCount: 25,
    runKm: 210500,
    energyKwh: 248390,
    createdAt: "2026-08-15T09:00:00Z",
    updatedAt: "2026-08-15T09:00:00Z",
  },
  {
    id: "veh-9",
    entityId: "dnhdd",
    depotId: "silvassa-depot",
    entityName: "DNHDD (Silvassa)",
    depotName: "Silvassa Depot",
    month: "Jul 2026",
    vehicleCount: 25,
    runKm: 208200,
    energyKwh: 245670,
    createdAt: "2026-07-15T09:00:00Z",
    updatedAt: "2026-07-15T09:00:00Z",
  },
];

/* ----------------------------- Drinking Water Records ---------------------------- */

export interface DrinkingWaterRecord {
  id: string;
  entityId: string;
  depotId: string;
  entityName: string;
  depotName: string;
  monthDate: string;
  peopleCount: number;
  qtyLitres: number;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_DRINKING_WATER_RECORDS: DrinkingWaterRecord[] = [
  {
    id: "dw-1",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    monthDate: "Aug 2026",
    peopleCount: 120,
    qtyLitres: 3600,
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T09:00:00Z",
  },
  {
    id: "dw-2",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    monthDate: "Jul 2026",
    peopleCount: 125,
    qtyLitres: 3850,
    createdAt: "2026-07-01T09:00:00Z",
    updatedAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "dw-3",
    entityId: "mbmt",
    depotId: "bhayandar",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Bhayandar Depot",
    monthDate: "Aug 2026",
    peopleCount: 85,
    qtyLitres: 2550,
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T09:00:00Z",
  },
  {
    id: "dw-4",
    entityId: "mbmt",
    depotId: "bhayandar",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Bhayandar Depot",
    monthDate: "Jul 2026",
    peopleCount: 80,
    qtyLitres: 2400,
    createdAt: "2026-07-01T09:00:00Z",
    updatedAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "dw-5",
    entityId: "dnhdd",
    depotId: "silvassa-depot",
    entityName: "DNHDD (Silvassa)",
    depotName: "Silvassa Depot",
    monthDate: "Aug 2026",
    peopleCount: 65,
    qtyLitres: 1950,
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T09:00:00Z",
  },
];

/* ----------------------------- Waste Water Records ---------------------------- */

export interface WasteWaterRecord {
  id: string;
  entityId: string;
  depotId: string;
  entityName: string;
  depotName: string;
  monthDate: string;
  qtyLitres: number;
  sludgeQty: number;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_WASTE_WATER_RECORDS: WasteWaterRecord[] = [
  {
    id: "ww-1",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    monthDate: "Aug 2026",
    qtyLitres: 12500,
    sludgeQty: 350,
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T09:00:00Z",
  },
  {
    id: "ww-2",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    monthDate: "Jul 2026",
    qtyLitres: 13200,
    sludgeQty: 380,
    createdAt: "2026-07-01T09:00:00Z",
    updatedAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "ww-3",
    entityId: "mbmt",
    depotId: "bhayandar",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Bhayandar Depot",
    monthDate: "Aug 2026",
    qtyLitres: 9800,
    sludgeQty: 270,
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T09:00:00Z",
  },
  {
    id: "ww-4",
    entityId: "mbmt",
    depotId: "bhayandar",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Bhayandar Depot",
    monthDate: "Jul 2026",
    qtyLitres: 10400,
    sludgeQty: 295,
    createdAt: "2026-07-01T09:00:00Z",
    updatedAt: "2026-07-01T09:00:00Z",
  },
  {
    id: "ww-5",
    entityId: "dnhdd",
    depotId: "silvassa-depot",
    entityName: "DNHDD (Silvassa)",
    depotName: "Silvassa Depot",
    monthDate: "Aug 2026",
    qtyLitres: 7500,
    sludgeQty: 210,
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-01T09:00:00Z",
  },
];

export type MonitoringReading = {
  id: string;
  paramKey: string;
  entityId: string;
  depotId: string;
  period: string; // "2026-07" — matches PERIODS ids
  value: number | null;
  enteredBy: string; // person id — ESG Champion
  source: "manual" | "excel";
  prov?: Provenance; // set when source === "excel"
};

/** A reading breaches when it has a value over the parameter's regulatory limit. */
export function isMonitoringBreach(r: MonitoringReading): boolean {
  const p = monitoringParamByKey(r.paramKey);
  return r.value != null && p?.limit != null && r.value > p.limit;
}

export const MONITORING_READINGS: MonitoringReading[] = [
  // MBMT · Kashimira — July (one breach: PM10 over limit, arrived via Excel)
  {
    id: "m-1",
    paramKey: "pm10",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    value: 118,
    enteredBy: "priya",
    source: "excel",
    prov: { source: "monitoring-upload.xlsx", fetchedAt: "2026-07-12T06:30:00Z" },
  },
  {
    id: "m-2",
    paramKey: "pm25",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    value: 48,
    enteredBy: "priya",
    source: "excel",
    prov: { source: "monitoring-upload.xlsx", fetchedAt: "2026-07-12T06:30:00Z" },
  },
  {
    id: "m-3",
    paramKey: "bod",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    value: 22,
    enteredBy: "rohan",
    source: "manual",
  },
  {
    id: "m-4",
    paramKey: "noise-day",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    value: 71,
    enteredBy: "rohan",
    source: "manual",
  },
  // MBMT · Bhayandar — July
  {
    id: "m-5",
    paramKey: "pm10",
    entityId: "mbmt",
    depotId: "bhayandar",
    period: "2026-07",
    value: 86,
    enteredBy: "priya",
    source: "manual",
  },
  {
    id: "m-6",
    paramKey: "bod",
    entityId: "mbmt",
    depotId: "bhayandar",
    period: "2026-07",
    value: 26,
    enteredBy: "rohan",
    source: "manual",
  },
  {
    id: "m-7",
    paramKey: "ph",
    entityId: "mbmt",
    depotId: "bhayandar",
    period: "2026-07",
    value: null,
    enteredBy: "rohan",
    source: "manual",
  },
  // Silvassa — July
  {
    id: "m-8",
    paramKey: "pm10",
    entityId: "silvassa",
    depotId: "silvassa-depot",
    period: "2026-07",
    value: 74,
    enteredBy: "priya",
    source: "manual",
  },
  {
    id: "m-9",
    paramKey: "noise-day",
    entityId: "silvassa",
    depotId: "silvassa-depot",
    period: "2026-07",
    value: 68,
    enteredBy: "priya",
    source: "manual",
  },
  // June history (for trend sparklines)
  {
    id: "m-10",
    paramKey: "pm10",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-06",
    value: 92,
    enteredBy: "priya",
    source: "manual",
  },
  {
    id: "m-11",
    paramKey: "pm10",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-05",
    value: 88,
    enteredBy: "priya",
    source: "manual",
  },
  {
    id: "m-12",
    paramKey: "pm25",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-06",
    value: 44,
    enteredBy: "priya",
    source: "manual",
  },
  {
    id: "m-13",
    paramKey: "bod",
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-06",
    value: 20,
    enteredBy: "rohan",
    source: "manual",
  },
];

/* ------------------------ environment metadata master ----------------------- */

export type MonitoringAreaKey =
  | "energy_vehicle"
  | "hazardous_waste"
  | "non_hazardous_waste"
  | "haz_consumption"
  | "drinking_water"
  | "wastewater"
  | "waste_disposal"
  | "housekeeping"
  | "other";

export interface MonitoringAreaMeta {
  key: MonitoringAreaKey;
  label: string;
  shortLabel: string;
  description: string;
  category: "operations" | "waste" | "consumption" | "water" | "facility";
  badgeText: string;
}

export const MONITORING_AREAS: MonitoringAreaMeta[] = [
  {
    key: "energy_vehicle",
    label: "Energy Consumption & Vehicle Data",
    shortLabel: "Energy / Fleet",
    description: "Monthly fleet distance (km), bus charging kWh draw, energy efficiency, and telemetry sync.",
    category: "operations",
    badgeText: "Vehicle & Power Data",
  },
  {
    key: "hazardous_waste",
    label: "Hazardous Waste Management",
    shortLabel: "Hazardous Waste",
    description: "Used oil, grease, coolant, chemical thinners, oily rags, PPE, barrels, and bunding integrity.",
    category: "waste",
    badgeText: "Hazardous Waste Inventory",
  },
  {
    key: "non_hazardous_waste",
    label: "Non-Hazardous Solid Waste",
    shortLabel: "Solid Waste (SWM)",
    description: "Dry recyclables (paper/plastic/metal), wet canteen organic waste, and domestic hazardous waste.",
    category: "waste",
    badgeText: "Dry / Wet / Domestic Haz",
  },
  {
    key: "haz_consumption",
    label: "Hazardous Material Consumption",
    shortLabel: "Material Consumption",
    description: "Maintenance lubricants, hydraulic oils, degreasers, and battery servicing chemicals consumed.",
    category: "consumption",
    badgeText: "Chemicals & Lubricants",
  },
  {
    key: "drinking_water",
    label: "Drinking Water & Potability",
    shortLabel: "Drinking Water",
    description: "RO water consumption, potability lab testing (IS 10500), dispenser sanitation, and filter changes.",
    category: "water",
    badgeText: "RO & Potability",
  },
  {
    key: "wastewater",
    label: "Wastewater & Effluent (ETP/STP)",
    shortLabel: "Wastewater / ETP",
    description: "Bus washing runoff, oil-water separator efficiency, treated effluent reuse, and ZLD compliance.",
    category: "water",
    badgeText: "Effluent & Recycled Water",
  },
  {
    key: "waste_disposal",
    label: "Waste Disposal & Recycler Dispatches",
    shortLabel: "Disposal & Manifests",
    description: "Form 10 manifests, authorized recycler pickups, CHWTSDF transfers, and passbook logs.",
    category: "waste",
    badgeText: "Disposal Manifests",
  },
  {
    key: "housekeeping",
    label: "Environmental Housekeeping & Ambient Quality",
    shortLabel: "Housekeeping / Ambient",
    description: "Bay cleanliness, spill kit availability, stormwater drain integrity, and ambient dust/noise.",
    category: "facility",
    badgeText: "Depot Housekeeping",
  },
  {
    key: "other",
    label: "Other Environmental Observations",
    shortLabel: "Other Observations",
    description: "Spill incidents, external environmental audits, neighbour observations, and ad-hoc compliance.",
    category: "facility",
    badgeText: "General Environmental",
  },
];

export const monitoringAreaByKey = (key: MonitoringAreaKey | string) =>
  MONITORING_AREAS.find((a) => a.key === key);

export interface EnergyVehicleMetadata {
  period: string;
  vehicleCount: number;
  runKm: number;
  energyKwh: number;
  energyIntensityKwhPerKm: number;
  solarGeneratedKwh: number;
  dgDieselLitres: number;
  reportingStatus: string;
}

export interface HazardousWasteItem {
  type:
    | "Oil"
    | "Grease"
    | "Coolant"
    | "Diesel"
    | "Thinner/Chemical"
    | "Discarded containers/barrels/liners"
    | "Greasing clothes"
    | "PPE"
    | "Oily cloths"
    | "Waste water";
  quantity: number;
  unit: "Kg" | "Litres" | "Barrels" | "Nos";
  frequency: "Monthly" | "Quarterly" | "As-generated";
  storageLocation: string;
  disposalStatus: "Stored on Site" | "Dispatched to Recycler" | "Awaiting Manifest";
  vendorRecycler?: string;
  manifestNumber?: string;
  disposalDate?: string;
}

export interface NonHazardousWasteItem {
  category: "Dry" | "Wet" | "Domestic Hazardous";
  type: string;
  quantity: number;
  unit: "Kg";
  storage: string;
  disposalMethod: string;
}

export interface ConsumptionMetadata {
  drinkingWaterLitres: number;
  waterSource: string;
  potabilityStatus: "Tested Potable (IS 10500)" | "Pending Lab Test";
  tdsPpm: number;
  lastFilterChangeDate: string;
  hazardousMaterials: {
    name: string;
    quantity: number;
    unit: "Litres" | "Kg";
    storage: string;
  }[];
}

export interface WastewaterDisposalMetadata {
  effluentTreatedKL: number;
  treatmentFacility: "Depot ETP" | "Depot STP" | "Oil-Water Separator & Soak Pit";
  dischargeMode: "100% Recycled for Bus Washing (ZLD)" | "Permitted Soak Pit" | "Municipal Drain";
  labPh: number;
  labBodMgL: number;
  labCodMgL: number;
  lastRecyclerDispatchDate: string;
  manifestNumber: string;
  transporterName: string;
  authorizedReceiverName: string;
}

export interface SiteEnvironmentMetadata {
  entityId: string;
  depotId: string;
  period: string;
  energyVehicle: EnergyVehicleMetadata;
  hazardousWaste: HazardousWasteItem[];
  nonHazardousWaste: NonHazardousWasteItem[];
  consumption: ConsumptionMetadata;
  wastewaterDisposal: WastewaterDisposalMetadata;
}

export const SITE_ENVIRONMENT_METADATA: SiteEnvironmentMetadata[] = [
  // MBMT · Kashimira Depot — July 2026
  {
    entityId: "mbmt",
    depotId: "kashimira",
    period: "2026-07",
    energyVehicle: {
      period: "2026-07",
      vehicleCount: 50,
      runKm: 412380,
      energyKwh: 486120,
      energyIntensityKwhPerKm: 1.18,
      solarGeneratedKwh: 15400,
      dgDieselLitres: 310,
      reportingStatus: "End-of-Month Telematics & Meter Sync Completed",
    },
    hazardousWaste: [
      {
        type: "Oil",
        quantity: 450,
        unit: "Litres",
        frequency: "Monthly",
        storageLocation: "Dedicated Bunded Haz Shed (Bay 2)",
        disposalStatus: "Stored on Site",
        vendorRecycler: "EcoLube Recycling Pvt Ltd (MPCB/HW/09)",
        manifestNumber: "MPCB/HW/2026/07-882",
      },
      {
        type: "Grease",
        quantity: 65,
        unit: "Kg",
        frequency: "Monthly",
        storageLocation: "Sealed Heavy Drums in Shed",
        disposalStatus: "Stored on Site",
        vendorRecycler: "EcoLube Recycling Pvt Ltd",
      },
      {
        type: "Coolant",
        quantity: 120,
        unit: "Litres",
        frequency: "Quarterly",
        storageLocation: "Secondary Spill Pallet 3",
        disposalStatus: "Dispatched to Recycler",
        vendorRecycler: "CleanChem Solutions",
        manifestNumber: "MPCB/HW/2026/06-419",
        disposalDate: "2026-06-28",
      },
      {
        type: "Diesel",
        quantity: 40,
        unit: "Litres",
        frequency: "As-generated",
        storageLocation: "DG Room Spill Catchment Tray",
        disposalStatus: "Stored on Site",
      },
      {
        type: "Thinner/Chemical",
        quantity: 25,
        unit: "Litres",
        frequency: "As-generated",
        storageLocation: "Flammable Storage Cabinet",
        disposalStatus: "Stored on Site",
      },
      {
        type: "Discarded containers/barrels/liners",
        quantity: 18,
        unit: "Nos",
        frequency: "Monthly",
        storageLocation: "Yard Haz Bay 4 (Covered)",
        disposalStatus: "Stored on Site",
        vendorRecycler: "Maharashtra Enviro Power Ltd",
      },
      {
        type: "Greasing clothes",
        quantity: 45,
        unit: "Kg",
        frequency: "Monthly",
        storageLocation: "Yellow Fire-Resistant Haz Bin",
        disposalStatus: "Stored on Site",
      },
      {
        type: "PPE",
        quantity: 20,
        unit: "Kg",
        frequency: "Monthly",
        storageLocation: "Contaminated PPE Drum",
        disposalStatus: "Stored on Site",
      },
      {
        type: "Oily cloths",
        quantity: 40,
        unit: "Kg",
        frequency: "Monthly",
        storageLocation: "Yellow Fire-Resistant Haz Bin",
        disposalStatus: "Stored on Site",
      },
      {
        type: "Waste water",
        quantity: 1200,
        unit: "Litres",
        frequency: "Monthly",
        storageLocation: "Wash Pit Settling & Interceptor Tank",
        disposalStatus: "Stored on Site",
        vendorRecycler: "Authorized CETP Transporter",
      },
    ],
    nonHazardousWaste: [
      {
        category: "Dry",
        type: "Paper / Cardboard & Packaging",
        quantity: 180,
        unit: "Kg",
        storage: "Segregated Blue Bin (Depot Office & Stores)",
        disposalMethod: "Local Authorized Recycler (Green Earth Recyclers)",
      },
      {
        category: "Dry",
        type: "Plastic Bottles & Wrapping",
        quantity: 95,
        unit: "Kg",
        storage: "Segregated Blue Bin",
        disposalMethod: "Local Authorized Recycler",
      },
      {
        category: "Dry",
        type: "Scrap Metal & Wire Cut-offs",
        quantity: 65,
        unit: "Kg",
        storage: "Scrap Yard Bay 1",
        disposalMethod: "Authorized Metal Scrap Merchant",
      },
      {
        category: "Wet",
        type: "Food Waste / Vegetable Peels / Tea Leaves",
        quantity: 190,
        unit: "Kg",
        storage: "Green Organic Canteen Bins",
        disposalMethod: "MBMC Municipal Wet Waste Collection & Composter",
      },
      {
        category: "Domestic Hazardous",
        type: "Bandage / First Aid Medicine Waste",
        quantity: 4,
        unit: "Kg",
        storage: "Red Bio-Medical Waste Container (First Aid Room)",
        disposalMethod: "Common Bio-Medical Waste Facility (CBMWTF)",
      },
      {
        category: "Domestic Hazardous",
        type: "Fluorescent Tubes & Dry Batteries",
        quantity: 8,
        unit: "Kg",
        storage: "E-Waste Secure Locker",
        disposalMethod: "E-Waste Recycler (Authorized)",
      },
    ],
    consumption: {
      drinkingWaterLitres: 4800,
      waterSource: "Municipal Tap Supply + 50 LPH Commercial RO Unit",
      potabilityStatus: "Tested Potable (IS 10500)",
      tdsPpm: 142,
      lastFilterChangeDate: "2026-05-12",
      hazardousMaterials: [
        { name: "Synthetic Gear Lubricant 75W-90", quantity: 35, unit: "Litres", storage: "Lubricant Room Bay A" },
        { name: "High-Dielectric EV Coolant 50/50", quantity: 50, unit: "Litres", storage: "Secondary Spill Pallet" },
        { name: "Heavy Duty Degreaser & Solvent", quantity: 20, unit: "Litres", storage: "Flammables Cabinet" },
        { name: "Battery Terminal Protection Gel", quantity: 10, unit: "Kg", storage: "Battery Workshop Shelf" },
      ],
    },
    wastewaterDisposal: {
      effluentTreatedKL: 18.5,
      treatmentFacility: "Depot ETP",
      dischargeMode: "100% Recycled for Bus Washing (ZLD)",
      labPh: 7.4,
      labBodMgL: 22,
      labCodMgL: 118,
      lastRecyclerDispatchDate: "2026-07-04",
      manifestNumber: "MPCB/HW/2026/07-882",
      transporterName: "CleanEarth Environmental Logistics (MH-04-GP-8891)",
      authorizedReceiverName: "Maharashtra Enviro Power Ltd (CHWTSDF Taloja)",
    },
  },

  // MBMT · Bhayandar Depot — July 2026
  {
    entityId: "mbmt",
    depotId: "bhayandar",
    period: "2026-07",
    energyVehicle: {
      period: "2026-07",
      vehicleCount: 45,
      runKm: 386060,
      energyKwh: 455150,
      energyIntensityKwhPerKm: 1.18,
      solarGeneratedKwh: 12800,
      dgDieselLitres: 240,
      reportingStatus: "End-of-Month Telematics & Meter Sync Completed",
    },
    hazardousWaste: [
      {
        type: "Oil",
        quantity: 380,
        unit: "Litres",
        frequency: "Monthly",
        storageLocation: "Covered Drum Storage Platform",
        disposalStatus: "Stored on Site",
        vendorRecycler: "EcoLube Recycling Pvt Ltd",
      },
      {
        type: "Grease",
        quantity: 50,
        unit: "Kg",
        frequency: "Monthly",
        storageLocation: "Sealed Drums",
        disposalStatus: "Stored on Site",
      },
      {
        type: "Coolant",
        quantity: 90,
        unit: "Litres",
        frequency: "Quarterly",
        storageLocation: "Spill Containment Tray",
        disposalStatus: "Stored on Site",
      },
      {
        type: "Greasing clothes",
        quantity: 35,
        unit: "Kg",
        frequency: "Monthly",
        storageLocation: "Yellow Haz Drum",
        disposalStatus: "Stored on Site",
      },
      {
        type: "PPE",
        quantity: 15,
        unit: "Kg",
        frequency: "Monthly",
        storageLocation: "PPE Waste Box",
        disposalStatus: "Stored on Site",
      },
      {
        type: "Discarded containers/barrels/liners",
        quantity: 12,
        unit: "Nos",
        frequency: "Monthly",
        storageLocation: "Depot Yard Corner",
        disposalStatus: "Stored on Site",
      },
      {
        type: "Waste water",
        quantity: 950,
        unit: "Litres",
        frequency: "Monthly",
        storageLocation: "Oil-Water Separator Pit",
        disposalStatus: "Stored on Site",
      },
    ],
    nonHazardousWaste: [
      {
        category: "Dry",
        type: "Paper / Cardboard & Packaging",
        quantity: 140,
        unit: "Kg",
        storage: "Blue Recyclables Bin",
        disposalMethod: "Local Recycler",
      },
      {
        category: "Dry",
        type: "Plastic Bottles & Wrapping",
        quantity: 75,
        unit: "Kg",
        storage: "Blue Recyclables Bin",
        disposalMethod: "Local Recycler",
      },
      {
        category: "Wet",
        type: "Food Waste / Vegetable Peels / Tea Leaves",
        quantity: 160,
        unit: "Kg",
        storage: "Green Organic Bins",
        disposalMethod: "MBMC Municipal Composting",
      },
      {
        category: "Domestic Hazardous",
        type: "Bandage / Medicine Waste",
        quantity: 3,
        unit: "Kg",
        storage: "First Aid Red Box",
        disposalMethod: "Bio-Medical Waste Handler",
      },
    ],
    consumption: {
      drinkingWaterLitres: 4200,
      waterSource: "Municipal Connection + 50 LPH RO Unit",
      potabilityStatus: "Tested Potable (IS 10500)",
      tdsPpm: 155,
      lastFilterChangeDate: "2026-06-01",
      hazardousMaterials: [
        { name: "Gearbox Lubricant 75W-90", quantity: 25, unit: "Litres", storage: "Stores" },
        { name: "Dielectric Coolant", quantity: 40, unit: "Litres", storage: "Stores" },
      ],
    },
    wastewaterDisposal: {
      effluentTreatedKL: 15.2,
      treatmentFacility: "Depot ETP",
      dischargeMode: "100% Recycled for Bus Washing (ZLD)",
      labPh: 7.6,
      labBodMgL: 26,
      labCodMgL: 135,
      lastRecyclerDispatchDate: "2026-06-25",
      manifestNumber: "MPCB/HW/2026/06-398",
      transporterName: "CleanEarth Environmental Logistics",
      authorizedReceiverName: "Maharashtra Enviro Power Ltd",
    },
  },

  // Silvassa Depot — July 2026
  {
    entityId: "silvassa",
    depotId: "silvassa-depot",
    period: "2026-07",
    energyVehicle: {
      period: "2026-07",
      vehicleCount: 25,
      runKm: 185000,
      energyKwh: 212750,
      energyIntensityKwhPerKm: 1.15,
      solarGeneratedKwh: 8500,
      dgDieselLitres: 120,
      reportingStatus: "End-of-Month Telematics & Meter Sync Completed",
    },
    hazardousWaste: [
      {
        type: "Oil",
        quantity: 210,
        unit: "Litres",
        frequency: "Monthly",
        storageLocation: "Dedicated Haz Shed",
        disposalStatus: "Stored on Site",
        vendorRecycler: "PCC DNH Authorized Recycler",
      },
      {
        type: "Grease",
        quantity: 30,
        unit: "Kg",
        frequency: "Monthly",
        storageLocation: "Sealed Containers",
        disposalStatus: "Stored on Site",
      },
      {
        type: "PPE",
        quantity: 10,
        unit: "Kg",
        frequency: "Monthly",
        storageLocation: "Yellow Bin",
        disposalStatus: "Stored on Site",
      },
      {
        type: "Waste water",
        quantity: 600,
        unit: "Litres",
        frequency: "Monthly",
        storageLocation: "Settling Sump",
        disposalStatus: "Stored on Site",
      },
    ],
    nonHazardousWaste: [
      {
        category: "Dry",
        type: "Paper & Cardboard",
        quantity: 90,
        unit: "Kg",
        storage: "Dry Waste Shed",
        disposalMethod: "Local Authorized Recycler",
      },
      {
        category: "Wet",
        type: "Food Waste & Peels",
        quantity: 95,
        unit: "Kg",
        storage: "Green Organic Bin",
        disposalMethod: "Silvassa Municipal Wet Waste Disposal",
      },
      {
        category: "Domestic Hazardous",
        type: "Bandage & First Aid Waste",
        quantity: 2,
        unit: "Kg",
        storage: "First Aid Room Bin",
        disposalMethod: "UT Bio-Medical Handler",
      },
    ],
    consumption: {
      drinkingWaterLitres: 2400,
      waterSource: "Depot Borewell + Commercial RO Filtration",
      potabilityStatus: "Tested Potable (IS 10500)",
      tdsPpm: 128,
      lastFilterChangeDate: "2026-05-20",
      hazardousMaterials: [
        { name: "Lubricating Oil 15W-40", quantity: 20, unit: "Litres", storage: "Store Room" },
        { name: "Cleaning Degreaser", quantity: 15, unit: "Litres", storage: "Chemical Shelf" },
      ],
    },
    wastewaterDisposal: {
      effluentTreatedKL: 8.5,
      treatmentFacility: "Depot ETP",
      dischargeMode: "100% Recycled for Bus Washing (ZLD)",
      labPh: 7.2,
      labBodMgL: 18,
      labCodMgL: 95,
      lastRecyclerDispatchDate: "2026-06-18",
      manifestNumber: "DNH/PCC/HW/2026/06-112",
      transporterName: "Silvassa Green Logistics",
      authorizedReceiverName: "DNH TSDF Facility",
    },
  },
];

/** Fetch environment metadata for a depot and period, with sensible fallback if historical */
export function getEnvironmentMetadata(
  entityId: string,
  depotId: string,
  period: string,
): SiteEnvironmentMetadata {
  const found = SITE_ENVIRONMENT_METADATA.find(
    (m) => m.entityId === entityId && m.depotId === depotId && m.period === period,
  );
  if (found) return found;

  const sameDepot = SITE_ENVIRONMENT_METADATA.find(
    (m) => m.entityId === entityId && m.depotId === depotId,
  );
  if (sameDepot) {
    return {
      ...sameDepot,
      period,
      energyVehicle: { ...sameDepot.energyVehicle, period },
    };
  }

  // General fallback
  const first = SITE_ENVIRONMENT_METADATA[0];
  return {
    ...first,
    entityId,
    depotId,
    period,
    energyVehicle: { ...first.energyVehicle, period },
  };
}

/* ----------------------------- project lifecycle ---------------------------- */

/**
 * The ESMS project lifecycle, as onboarding map and pipeline view. Node shape
 * (start/process/decision/document/end) is the legend from the stakeholder
 * diagram; `deepLink` is what a click navigates to — undefined for nodes with
 * no corresponding screen (decisions, documents, the two terminal nodes).
 */
export type LifecycleStageKind = "start" | "process" | "decision" | "document" | "end";

export type LifecycleStage = {
  key: string;
  label: string;
  kind: LifecycleStageKind;
  note?: string;
  deepLink?: { sub: string };
};

/** Column a stage sits in in the branch section — undefined outside the branch. */
export type LifecycleBranch = "brownfield" | "greenfield";

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  { key: "new-opportunity", label: "New project opportunity", kind: "start" },
  { key: "screening", label: "Preliminary E&S screening", note: "Before bidding", kind: "process" },
  { key: "screening-doc", label: "Screening report", kind: "document" },
  { key: "classification", label: "Project type classification", kind: "decision" },
  // brownfield branch
  { key: "esdd", label: "Comprehensive ESDD", kind: "process", deepLink: { sub: "esdd" } },
  {
    key: "esdd-risk",
    label: "Risk identification & analysis",
    kind: "process",
    deepLink: { sub: "esdd" },
  },
  {
    key: "esdd-category",
    label: "Assign risk category A/B/C/D",
    kind: "process",
    deepLink: { sub: "esdd" },
  },
  { key: "esap-formulate", label: "Formulate ESAP", kind: "process", deepLink: { sub: "esap" } },
  { key: "esdd-docs", label: "ESDD report · ESAP", kind: "document" },
  { key: "esap-implement", label: "Implement ESAP", kind: "process", deepLink: { sub: "esap" } },
  // greenfield branch
  { key: "esia", label: "Comprehensive ESIA", kind: "process", deepLink: { sub: "esia" } },
  {
    key: "esia-risk",
    label: "Risk identification & analysis",
    kind: "process",
    deepLink: { sub: "esia" },
  },
  {
    key: "esia-category",
    label: "Assign risk category A/B/C/D",
    kind: "process",
    deepLink: { sub: "esia" },
  },
  { key: "esmp-formulate", label: "Formulate ESMP", kind: "process", deepLink: { sub: "esia" } },
  { key: "esia-docs", label: "ESIA report · ESMP", kind: "document" },
  { key: "esmp-implement", label: "Implement ESMP", kind: "process", deepLink: { sub: "esia" } },
  // converge
  {
    key: "monitor-review",
    label: "Monitor & review implementation",
    kind: "process",
    deepLink: { sub: "monitoring" },
  },
  { key: "risk-reduced", label: "Risk category reduced?", kind: "decision" },
  {
    key: "update-action",
    label: "Update action / management plan",
    note: "Re-implement — loops back",
    kind: "process",
    deepLink: { sub: "esap" },
  },
  {
    key: "maintain-ops",
    label: "Maintain operations",
    note: "Lower risk profile",
    kind: "process",
    deepLink: { sub: "monitoring" },
  },
  {
    key: "ongoing-monitoring",
    label: "Ongoing monitoring & periodic review",
    kind: "process",
    deepLink: { sub: "monitoring" },
  },
  {
    key: "closure",
    label: "Project closure / phase-out",
    note: "Not in current scope",
    kind: "end",
  },
];

export const lifecycleStageByKey = (key: string) => LIFECYCLE_STAGES.find((s) => s.key === key);

export const LIFECYCLE_BRANCH_STAGES: Record<LifecycleBranch, string[]> = {
  brownfield: [
    "esdd",
    "esdd-risk",
    "esdd-category",
    "esap-formulate",
    "esdd-docs",
    "esap-implement",
  ],
  greenfield: [
    "esia",
    "esia-risk",
    "esia-category",
    "esmp-formulate",
    "esia-docs",
    "esmp-implement",
  ],
};

export type ProjectLifecycle = {
  projectId: string;
  project: string;
  entityId: string;
  branch: LifecycleBranch;
  currentStage: string;
  stageEnteredOn: string; // ISO date
  blocked?: { reason: string; since: string };
};

export const PROJECT_LIFECYCLES: ProjectLifecycle[] = [
  {
    projectId: "pl-mbmt",
    project: "MBMT depot electrification",
    entityId: "mbmt",
    branch: "brownfield",
    currentStage: "esap-implement",
    stageEnteredOn: "2026-06-15",
  },
  {
    projectId: "pl-silvassa",
    project: "Silvassa greenfield depot",
    entityId: "silvassa",
    branch: "greenfield",
    currentStage: "monitor-review",
    stageEnteredOn: "2026-06-20",
  },
  {
    projectId: "pl-noida",
    project: "Depot acquisition — due diligence",
    entityId: "corp",
    branch: "brownfield",
    currentStage: "esdd",
    stageEnteredOn: "2026-06-20", // ~25d in stage as of ESG_TODAY — the bottleneck showcase
    blocked: {
      reason: "Soil contamination screen results pending from the lab",
      since: "2026-06-20",
    },
  },
  {
    projectId: "pl-corp2",
    project: "Corporate HQ annex fit-out",
    entityId: "corp",
    branch: "brownfield",
    currentStage: "classification",
    stageEnteredOn: "2026-07-10",
  },
];

/** A stage is a bottleneck when a project is explicitly blocked, or has sat there beyond the threshold. */
export const LIFECYCLE_STUCK_THRESHOLD_DAYS = 21;

export function lifecycleDaysInStage(p: ProjectLifecycle): number {
  return Math.max(0, daysUntil(p.stageEnteredOn) * -1);
}

export function lifecycleIsBottleneck(p: ProjectLifecycle): boolean {
  return !!p.blocked || lifecycleDaysInStage(p) > LIFECYCLE_STUCK_THRESHOLD_DAYS;
}

/** Count of projects currently sitting at each stage — the pipeline view. */
export function lifecycleStageCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of PROJECT_LIFECYCLES) counts[p.currentStage] = (counts[p.currentStage] ?? 0) + 1;
  return counts;
}

/* ------------------------------- ESMS nav map ------------------------------ */

/**
 * Two-tier ESMS navigation. The module has too many sub-views for one segmented
 * row, so tier-1 groups (Governance · Assessment · Assurance · Lifecycle) hold
 * contextual tier-2 tabs. The tier-2 `key` is the `?sub=` deep-link value; tier-1
 * is derived from it via {@link esmsTierForSub}, so old links (`?sub=esap`) resolve.
 *
 * Pure data (no JSX) so later phases register a sub-tab by adding a row here; the
 * renderer maps `key` → panel. `available: false` reserves a slot for a later phase
 * without surfacing an empty screen.
 */
export type EsmsTier = "governance" | "assessment" | "monitoring" | "assurance" | "lifecycle";

export const ESMS_TIERS: { key: EsmsTier; label: string }[] = [
  { key: "governance", label: "Governance" },
  { key: "assessment", label: "Assessment" },
  { key: "monitoring", label: "Site Monitoring" },
  { key: "assurance", label: "Assurance" },
  { key: "lifecycle", label: "Lifecycle" },
];

export type EsmsSubTab = {
  key: string; // the ?sub= value
  tier: EsmsTier;
  label: string; // plain label; `acronym` renders through <A> in the UI
  acronym?: string; // when the whole label is a glossary acronym
  available: boolean; // false = reserved for a later phase, hidden from the nav
  phase?: number;
};

export const ESMS_SUBTABS: EsmsSubTab[] = [
  { key: "policies", tier: "governance", label: "Policies", available: true },
  { key: "sops", tier: "governance", label: "SOPs", available: true },
  { key: "grievance", tier: "governance", label: "Grievance", available: true },
  {
    key: "esap",
    tier: "governance",
    label: "ESAP/ESMP Register",
    acronym: "ESAP",
    available: true,
  },
  { key: "esdd", tier: "assessment", label: "ESDD", acronym: "ESDD", available: true },
  { key: "esia", tier: "assessment", label: "ESIA", acronym: "ESIA", available: true },
  { key: "monitoring", tier: "monitoring", label: "Site Monitoring", available: true, phase: 6 },
  { key: "audit-internal", tier: "assurance", label: "Internal Audit", available: true, phase: 3 },
  { key: "audit-external", tier: "assurance", label: "External Audit", available: true, phase: 4 },
  { key: "training", tier: "assurance", label: "Training", available: true, phase: 5 },
  { key: "assurance-calendar", tier: "assurance", label: "Assurance Calendar", available: true },
  { key: "lifecycle", tier: "lifecycle", label: "Lifecycle", available: true, phase: 8 },
];

/** Legacy `?sub=` aliases → canonical sub key, so old deep-links keep resolving. */
export const ESMS_SUB_ALIAS: Record<string, string> = {
  audits: "audit-internal",
};

export function resolveEsmsSub(sub?: string): string {
  if (!sub) return "policies";
  const canonical = ESMS_SUB_ALIAS[sub] ?? sub;
  const tab = ESMS_SUBTABS.find((s) => s.key === canonical);
  return tab && tab.available ? canonical : "policies";
}

export function esmsTierForSub(sub: string): EsmsTier {
  return ESMS_SUBTABS.find((s) => s.key === sub)?.tier ?? "governance";
}

export const isEsmsSubAvailable = (sub: string) =>
  !!ESMS_SUBTABS.find((s) => s.key === sub)?.available;

export const esmsSubsForTier = (tier: EsmsTier) =>
  ESMS_SUBTABS.filter((s) => s.tier === tier && s.available);

/** Tiers that currently have at least one available sub-tab. */
export const availableEsmsTiers = () => ESMS_TIERS.filter((t) => esmsSubsForTier(t.key).length > 0);

/* --------------------------------- periods -------------------------------- */

export const PERIODS = [
  { id: "2026-07", label: "Jul 2026" },
  { id: "2026-06", label: "Jun 2026" },
  { id: "2026-05", label: "May 2026" },
];

/* ----------------------------------- AMR ----------------------------------- */

export type AmrField = {
  id: string;
  label: string;
  unit: string;
  mode: "manual" | "auto";
  source?: string;
};

export const AMR_FIELDS: AmrField[] = [
  { id: "km", label: "Fleet km operated", unit: "km", mode: "auto", source: "Telematics" },
  {
    id: "energy",
    label: "Charging energy drawn",
    unit: "kWh",
    mode: "auto",
    source: "Energy meters",
  },
  {
    id: "water",
    label: "Water consumption",
    unit: "KL",
    mode: "auto",
    source: "Depot water meter",
  },
  { id: "diesel", label: "DG diesel consumed", unit: "L", mode: "manual" },
  { id: "haz", label: "Hazardous waste dispatched", unit: "kg", mode: "manual" },
  { id: "lti", label: "Lost-time injuries", unit: "count", mode: "manual" },
  { id: "grv", label: "Community grievances received", unit: "count", mode: "manual" },
  { id: "train", label: "EHS training hours", unit: "hrs", mode: "manual" },
];

/** Stub AMR values keyed period → field. `null` = not yet captured. */
export const AMR_VALUES: Record<
  string,
  Record<string, { value: number | null; prov?: Provenance }>
> = {
  "2026-07": {
    km: { value: 412_380, prov: { source: "Telematics", fetchedAt: "2026-07-15T02:00:00Z" } },
    energy: {
      value: 486_120,
      prov: { source: "Energy meters", fetchedAt: "2026-07-15T02:00:00Z" },
    },
    water: {
      value: null,
      prov: {
        source: "Depot water meter",
        fetchedAt: "2026-07-15T02:00:00Z",
        error: "Source unreachable since 12 Jul — meter gateway offline",
      },
    },
    diesel: { value: null },
    haz: { value: null },
    lti: { value: 0 },
    grv: { value: null },
    train: { value: null },
  },
  "2026-06": {
    km: { value: 798_440, prov: { source: "Telematics", fetchedAt: "2026-07-01T02:00:00Z" } },
    energy: {
      value: 941_270,
      prov: { source: "Energy meters", fetchedAt: "2026-07-01T02:00:00Z" },
    },
    water: {
      value: 1_240,
      prov: { source: "Depot water meter", fetchedAt: "2026-07-01T02:00:00Z" },
    },
    diesel: { value: 310 },
    haz: { value: 84 },
    lti: { value: 0 },
    grv: { value: 2 },
    train: { value: 126 },
  },
  "2026-05": {
    km: { value: 771_020, prov: { source: "Telematics", fetchedAt: "2026-06-01T02:00:00Z" } },
    energy: {
      value: 910_580,
      prov: { source: "Energy meters", fetchedAt: "2026-06-01T02:00:00Z" },
    },
    water: {
      value: 1_310,
      prov: { source: "Depot water meter", fetchedAt: "2026-06-01T02:00:00Z" },
    },
    diesel: { value: 285 },
    haz: { value: 61 },
    lti: { value: 1 },
    grv: { value: 1 },
    train: { value: 98 },
  },
};

/* ----------------------------------- GHG ----------------------------------- */

export type GhgParam = {
  id: string;
  scope: 1 | 2 | 3;
  label: string;
  unit: string;
  factor: number; // kgCO2e per unit
  factorSource: string;
  mode: "manual" | "auto";
  source?: string;
};

export const GHG_PARAMS: GhgParam[] = [
  {
    id: "diesel-dg",
    scope: 1,
    label: "DG diesel",
    unit: "L",
    factor: 2.68,
    factorSource: "DEFRA 2025",
    mode: "manual",
  },
  {
    id: "refrigerant",
    scope: 1,
    label: "Refrigerant top-up (R134a)",
    unit: "kg",
    factor: 1430,
    factorSource: "IPCC AR6 GWP",
    mode: "manual",
  },
  {
    id: "grid",
    scope: 2,
    label: "Grid electricity (charging + depot)",
    unit: "kWh",
    factor: 0.716,
    factorSource: "CEA Baseline v19",
    mode: "auto",
    source: "Energy meters",
  },
  {
    id: "commute",
    scope: 3,
    label: "Employee commute",
    unit: "km",
    factor: 0.11,
    factorSource: "DEFRA 2025",
    mode: "manual",
  },
  {
    id: "upstream-fuel",
    scope: 3,
    label: "Well-to-tank — grid electricity",
    unit: "kWh",
    factor: 0.078,
    factorSource: "DEFRA 2025",
    mode: "auto",
    source: "Energy meters",
  },
  {
    id: "waste",
    scope: 3,
    label: "Waste to landfill",
    unit: "kg",
    factor: 0.45,
    factorSource: "DEFRA 2025",
    mode: "manual",
  },
];

/** Stub GHG activity quantities keyed period → param. */
export const GHG_QTY: Record<string, Record<string, number | null>> = {
  "2026-07": {
    "diesel-dg": 180,
    refrigerant: null,
    grid: 486_120,
    commute: 61_200,
    "upstream-fuel": 486_120,
    waste: 2_100,
  },
  "2026-06": {
    "diesel-dg": 310,
    refrigerant: 4,
    grid: 941_270,
    commute: 118_400,
    "upstream-fuel": 941_270,
    waste: 4_450,
  },
  "2026-05": {
    "diesel-dg": 285,
    refrigerant: 0,
    grid: 910_580,
    commute: 120_100,
    "upstream-fuel": 910_580,
    waste: 4_120,
  },
};

/* ------------------------------ carbon savings ----------------------------- */

export const CARBON = {
  /** Public-website methodology (v2.1): baseline diesel bus 1.08 kgCO2e/km vs actual grid-charged EV. */
  methodology:
    "Reconciled to public-website methodology v2.1 — baseline diesel bus 1.08 kgCO₂e/km vs metered EV charging × CEA grid factor.",
  baselinePerKm: 1.08, // kgCO2e/km diesel baseline
  cumulativeSavedT: 12_480, // as displayed on website
  websiteFigureT: 12_480,
  monthly: [
    { period: "2026-05", fleetKm: 771_020, savedT: 405 },
    { period: "2026-06", fleetKm: 798_440, savedT: 419 },
    { period: "2026-07", fleetKm: 412_380, savedT: 216 }, // month-to-date
  ],
};

/* --------------------------------- vendors --------------------------------- */

export type VendorCategory = "battery-recycler" | "civil-contractor" | "o-and-m" | "scrap-dealer";

export const VENDOR_CATEGORY_META: Record<
  VendorCategory,
  { label: string; conditional: string[] } // conditional doc sections
> = {
  "battery-recycler": { label: "Battery recycler", conditional: ["Battery disposal", "E-waste"] },
  "civil-contractor": { label: "Civil contractor", conditional: ["SWM", "Labour compliance"] },
  "o-and-m": { label: "O&M vendor", conditional: ["E-waste", "ETP"] },
  "scrap-dealer": { label: "Scrap dealer", conditional: ["E-waste", "SWM"] },
};

export type VendorDoc = {
  name: string;
  section: string; // "Identity" | "Registration" | conditional section
  status: "pending" | "submitted" | "verified" | "rejected";
  note?: string;
};

export type Vendor = {
  id: string;
  name: string;
  category: VendorCategory;
  contractEnd: string;
  docs: VendorDoc[];
};

export const VENDORS: Vendor[] = [
  {
    id: "v-eco",
    name: "EcoVolt Recyclers Pvt Ltd",
    category: "battery-recycler",
    contractEnd: "2027-03-31",
    docs: [
      { name: "GST registration", section: "Registration", status: "verified" },
      { name: "PAN", section: "Identity", status: "verified" },
      { name: "CPCB recycler authorisation", section: "Battery disposal", status: "submitted" },
      { name: "E-waste licence", section: "E-waste", status: "submitted" },
    ],
  },
  {
    id: "v-shree",
    name: "Shree Infra Works",
    category: "civil-contractor",
    contractEnd: "2026-12-31",
    docs: [
      { name: "GST registration", section: "Registration", status: "verified" },
      { name: "PAN", section: "Identity", status: "verified" },
      {
        name: "Debris disposal plan (SWM)",
        section: "SWM",
        status: "rejected",
        note: "Plan names a dump site outside approved list — resubmit.",
      },
      { name: "PF/ESIC challans (Q1)", section: "Labour compliance", status: "submitted" },
    ],
  },
  {
    id: "v-omx",
    name: "OmniMax O&M Services",
    category: "o-and-m",
    contractEnd: "2027-06-30",
    docs: [
      { name: "GST registration", section: "Registration", status: "verified" },
      { name: "PAN", section: "Identity", status: "verified" },
      { name: "E-waste handling declaration", section: "E-waste", status: "pending" },
      { name: "ETP operator certification", section: "ETP", status: "pending" },
    ],
  },
];

/* --------------------------------- reports --------------------------------- */

export type ReportDef = {
  id: string;
  name: string;
  acronyms: string[];
  blurb: string;
  kind: "rollup" | "external-format" | "narrative" | "calculation";
};

export const REPORT_DEFS: ReportDef[] = [
  {
    id: "nc-report",
    name: "NC Report",
    acronyms: ["NC"],
    blurb:
      "Consolidated register: permits, site compliance, internal & external audit NCs, and monitoring breaches — one list, one number.",
    kind: "rollup",
  },
  {
    id: "amr",
    name: "AMR",
    acronyms: ["AMR"],
    blurb: "Lender-format monitoring report from configured input fields.",
    kind: "external-format",
  },
  {
    id: "ghg",
    name: "GHG inventory",
    acronyms: ["GHG"],
    blurb: "Scope 1 / 2 / 3 emissions from configured parameters and factors.",
    kind: "external-format",
  },
  {
    id: "brsr",
    name: "BRSR",
    acronyms: ["BRSR", "SEBI"],
    blurb: "SEBI disclosure format; project-level, rolls up to group.",
    kind: "external-format",
  },
  {
    id: "impact",
    name: "Impact report",
    acronyms: ["ESIA", "ESDD"],
    blurb: "Narrative output of the assessment process.",
    kind: "narrative",
  },
  {
    id: "carbon",
    name: "Carbon savings",
    acronyms: ["EV"],
    blurb: "Baseline-vs-actual emissions avoided by EV fleet operation.",
    kind: "calculation",
  },
];

/* ------------------------------ notifications ------------------------------ */

export type EsgNotification = {
  id: string;
  kind: "expiry" | "digest" | "escalation" | "reminder";
  title: string;
  detail: string;
  when: string;
  recordId?: string;
  unread?: boolean;
  
  // Escalation properties
  severity?: "normal" | "reminder" | "overdue" | "escalated" | "critical";
  level?: 0 | 1 | 2 | 3 | 4;
  project?: string;
  siteId?: string;
  siteName?: string;
  taskType?: "energy" | "water" | "workforce" | "governance" | "permit" | "nc" | "esap" | "audit" | "policy" | "approval";
  indicatorId?: string;
  policyId?: string;
  period?: string;
  reason?: string;
  overdueDays?: number;
  owner?: string;
  escalatedTo?: string;
  isResolved?: boolean;
};

export const NOTIFICATIONS: EsgNotification[] = [
  {
    id: "n-1",
    kind: "escalation",
    title: "Fire NOC · Kashimira — 17d overdue, escalated",
    detail: "Unactioned past owner SLA; escalated to ESG Lead. Remediation note on record.",
    when: "2026-07-14T08:00:00+05:30",
    recordId: "r-fire-kash",
    unread: true,
  },
  {
    id: "n-2",
    kind: "expiry",
    title: "Fire NOC · Bhayandar — enters 60-day window",
    detail: "Expires 05 Aug 2026. Renewal not yet initiated. Owner: Rohan Desai.",
    when: "2026-07-13T07:30:00+05:30",
    recordId: "r-fire-bhy",
    unread: true,
  },
  {
    id: "n-3",
    kind: "expiry",
    title: "CTO · MBMT — 36 days to expiry",
    detail: "Renewal initiated 02 Jul; awaiting MPCB inspection slot.",
    when: "2026-07-12T07:30:00+05:30",
    recordId: "r-cto-mbmt",
  },
  {
    id: "n-4",
    kind: "digest",
    title: "Monthly compliance digest — 7 Jul 2026",
    detail:
      "4 overdue · 6 expiring · 14 valid across group. Full list in Reports → Non-compliance.",
    when: "2026-07-07T09:00:00+05:30",
  },
];

/* ------------------------------- aggregations ------------------------------ */

export type DomainKey = "permits" | "site" | "esms" | "vendor" | "reporting";

export const DOMAINS: { key: DomainKey; label: string; acronyms?: string[] }[] = [
  { key: "permits", label: "Permits & Licences" },
  { key: "site", label: "Site Compliance" },
  { key: "esms", label: "ESMS", acronyms: ["ESMS"] },
  { key: "vendor", label: "Vendors" },
  { key: "reporting", label: "AMR / GHG", acronyms: ["AMR", "GHG"] },
];

export type CellStat = { valid: number; expiring: number; overdue: number };

export function worstOf(c: CellStat): EsgState {
  if (c.overdue > 0) return "overdue";
  if (c.expiring > 0) return "expiring";
  return "valid";
}

/** Matrix cell roll-up per entity × domain (stub aggregation over local data). */
export function cellStat(entityId: string, domain: DomainKey): CellStat {
  const zero: CellStat = { valid: 0, expiring: 0, overdue: 0 };
  if (domain === "permits" || domain === "site") {
    const cat: ComplianceCategory = domain === "permits" ? "permit" : "site";
    return RECORDS.filter(
      (r) => r.entityId === entityId && typeByKey(r.typeKey)?.category === cat,
    ).reduce(
      (acc, r) => {
        acc[
          recordState(r) === "overdue"
            ? "overdue"
            : recordState(r) === "expiring"
              ? "expiring"
              : "valid"
        ]++;
        return acc;
      },
      { ...zero },
    );
  }
  if (domain === "esms") {
    return ESAP_ACTIONS.filter((a) => esapActionEntityId(a) === entityId).reduce(
      (acc, a) => {
        const s = esapState(a);
        if (s === "overdue") acc.overdue++;
        else if (s === "open") acc.expiring++;
        else acc.valid++;
        return acc;
      },
      { ...zero },
    );
  }
  if (domain === "vendor") {
    // Vendors attach at group level in the stub; attribute to MBMT + Silvassa evenly for the matrix.
    if (entityId === "corp") return { ...zero };
    return VENDORS.reduce(
      (acc, v) => {
        for (const d of v.docs) {
          if (d.status === "rejected") acc.overdue++;
          else if (d.status === "pending" || d.status === "submitted") acc.expiring++;
          else acc.valid++;
        }
        return acc;
      },
      { ...zero },
    );
  }
  // reporting: July capture status per entity (stub — water meter outage + pending manual fields)
  const julyPending = entityId === "mbmt" ? 3 : entityId === "silvassa" ? 2 : 0;
  return { valid: AMR_FIELDS.length - julyPending, expiring: julyPending, overdue: 0 };
}

/* ------------------------------ derived helpers ---------------------------- */

export function auditFindingCounts(auditId: string): {
  compliant: number;
  nc: number;
  observation: number;
} {
  const f = AUDIT_FINDINGS.filter((x) => x.auditId === auditId);
  return {
    compliant: f.filter((x) => x.result === "compliant").length,
    nc: f.filter((x) => x.result === "nc").length,
    observation: f.filter((x) => x.result === "observation").length,
  };
}

/** Open non-conformities in scope: audit NCs whose corrective action is unresolved. */
export function openNcCount(sel: ScopeSel): number {
  return AUDIT_FINDINGS.filter((f) => f.result === "nc").filter((f) => {
    const audit = AUDITS.find((a) => a.id === f.auditId);
    if (!audit || !inScope({ entityId: audit.entityId, depotId: audit.depotId }, sel)) return false;
    if (!f.actionId) return true; // an NC with no corrective action is still open
    const act = ESAP_ACTIONS.find((x) => x.id === f.actionId);
    return act ? act.status !== "closed" : true;
  }).length;
}

export function trainingCoverage(
  sel: ScopeSel,
  period: string,
): { sessions: number; attendees: number; rate: number } {
  const sessions = TRAININGS.filter((t) =>
    inScope({ entityId: t.entityId, depotId: t.depotId }, sel),
  ).filter((t) => t.scheduledAt.startsWith(period));
  const attendees = sessions.reduce((n, t) => n + t.attendees.length, 0);
  const present = sessions.reduce((n, t) => n + t.attendees.filter((a) => a.present).length, 0);
  return {
    sessions: sessions.length,
    attendees,
    rate: attendees ? Math.round((present / attendees) * 100) : 0,
  };
}

export function monitoringBreaches(sel: ScopeSel, period: string): MonitoringReading[] {
  return MONITORING_READINGS.filter((r) => r.period === period)
    .filter((r) => inScope({ entityId: r.entityId, depotId: r.depotId }, sel))
    .filter((r) => isMonitoringBreach(r));
}

export function policiesDueForReview(sel: ScopeSel, withinDays = 60): Policy[] {
  return POLICIES.filter((p) => daysUntil(p.reviewDue) <= withinDays);
}

export function headline(sel: ScopeSel) {
  const rec = RECORDS.filter((r) => inScope(r, sel));
  const overdue = rec.filter((r) => recordState(r) === "overdue");
  const expiring = rec.filter((r) => recordState(r) === "expiring");
  const openActions = ESAP_ACTIONS.filter((a) => a.status !== "closed").filter((a) => {
    const entityId = esapActionEntityId(a);
    return entityId ? inScope({ entityId }, { entityId: sel.entityId }) : true;
  });
  const compliantPct =
    rec.length === 0 ? 100 : Math.round(((rec.length - overdue.length) / rec.length) * 100);
  // Wired in for the Phase 9 Overview tiles; the current tiles ignore the extra keys.
  const openNcs = openNcCount(sel);
  const breaches = monitoringBreaches(sel, PERIODS[0].id);
  const policiesDue = policiesDueForReview(sel);
  return {
    records: rec,
    overdue,
    expiring,
    openActions,
    compliantPct,
    openNcs,
    breaches,
    policiesDue,
  };
}
