import React, { useState, useMemo } from 'react';
import { Search, Eye, ArrowUpDown, Link2, FileSpreadsheet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { exportToXlsx } from '@/lib/export-xlsx';
import {
  daysUntil,
  esapSourceLabel,
  esapState,
  fmtDate,
  personById,
  type EsapAction,
} from '@/lib/esg-data';
import { getFilteredEsapActions, type EsapFilterState } from '@/lib/esg-esap-adapter';

interface EsapComparisonTableProps {
  allActions: EsapAction[];
  filters: EsapFilterState;
  onSelectActionDetails: (action: EsapAction) => void;
}

export function EsapComparisonTable({
  allActions,
  filters,
  onSelectActionDetails,
}: EsapComparisonTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'action' | 'due' | 'severity' | 'status'>('due');
  const [sortAsc, setSortAsc] = useState(true);

  const actions = useMemo(() => {
    const base = getFilteredEsapActions(allActions, filters);
    return base
      .filter((a) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const src = esapSourceLabel(a.source);
        const owner = personById(a.ownerId);
        return (
          a.action.toLowerCase().includes(q) ||
          a.finding.toLowerCase().includes(q) ||
          (a.ncRef?.toLowerCase().includes(q) ?? false) ||
          src.label.toLowerCase().includes(q) ||
          (owner?.name.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => {
        if (sortField === 'action') {
          return sortAsc ? a.action.localeCompare(b.action) : b.action.localeCompare(a.action);
        }
        if (sortField === 'due') {
          return sortAsc ? a.due.localeCompare(b.due) : b.due.localeCompare(a.due);
        }
        if (sortField === 'severity') {
          const weight = { major: 3, minor: 2, observation: 1 };
          const wA = weight[a.severity ?? 'minor'];
          const wB = weight[b.severity ?? 'minor'];
          return sortAsc ? wA - wB : wB - wA;
        }
        if (sortField === 'status') {
          return sortAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
        }
        return 0;
      });
  }, [allActions, filters, search, sortField, sortAsc]);

  const toggleSort = (field: 'action' | 'due' | 'severity' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExport = () => {
    exportToXlsx(
      'esap-register-report',
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
      actions.map((a) => ({
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
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">ESAP / ESMP Action Item Register</h3>
          <p className="text-[12px] text-muted-foreground">
            Complete action tracking matrix with deep-links to ESDD, ESIA, Audits, and Policy rollout
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, NC ref, owner..."
              className="h-9 pl-9 text-[12.5px] bg-muted/20 border-border/60"
            />
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="h-9 text-[12px] gap-1.5 font-semibold"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card shadow-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-[12.5px]">
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                <TableHead
                  className="px-5 py-3.5 font-semibold cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('action')}
                >
                  <div className="flex items-center gap-1">
                    Action Item & Ref <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3.5 font-semibold">Origin Finding & Source</TableHead>
                <TableHead className="px-4 py-3.5 font-semibold">Owner</TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('due')}
                >
                  <div className="flex items-center gap-1">
                    Target Date <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('severity')}
                >
                  <div className="flex items-center gap-1">
                    Risk Severity <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="px-5 py-3.5 font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {actions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                    No action items match the active filters.
                  </TableCell>
                </TableRow>
              ) : (
                actions.map((a) => {
                  const st = esapState(a);
                  const closed = a.status === 'closed';
                  const owner = personById(a.ownerId);
                  const src = esapSourceLabel(a.source);

                  return (
                    <TableRow
                      key={a.id}
                      className={cn(
                        'hover:bg-muted/15 transition-colors cursor-pointer',
                        closed && 'opacity-70 bg-muted/5',
                      )}
                      onClick={() => onSelectActionDetails(a)}
                    >
                      {/* Action & Ref */}
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                          <span>{a.action}</span>
                          {a.ncRef && (
                            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              {a.ncRef}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Finding & Source */}
                      <TableCell className="px-4 py-3.5 text-muted-foreground">
                        <div className="text-[12px] font-medium text-foreground">{a.finding}</div>
                        <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <Link2 className="h-3 w-3 shrink-0" /> {src.label}
                        </div>
                      </TableCell>

                      {/* Owner */}
                      <TableCell className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">
                        {owner?.name ?? a.ownerId}
                      </TableCell>

                      {/* Target Date */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap num font-medium">
                        <span className={cn(st === 'overdue' && !closed ? 'text-destructive font-bold' : 'text-foreground')}>
                          {closed && a.closedOn ? `Closed ${fmtDate(a.closedOn)}` : fmtDate(a.due)}
                        </span>
                      </TableCell>

                      {/* Severity */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize',
                            a.severity === 'major'
                              ? 'bg-destructive/12 text-destructive'
                              : a.severity === 'observation'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-warning/14 text-warning',
                          )}
                        >
                          {a.severity ?? 'minor'}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex w-[86px] items-center justify-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider',
                            closed
                              ? 'bg-success/12 text-success'
                              : st === 'overdue'
                              ? 'bg-destructive/12 text-destructive'
                              : a.status === 'in-progress'
                              ? 'bg-warning/14 text-warning'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {closed
                            ? 'Closed'
                            : st === 'overdue'
                            ? 'Overdue'
                            : a.status === 'in-progress'
                            ? 'In progress'
                            : 'Open'}
                        </span>
                      </TableCell>

                      {/* Details Action */}
                      <TableCell className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectActionDetails(a);
                          }}
                          className="h-7 text-[11.5px] gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
