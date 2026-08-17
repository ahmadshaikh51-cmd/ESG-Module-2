import { useEffect, useMemo, useState } from "react";
import { FileBadge, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { RECORDS, inScope, typeByKey } from "@/lib/esg-data";
import {
  A,
  EmptyState,
  PanelCard,
  useEsg,
  useStubLoad,
  LoadingRows,
} from "./primitives";
import { WorkQueue } from "./WorkQueue";
import { getCurrentUser } from "@/lib/auth";
import { getRoleFromEmail, ESG_ROLES_CONFIG } from "@/lib/esg-roles";
import { EsgDataPortal } from "./projects/EsgDataPortal";
import { ReportDataEntryForm, type ReportType } from "./projects/ReportDataEntryForm";

type Sub = "permits" | "site";

export function ProjectsTab({ initialSub }: { initialSub?: string }) {
  const { scope } = useEsg();
  const [sub, setSub] = useState<Sub>((initialSub as Sub) || "permits");
  const [activeForm, setActiveForm] = useState<ReportType | null>(null);
  const [editRecordId, setEditRecordId] = useState<string | null>(null);
  const [showDataPortal, setShowDataPortal] = useState(false);
  const [initialProject, setInitialProject] = useState<string | undefined>(undefined);
  const [initialSite, setInitialSite] = useState<string | undefined>(undefined);
  const [initialPeriod, setInitialPeriod] = useState<string | undefined>(undefined);
  const loading = useStubLoad(sub + JSON.stringify(scope));

  useEffect(() => {
    if (initialSub) {
      setSub(initialSub as Sub);
    }
  }, [initialSub]);

  // Reset form when sub tab changes
  useEffect(() => {
    setActiveForm(null);
    setEditRecordId(null);
    setShowDataPortal(false);
  }, [sub]);

  const subs: { key: Sub; label: React.ReactNode }[] = [
    { key: "permits", label: "Permits & Licences" },
    { key: "site", label: "Project Compliance Status" },
  ];

  const currentUser = getCurrentUser();
  const esgRole = currentUser ? getRoleFromEmail(currentUser.email) : "esg_team";
  const roleConfig = ESG_ROLES_CONFIG[esgRole] || ESG_ROLES_CONFIG.esg_team;
  
  const allowedSubKeys = roleConfig.subtabs.projects || [];
  const allowedSubs = subs.filter((s) => allowedSubKeys.includes(s.key));

  useEffect(() => {
    if (allowedSubKeys.length > 0 && !allowedSubKeys.includes(sub)) {
      setSub(allowedSubKeys[0] as Sub);
    }
  }, [esgRole, sub, allowedSubKeys]);

  const records = useMemo(
    () =>
      RECORDS.filter((r) => inScope(r, scope)).filter(
        (r) => typeByKey(r.typeKey)?.category === (sub === "permits" ? "permit" : "site"),
      ),
    [scope, sub],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className="flex items-center gap-0.5 overflow-x-auto rounded-xl border border-border/60 bg-card/60 p-1"
            role="tablist"
            aria-label="Project regulatory compliance sections"
          >
            {allowedSubs.map((s) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={sub === s.key && !showDataPortal}
                onClick={() => {
                  setSub(s.key);
                  setShowDataPortal(false);
                }}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  (sub === s.key && !showDataPortal)
                    ? "nav-pill-active"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowDataPortal(!showDataPortal)}
            className={cn(
              "shrink-0 rounded-xl px-4 py-2 text-[12px] font-semibold border transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5",
              showDataPortal
                ? "bg-primary text-primary-foreground border-primary/20 shadow-sm font-bold"
                : "bg-card hover:bg-muted/50 text-foreground border-border/60"
            )}
          >
            <Database className="h-3.5 w-3.5" />
            {showDataPortal ? "Close Data Portal" : "ESG Data Portal"}
          </button>
        </div>
      </div>

      {activeForm ? (
        <ReportDataEntryForm
          reportType={activeForm as any}
          editRecordId={editRecordId}
          initialProject={initialProject}
          initialSite={initialSite}
          initialPeriod={initialPeriod}
          onCancel={() => {
            setActiveForm(null);
            setEditRecordId(null);
            setInitialProject(undefined);
            setInitialSite(undefined);
            setInitialPeriod(undefined);
          }}
        />
      ) : showDataPortal ? (
        <EsgDataPortal
          onBack={() => setShowDataPortal(false)}
          onOpenForm={(reportType, recordId, project, siteId, period) => {
            setActiveForm(reportType);
            setEditRecordId(recordId);
            setInitialProject(project);
            setInitialSite(siteId);
            setInitialPeriod(period);
          }}
        />
      ) : loading ? (
        <PanelCard>
          <LoadingRows rows={5} />
        </PanelCard>
      ) : sub === "permits" || sub === "site" ? (
        <PanelCard>
          <div className="border-b border-border/60 px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
              <FileBadge className="h-4 w-4 text-primary" aria-hidden />
              {sub === "permits" ? "Permits, licences & certificates" : "Site compliance items"}
            </h3>
            <p className="text-[12px] text-muted-foreground">
              {sub === "permits" ? (
                <>
                  Incorporation, <A t="ROC" />, <A t="MOA/AOA" />, <A t="CTO" />, <A t="COE" /> —
                  one record type, one expiry clock, one owner each.
                </>
              ) : (
                <>
                  Fire <A t="NOC" />, <A t="SWM" />, <A t="STP" />, <A t="ETP" />, <A t="ISO" />,{" "}
                  <A t="PCC" /> — the same atomic record with a different type master.
                </>
              )}
            </p>
          </div>
          {records.length === 0 ? (
            <EmptyState
              title="No items in this scope"
              hint="Widen the scope selector to see group-level records."
            />
          ) : (
            <WorkQueue records={records} />
          )}
        </PanelCard>
      ) : null}
    </div>
  );
}
