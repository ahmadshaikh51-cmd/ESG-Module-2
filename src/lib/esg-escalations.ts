import {
  ESG_TODAY,
  NOTIFICATIONS,
  RECORDS,
  POLICIES,
  typeByKey,
  recordState,
  daysUntil,
  personById,
  type EsgNotification,
  type ComplianceRecord,
  type Policy,
  PERIODS,
} from "./esg-data";
import { PROJECTS_MAPPING, INDICATORS } from "../components/esg/projects/ReportDataEntryForm";
import { getRoleFromEmail, ESG_ROLES_CONFIG, type EsgRole } from "./esg-roles";

// SLA Configuration in Days
const SLA_L1_OVERDUE = 1;      // Level 1: Overdue (1 day) -> Project Manager
const SLA_L2_ESCALATED = 3;    // Level 2: Escalated (3 days) -> ESG Team
const SLA_L3_CRITICAL = 7;     // Level 3: Critical (7 days) -> ESG Head / Approver
const SLA_L4_MANAGEMENT = 10;  // Level 4: Management Visibility (10+ days)

export interface EscalationDetail {
  id: string;
  level: 0 | 1 | 2 | 3 | 4;
  severity: "normal" | "reminder" | "overdue" | "escalated" | "critical";
  title: string;
  reason: string;
  project?: string;
  siteId?: string;
  siteName?: string;
  taskType: "energy" | "water" | "workforce" | "governance" | "permit" | "nc" | "esap" | "audit" | "policy" | "approval";
  dueDate: string;
  daysOverdue: number;
  owner: string;
  escalatedTo: string;
  nextEscalationDate?: string;
  history: { level: number; date: string; description: string }[];
}

/** Calculates the escalation level and severity based on overdue days */
function getSlaLevel(days: number): { level: 0 | 1 | 2 | 3 | 4; severity: EsgNotification["severity"] } {
  if (days >= SLA_L4_MANAGEMENT) return { level: 4, severity: "critical" };
  if (days >= SLA_L3_CRITICAL) return { level: 3, severity: "critical" };
  if (days >= SLA_L2_ESCALATED) return { level: 2, severity: "escalated" };
  if (days >= SLA_L1_OVERDUE) return { level: 1, severity: "overdue" };
  return { level: 0, severity: "reminder" };
}

function getRoleLabelForLevel(level: number): string {
  switch (level) {
    case 0: return "Responsible User";
    case 1: return "Project Manager";
    case 2: return "ESG Team";
    case 3: return "ESG Head / Authorized Approver";
    case 4:
    default:
      return "Management Board";
  }
}

/**
 * Returns all active automatic escalations in the system.
 */
