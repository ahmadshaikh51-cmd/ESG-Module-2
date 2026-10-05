import rawData from './esg-site-monitoring-data.json';

export interface ProjectMeta {
  id: string;
  name: string;
  client: string;
  vehicleType: 'E-Bus' | 'E-Truck';
  businessType: 'B2G' | 'B2B';
  trackerFleetSize: number;
  misStatus: string;
  hasMonthlyData: boolean;
}

export interface NonOperationalProject {
  name: string;
  client: string;
  type: string;
}

export interface MetricQuality {
  vehicles: 'reported' | 'carried_forward' | 'missing';
  distanceKm: 'reported' | 'extrapolated' | 'missing';
  energyKwh: 'reported' | 'assumed' | 'extrapolated' | 'missing';
  derived: 'reported' | 'assumed' | 'extrapolated' | 'missing';
}

export interface MetricValues {
  vehicles: number | null;
  distanceKm: number | null;
  tonnageMt: number | null;
  passengers: number | null;
  energyKwh: number | null;
  dieselSavedL: number | null;
  co2t: number | null;
  noxKg: number | null;
  so2Kg: number | null;
  pm25Kg: number | null;
  pm10Kg: number | null;
  trees: number | null;
}

export interface MonthlyRecord {
  projectId: string;
  month: string; // 'YYYY-MM'
  metrics: MetricValues;
  quality: MetricQuality;
}

export interface Issue {
  id: string;
  projectId: string;
  month?: string;
  metric?: string;
  severity: 'info' | 'review';
  message: string;
  sourceRef: string;
}

export interface FilterState {
  projectId: string; // 'all' or specific project id
  clientId: string; // 'all' or specific client name
  vehicleType: string; // 'all' | 'E-Bus' | 'E-Truck'
  businessType: string; // 'all' | 'B2G' | 'B2B'
  periodType: 'all' | 'month' | 'quarter' | 'custom';
  selectedMonth: string; // 'YYYY-MM'
  selectedQuarter: string; // e.g. '2025-Q1'
  customRange: { from: string; to: string };
  includeProjected: boolean; // default false
}

export interface AggregateKpis {
  totalDistanceKm: number;
  totalEnergyKwh: number;
  activeVehicles: number;
  totalDieselSavedL: number;
  totalCo2t: number;
  totalNoxKg: number;
  totalSo2Kg: number;
  totalPm25Kg: number;
  totalPm10Kg: number;
  totalTrees: number;
  totalTonnageMt: number;
  totalPassengers: number;
  projectedDistanceKm: number;
  projectedEnergyKwh: number;
  projectedCo2t: number;
  projectCount: number;
  reportingCountDistance: number;
  reportingCountEnergy: number;
  reportingNotes: {
    distance: string;
    energy: string;
    vehicles: string;
  };
}

export const PROJECTS: ProjectMeta[] = rawData.projects as ProjectMeta[];
export const NON_OPERATIONAL: NonOperationalProject[] = rawData.nonOperationalProjects as NonOperationalProject[];
export const MONTHLY_RECORDS: MonthlyRecord[] = rawData.monthlyRecords as MonthlyRecord[];
export const DATA_ISSUES: Issue[] = rawData.issues as Issue[];

// All available months sorted
export const ALL_MONTHS: string[] = Array.from(
  new Set(MONTHLY_RECORDS.map((r) => r.month))
).sort();

export const FIRST_MONTH = ALL_MONTHS[0] || '2023-10';
export const LAST_MONTH = ALL_MONTHS[ALL_MONTHS.length - 1] || '2026-07';

// Get unique clients
export const UNIQUE_CLIENTS: string[] = Array.from(
  new Set(PROJECTS.map((p) => p.client))
).sort();

// Quarters generator based on months
export function getAvailableQuarters(): { id: string; label: string }[] {
  const quarterSet = new Set<string>();
  ALL_MONTHS.forEach((m) => {
    const [y, mm] = m.split('-');
    const q = Math.ceil(parseInt(mm, 10) / 3);
    quarterSet.add(`${y}-Q${q}`);
  });
  return Array.from(quarterSet).sort().map((q) => ({ id: q, label: q }));
}

export const INITIAL_FILTERS: FilterState = {
  projectId: 'all',
  clientId: 'all',
  vehicleType: 'all',
  businessType: 'all',
  periodType: 'all',
  selectedMonth: LAST_MONTH,
  selectedQuarter: getAvailableQuarters().pop()?.id || '2026-Q3',
  customRange: { from: FIRST_MONTH, to: LAST_MONTH },
  includeProjected: false,
};

