import { useEffect, useState } from "react";
import {
  availableEsmsTiers,
  esmsSubsForTier,
  esmsTierForSub,
  isEsmsSubAvailable,
  resolveEsmsSub,
  type EsmsSubTab,
  type EsmsTier,
} from "@/lib/esg-data";
import { A, PanelCard, useEsg, useStubLoad, LoadingRows } from "./primitives";
import { Segmented } from "./Segmented";
import { getCurrentUser } from "@/lib/auth";
import { getRoleFromEmail, ESG_ROLES_CONFIG } from "@/lib/esg-roles";
import { PoliciesPanel } from "./esms/PoliciesPanel";
import { SopsPanel } from "./esms/SopsPanel";
import { AssessmentsPanel } from "./esms/AssessmentsPanel";
import { EsapPanel } from "./esms/EsapPanel";
import { AuditsPanel } from "./esms/AuditsPanel";
import { TrainingPanel } from "./esms/TrainingPanel";
import { MonitoringPanel } from "./esms/MonitoringPanel";
import { LifecyclePanel } from "./esms/LifecyclePanel";
import { GrievancePanel } from "./esms/GrievancePanel";
import { AssuranceCalendarPanel } from "./esms/AssuranceCalendarPanel";


/** Renders a tier-2 tab's label — through the acronym glossary when it is one. */
function subLabel(s: EsmsSubTab): React.ReactNode {
  if (s.key === "esap") {
    return (
      <>
        <A t="ESAP" />/<A t="ESMP" /> Register
      </>
    );
  }
  if (!s.acronym) return s.label;
  const rest = s.label.slice(s.acronym.length);
  return (
    <>
      <A t={s.acronym} />
      {rest}
    </>
  );
}

/**
 * ESMS shell. Two-tier navigation (tier-1 groups → contextual tier-2 tabs) keeps
 * every row short as the module grows. The tier-2 key is the `?sub=` value; tier-1
 * is derived from it, so existing deep-links keep resolving.
 */
export function EsmsTab({ initialSub }: { initialSub?: string }) {
  const { scope, goto } = useEsg();
  const [sub, setSub] = useState<string>(() => {
    if (initialSub) return resolveEsmsSub(initialSub);
    try {
      const saved = sessionStorage.getItem("esg_sub_esms");
      if (saved) return resolveEsmsSub(saved);
    } catch {}
    return resolveEsmsSub(initialSub);
  });
  const loading = useStubLoad(sub + JSON.stringify(scope));

  // Sync when initialSub prop changes
  useEffect(() => {
    if (initialSub) {
      setSub(resolveEsmsSub(initialSub));
      try {
        sessionStorage.setItem("esg_sub_esms", resolveEsmsSub(initialSub));
      } catch {}
    }
  }, [initialSub]);

  const currentUser = getCurrentUser();
  const esgRole = currentUser ? getRoleFromEmail(currentUser.email) : "esg_team";
  const roleConfig = ESG_ROLES_CONFIG[esgRole] || ESG_ROLES_CONFIG.esg_team;
  const allowedSubKeys = roleConfig.subtabs.esms || [];

  useEffect(() => {
    if (allowedSubKeys.length > 0 && !allowedSubKeys.includes(sub)) {
      setSub(allowedSubKeys[0]);
    }
  }, [esgRole, sub, allowedSubKeys]);

  const tier = esmsTierForSub(sub);
  const rawTiers = availableEsmsTiers();
  
  // Filter tiers: only show tiers where at least one subtab is allowed
  const allowedTiers = rawTiers.filter((t) =>
    esmsSubsForTier(t.key).some((s) => allowedSubKeys.includes(s.key))
  );

  const tierSubs = esmsSubsForTier(tier);
  const allowedTierSubs = tierSubs.filter((s) => allowedSubKeys.includes(s.key));

  const selectSub = (next: string) => {
    setSub(next);
    try {
      sessionStorage.setItem("esg_sub_esms", next);
    } catch {}
    goto("esms", { sub: next });
  };

  const setTier = (t: EsmsTier) => {
    const subsOfTier = esmsSubsForTier(t).filter((s) => allowedSubKeys.includes(s.key));
    const first = subsOfTier[0];
    if (first) selectSub(first.key);
  };

  // ESAP backlinks and assessment "open findings" links jump between sub-tabs;
  // only follow when the target sub is available in the current build.
  const goToSub = (next: string) => {
    if (isEsmsSubAvailable(next) && allowedSubKeys.includes(next)) selectSub(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {allowedTiers.length > 0 && (
          <Segmented<EsmsTier>
            ariaLabel="ESMS groups"
            size="md"
            value={tier}
            onChange={setTier}
            options={allowedTiers.map((t) => ({ key: t.key, label: t.label }))}
          />
        )}
        {allowedTierSubs.length > 1 && (
          <Segmented<string>
            ariaLabel={`${tier} sections`}
            size="sm"
            value={sub}
            onChange={selectSub}
            options={allowedTierSubs.map((s) => ({ key: s.key, label: subLabel(s) }))}
          />
        )}
      </div>

      {loading ? (
        <PanelCard>
          <LoadingRows rows={5} />
        </PanelCard>
      ) : (
        <>
          {sub === "policies" && <PoliciesPanel onOpenEsap={() => setSub("esap")} />}
          {sub === "sops" && <SopsPanel />}
          {sub === "grievance" && <GrievancePanel />}
          {sub === "esdd" && <AssessmentsPanel kind="ESDD" onOpenEsap={() => setSub("esap")} />}
          {sub === "esia" && <AssessmentsPanel kind="ESIA" onOpenEsap={() => setSub("esap")} />}
          {sub === "audit-internal" && (
            <AuditsPanel kind="internal" onOpenEsap={() => setSub("esap")} />
          )}
          {sub === "audit-external" && (
            <AuditsPanel kind="external" onOpenEsap={() => setSub("esap")} />
          )}
          {sub === "training" && <TrainingPanel />}
          {sub === "monitoring" && <MonitoringPanel />}
          {sub === "lifecycle" && <LifecyclePanel />}
          {sub === "esap" && <EsapPanel onOpenSource={goToSub} />}
          {sub === "assurance-calendar" && <AssuranceCalendarPanel />}
        </>
      )}
    </div>
  );
}
