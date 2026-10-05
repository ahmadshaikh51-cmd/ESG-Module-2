import React from 'react';
import { Filter, RefreshCw, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ESG_GROUP } from '@/lib/esg-data';
import { type EsapFilterState } from '@/lib/esg-esap-adapter';

interface EsapDashboardFiltersProps {
  filters: EsapFilterState;
  onChange: (next: EsapFilterState) => void;
  onReset: () => void;
}

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'closed', label: 'Closed' },
] as const;

export function EsapDashboardFilters({ filters, onChange, onReset }: EsapDashboardFiltersProps) {
  const isDefault =
    filters.sourceKind === 'all' &&
    filters.projectId === 'all' &&
    filters.status === 'all' &&
    filters.severity === 'all' &&
    filters.ownerId === 'all' &&
    !filters.searchQuery;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
      {/* Top Bar: Title & Status Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[13.5px] font-bold text-foreground">ESAP / ESMP Performance Filters</h3>
            <p className="text-[11px] text-muted-foreground">
              Filter action register by origin source, project SPV, risk severity, and target status
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Quick Filter Tabs (Pill style matching screenshot) */}
          <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/20 p-1">
            <span className="text-[11.5px] font-bold text-muted-foreground px-2.5 uppercase tracking-wider select-none">
              Status:
            </span>
            {STATUS_TABS.map((tab) => {
              const active = filters.status === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onChange({ ...filters, status: tab.key })}
                  className={cn(
                    'rounded-full px-3.5 py-1 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                    active
                      ? 'bg-primary/20 text-primary font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {!isDefault && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onReset}
              className="h-8 gap-1.5 text-[12px] text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-border/40">
        {/* Source Kind */}
        <div className="space-y-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Origin Source
          </span>
          <Select
            value={filters.sourceKind}
            onValueChange={(val: any) => onChange({ ...filters, sourceKind: val })}
          >
            <SelectTrigger className="h-9 text-[12px] bg-muted/15">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">All Sources</SelectItem>
              <SelectItem value="assessment" className="text-[12px]">Assessments (ESDD/ESIA)</SelectItem>
              <SelectItem value="internal-audit" className="text-[12px]">Internal Audits</SelectItem>
              <SelectItem value="external-audit" className="text-[12px]">External Audits</SelectItem>
              <SelectItem value="policy" className="text-[12px]">Approved Policies</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Project / Entity */}
        <div className="space-y-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Project / Entity
          </span>
          <Select
            value={filters.projectId}
            onValueChange={(val) => onChange({ ...filters, projectId: val })}
          >
            <SelectTrigger className="h-9 text-[12px] bg-muted/15">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">All Projects</SelectItem>
              {ESG_GROUP.entities.map((e) => (
                <SelectItem key={e.id} value={e.id} className="text-[12px]">
                  {e.short} — {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Dropdown */}
        <div className="space-y-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Action Status
          </span>
          <Select
            value={filters.status}
            onValueChange={(val: any) => onChange({ ...filters, status: val })}
          >
            <SelectTrigger className="h-9 text-[12px] bg-muted/15">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">All Statuses</SelectItem>
              <SelectItem value="open" className="text-[12px]">Open</SelectItem>
              <SelectItem value="in-progress" className="text-[12px]">In Progress</SelectItem>
              <SelectItem value="overdue" className="text-[12px]">Overdue</SelectItem>
              <SelectItem value="closed" className="text-[12px]">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Severity Dropdown */}
        <div className="space-y-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Risk Severity
          </span>
          <Select
            value={filters.severity}
            onValueChange={(val: any) => onChange({ ...filters, severity: val })}
          >
            <SelectTrigger className="h-9 text-[12px] bg-muted/15">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">All Severities</SelectItem>
              <SelectItem value="major" className="text-[12px]">Major NC</SelectItem>
              <SelectItem value="minor" className="text-[12px]">Minor NC</SelectItem>
              <SelectItem value="observation" className="text-[12px]">Observation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className="space-y-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Search Keyword
          </span>
          <Input
            placeholder="Action, NC ref, owner..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="h-9 text-[12px] bg-muted/15"
          />
        </div>
      </div>
    </div>
  );
}
