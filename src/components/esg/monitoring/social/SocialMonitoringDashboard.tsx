import React, { useState, useMemo } from 'react';
import { Users, Calendar, Download, RefreshCw, Info } from 'lucide-react';
import {
  computeSocialAggregateKpis,
} from '@/lib/esg-social-monitoring-adapter';
import { FilterState, INITIAL_FILTERS, FIRST_MONTH, LAST_MONTH } from '@/lib/esg-site-monitoring-adapter';
import { SocialDashboardFilters } from './SocialDashboardFilters';
import { SocialKpiCardsRow } from './SocialKpiCardsRow';
import { SocialOperationalCharts } from './SocialOperationalCharts';
import { SocialImpactCharts } from './SocialImpactCharts';
import { SocialProjectComparisonTable } from './SocialProjectComparisonTable';
import { SocialDataCoverageGrid } from './SocialDataCoverageGrid';
import { SocialSourceIssuesList } from './SocialSourceIssuesList';
import { SocialProjectDetailDrawer } from './SocialProjectDetailDrawer';
import { Button } from '@/components/ui/button';

export function SocialMonitoringDashboard() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedDrawerProjectId, setSelectedDrawerProjectId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const kpis = useMemo(() => computeSocialAggregateKpis(filters), [filters]);

  const handleResetFilters = () => setFilters(INITIAL_FILTERS);

  const handleOpenDrawer = (projectId: string) => {
    setSelectedDrawerProjectId(projectId);
    setDrawerOpen(true);
  };

  const periodText =
    filters.periodType === 'all'
      ? `${FIRST_MONTH} to ${LAST_MONTH}`
      : filters.periodType === 'month'
      ? filters.selectedMonth
      : filters.periodType === 'quarter'
      ? filters.selectedQuarter
      : `${filters.customRange.from} to ${filters.customRange.to}`;

  const coverageSubtitle = `${periodText} · ${kpis.projectCount} projects selected · ${kpis.reportingCountPassengers} monthly social records`;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-bold tracking-tight text-foreground">
              Meta Data Social Overview
            </h2>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Social MIS & Safety Source
            </span>
          </div>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Monitor public commuter ridership, green driver workforce, safety hours, and EHS compliance across projects.
          </p>
          <p className="text-[11.5px] font-medium text-muted-foreground/80 mt-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> {coverageSubtitle}
          </p>
        </div>
      </div>

      {/* Performance Filters */}
      <SocialDashboardFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* KPI Cards Row (5 Cards) */}
      <SocialKpiCardsRow kpis={kpis} />

      {/* Operational Trends (Passenger Mobility & Workforce Deployment) */}
      <SocialOperationalCharts filters={filters} />

      {/* Social Impact & EHS Safety Governance */}
      <SocialImpactCharts filters={filters} kpis={kpis} />

      {/* Project Comparison Table */}
      <SocialProjectComparisonTable
        filters={filters}
        onSelectProjectDetails={handleOpenDrawer}
      />

      {/* Data Coverage & Completeness Grid */}
      <SocialDataCoverageGrid filters={filters} />

      {/* Documented Source Inconsistencies & Flags List */}
      <SocialSourceIssuesList />

      {/* Project Details Modal Drawer */}
      <SocialProjectDetailDrawer
        projectId={selectedDrawerProjectId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