export function getActiveEscalations(): EsgNotification[] {
  const list: EsgNotification[] = [];

  // 1. Data Entry Tasks (from PROJECTS_MAPPING / localStorage)
  let savedRecords: any[] = [];
  try {
    savedRecords = JSON.parse(localStorage.getItem("voltline-report-records") || "[]");
  } catch {
    savedRecords = [];
  }

  Object.entries(PROJECTS_MAPPING).forEach(([projName, projMeta]) => {
    projMeta.sites.forEach((siteMeta) => {
      projMeta.indicators.forEach((indId) => {
        const indMeta = INDICATORS.find(i => i.id === indId);
        if (!indMeta) return;

        PERIODS.forEach((periodMeta) => {
          // Calculate due date (10th of next month)
          const [year, month] = periodMeta.id.split("-").map(Number);
          let dueYear = year;
          let dueMonth = month + 1;
          if (dueMonth > 12) {
            dueMonth = 1;
            dueYear += 1;
          }
          const dueIso = `${dueYear}-${String(dueMonth).padStart(2, "0")}-10`;
          const dueDateObj = new Date(dueIso);
          const daysDiff = Math.floor((ESG_TODAY.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24));

          // Only compute for past/overdue periods
          if (daysDiff < 0) return; // Not yet due

          const matchingRecord = savedRecords.find((r: any) =>
            r.project === projName &&
            r.site === siteMeta.id &&
            r.reportingPeriod === periodMeta.id &&
            r.indicatorValues?.[indId]?.actual !== undefined
          );

          const status = matchingRecord ? matchingRecord.status : "Pending Entry";
          const isResolved = status === "Approved" || status === "Submitted" || status === "Reviewed";

          if (!isResolved) {
            // It is overdue!
            const sla = getSlaLevel(daysDiff);
            const ownerName = personById(projMeta.person)?.name || projMeta.person;

            list.push({
              id: `esc-task-${projName}-${siteMeta.id}-${indId}-${periodMeta.id}`,
              kind: sla.level >= 2 ? "escalation" : "reminder",
              title: `${projName} · ${indMeta.name}`,
              detail: `${indMeta.name} is overdue by ${daysDiff} days.`,
              when: new Date(dueDateObj.getTime() + 24 * 60 * 60 * 1000).toISOString(), // 1 day past due
              unread: true,
              severity: sla.severity,
              level: sla.level,
              project: projName,
              siteId: siteMeta.id,
              siteName: siteMeta.name,
              taskType: indMeta.maps.includes("amr") ? "energy" : "water", // simplified classification
              indicatorId: indMeta.id,
              period: periodMeta.id,
              overdueDays: daysDiff,
              owner: `${ownerName} (${projMeta.dept})`,
              escalatedTo: getRoleLabelForLevel(sla.level),
              reason: `Monthly metrics submission breached the ${getRoleLabelForLevel(0)} SLA date of ${dueIso}.`,
            });
          }

          // 2. Approvals Overdue (submitted > 2 days)
          if (status === "Submitted") {
            const updatedAt = matchingRecord.updatedAt ? new Date(matchingRecord.updatedAt) : ESG_TODAY;
            const daysPending = Math.floor((ESG_TODAY.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
            if (daysPending >= 2) {
              const sla = getSlaLevel(daysPending + 1); // offset for approval SLA priority
              list.push({
                id: `esc-appr-${matchingRecord.id}`,
                kind: "escalation",
                title: `Awaiting Sign-off: ${projName}`,
                detail: `Submission for ${periodMeta.label} awaits review signature for ${daysPending} days.`,
                when: updatedAt.toISOString(),
                unread: true,
                severity: sla.severity,
                level: Math.min(3, sla.level + 1) as any, // escalated to Approver / ESG Head
                project: projName,
                siteId: siteMeta.id,
                siteName: siteMeta.name,
                taskType: "approval",
                period: periodMeta.id,
                overdueDays: daysPending,
                owner: "ESG Reviewer",
                escalatedTo: "ESG Head / authorized Approver",
                reason: `Approval cycle delayed past the standard 48-hour validation review window.`,
              });
            }
          }
        });
      });
    });
  });

  // 3. Compliance Permits & Licences (from RECORDS)
  RECORDS.forEach((r) => {
    if (recordState(r) === "overdue" && r.expiryDate) {
      const daysOverdue = Math.floor((ESG_TODAY.getTime() - new Date(r.expiryDate).getTime()) / (1000 * 60 * 60 * 24));
      const sla = getSlaLevel(daysOverdue);
      const ownerName = personById(r.ownerId)?.name || r.ownerId;
      const type = typeByKey(r.typeKey);

      list.push({
        id: `esc-permit-${r.id}`,
        kind: sla.level >= 2 ? "escalation" : "reminder",
        title: `${type?.label || r.typeKey} · ${r.authority}`,
        detail: `Licence ${r.refNo} expired on ${r.expiryDate}.`,
        when: new Date(r.expiryDate).toISOString(),
        recordId: r.id,
        unread: true,
        severity: sla.severity,
        level: sla.level,
        project: type?.category === "permit" ? "Permits" : "Site compliance",
        siteId: r.depotId,
        siteName: r.depotId ? r.depotId.charAt(0).toUpperCase() + r.depotId.slice(1) + " Depot" : undefined,
        taskType: "permit",
        overdueDays: daysOverdue,
        owner: ownerName,
        escalatedTo: getRoleLabelForLevel(sla.level),
        reason: `Licence renewal was not signed off before the official legal expiration date.`,
      });
    }
  });

  // 4. Overdue Policy Reviews (from POLICIES)
  POLICIES.forEach((p) => {
    const daysOverdue = Math.floor((ESG_TODAY.getTime() - new Date(p.reviewDue).getTime()) / (1000 * 60 * 60 * 24));
    if (daysOverdue > 0) {
      const sla = getSlaLevel(daysOverdue);
      const ownerName = personById(p.ownerId)?.name || p.ownerId;

      list.push({
        id: `esc-policy-${p.id}`,
        kind: sla.level >= 2 ? "escalation" : "reminder",
        title: `Policy Review: ${p.name}`,
        detail: `Annual policy review has been overdue since ${p.reviewDue}.`,
        when: new Date(p.reviewDue).toISOString(),
        policyId: p.id,
        unread: true,
        severity: sla.severity,
        level: sla.level,
        taskType: "policy",
        overdueDays: daysOverdue,
        owner: ownerName,
        escalatedTo: getRoleLabelForLevel(sla.level),
        reason: `Annual review cycle breached. Board compliance requires rolling reviews every 12 months.`,
      });
    }
  });

  return list;
}

/**
 * Returns role-filtered notifications including static alerts and dynamic escalations.
 */
export function generateEscalations(currentUserEmail: string | null): EsgNotification[] {
  const role = currentUserEmail ? getRoleFromEmail(currentUserEmail) : "esg_team";
  const roleConfig = ESG_ROLES_CONFIG[role] || ESG_ROLES_CONFIG.esg_team;

  // Load static notifications (e.g. monthly compliance digest and valid CTO items)
  const staticNotifs = NOTIFICATIONS.map(n => ({
    ...n,
    // Add default values for rendering consistency
    severity: (n.kind === "escalation" ? "escalated" : "normal") as EsgNotification["severity"],
    level: (n.kind === "escalation" ? 2 : 0) as EsgNotification["level"],
    owner: "Facility Manager",
    escalatedTo: "ESG Lead",
  }));

  const dynamicNotifs = getActiveEscalations();

  // Combine lists
  const allNotifs = [...dynamicNotifs, ...staticNotifs];

  // Role-Based Notification Filters
  return allNotifs.filter((n) => {
    // 1. Contributors (Site managers, HSE, HR, Operations, Finance)
    if (roleConfig.isContributorOnly) {
      // Show reminders, overdue tasks, and Level 0 / 1 tasks that concern their indicators
      if (roleConfig.indicators && roleConfig.indicators.length > 0) {
        if (n.indicatorId && !roleConfig.indicators.includes(n.indicatorId)) return false;
      }
      return n.level !== undefined && n.level <= 1;
    }

    // 2. Project Managers
    if (role === "project_manager") {
      // See escalations for assigned projects (Level 1 and 2)
      return n.level !== undefined && n.level >= 1 && n.level <= 2;
    }

    // 3. ESG Reviewer
    if (role === "reviewer") {
      // See Level 1, 2, and 3 approvals or digests
      return n.level !== undefined && n.level >= 1 && n.level <= 3;
    }

    // 4. ESG Approver / ESG Head
    if (role === "approver") {
      // See Level 3 and 4 critical escalations and approval related notices
      if (n.taskType === "approval") return true;
      return n.level !== undefined && n.level >= 3;
    }

    // 5. Admin / Management Visibility
    if (role === "admin") {
      // See Level 3 and Level 4 critical issues only
      return n.level !== undefined && n.level >= 3;
    }

    // 6. ESG Team (Lead)
    // See all escalations and notifications
    return true;
  });
}

/** Retrieves the active escalation object for a specific record ID */
export function getActiveEscalationForSource(sourceId: string): EscalationDetail | null {
  const activeList = getActiveEscalations();
  const matched = activeList.find((n) => n.indicatorId === sourceId || n.recordId === sourceId || n.policyId === sourceId);

  if (!matched) return null;

  const due = matched.period ? "10th of following month" : matched.when.slice(0, 10);
  const overdueDays = matched.overdueDays || 0;

  // Generate historical log entries
  const history = [
    { level: 0, date: matched.when.slice(0, 10), description: "Task created and assigned to owner." }
  ];
  if (overdueDays >= SLA_L1_OVERDUE) {
    history.push({ level: 1, date: "SLA Day +1", description: "Breached owner deadline. Escalated to Project Manager." });
  }
  if (overdueDays >= SLA_L2_ESCALATED) {
    history.push({ level: 2, date: "SLA Day +3", description: "Unresolved in 3 days. Escalated to ESG Team." });
  }
  if (overdueDays >= SLA_L3_CRITICAL) {
    history.push({ level: 3, date: "SLA Day +7", description: "Breached Level 2 response SLA. Elevated to ESG Head." });
  }

  // Calculate next escalation date
  let nextDate = "N/A";
  if (overdueDays < SLA_L1_OVERDUE) nextDate = "SLA Day +1";
  else if (overdueDays < SLA_L2_ESCALATED) nextDate = "SLA Day +3";
  else if (overdueDays < SLA_L3_CRITICAL) nextDate = "SLA Day +7";
  else if (overdueDays < SLA_L4_MANAGEMENT) nextDate = "SLA Day +10";

  return {
    id: matched.id,
    level: matched.level || 0,
    severity: matched.severity || "normal",
    title: matched.title,
    reason: matched.reason || "Automatic threshold breach.",
    project: matched.project,
    siteId: matched.siteId,
    siteName: matched.siteName,
    taskType: matched.taskType || "energy",
    dueDate: due,
    daysOverdue: overdueDays,
    owner: matched.owner || "Unassigned",
    escalatedTo: matched.escalatedTo || "None",
    nextEscalationDate: nextDate,
    history,
  };
}
