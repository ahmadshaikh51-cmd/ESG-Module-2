import React, { useState, useMemo } from 'react';
import { Layers, Activity, Calendar, Download, RefreshCw, Info } from 'lucide-react';
import {
  computeAggregateKpis,
  INITIAL_FILTERS,
  FilterState,
  FIRST_MONTH,
  LAST_MONTH,
} from '@/lib/esg-site-monitoring-adapter';
import { DashboardFilters } from './DashboardFilters';
import { KpiCardsRow } from './KpiCardsRow';
import { EnergyEfficiencyCard } from './EnergyEfficiencyCard';
import { OperationalCharts } from './OperationalCharts';
import { EnvironmentalCharts } from './EnvironmentalCharts';
import { ProjectComparisonTable } from './ProjectComparisonTable';
import { DataCoverageGrid } from './DataCoverageGrid';
import { SourceIssuesList } from './SourceIssuesList';
import { ProjectDetailDrawer } from './ProjectDetailDrawer';
import { Button } from '@/components/ui/button';

export function SiteMonitoringDashboard() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [energyUnit, setEnergyUnit] = useState<'kWh' | 'MWh'>('kWh');
  const [selectedDrawerProjectId, setSelectedDrawerProjectId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const kpis = useMemo(() => computeAggregateKpis(filters), [filters]);

  const handleResetFilters = () => setFilters(INITIAL_FILTERS);

  const handleOpenDrawer = (projectId: string) => {
    setSelectedDrawerProjectId(projectId);
    setDrawerOpen(true);
  };

  // Subtitle coverage text
  const periodText =
    filters.periodType === 'all'
      ? `${FIRST_MONTH} to ${LAST_MONTH}`
      : filters.periodType === 'month'
      ? filters.selectedMonth
      : filters.periodType === 'quarter'
      ? filters.selectedQuarter
      : `${filters.customRange.from} to ${filters.customRange.to}`;

  const coverageSubtitle = `${periodText} · ${kpis.projectCount} projects selected · ${kpis.reportingCountDistance} reporting operational records`;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-bold tracking-tight text-foreground">
              Site Monitoring Overview
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              Prototype MIS Source
            </span>
          </div>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Monitor operational performance and environmental impact across projects.
          </p>
          <p className="text-[11.5px] font-medium text-muted-foreground/80 mt-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" /> {coverageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEnergyUnit(energyUnit === 'kWh' ? 'MWh' : 'kWh')}
            className="h-9 text-[12px] font-semibold gap-1.5"
          >
            Unit: {energyUnit} (click to toggle)
          </Button>
        </div>
      </div>

      {/* Performance Filters */}
      <DashboardFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* KPI Cards Row (5 Cards) */}
      <KpiCardsRow
        kpis={kpis}
        energyUnit={energyUnit}
        onEnergyUnitToggle={setEnergyUnit}
      />

      {/* Energy Efficiency Metric (Monitor & Review) */}
      <EnergyEfficiencyCard
        initialEnergyKwh={kpis.totalEnergyKwh}
        initialDistanceKm={kpis.totalDistanceKm}
        title="Energy Efficiency"
        subtitle="Monitor & Review Metadata Metric"
        domainTag="Site Monitoring Metadata"
      />

      {/* Operational Charts (Distance, Fleet Deployment, Energy) */}
      <OperationalCharts
        filters={filters}
        energyUnit={energyUnit}
        onEnergyUnitToggle={setEnergyUnit}
      />

      {/* Environmental Impact (CO2, Diesel, NOx, SO2, PM, Trees) */}
      <EnvironmentalCharts
        filters={filters}
        kpis={kpis}
      />

      {/* Project Comparison Table */}
      <ProjectComparisonTable
        filters={filters}
        energyUnit={energyUnit}
        onSelectProjectDetails={handleOpenDrawer}
      />

      {/* Data Coverage & Completeness Grid */}
      <DataCoverageGrid filters={filters} />

      {/* Documented Source Inconsistencies & Flags List */}
      <SourceIssuesList />

      {/* Project Details Modal Drawer */}
      <ProjectDetailDrawer
        projectId={selectedDrawerProjectId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        energyUnit={energyUnit}
      />
    </div>
  );
}
