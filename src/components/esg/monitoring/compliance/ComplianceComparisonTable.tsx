import React, { useState, useMemo } from 'react';
import { Search, Eye, ArrowUpDown, FileSpreadsheet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { exportToXlsx } from '@/lib/export-xlsx';
import {
  countdownLabel,
  daysUntil,
  personById,
  recordPlace,
  recordState,
  typeByKey,
  type ComplianceRecord,
} from '@/lib/esg-data';
import { getFilteredComplianceRecords, type ComplianceFilterState } from '@/lib/esg-compliance-adapter';

interface ComplianceComparisonTableProps {
  allRecords: ComplianceRecord[];
  filters: ComplianceFilterState;
  onSelectRecordDetails: (record: ComplianceRecord) => void;
}

export function ComplianceComparisonTable({
  allRecords,
  filters,
  onSelectRecordDetails,
}: ComplianceComparisonTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'label' | 'expiryDate' | 'status'>('expiryDate');
  const [sortAsc, setSortAsc] = useState(true);

  const records = useMemo(() => {
    const base = getFilteredComplianceRecords(allRecords, filters);
    return base
      .filter((r) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const type = typeByKey(r.typeKey);
        const owner = personById(r.ownerId);
        return (
          (type?.label.toLowerCase().includes(q) ?? false) ||
          r.refNo.toLowerCase().includes(q) ||
          r.authority.toLowerCase().includes(q) ||
          recordPlace(r).toLowerCase().includes(q) ||
          (owner?.name.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => {
        if (sortField === 'label') {
          const lA = typeByKey(a.typeKey)?.label ?? '';
          const lB = typeByKey(b.typeKey)?.label ?? '';
          return sortAsc ? lA.localeCompare(lB) : lB.localeCompare(lA);
        }
        if (sortField === 'expiryDate') {
          const dA = a.expiryDate ? daysUntil(a.expiryDate) : 9999;
          const dB = b.expiryDate ? daysUntil(b.expiryDate) : 9999;
          return sortAsc ? dA - dB : dB - dA;
        }
        if (sortField === 'status') {
          return sortAsc ? recordState(a).localeCompare(recordState(b)) : recordState(b).localeCompare(recordState(a));
        }
        return 0;
      });
  }, [allRecords, filters, search, sortField, sortAsc]);

  const toggleSort = (field: 'label' | 'expiryDate' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleExport = () => {
    exportToXlsx(
      'compliance-permits-report',
      [
        { key: 'Item', header: 'Compliance Item' },
        { key: 'Category', header: 'Category' },
        { key: 'RefNo', header: 'Reference No' },
        { key: 'Authority', header: 'Authority' },
        { key: 'Location', header: 'Entity / Depot' },
        { key: 'Owner', header: 'Owner' },
        { key: 'ExpiryDate', header: 'Expiry Date' },
        { key: 'Status', header: 'Status' },
        { key: 'Renewal', header: 'Renewal Status' },
      ],
      records.map((r) => {
        const type = typeByKey(r.typeKey);
        const st = recordState(r);
        return {
          Item: type?.label ?? r.typeKey,
          Category: type?.category === 'permit' ? 'Permits & Licences' : 'Project Compliance Status',
          RefNo: r.refNo,
          Authority: r.authority,
          Location: recordPlace(r),
          Owner: personById(r.ownerId)?.name ?? r.ownerId,
          ExpiryDate: r.expiryDate ?? 'Perpetual',
          Status: st === 'valid' ? 'Valid' : st === 'expiring' ? 'Expiring Soon' : 'Overdue',
          Renewal: r.renewal === 'initiated' ? 'In Progress' : 'None',
        };
      }),
      'Compliance Register',
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Statutory Permits & Compliance Register</h3>
          <p className="text-[12px] text-muted-foreground">
            Complete compliance tracking matrix with statutory reference numbers and expiry clocks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item, ref, owner, authority..."
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
                  onClick={() => toggleSort('label')}
                >
                  <div className="flex items-center gap-1">
                    Compliance Item & Ref <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="px-4 py-3.5 font-semibold">Category</TableHead>
                <TableHead className="px-4 py-3.5 font-semibold">Location / Depot</TableHead>
                <TableHead className="px-4 py-3.5 font-semibold">Regulator Authority</TableHead>
                <TableHead className="px-4 py-3.5 font-semibold">Owner</TableHead>
                <TableHead
                  className="px-4 py-3.5 font-semibold text-right cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('expiryDate')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Expiry Clock <ArrowUpDown className="h-3 w-3" />
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
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-muted-foreground">
                    No compliance items match the active filters.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => {
                  const type = typeByKey(r.typeKey);
                  const st = recordState(r);
                  const owner = personById(r.ownerId);

                  return (
                    <TableRow
                      key={r.id}
                      className={cn(
                        'hover:bg-muted/15 transition-colors cursor-pointer',
                        st === 'overdue' && 'bg-destructive/5',
                      )}
                      onClick={() => onSelectRecordDetails(r)}
                    >
                      {/* Item & Ref */}
                      <TableCell className="px-5 py-3.5">
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <span>{type?.label ?? r.typeKey}</span>
                          {r.renewal === 'initiated' && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9.5px] font-bold text-primary uppercase">
                              Renewal in progress
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">Ref: {r.refNo}</div>
                      </TableCell>

                      {/* Category */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold',
                            type?.category === 'permit'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                          )}
                        >
                          {type?.category === 'permit' ? 'Permits & Licences' : 'Project Compliance'}
                        </span>
                      </TableCell>

                      {/* Location */}
                      <TableCell className="px-4 py-3.5 text-muted-foreground font-medium whitespace-nowrap">
                        {recordPlace(r)}
                      </TableCell>

                      {/* Authority */}
                      <TableCell className="px-4 py-3.5 text-foreground font-medium whitespace-nowrap">
                        {r.authority}
                      </TableCell>

                      {/* Owner */}
                      <TableCell className="px-4 py-3.5 font-medium text-foreground whitespace-nowrap">
                        {owner?.name ?? r.ownerId}
                      </TableCell>

                      {/* Expiry Clock */}
                      <TableCell className="px-4 py-3.5 text-right num font-semibold whitespace-nowrap">
                        <span
                          className={cn(
                            st === 'overdue'
                              ? 'text-destructive font-bold'
                              : st === 'expiring'
                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-muted-foreground',
                          )}
                        >
                          {countdownLabel(r)}
                        </span>
                        {r.expiryDate && (
                          <span className="block text-[10.5px] font-normal text-muted-foreground">
                            {r.expiryDate}
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
                            st === 'valid'
                              ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                              : st === 'expiring'
                              ? 'bg-amber-500/14 text-amber-600 dark:text-amber-400'
                              : 'bg-destructive/12 text-destructive',
                          )}
                        >
                          {st === 'valid' ? 'Valid' : st === 'expiring' ? 'Expiring' : 'Overdue'}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRecordDetails(r);
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
