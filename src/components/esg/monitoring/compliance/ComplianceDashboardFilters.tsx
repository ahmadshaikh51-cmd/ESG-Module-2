import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ESG_GROUP, RECORDS } from '@/lib/esg-data';
import { type ComplianceFilterState } from '@/lib/esg-compliance-adapter';

interface ComplianceDashboardFiltersProps {
  filters: ComplianceFilterState;
  onChange: (next: ComplianceFilterState) => void;
  onReset: () => void;
}

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'expiring', label: 'Expiring' },
  { key: 'valid', label: 'Valid' },
] as const;

export function ComplianceDashboardFilters({
  filters,
  onChange,
  onReset,
}: ComplianceDashboardFiltersProps) {
  const isDefault =
    filters.category === 'all' &&
    filters.projectId === 'all' &&
    filters.status === 'all' &&
    filters.authority === 'all' &&
    filters.ownerId === 'all' &&
    !filters.searchQuery;

  // Extract unique authorities from RECORDS
  const authorities = Array.from(new Set(RECORDS.map((r) => r.authority))).sort();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
      {/* Top Bar: Title & Status Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[13.5px] font-bold text-foreground">
              Compliance & Permits Performance Filters
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Filter permits, licenses, and statutory compliance status across SPVs, authorities, and expiry clocks
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Quick Filter Pills */}
          <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/20 p-1">
            {STATUS_TABS.map((tab) => {
              const active = filters.status === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onChange({ ...filters, status: tab.key })}
                  className={cn(
                    'rounded-full px-3.5 py-1 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 cursor-pointer',
                    active
                      ? 'bg-teal-500/25 text-teal-800 dark:text-teal-200 font-bold shadow-xs'
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
        {/* Category */}
        <div className="space-y-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Compliance Category
          </span>
          <Select
            value={filters.category}
            onValueChange={(val: any) => onChange({ ...filters, category: val })}
          >
            <SelectTrigger className="h-9 text-[12px] bg-muted/15">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">All Categories</SelectItem>
              <SelectItem value="permit" className="text-[12px]">Permits & Licences</SelectItem>
              <SelectItem value="site" className="text-[12px]">Project Compliance Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Project SPV */}
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
            Expiry Clock Status
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
              <SelectItem value="valid" className="text-[12px]">Valid Stock</SelectItem>
              <SelectItem value="expiring" className="text-[12px]">Expiring Soon</SelectItem>
              <SelectItem value="overdue" className="text-[12px]">Overdue Items</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statutory Authority */}
        <div className="space-y-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Statutory Regulator
          </span>
          <Select
            value={filters.authority}
            onValueChange={(val) => onChange({ ...filters, authority: val })}
          >
            <SelectTrigger className="h-9 text-[12px] bg-muted/15">
              <SelectValue placeholder="All Regulators" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">All Regulators</SelectItem>
              {authorities.map((auth) => (
                <SelectItem key={auth} value={auth} className="text-[12px]">
                  {auth}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Keyword Search */}
        <div className="space-y-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Search Keyword
          </span>
          <Input
            placeholder="Permit, ref no, owner..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="h-9 text-[12px] bg-muted/15"
          />
        </div>
      </div>
    </div>
  );
}
