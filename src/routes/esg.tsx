import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Globe } from "lucide-react";
import { PageShell } from "@/components/layout/AppNav";
import { EsgHeader } from "@/components/esg/EsgHeader";
import { EsmsTab } from "@/components/esg/EsmsTab";
import { MastersTab } from "@/components/esg/MastersTab";
import { OverviewTab } from "@/components/esg/OverviewTab";
import { ProjectsTab } from "@/components/esg/ProjectsTab";
import { RecordDrawer } from "@/components/esg/RecordDrawer";
import { ReportsTab } from "@/components/esg/ReportsTab";
import { VendorsTab } from "@/components/esg/VendorsTab";
import {
  EsgContext,
  type Audience,
  type EsgCtx,
  type DateRange,
} from "@/components/esg/primitives";
import { PERIODS, RECORDS, PROJECT_LIFECYCLES, type ScopeSel } from "@/lib/esg-data";
import { usePolicyWorkflow, type Role } from "@/lib/esg-policy";
import { useAuditWorkflow } from "@/lib/esg-audit";
import { useTrainingWorkflow } from "@/lib/esg-training";
import { useMonitoringWorkflow } from "@/lib/esg-monitoring";
import { useMastersWorkflow } from "@/lib/esg-masters";
import { personById } from "@/lib/esg-data";
import { getCurrentUser } from "@/lib/auth";
import { getRoleFromEmail, ESG_ROLES_CONFIG } from "@/lib/esg-roles";

type EsgSearch = { area?: string; sub?: string; record?: string };

const trainingPersonLabel = (id: string) => {
  const p = personById(id);
  return { name: p?.name ?? id, role: p?.role ?? "" };
};

export const Route = createFileRoute("/esg")({
  validateSearch: (s: Record<string, unknown>): EsgSearch => ({
    area: typeof s.area === "string" ? s.area : undefined,
    sub: typeof s.sub === "string" ? s.sub : undefined,
    record: typeof s.record === "string" ? s.record : undefined,
  }),
  head: () => ({
    meta: [
      { title: "ESG · Voltline" },
      {
        name: "description",
        content:
          "Compliance command — permits, ESMS, GHG and reports. A pump against expiry, not a shelf for documents.",
      },
    ],
  }),
  component: EsgPage,
});