// Filtering function
export function getFilteredProjects(filters: FilterState): ProjectMeta[] {
  return PROJECTS.filter((p) => {
    if (filters.projectId !== 'all' && p.id !== filters.projectId) return false;
    if (filters.clientId !== 'all' && p.client !== filters.clientId) return false;
    if (filters.vehicleType !== 'all' && p.vehicleType !== filters.vehicleType) return false;
    if (filters.businessType !== 'all' && p.businessType !== filters.businessType) return false;
    return true;
  });
}

export function isMonthInFilterRange(month: string, filters: FilterState): boolean {
  if (filters.periodType === 'all') return true;
  if (filters.periodType === 'month') return month === filters.selectedMonth;
  if (filters.periodType === 'quarter') {
    const [y, mm] = month.split('-');
    const q = Math.ceil(parseInt(mm, 10) / 3);
    return `${y}-Q${q}` === filters.selectedQuarter;
  }
  if (filters.periodType === 'custom') {
    return month >= filters.customRange.from && month <= filters.customRange.to;
  }
  return true;
}

// Compute aggregate KPIs according to Section 5
export function computeAggregateKpis(filters: FilterState): AggregateKpis {
  const allowedProjects = getFilteredProjects(filters);
  const activeProjIds = new Set(allowedProjects.filter((p) => p.hasMonthlyData).map((p) => p.id));

  let totalDistanceKm = 0;
  let totalEnergyKwh = 0;
  let totalDieselSavedL = 0;
  let totalCo2t = 0;
  let totalNoxKg = 0;
  let totalSo2Kg = 0;
  let totalPm25Kg = 0;
  let totalPm10Kg = 0;
  let totalTrees = 0;
  let totalTonnageMt = 0;
  let totalPassengers = 0;

  let projectedDistanceKm = 0;
  let projectedEnergyKwh = 0;
  let projectedCo2t = 0;

  const projDistanceMap = new Map<string, number>();
  const projEnergyMap = new Map<string, number>();

  // Latest vehicle count per project at or before end of filter range
  const endMonth =
    filters.periodType === 'month'
      ? filters.selectedMonth
      : filters.periodType === 'quarter'
      ? `${filters.selectedQuarter.split('-')[0]}-${String(
          parseInt(filters.selectedQuarter.split('-Q')[1], 10) * 3
        ).padStart(2, '0')}`
      : filters.periodType === 'custom'
      ? filters.customRange.to
      : LAST_MONTH;

  MONTHLY_RECORDS.forEach((r) => {
    if (!activeProjIds.has(r.projectId)) return;
    if (!isMonthInFilterRange(r.month, filters)) return;

    const isProj =
      r.quality.distanceKm === 'extrapolated' ||
      r.quality.energyKwh === 'extrapolated' ||
      r.quality.vehicles === 'carried_forward';

    if (isProj) {
      if (r.metrics.distanceKm != null) projectedDistanceKm += r.metrics.distanceKm;
      if (r.metrics.energyKwh != null) projectedEnergyKwh += r.metrics.energyKwh;
      if (r.metrics.co2t != null) projectedCo2t += r.metrics.co2t;
    }

    if (!isProj || filters.includeProjected) {
      if (r.metrics.distanceKm != null) {
        totalDistanceKm += r.metrics.distanceKm;
        projDistanceMap.set(r.projectId, (projDistanceMap.get(r.projectId) || 0) + r.metrics.distanceKm);
      }
      if (r.metrics.energyKwh != null) {
        totalEnergyKwh += r.metrics.energyKwh;
        projEnergyMap.set(r.projectId, (projEnergyMap.get(r.projectId) || 0) + r.metrics.energyKwh);
      }
      if (r.metrics.dieselSavedL != null) totalDieselSavedL += r.metrics.dieselSavedL;
      if (r.metrics.co2t != null) totalCo2t += r.metrics.co2t;
      if (r.metrics.noxKg != null) totalNoxKg += r.metrics.noxKg;
      if (r.metrics.so2Kg != null) totalSo2Kg += r.metrics.so2Kg;
      if (r.metrics.pm25Kg != null) totalPm25Kg += r.metrics.pm25Kg;
      if (r.metrics.pm10Kg != null) totalPm10Kg += r.metrics.pm10Kg;
      if (r.metrics.trees != null) totalTrees += r.metrics.trees;
      if (r.metrics.tonnageMt != null) totalTonnageMt += r.metrics.tonnageMt;
      if (r.metrics.passengers != null) totalPassengers += r.metrics.passengers;
    }
  });

  // Calculate active vehicles (latest reported month per project <= endMonth)
  let activeVehicles = 0;
  const activeProjWithVehicles = new Set<string>();

  allowedProjects.forEach((p) => {
    if (!p.hasMonthlyData) return;
    const pRecords = MONTHLY_RECORDS.filter(
      (r) =>
        r.projectId === p.id &&
        r.month <= endMonth &&
        (filters.includeProjected || r.quality.vehicles === 'reported')
    ).sort((a, b) => a.month.localeCompare(b.month));

    const latest = pRecords[pRecords.length - 1];
    if (latest && latest.metrics.vehicles != null) {
      activeVehicles += latest.metrics.vehicles;
      activeProjWithVehicles.add(p.id);
    }
  });

  const reportingCountDistance = projDistanceMap.size;
  const reportingCountEnergy = projEnergyMap.size;
  const totalActiveInFilter = allowedProjects.filter((p) => p.hasMonthlyData).length;

  const energyMissingProjects = allowedProjects
    .filter((p) => p.hasMonthlyData && !projEnergyMap.has(p.id))
    .map((p) => p.name);

  return {
    totalDistanceKm,
    totalEnergyKwh,
    activeVehicles,
    totalDieselSavedL,
    totalCo2t,
    totalNoxKg,
    totalSo2Kg,
    totalPm25Kg,
    totalPm10Kg,
    totalTrees,
    totalTonnageMt,
    totalPassengers,
    projectedDistanceKm,
    projectedEnergyKwh,
    projectedCo2t,
    projectCount: allowedProjects.length,
    reportingCountDistance,
    reportingCountEnergy,
    reportingNotes: {
      distance: `${reportingCountDistance} of ${totalActiveInFilter} projects reporting`,
      energy:
        energyMissingProjects.length > 0
          ? `${reportingCountEnergy} of ${totalActiveInFilter} projects; ${energyMissingProjects.join(', ')} missing data`
          : `${reportingCountEnergy} of ${totalActiveInFilter} projects reporting`,
      vehicles: `${activeProjWithVehicles.size} of ${totalActiveInFilter} active projects reporting`,
    },
  };
}

