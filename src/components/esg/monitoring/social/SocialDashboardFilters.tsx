import React from 'react';
import { Filter, RefreshCw, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  FilterState,
  PROJECTS,
  UNIQUE_CLIENTS,
  ALL_MONTHS,
  getAvailableQuarters,
} from '@/lib/esg-site-monitoring-adapter';

interface SocialDashboardFiltersProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

export function SocialDashboardFilters({ filters, onChange, onReset }: SocialDashboardFiltersProps) {
  const availableQuarters = getAvailableQuarters();

  const filteredProjectsForSelect = PROJECTS.filter((p) => {
    if (filters.vehicleType !== 'all' && p.vehicleType !== filters.vehicleType) return false;
    if (filters.businessType !== 'all' && p.businessType !== filters.businessType) return false;
    if (filters.clientId !== 'all' && p.client !== filters.clientId) return false;
    return true;
  });

  const isDefault =
    filters.projectId === 'all' &&
    filters.clientId === 'all' &&
    filters.vehicleType === 'all' &&
    filters.businessType === 'all' &&
    filters.periodType === 'all' &&
    !filters.includeProjected;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[13.5px] font-bold text-foreground">Social Performance Filters</h3>
            <p className="text-[11px] text-muted-foreground">Filter ridership, workforce, and EHS compliance by project & period</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 px-3.5 py-1.5">
            <Switch
              id="social-include-projected"
              checked={filters.includeProjected}
              onCheckedChange={(checked) => onChange({ ...filters, includeProjected: checked })}
            />
            <Label htmlFor="social-include-projected" className="text-[12px] font-semibold text-foreground cursor-pointer">
              Include projected months
            </Label>
            <span className="text-[10px] text-muted-foreground rounded bg-muted px-1 py-0.5">
              {filters.includeProjected ? 'On' : 'Off'}
            </span>
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-border/40">
        {/* Project Selector */}
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
              <SelectItem value="all" className="text-[12px] font-medium">
                All Projects (10)
              </SelectItem>
              {filteredProjectsForSelect.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-[12px]">
                  {p.name} {p.hasMonthlyData ? '' : ' (No MIS)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client Selector */}
        <div className="space-y-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Client / Authority
          </span>
          <Select
            value={filters.clientId}
            onValueChange={(val) => onChange({ ...filters, clientId: val })}
          >
            <SelectTrigger className="h-9 text-[12px] bg-muted/15">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">
                All Clients
              </SelectItem>
              {UNIQUE_CLIENTS.map((c) => (
                <SelectItem key={c} value={c} className="text-[12px]">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vehicle Type */}
        <div className="space-y-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Vehicle Type
          </span>
          <Select
            value={filters.vehicleType}
            onValueChange={(val) => onChange({ ...filters, vehicleType: val })}
          >
            <SelectTrigger className="h-9 text-[12px] bg-muted/15">
              <SelectValue placeholder="All Vehicle Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">
                All Types
              </SelectItem>
              <SelectItem value="E-Bus" className="text-[12px]">
                E-Bus (Public Transit)
              </SelectItem>
              <SelectItem value="E-Truck" className="text-[12px]">
                E-Truck (Logistics)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Business Model */}
        <div className="space-y-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Business Model
          </span>
          <Select
            value={filters.businessType}
            onValueChange={(val) => onChange({ ...filters, businessType: val })}
          >
            <SelectTrigger className="h-9 text-[12px] bg-muted/15">
              <SelectValue placeholder="All Business Models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">
                All Models
              </SelectItem>
              <SelectItem value="B2G" className="text-[12px]">
                B2G (Municipal STU)
              </SelectItem>
              <SelectItem value="B2B" className="text-[12px]">
                B2B (Corporate Freight)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Period Selector */}
        <div className="space-y-1">
          <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Reporting Timeframe
          </span>
          <Select
            value={filters.periodType}
            onValueChange={(val: any) => onChange({ ...filters, periodType: val })}
          >
            <SelectTrigger className="h-9 text-[12px] bg-muted/15">
              <SelectValue placeholder="Period Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">
                All-Time (Oct 23 - Jul 26)
              </SelectItem>
              <SelectItem value="month" className="text-[12px]">
                Specific Month
              </SelectItem>
              <SelectItem value="quarter" className="text-[12px]">
                Specific Quarter
              </SelectItem>
              <SelectItem value="custom" className="text-[12px]">
                Custom Date Range
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sub-Filters for Month / Quarter / Custom */}
      {filters.periodType !== 'all' && (
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/30 bg-muted/10 p-3 rounded-xl">
          {filters.periodType === 'month' && (
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-medium text-muted-foreground">Select Month:</span>
              <Select
                value={filters.selectedMonth}
                onValueChange={(val) => onChange({ ...filters, selectedMonth: val })}
              >
                <SelectTrigger className="h-8 w-44 text-[12px] bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_MONTHS.map((m) => (
                    <SelectItem key={m} value={m} className="text-[12px]">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filters.periodType === 'quarter' && (
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-medium text-muted-foreground">Select Quarter:</span>
              <Select
                value={filters.selectedQuarter}
                onValueChange={(val) => onChange({ ...filters, selectedQuarter: val })}
              >
                <SelectTrigger className="h-8 w-44 text-[12px] bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableQuarters.map((q) => (
                    <SelectItem key={q.id} value={q.id} className="text-[12px]">
                      {q.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filters.periodType === 'custom' && (
            <div className="flex items-center gap-3 text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-medium">From:</span>
                <Input
                  type="month"
                  value={filters.customRange.from}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      customRange: { ...filters.customRange, from: e.target.value },
                    })
                  }
                  className="h-8 w-36 text-[12px] bg-card"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-medium">To:</span>
                <Input
                  type="month"
                  value={filters.customRange.to}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      customRange: { ...filters.customRange, to: e.target.value },
                    })
                  }
                  className="h-8 w-36 text-[12px] bg-card"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
