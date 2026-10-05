import {
  countdownLabel,
  daysUntil,
  personById,
  recordPlace,
  recordState,
  RECORDS,
  STATE_META,
  typeByKey,
  type ComplianceRecord,
  type EsgState,
} from './esg-data';

export interface ComplianceFilterState {
  category: 'all' | 'permit' | 'site';
  projectId: string;
  status: 'all' | 'overdue' | 'expiring' | 'valid';
  authority: string;
  ownerId: string;
  searchQuery: string;
}

export const INITIAL_COMPLIANCE_FILTERS: ComplianceFilterState = {
  category: 'all',
  projectId: 'all',
  status: 'all',
  authority: 'all',
  ownerId: 'all',
  searchQuery: '',
};

export interface ComplianceKpiStats {
  totalRecords: number;
  validCount: number;
  expiringCount: number;
  overdueCount: number;
  renewalsInitiatedCount: number;
  validPct: number;
  permitsCount: number;
  siteComplianceCount: number;
}

export function getFilteredComplianceRecords(
  allRecords: ComplianceRecord[],
  filters: ComplianceFilterState,
): ComplianceRecord[] {
  return allRecords.filter((r) => {
    const type = typeByKey(r.typeKey);
    const cat = type?.category ?? 'permit';

    // Category filter
    if (filters.category !== 'all' && cat !== filters.category) {
      return false;
    }

    // Project filter
    if (filters.projectId !== 'all' && r.entityId !== filters.projectId) {
      return false;
    }

    // Status filter
    const st = recordState(r);
    if (filters.status !== 'all' && st !== filters.status) {
      return false;
    }

    // Authority filter
    if (filters.authority !== 'all' && r.authority !== filters.authority) {
      return false;
    }

    // Owner filter
    if (filters.ownerId !== 'all' && r.ownerId !== filters.ownerId) {
      return false;
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const labelMatch = type?.label.toLowerCase().includes(q) ?? false;
      const refMatch = r.refNo.toLowerCase().includes(q);
      const authMatch = r.authority.toLowerCase().includes(q);
      const owner = personById(r.ownerId);
      const ownerMatch = owner?.name.toLowerCase().includes(q) ?? false;
      const placeMatch = recordPlace(r).toLowerCase().includes(q);

      if (!labelMatch && !refMatch && !authMatch && !ownerMatch && !placeMatch) {
        return false;
      }
    }

    return true;
  });
}

export function computeComplianceKpis(records: ComplianceRecord[]): ComplianceKpiStats {
  const totalRecords = records.length;
  let validCount = 0;
  let expiringCount = 0;
  let overdueCount = 0;
  let renewalsInitiatedCount = 0;
  let permitsCount = 0;
  let siteComplianceCount = 0;

  for (const r of records) {
    const st = recordState(r);
    if (st === 'valid') validCount++;
    else if (st === 'expiring') expiringCount++;
    else if (st === 'overdue') overdueCount++;

    if (r.renewal === 'initiated') renewalsInitiatedCount++;

    const cat = typeByKey(r.typeKey)?.category;
    if (cat === 'permit') permitsCount++;
    else if (cat === 'site') siteComplianceCount++;
  }

  const validPct = totalRecords > 0 ? Math.round((validCount / totalRecords) * 100) : 0;

  return {
    totalRecords,
    validCount,
    expiringCount,
    overdueCount,
    renewalsInitiatedCount,
    validPct,
    permitsCount,
    siteComplianceCount,
  };
}

export function getComplianceStatusBreakdown(records: ComplianceRecord[]) {
  const kpis = computeComplianceKpis(records);
  return [
    { name: 'Valid Stock', value: kpis.validCount, color: '#10b981' },
    { name: 'Expiring Soon', value: kpis.expiringCount, color: '#f59e0b' },
    { name: 'Overdue Items', value: kpis.overdueCount, color: '#ef4444' },
  ];
}

export function getComplianceCategoryBreakdown(records: ComplianceRecord[]) {
  const kpis = computeComplianceKpis(records);
  return [
    { name: 'Permits & Licences', value: kpis.permitsCount, color: '#0ea5e9' },
    { name: 'Project Compliance Status', value: kpis.siteComplianceCount, color: '#8b5cf6' },
  ];
}

export function getComplianceAuthorityBreakdown(records: ComplianceRecord[]) {
  const map: Record<string, { count: number; overdue: number; expiring: number; valid: number }> = {};

  for (const r of records) {
    const auth = r.authority || 'Other Regulator';
    if (!map[auth]) {
      map[auth] = { count: 0, overdue: 0, expiring: 0, valid: 0 };
    }
    map[auth].count++;
    const st = recordState(r);
    if (st === 'overdue') map[auth].overdue++;
    else if (st === 'expiring') map[auth].expiring++;
    else map[auth].valid++;
  }

  return Object.entries(map)
    .map(([authority, val]) => ({
      authority,
      count: val.count,
      overdue: val.overdue,
      expiring: val.expiring,
      valid: val.valid,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getComplianceProjectComparison(records: ComplianceRecord[]) {
  const map: Record<
    string,
    {
      name: string;
      total: number;
      permits: number;
      site: number;
      valid: number;
      expiring: number;
      overdue: number;
    }
  > = {
    mbmt: { name: 'MBMT Project SPV', total: 0, permits: 0, site: 0, valid: 0, expiring: 0, overdue: 0 },
    silvassa: { name: 'Silvassa Smart City SPV', total: 0, permits: 0, site: 0, valid: 0, expiring: 0, overdue: 0 },
    best: { name: 'BEST Fleet Electrification SPV', total: 0, permits: 0, site: 0, valid: 0, expiring: 0, overdue: 0 },
    pmpml: { name: 'PMPML Pune Bus SPV', total: 0, permits: 0, site: 0, valid: 0, expiring: 0, overdue: 0 },
    corp: { name: 'Corporate & Governance', total: 0, permits: 0, site: 0, valid: 0, expiring: 0, overdue: 0 },
  };

  for (const r of records) {
    const target = map[r.entityId] ?? map['corp'];
    target.total++;

    const cat = typeByKey(r.typeKey)?.category;
    if (cat === 'permit') target.permits++;
    else target.site++;

    const st = recordState(r);
    if (st === 'valid') target.valid++;
    else if (st === 'expiring') target.expiring++;
    else target.overdue++;
  }

  return Object.entries(map).map(([id, data]) => ({
    projectId: id,
    projectName: data.name,
    total: data.total,
    permits: data.permits,
    site: data.site,
    valid: data.valid,
    expiring: data.expiring,
    overdue: data.overdue,
    compliancePct: data.total > 0 ? Math.round((data.valid / data.total) * 100) : 100,
  }));
}