// Generate time-series trend data for charts
export interface TimeSeriesPoint {
  month: string;
  isProjected: boolean;
  totalKm: number;
  totalEnergyKwh: number;
  totalCo2t: number;
  totalDieselL: number;
  totalVehicles: number;
  [projectId: string]: any;
}

export function getTimeSeriesData(filters: FilterState): TimeSeriesPoint[] {
  const allowedProjects = getFilteredProjects(filters);
  const activeProjIds = new Set(allowedProjects.filter((p) => p.hasMonthlyData).map((p) => p.id));

  return ALL_MONTHS.filter((m) => isMonthInFilterRange(m, filters)).map((m) => {
    const monthRecs = MONTHLY_RECORDS.filter(
      (r) => r.month === m && activeProjIds.has(r.projectId)
    );

    const isProjected = monthRecs.some(
      (r) =>
        r.quality.distanceKm === 'extrapolated' ||
        r.quality.energyKwh === 'extrapolated' ||
        r.quality.vehicles === 'carried_forward'
    );

    const point: TimeSeriesPoint = {
      month: m,
      isProjected,
      totalKm: 0,
      totalEnergyKwh: 0,
      totalCo2t: 0,
      totalDieselL: 0,
      totalVehicles: 0,
    };

    monthRecs.forEach((r) => {
      const isRecordProj =
        r.quality.distanceKm === 'extrapolated' ||
        r.quality.energyKwh === 'extrapolated' ||
        r.quality.vehicles === 'carried_forward';

      if (!isRecordProj || filters.includeProjected) {
        if (r.metrics.distanceKm != null) {
          point.totalKm += r.metrics.distanceKm;
          point[`km_${r.projectId}`] = r.metrics.distanceKm;
        }
        if (r.metrics.energyKwh != null) {
          point.totalEnergyKwh += r.metrics.energyKwh;
          point[`kwh_${r.projectId}`] = r.metrics.energyKwh;
        }
        if (r.metrics.co2t != null) point.totalCo2t += r.metrics.co2t;
        if (r.metrics.dieselSavedL != null) point.totalDieselL += r.metrics.dieselSavedL;
        if (r.metrics.vehicles != null) point.totalVehicles += r.metrics.vehicles;
      }
    });

    return point;
  });
}

// Generate project comparison table rows
export interface ProjectComparisonRow {
  id: string;
  name: string;
  client: string;
  vehicleType: 'E-Bus' | 'E-Truck';
  businessType: 'B2G' | 'B2B';
  trackerFleetSize: number;
  latestVehicles: number | null;
  distanceKm: number | null;
  energyKwh: number | null;
  co2t: number | null;
  tonnageMt: number | null;
  passengers: number | null;
  firstMonth: string | null;
  lastMonth: string | null;
  misStatus: string;
  hasMonthlyData: boolean;
  periodDiffersFromFilter: boolean;
}

