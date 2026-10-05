import {
  daysUntil,
  ESAP_ACTIONS,
  esapActionEntityId,
  esapSourceLabel,
  esapState,
  personById,
  type EsapAction,
  type EsapSource,
} from './esg-data';

export interface EsapFilterState {
  sourceKind: 'all' | 'assessment' | 'internal-audit' | 'external-audit' | 'policy';
  projectId: string;
  status: 'all' | 'open' | 'in-progress' | 'overdue' | 'closed';
  severity: 'all' | 'major' | 'minor' | 'observation';
  ownerId: string;
  searchQuery: string;
}

export const INITIAL_ESAP_FILTERS: EsapFilterState = {
  sourceKind: 'all',
  projectId: 'all',
  status: 'all',
  severity: 'all',
  ownerId: 'all',
  searchQuery: '',
};

export interface EsapKpiStats {
  totalActions: number;
  openActions: number;
  inProgressActions: number;
  overdueActions: number;
  closedActions: number;
  majorCount: number;
  minorCount: number;
  observationCount: number;
  closureRatePct: number;
  onTimeClosureRatePct: number;
}

export interface EsapProjectRow {
  projectId: string;
  projectName: string;
  total: number;
  open: number;
  inProgress: number;
  overdue: number;
  closed: number;
  major: number;
  minor: number;
  closureRate: number;
}

export function getFilteredEsapActions(
  allActions: EsapAction[],
  filters: EsapFilterState,
): EsapAction[] {
  return allActions.filter((a) => {
    // Source filter
    if (filters.sourceKind !== 'all' && a.source.kind !== filters.sourceKind) {
      return false;
    }
    // Project filter
    if (filters.projectId !== 'all') {
      const entityId = esapActionEntityId(a);
      if (entityId !== filters.projectId) return false;
    }
    // Status filter
    const computedState = esapState(a);
    if (filters.status !== 'all') {
      if (filters.status === 'closed' && a.status !== 'closed') return false;
      if (filters.status === 'overdue' && computedState !== 'overdue') return false;
      if (filters.status === 'in-progress' && a.status !== 'in-progress') return false;
      if (filters.status === 'open' && (a.status === 'closed' || computedState === 'overdue')) {
        return false;
      }
    }
    // Severity filter
    if (filters.severity !== 'all' && (a.severity ?? 'minor') !== filters.severity) {
      return false;
    }
    // Owner filter
    if (filters.ownerId !== 'all' && a.ownerId !== filters.ownerId) {
      return false;
    }
    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchAction = a.action.toLowerCase().includes(q);
      const matchFinding = a.finding.toLowerCase().includes(q);
      const matchRef = a.ncRef?.toLowerCase().includes(q) ?? false;
      const owner = personById(a.ownerId);
      const matchOwner = owner?.name.toLowerCase().includes(q) ?? false;
      const sourceInfo = esapSourceLabel(a.source);
      const matchSource = sourceInfo.label.toLowerCase().includes(q);
      if (!matchAction && !matchFinding && !matchRef && !matchOwner && !matchSource) {
        return false;
      }
    }
    return true;
  });
}

export function computeEsapKpis(actions: EsapAction[]): EsapKpiStats {
  const totalActions = actions.length;
  let openActions = 0;
  let inProgressActions = 0;
  let overdueActions = 0;
  let closedActions = 0;
  let majorCount = 0;
  let minorCount = 0;
  let observationCount = 0;

  for (const a of actions) {
    const st = esapState(a);
    if (a.status === 'closed') {
      closedActions++;
    } else if (st === 'overdue') {
      overdueActions++;
    } else if (a.status === 'in-progress') {
      inProgressActions++;
    } else {
      openActions++;
    }

    const sev = a.severity ?? 'minor';
    if (sev === 'major') majorCount++;
    else if (sev === 'minor') minorCount++;
    else observationCount++;
  }

  const closureRatePct = totalActions > 0 ? Math.round((closedActions / totalActions) * 100) : 0;
  const onTimeClosureRatePct =
    totalActions - overdueActions > 0
      ? Math.round((closedActions / (totalActions - overdueActions)) * 100)
      : 0;

  return {
    totalActions,
    openActions,
    inProgressActions,
    overdueActions,
    closedActions,
    majorCount,
    minorCount,
    observationCount,
    closureRatePct,
    onTimeClosureRatePct,
  };
}