function EsgPage() {
  const navigate = useNavigate({ from: "/esg" });
  const { area = "overview", sub, record } = Route.useSearch();

  const [scope, setScope] = useState<ScopeSel>(() => {
    try {
      const saved = sessionStorage.getItem("esg_saved_scope");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [period, setPeriodState] = useState<string>(() => {
    try {
      return sessionStorage.getItem("esg_saved_period") || PERIODS[0].id;
    } catch {
      return PERIODS[0].id;
    }
  });

  const setPeriod = useCallback((p: string) => {
    setPeriodState(p);
    try {
      sessionStorage.setItem("esg_saved_period", p);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("esg_saved_scope", JSON.stringify(scope));
    } catch {}
  }, [scope]);

  const [audience, setAudience] = useState<Audience>("internal");
  const [role, setRole] = useState<Role>("maintainer");
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const currentUser = getCurrentUser();
  const esgRole = currentUser ? getRoleFromEmail(currentUser.email) : "esg_team";
  const roleConfig = ESG_ROLES_CONFIG[esgRole] || ESG_ROLES_CONFIG.esg_team;

  // Auto redirect area if not allowed
  useEffect(() => {
    if (roleConfig.tabs.length > 0 && !roleConfig.tabs.includes(area)) {
      void navigate({ search: { area: roleConfig.tabs[0], sub: undefined } });
    }
  }, [esgRole, area, roleConfig.tabs, navigate]);

  // Sync context role with user type
  useEffect(() => {
    if (esgRole === "approver") {
      setRole("approver");
    } else {
      setRole("maintainer");
    }
  }, [esgRole]);

  const policy = usePolicyWorkflow();
  const audit = useAuditWorkflow();
  const training = useTrainingWorkflow(trainingPersonLabel);
  const monitoring = useMonitoringWorkflow();
  const masters = useMastersWorkflow();
  const defaultRange = useMemo<DateRange>(() => {
    return {
      start: new Date("2026-07-01T00:00:00"),
      end: new Date("2026-07-31T23:59:59"),
      presetKey: "thisMonth",
      label: "This Month",
    };
  }, []);

  const [dateRange, setDateRangeState] = useState<DateRange>(defaultRange);

  const setDateRange = useCallback((range: DateRange) => {
    setDateRangeState(range);
    const y = range.start.getFullYear();
    const m = String(range.start.getMonth() + 1).padStart(2, "0");
    setPeriod(`${y}-${m}`);
  }, [setPeriod]);

  const [projectId, setProjectIdState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem("esg_saved_project_id") || null;
    } catch {
      return null;
    }
  });

  // Sync project selection to scope and session storage
  const setProjectId = useCallback((id: string | null) => {
    setProjectIdState(id);
    try {
      if (id) {
        sessionStorage.setItem("esg_saved_project_id", id);
      } else {
        sessionStorage.removeItem("esg_saved_project_id");
      }
    } catch {}

    if (id) {
      const proj = PROJECT_LIFECYCLES.find((p) => p.projectId === id);
      if (proj) {
        setScope({ entityId: proj.entityId });
      }
    } else {
      setScope({});
    }
  }, []);

  // Sync scope changes back to project filter
  useEffect(() => {
    if (scope.entityId) {
      const currentProj = PROJECT_LIFECYCLES.find((p) => p.projectId === projectId);
      if (!currentProj || currentProj.entityId !== scope.entityId) {
        const matchingProj = PROJECT_LIFECYCLES.find((p) => p.entityId === scope.entityId);
        setProjectIdState(matchingProj ? matchingProj.projectId : null);
      }
    } else {
      setProjectIdState(null);
    }
  }, [scope.entityId, projectId]);

  type HistoryFrame = {
    area: string;
    sub?: string;
    scope: ScopeSel;
    period: string;
    projectId: string | null;
  };

  const [history, setHistory] = useState<HistoryFrame[]>([]);

  const goto = useCallback(
    (nextArea: string, opts?: { record?: string; state?: string; sub?: string }) => {
      let nextSub = opts?.sub;

      // Restore last visited sub-tab for target area if not explicitly specified
      if (!nextSub && nextArea !== area) {
        try {
          const savedSub = sessionStorage.getItem(`esg_sub_${nextArea}`);
          if (savedSub) nextSub = savedSub;
        } catch {}
      }

      // Save sub-tab choice if navigating within or to an area
      if (nextSub) {
        try {
          sessionStorage.setItem(`esg_sub_${nextArea}`, nextSub);
        } catch {}
      }

      // Ignore duplicate navigation to exact same area & sub
      if (area === nextArea && sub === nextSub) {
        if (opts?.record) setDrawerId(opts.record);
        return;
      }

      setHistory((prev) => {
        const last = prev[prev.length - 1];
        // Avoid pushing identical consecutive frame
        if (
          last &&
          last.area === area &&
          last.sub === sub &&
          JSON.stringify(last.scope) === JSON.stringify(scope) &&
          last.period === period
        ) {
          return prev;
        }

        // Prevent 2-step navigation loops (e.g. A -> B -> A)
        if (
          prev.length >= 2 &&
          prev[prev.length - 2].area === nextArea &&
          prev[prev.length - 2].sub === nextSub
        ) {
          return prev.slice(0, prev.length - 1);
        }

        return [
          ...prev,
          {
            area,
            sub,
            scope: { ...scope },
            period,
            projectId,
          },
        ];
      });

      void navigate({ search: { area: nextArea, record: opts?.record, sub: nextSub } });
      if (opts?.record) setDrawerId(opts.record);
    },
    [navigate, area, sub, scope, period, projectId],
  );

  const goBack = useCallback(() => {
    // 1. Retrace explicitly recorded navigation history
    if (history.length > 0) {
      setHistory((prev) => {
        const nextHistory = [...prev];
        const prevFrame = nextHistory.pop();
        if (prevFrame) {
          setScope(prevFrame.scope);
          if (prevFrame.period) setPeriod(prevFrame.period);
          if (prevFrame.projectId !== undefined) setProjectIdState(prevFrame.projectId);
          void navigate({ search: { area: prevFrame.area, sub: prevFrame.sub } });
        }
        return nextHistory;
      });
      return;
    }

    // 2. Intelligent fallback for direct URLs / refreshed pages with empty history stack:
    if (sub !== undefined) {
      // Step back from sub-tab to main area root
      void navigate({ search: { area, sub: undefined } });
    } else if (area !== "overview") {
      // Step back from non-overview area to Overview dashboard
      void navigate({ search: { area: "overview", sub: undefined } });
    }
  }, [history, area, sub, navigate, setScope, setPeriod, setProjectIdState]);

  const hasHistory = history.length > 0 || area !== "overview" || sub !== undefined;

  const openRecord = useCallback((id: string) => setDrawerId(id), []);

  const ctx = useMemo<EsgCtx>(
    () => ({
      scope,
      setScope,
      period,
      setPeriod,
      dateRange,
      setDateRange,
      audience,
      setAudience,
      projectId,
      setProjectId,
      role,
      setRole,
      policy,
      audit,
      training,
      monitoring,
      masters,
      openRecord,
      goto,
      goBack,
      hasHistory,
    }),
    [
      scope,
      period,
      dateRange,
      setDateRange,
      audience,
      projectId,
      setProjectId,
      role,
      policy,
      audit,
      training,
      monitoring,
      masters,
      openRecord,
      goto,
      goBack,
      hasHistory,
    ],
  );

  // Notification deep-links land with ?record= — open the drawer and highlight the row.
  const activeRecordId = drawerId ?? record ?? null;
  const activeRecord = activeRecordId
    ? (RECORDS.find((r) => r.id === activeRecordId) ?? null)
    : null;
  const closeDrawer = () => {
    setDrawerId(null);
    if (record) void navigate({ search: { area, record: undefined, sub: undefined } });
  };

  const external = audience === "external";
  const reduce = useReducedMotion();

  const body = (
    <>
      {area === "overview" && <OverviewTab deepLinkRecordId={record ?? undefined} />}
      {area === "esms" && <EsmsTab initialSub={sub} />}
      {area === "projects" && <ProjectsTab initialSub={sub} />}
      {area === "reports" && <ReportsTab />}
      {area === "vendors" && <VendorsTab />}
      {area === "masters" && <MastersTab />}
    </>
  );

  return (
    <EsgContext.Provider value={ctx}>
      <PageShell
        eyebrow="Environmental · Social · Governance"
        title="ESG"
        titleAccent="Command"
        description="A pump against compliance decay — what's draining, who owns it, and when it must be renewed. Continuous capture; monthly reporting on the 7th."
        meta={
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-[11.5px] font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            Live — dashboard reads the record continuously, not on the report cycle
          </div>
        }
      >
        <div className="space-y-5">
          <EsgHeader area={area} />
          {/* Tab switches blur-crossfade; the audience lens fades so the curated
              swap reads as a deliberate mode change, not a reload. */}
          <motion.div
            key={area}
            initial={reduce ? false : { opacity: 0.35, filter: "blur(3px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            <motion.div
              key={audience}
              initial={reduce ? false : { opacity: 0, filter: "blur(2px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              {external ? (
                <div className="rounded-2xl border border-dashed border-border/80 p-3 sm:p-4">
                  <div className="mb-3 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <Globe className="h-3.5 w-3.5" aria-hidden />
                    External view — curated · non-compliance is withheld here but never internally
                  </div>
                  {body}
                </div>
              ) : (
                body
              )}
            </motion.div>
          </motion.div>
        </div>
        {activeRecord && <RecordDrawer record={activeRecord} onClose={closeDrawer} />}
      </PageShell>
    </EsgContext.Provider>
  );
}