export function getProjectComparisonRows(filters: FilterState): ProjectComparisonRow[] {
  const allowedProjects = getFilteredProjects(filters);

  return allowedProjects.map((p) => {
    if (!p.hasMonthlyData) {
      return {
        id: p.id,
        name: p.name,
        client: p.client,
        vehicleType: p.vehicleType,
        businessType: p.businessType,
        trackerFleetSize: p.trackerFleetSize,
        latestVehicles: null,
        distanceKm: null,
        energyKwh: null,
        co2t: null,
        tonnageMt: null,
        passengers: null,
        firstMonth: null,
        lastMonth: null,
        misStatus: p.misStatus,
        hasMonthlyData: false,
        periodDiffersFromFilter: false,
      };
    }

    const pRecords = MONTHLY_RECORDS.filter(
      (r) =>
        r.projectId === p.id &&
        isMonthInFilterRange(r.month, filters) &&
        (filters.includeProjected || r.quality.distanceKm !== 'extrapolated')
    ).sort((a, b) => a.month.localeCompare(b.month));

    if (pRecords.length === 0) {
      return {
        id: p.id,
        name: p.name,
        client: p.client,
        vehicleType: p.vehicleType,
        businessType: p.businessType,
        trackerFleetSize: p.trackerFleetSize,
        latestVehicles: null,
        distanceKm: null,
        energyKwh: null,
        co2t: null,
        tonnageMt: null,
        passengers: null,
        firstMonth: null,
        lastMonth: null,
        misStatus: p.misStatus,
        hasMonthlyData: true,
        periodDiffersFromFilter: true,
      };
    }

    let distanceKm: number | null = null;
    let energyKwh: number | null = null;
    let co2t: number | null = null;
    let tonnageMt: number | null = null;
    let passengers: number | null = null;

    pRecords.forEach((r) => {
      if (r.metrics.distanceKm != null) distanceKm = (distanceKm || 0) + r.metrics.distanceKm;
      if (r.metrics.energyKwh != null) energyKwh = (energyKwh || 0) + r.metrics.energyKwh;
      if (r.metrics.co2t != null) co2t = (co2t || 0) + r.metrics.co2t;
      if (r.metrics.tonnageMt != null) tonnageMt = (tonnageMt || 0) + r.metrics.tonnageMt;
      if (r.metrics.passengers != null) passengers = (passengers || 0) + r.metrics.passengers;
    });

    const lastRec = pRecords[pRecords.length - 1];
    const latestVehicles = lastRec.metrics.vehicles;

    const firstMonth = pRecords[0].month;
    const lastMonth = lastRec.month;

    // Check if period differs from main filter
    let periodDiffersFromFilter = false;
    if (filters.periodType === 'month' && (firstMonth !== filters.selectedMonth || lastMonth !== filters.selectedMonth)) {
      periodDiffersFromFilter = true;
    }

    return {
      id: p.id,
      name: p.name,
      client: p.client,
      vehicleType: p.vehicleType,
      businessType: p.businessType,
      trackerFleetSize: p.trackerFleetSize,
      latestVehicles,
      distanceKm,
      energyKwh,
      co2t,
      tonnageMt,
      passengers,
      firstMonth,
      lastMonth,
      misStatus: p.misStatus,
      hasMonthlyData: true,
      periodDiffersFromFilter,
    };
  });
}

// Data Coverage Grid calculation
export interface CoverageGridCell {
  month: string;
  status: 'reported' | 'assumed' | 'extrapolated' | 'missing' | 'no_mis';
}

export interface ProjectCoverageRow {
  project: ProjectMeta;
  latestReportedMonth: string | null;
  months: CoverageGridCell[];
}

export function getCoverageGridData(filters: FilterState): ProjectCoverageRow[] {
  const allowedProjects = getFilteredProjects(filters);
  const filterMonths = ALL_MONTHS.filter((m) => isMonthInFilterRange(m, filters));

  return allowedProjects.map((p) => {
    if (!p.hasMonthlyData) {
      return {
        project: p,
        latestReportedMonth: null,
        months: filterMonths.map((m) => ({ month: m, status: 'no_mis' })),
      };
    }

    const pRecords = MONTHLY_RECORDS.filter((r) => r.projectId === p.id);

    // Latest reported month (quality === 'reported')
    const reportedRecs = pRecords
      .filter((r) => r.quality.distanceKm === 'reported' || r.quality.energyKwh === 'reported')
      .sort((a, b) => a.month.localeCompare(b.month));

    const latestReportedMonth = reportedRecs.length > 0 ? reportedRecs[reportedRecs.length - 1].month : null;

    const months = filterMonths.map((m) => {
      const r = pRecords.find((rec) => rec.month === m);
      if (!r) return { month: m, status: 'missing' as const };

      if (r.quality.distanceKm === 'extrapolated' || r.quality.energyKwh === 'extrapolated') {
        return { month: m, status: 'extrapolated' as const };
      }
      if (r.quality.energyKwh === 'assumed') {
        return { month: m, status: 'assumed' as const };
      }
      return { month: m, status: 'reported' as const };
    });

    return {
      project: p,
      latestReportedMonth,
      months,
    };
  });
}