export function getEsapSourceBreakdown(actions: EsapAction[]) {
  const map: Record<string, { count: number; closed: number; overdue: number }> = {
    Assessment: { count: 0, closed: 0, overdue: 0 },
    'Internal Audit': { count: 0, closed: 0, overdue: 0 },
    'External Audit': { count: 0, closed: 0, overdue: 0 },
    Policy: { count: 0, closed: 0, overdue: 0 },
  };

  for (const a of actions) {
    const k =
      a.source.kind === 'assessment'
        ? 'Assessment'
        : a.source.kind === 'internal-audit'
        ? 'Internal Audit'
        : a.source.kind === 'external-audit'
        ? 'External Audit'
        : 'Policy';

    if (map[k]) {
      map[k].count++;
      if (a.status === 'closed') map[k].closed++;
      if (esapState(a) === 'overdue') map[k].overdue++;
    }
  }

  return Object.entries(map).map(([name, val]) => ({
    name,
    count: val.count,
    closed: val.closed,
    overdue: val.overdue,
    open: val.count - val.closed,
  }));
}

export function getEsapStatusBreakdown(actions: EsapAction[]) {
  const kpis = computeEsapKpis(actions);
  return [
    { name: 'Open', value: kpis.openActions, color: '#3b82f6' },
    { name: 'In Progress', value: kpis.inProgressActions, color: '#f59e0b' },
    { name: 'Overdue', value: kpis.overdueActions, color: '#ef4444' },
    { name: 'Closed', value: kpis.closedActions, color: '#10b981' },
  ];
}

export function getEsapSeverityBreakdown(actions: EsapAction[]) {
  const kpis = computeEsapKpis(actions);
  return [
    { name: 'Major NC', value: kpis.majorCount, color: '#ef4444' },
    { name: 'Minor NC', value: kpis.minorCount, color: '#f59e0b' },
    { name: 'Observation', value: kpis.observationCount, color: '#6b7280' },
  ];
}

export function getEsapProjectComparison(actions: EsapAction[]): EsapProjectRow[] {
  const projectMap: Record<
    string,
    {
      name: string;
      total: number;
      open: number;
      inProgress: number;
      overdue: number;
      closed: number;
      major: number;
      minor: number;
    }
  > = {
    'spv-mbmt': {
      name: 'MBMT Project SPV',
      total: 0,
      open: 0,
      inProgress: 0,
      overdue: 0,
      closed: 0,
      major: 0,
      minor: 0,
    },
    'spv-silvassa': {
      name: 'Silvassa Smart City SPV',
      total: 0,
      open: 0,
      inProgress: 0,
      overdue: 0,
      closed: 0,
      major: 0,
      minor: 0,
    },
    'spv-best': {
      name: 'BEST Fleet Electrification SPV',
      total: 0,
      open: 0,
      inProgress: 0,
      overdue: 0,
      closed: 0,
      major: 0,
      minor: 0,
    },
    'spv-pmpml': {
      name: 'PMPML Pune Bus SPV',
      total: 0,
      open: 0,
      inProgress: 0,
      overdue: 0,
      closed: 0,
      major: 0,
      minor: 0,
    },
    'spv-corporate': {
      name: 'Corporate & Governance',
      total: 0,
      open: 0,
      inProgress: 0,
      overdue: 0,
      closed: 0,
      major: 0,
      minor: 0,
    },
  };

  for (const a of actions) {
    const entityId = esapActionEntityId(a) || 'spv-corporate';
    const target = projectMap[entityId] ?? projectMap['spv-corporate'];

    target.total++;
    const st = esapState(a);
    if (a.status === 'closed') target.closed++;
    else if (st === 'overdue') target.overdue++;
    else if (a.status === 'in-progress') target.inProgress++;
    else target.open++;

    const sev = a.severity ?? 'minor';
    if (sev === 'major') target.major++;
    else if (sev === 'minor') target.minor++;
  }

  return Object.entries(projectMap).map(([id, data]) => ({
    projectId: id,
    projectName: data.name,
    total: data.total,
    open: data.open,
    inProgress: data.inProgress,
    overdue: data.overdue,
    closed: data.closed,
    major: data.major,
    minor: data.minor,
    closureRate: data.total > 0 ? Math.round((data.closed / data.total) * 100) : 0,
  }));
}
