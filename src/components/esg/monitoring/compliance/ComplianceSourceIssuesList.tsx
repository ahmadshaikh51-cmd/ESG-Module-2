import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { countdownLabel, personById, recordPlace, recordState, typeByKey, type ComplianceRecord } from '@/lib/esg-data';

interface ComplianceSourceIssuesListProps {
  allRecords: ComplianceRecord[];
  onSelectRecord: (record: ComplianceRecord) => void;
}

export function ComplianceSourceIssuesList({ allRecords, onSelectRecord }: ComplianceSourceIssuesListProps) {
  const overdueRecords = allRecords.filter((r) => recordState(r) === 'overdue');
  const expiringRecords = allRecords.filter((r) => recordState(r) === 'expiring');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">Critical Expiry Escalations & Renewal Queue</h3>
          <p className="text-[12px] text-muted-foreground">
            Overdue compliance items requiring immediate remediation and upcoming 30-90 day renewal filings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overdue Items List (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h4 className="text-[13.5px] font-bold text-foreground">
                Overdue Compliance Items ({overdueRecords.length})
              </h4>
            </div>
            <span className="text-[11px] text-muted-foreground">Requires immediate legal remediation</span>
          </div>

          <div className="space-y-3">
            {overdueRecords.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-[12px] text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                No overdue compliance items! All statutory permits and site records are valid.
              </div>
            ) : (
              overdueRecords.map((r) => {
                const type = typeByKey(r.typeKey);
                const owner = personById(r.ownerId);

                return (
                  <div
                    key={r.id}
                    onClick={() => onSelectRecord(r)}
                    className="rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 space-y-1.5 text-[12px] cursor-pointer hover:bg-destructive/10 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <span>{type?.label ?? r.typeKey}</span>
                        <span className="rounded bg-destructive/15 px-1.5 py-0.2 text-[10px] font-mono font-bold text-destructive">
                          Ref: {r.refNo}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                        {countdownLabel(r)}
                      </span>
                    </div>

                    <p className="text-muted-foreground">{r.remarks || 'Remediation inspection required.'}</p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                      <span>Location: {recordPlace(r)} · Regulator: {r.authority}</span>
                      <span className="font-semibold text-foreground">Owner: {owner?.name ?? r.ownerId}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Side Panel: Expiring Soon Queue */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-elevated space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h4 className="text-[13px] font-bold text-foreground">Expiring Soon Queue ({expiringRecords.length})</h4>
            </div>
            <p className="text-[11px] text-muted-foreground">Inside statutory renewal lead window</p>

            <div className="space-y-2">
              {expiringRecords.map((r) => {
                const type = typeByKey(r.typeKey);
                return (
                  <div
                    key={r.id}
                    onClick={() => onSelectRecord(r)}
                    className="rounded-xl border border-border/50 bg-muted/20 p-2.5 text-[12px] space-y-0.5 cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span className="truncate max-w-[160px]">{type?.label ?? r.typeKey}</span>
                      <span className="text-[10.5px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                        {countdownLabel(r)}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{recordPlace(r)} · {r.authority}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
