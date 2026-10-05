import React, { useState, useMemo } from 'react';
import { Calendar, FileSearch, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  daysUntil,
  ESAP_ACTIONS,
  esapActionEntityId,
  esapSourceLabel,
  esapState,
  personById,
  type EsapAction,
} from '@/lib/esg-data';
import {
  computeEsapKpis,
  INITIAL_ESAP_FILTERS,
  type EsapFilterState,
} from '@/lib/esg-esap-adapter';
import { exportToXlsx } from '@/lib/export-xlsx';
import { Button } from '@/components/ui/button';
import { useEsg } from '../../primitives';
import { EsapDashboardFilters } from './EsapDashboardFilters';
import { EsapKpiCardsRow } from './EsapKpiCardsRow';
import { EsapOperationalCharts } from './EsapOperationalCharts';
import { EsapRiskCharts } from './EsapRiskCharts';
import { EsapComparisonTable } from './EsapComparisonTable';
import { EsapDataCoverageGrid } from './EsapDataCoverageGrid';
import { EsapSourceIssuesList } from './EsapSourceIssuesList';
import { EsapDetailDrawer } from './EsapDetailDrawer';

interface EsapMonitoringDashboardProps {
  onOpenSource?: (sub: string) => void;
}

export function EsapMonitoringDashboard({ onOpenSource }: EsapMonitoringDashboardProps) {
  const { scope, policy, audit } = useEsg();
  const [filters, setFilters] = useState<EsapFilterState>(INITIAL_ESAP_FILTERS);
  const [actionOverrides, setActionOverrides] = useState<Record<string, EsapAction['status']>>({});
  const [selectedAction, setSelectedAction] = useState<EsapAction | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Combine actions from static list, policy actions, and audit actions
  const allScopedActions = useMemo(() => {
    const base = [...ESAP_ACTIONS, ...policy.policyEsapActions(), ...audit.auditEsapActions()];
    const withStatus = base.map((a) => ({ ...a, status: actionOverrides[a.id] ?? a.status }));
    return withStatus.filter((a) => {
      if (!scope.entityId) return true;
      return esapActionEntityId(a) === scope.entityId;
    });
  }, [scope.entityId, actionOverrides, policy, audit]);

  const kpis = useMemo(() => computeEsapKpis(allScopedActions), [allScopedActions]);

  const handleResetFilters = () => setFilters(INITIAL_ESAP_FILTERS);

  const handleOpenDrawer = (action: EsapAction) => {
    setSelectedAction(action);
    setDrawerOpen(true);
  };

  const advanceStatus = (a: EsapAction) => {
    const next = a.status === 'open' ? 'in-progress' : 'closed';
    setActionOverrides((o) => ({ ...o, [a.id]: next }));
    toast.success(next === 'closed' ? 'Action marked closed' : 'Action moved to in-progress', {
      description: `${a.action}`,
    });
  };

  const handleKpiFilterClick = (st: 'all' | 'open' | 'overdue' | 'closed') => {
    setFilters((prev) => ({ ...prev, status: st }));
  };

  const handleExportAll = () => {
    if (allScopedActions.length === 0) {
      toast.error('No actions available to export.');
      return;
    }

    exportToXlsx(
      'esap-monitoring-report',
      [
        { key: 'Action', header: 'Action Item' },
        { key: 'Finding', header: 'Origin Finding' },
        { key: 'Source', header: 'Source' },
        { key: 'Owner', header: 'Owner' },
        { key: 'Due', header: 'Target Due Date' },
        { key: 'Severity', header: 'Risk Severity' },
        { key: 'Status', header: 'Status' },
        { key: 'NC Ref', header: 'NC Ref' },
      ],
      allScopedActions.map((a) => ({
        Action: a.action,
        Finding: a.finding,
        Source: esapSourceLabel(a.source).label,
        Owner: personById(a.ownerId)?.name ?? a.ownerId,
        Due: a.due,
        Severity: a.severity ?? 'minor',
        Status: a.status === 'closed' ? 'Closed' : esapState(a) === 'overdue' ? 'Overdue' : a.status === 'in-progress' ? 'In Progress' : 'Open',
        'NC Ref': a.ncRef ?? '',
      })),
      'ESAP Register',
    );

    toast.success('ESAP Monitoring Report Exported', {
      description: `${allScopedActions.length} actions exported to Excel.`,
    });
  };

  const coverageSubtitle = `${kpis.totalActions} total actions · ${kpis.closureRatePct}% overall closure rate · ${kpis.overdueActions} overdue items requiring attention`;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-bold tracking-tight text-foreground">
              ESAP / ESMP Register Overview
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              ESMS Action Register
            </span>
          </div>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Monitor corrective actions, target completion timelines, risk severities, and source compliance across projects and depots.
          </p>
          <p className="text-[11.5px] font-medium text-muted-foreground/80 mt-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" /> {coverageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportAll}
            className="h-9 text-[12px] font-semibold gap-1.5"
          >
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Performance Filters */}
      <EsapDashboardFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* KPI Cards Row (5 Cards) */}
      <EsapKpiCardsRow
        kpis={kpis}
        onFilterClick={handleKpiFilterClick}
      />

      {/* Operational Charts */}
      <EsapOperationalCharts
        actions={allScopedActions}
        filters={filters}
      />

      {/* Risk & Governance Charts */}
      <EsapRiskCharts
        actions={allScopedActions}
        filters={filters}
      />

      {/* Action Register Comparison Table */}
      <EsapComparisonTable
        allActions={allScopedActions}
        filters={filters}
        onSelectActionDetails={handleOpenDrawer}
      />

      {/* Data Coverage & Completeness Grid */}
      <EsapDataCoverageGrid
        allActions={allScopedActions}
        filters={filters}
      />

      {/* Source Issues & Critical Escalations List */}
      <EsapSourceIssuesList
        allActions={allScopedActions}
        onSelectAction={handleOpenDrawer}
      />

      {/* Detail Drawer */}
      <EsapDetailDrawer
        action={selectedAction}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAdvanceStatus={advanceStatus}
        onOpenSource={onOpenSource}
      />
    </div>
  );
}
