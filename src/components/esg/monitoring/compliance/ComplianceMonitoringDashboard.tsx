import React, { useState, useMemo } from 'react';
import { Calendar, FileBadge, Download } from 'lucide-react';
import { toast } from 'sonner';
import { RECORDS, inScope, recordState, type ComplianceRecord } from '@/lib/esg-data';
import {
  computeComplianceKpis,
  INITIAL_COMPLIANCE_FILTERS,
  type ComplianceFilterState,
} from '@/lib/esg-compliance-adapter';
import { exportToXlsx } from '@/lib/export-xlsx';
import { Button } from '@/components/ui/button';
import { useEsg } from '../../primitives';
import { ComplianceDashboardFilters } from './ComplianceDashboardFilters';
import { ComplianceKpiCardsRow } from './ComplianceKpiCardsRow';
import { ComplianceOperationalCharts } from './ComplianceOperationalCharts';
import { ComplianceRiskCharts } from './ComplianceRiskCharts';
import { ComplianceComparisonTable } from './ComplianceComparisonTable';
import { ComplianceDataCoverageGrid } from './ComplianceDataCoverageGrid';
import { ComplianceSourceIssuesList } from './ComplianceSourceIssuesList';

export function ComplianceMonitoringDashboard() {
  const { scope, openRecord } = useEsg();
  const [filters, setFilters] = useState<ComplianceFilterState>(INITIAL_COMPLIANCE_FILTERS);

  // Scoped compliance records
  const allScopedRecords = useMemo(() => {
    return RECORDS.filter((r) => inScope(r, scope));
  }, [scope]);

  const kpis = useMemo(() => computeComplianceKpis(allScopedRecords), [allScopedRecords]);

  const handleResetFilters = () => setFilters(INITIAL_COMPLIANCE_FILTERS);

  const handleOpenRecordDetails = (r: ComplianceRecord) => {
    openRecord(r.id);
  };

  const handleKpiFilterClick = (st: 'all' | 'valid' | 'expiring' | 'overdue') => {
    setFilters((prev) => ({ ...prev, status: st }));
  };

  const handleExportAll = () => {
    if (allScopedRecords.length === 0) {
      toast.error('No compliance records available to export.');
      return;
    }

    exportToXlsx(
      'projects-compliance-monitoring-report',
      [
        { key: 'Item', header: 'Compliance Item' },
        { key: 'RefNo', header: 'Ref No' },
        { key: 'Authority', header: 'Authority' },
        { key: 'ExpiryDate', header: 'Expiry Date' },
        { key: 'Status', header: 'Status' },
        { key: 'Renewal', header: 'Renewal Status' },
      ],
      allScopedRecords.map((r) => ({
        Item: r.typeKey,
        RefNo: r.refNo,
        Authority: r.authority,
        ExpiryDate: r.expiryDate ?? 'Perpetual',
        Status: recordState(r),
        Renewal: r.renewal === 'initiated' ? 'In Progress' : 'None',
      })),
      'Compliance Status',
    );

    toast.success('Compliance Report Exported', {
      description: `${allScopedRecords.length} records exported to Excel.`,
    });
  };

  const coverageSubtitle = `${kpis.totalRecords} total records · ${kpis.validPct}% valid compliance health · ${kpis.expiringCount} expiring soon · ${kpis.overdueCount} overdue items`;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-bold tracking-tight text-foreground">
              Projects Compliance & Status Overview
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              Permits & Compliance Monitor
            </span>
          </div>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Monitor statutory permits, licenses, site compliance clocks, and renewal filings across project SPVs and depots.
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
      <ComplianceDashboardFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* KPI Cards Row (5 Cards) */}
      <ComplianceKpiCardsRow
        kpis={kpis}
        onFilterClick={handleKpiFilterClick}
      />

      {/* Operational Charts */}
      <ComplianceOperationalCharts
        records={allScopedRecords}
        filters={filters}
      />

      {/* Risk & Regulator Matrix */}
      <ComplianceRiskCharts
        records={allScopedRecords}
        filters={filters}
      />

      {/* Item Comparison Table */}
      <ComplianceComparisonTable
        allRecords={allScopedRecords}
        filters={filters}
        onSelectRecordDetails={handleOpenRecordDetails}
      />

      {/* Data Coverage Grid */}
      <ComplianceDataCoverageGrid
        allRecords={allScopedRecords}
        filters={filters}
      />

      {/* Critical Escalations Queue */}
      <ComplianceSourceIssuesList
        allRecords={allScopedRecords}
        onSelectRecord={handleOpenRecordDetails}
      />
    </div>
  );
}
