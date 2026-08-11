import { useRef, useState, useMemo } from "react";
import { ArrowUpRight, Check, CircleCheck, Lock, UploadCloud, User, ChevronDown, Info, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { entityById, fmtDate, personById, type Policy, type PolicyVersion } from "@/lib/esg-data";
import {
  POLICY_STEPS,
  canApprovePolicies,
  canEditPolicies,
  currentApprovedVersion,
  latestVersion,
  policyReviewState,
  policyStepIndex,
  reviewCountdownLabel,
} from "@/lib/esg-policy";
import { A, DocChip, StatePill, useEsg } from "../primitives";
import { EscalationStatusIndicator } from "../EscalationStatusIndicator";
import { getActiveEscalationForSource } from "@/lib/esg-escalations";

const VERSION_STATUS: Record<PolicyVersion["status"], { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", cls: "bg-warning/14 text-warning" },
  approved: { label: "Approved", cls: "bg-success/12 text-success" },
  rejected: { label: "Rejected", cls: "bg-destructive/12 text-destructive" },
};

function VersionStatusPill({ status }: { status: PolicyVersion["status"] }) {
  const m = VERSION_STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}

/** Horizontal 4-step approval stepper: Draft → Submitted → Approved → In ESAP/ESMP Register. */
function ApprovalStepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1">
      {POLICY_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-1">
            <div className="flex min-w-0 flex-col items-center gap-1 text-center">
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold transition-colors",
                  done
                    ? "bg-success text-white"
                    : active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight",
                  done || active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {i < POLICY_STEPS.length - 1 && (
              <span
                className={cn("mb-4 h-px flex-1", i < current ? "bg-success" : "bg-border")}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

interface PolicyActMapping {
  actName: string;
  whyApplicableSummary: string;
  context: string;
  obligation: string;
  relevance: string;
  authority: string;
}

const POLICY_ACTS_MAPPING: Record<string, PolicyActMapping> = {
  "p-esg": {
    actName: "Companies Act, 2013",
    whyApplicableSummary: "Applies because the policy defines corporate-wide governance and sustainability commitments.",
    context: "Transvolt operates as a registered corporate entity under Indian law, engaging in commercial activities that require corporate governance oversight.",
    obligation: "Requires public disclosures of corporate social responsibility (CSR) policies, board diversity, and environmental and governance practices.",
    relevance: "Establishes the legal framework for the board of directors to oversee ESG integration and report compliance in the annual board report.",
    authority: "Section 134(5) / Ministry of Corporate Affairs (MCA), SEBI Listing Regulations (LODR)."
  },
  "p-ehs": {
    actName: "Factories Act, 1948 & Environment Protection Act, 1986",
    whyApplicableSummary: "Applies because the policy covers workplace health, safety, and welfare at facilities.",
    context: "Transvolt operates physical charging depots and workshops where mechanical equipment, high-voltage electricity, and maintenance personnel are present.",
    obligation: "Mandates provision of clean working conditions, safety gear, ventilation, proper lighting, and waste disposal systems.",
    relevance: "Governs worker health, safety measures, pollution discharge limits, and hazardous substance management across all depot sites.",
    authority: "State Factory Inspectorate, State Pollution Control Boards (SPCB), Ministry of Environment, Forest and Climate Change (MoEFCC)."
  },
  "p-hr": {
    actName: "Contract Labour (Regulation & Abolition) Act, 1970",
    whyApplicableSummary: "Applies because Transvolt utilizes contract workers and operational drivers.",
    context: "Transvolt's operations involve a mix of direct employees and third-party contract workers for security, cleaning, and driving duties.",
    obligation: "Ensures contract workers receive statutory minimum wages, access to canteen facilities, restrooms, and regulated working hours.",
    relevance: "Establishes principal employer liability and prevents exploitation of contract workers at charging depots.",
    authority: "Ministry of Labour & Employment, Office of the Labour Commissioner."
  },
  "p-grv": {
    actName: "Right to Information Act, 2005",
    whyApplicableSummary: "Applies because Transvolt interacts with public entities and local communities.",
    context: "Depot installations and charging networks are built in municipal areas, directly impacting local communities and public space access.",
    obligation: "Requires maintaining public transparency, grievance channels, and responding to community concerns regarding noise or safety.",
    relevance: "Promotes accountability and provides citizens a legal path to query public utilities and municipal integrations.",
    authority: "Central/State Information Commissions, Local Municipal Authorities."
  },
  "p-sup": {
    actName: "Companies Act, 2013 (Section 166 - Duties of Directors)",
    whyApplicableSummary: "Applies because vendor governance and ethical sourcing are mandated.",
    context: "Transvolt procures batteries, chargers, and solar equipment from a global supply chain requiring strict vendor verification.",
    obligation: "Requires executing due diligence on supply chain partners regarding fair wages, child labour prohibitions, and safe work conditions.",
    relevance: "Protects Transvolt from secondary liability and reputational damage due to supplier compliance breaches.",
    authority: "Ministry of Corporate Affairs (MCA), Competition Commission of India."
  },
  "p-form-v": {
    actName: "Environment (Protection) Act, 1986 (Form V Submission)",
    whyApplicableSummary: "Applies because environmental reporting is required for operational consent.",
    context: "Any industry or project requiring Consent to Operate under the Air/Water Acts must submit an annual environmental statement.",
    obligation: "Requires filing Form V annually to details water consumption, raw material use, emissions, and waste generation metrics.",
    relevance: "Provides state authorities with verified data to monitor ecological impact and resource efficiency.",
    authority: "State Pollution Control Board (SPCB)."
  },
  "p-posh": {
    actName: "POSH Act, 2013",
    whyApplicableSummary: "Applies because Transvolt has more than 10 employees across operations.",
    context: "Transvolt maintains offices, depots, and field staff, requiring a harassment-free workplace for all employees.",
    obligation: "Mandates the constitution of an Internal Committee (IC), conducting regular POSH sensitization workshops, and filing annual return logs.",
    relevance: "Sets legal procedures to handle complaints of sexual harassment and guarantees safe working environments.",
    authority: "Ministry of Women and Child Development, District POSH Officers."
  }
};

/**
 * Policy detail — version history, upload, and the approval workflow that gates a
 * policy's entry into the ESAP/ESMP Register. Approve/Reject are gated on the stubbed
 * role (presentation of a permission model, not enforcement).
 */
export function PolicyDrawer({
  policy,
  onClose,
  onOpenEsap,
}: {
  policy: Policy;
  onClose: () => void;
  onOpenEsap: () => void;
}) {
  const { role, policy: wf } = useEsg();
  const fileRef = useRef<HTMLInputElement>(null);

  const [actsOpen, setActsOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  const mapping = POLICY_ACTS_MAPPING[policy.id] || {
    actName: "General Compliance Guidelines",
    whyApplicableSummary: "Applies to ensure organizational alignment and basic legal/operational standards.",
    context: "Transvolt operations require basic compliance policies to govern workplace safety, business ethics, and labor practices.",
    obligation: "Requires adherence to guidelines and principles set forth by corporate governance and industry codes.",
    relevance: "Establishes a baseline for organizational discipline and compliance management.",
    authority: "Internal Governance Committee."
  };

  const versions = wf.policyVersions(policy.id);
  const latest = latestVersion(versions);
  const step = policyStepIndex(versions);
  const approvedVersion = currentApprovedVersion(versions);
  const reviewState = policyReviewState(policy);
  const owner = personById(policy.ownerId);
  const escalation = useMemo(() => {
    return getActiveEscalationForSource(policy.id);
  }, [policy.id]);

  const mayEdit = canEditPolicies(role);
  const mayApprove = canApprovePolicies(role);

  const doUpload = () => {
    wf.uploadPolicyVersion(policy.id);
    if (fileRef.current) fileRef.current.value = ""; // allow re-uploading the same file
    toast.success("New version uploaded", {
      description: `${policy.name} — draft added, pending submission. (UI stub — no file stored.)`,
    });
  };
  const doSubmit = () => {
    wf.submitPolicyVersion(policy.id);
    toast.success("Submitted for approval", {
      description: `${policy.name} ${latest?.version} → awaiting approver.`,
    });
  };
  const doDecide = (decision: "approved" | "rejected") => {
    wf.decidePolicyVersion(policy.id, decision);
    if (decision === "approved") {
      toast.success("Policy approved", {
        description: `${policy.name} ${latest?.version} approved — now in the ESAP/ESMP Register.`,
      });
    } else {
      toast("Version rejected", {
        description: `${policy.name} ${latest?.version} sent back for revision.`,
      });
    }
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto border-border/60 sm:max-w-[540px]">
        <SheetHeader className="space-y-3 pb-0">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div>
              <div className="section-label">Policy · {entityById(policy.entityId)?.short}</div>
              <SheetTitle className="mt-1 text-[19px] leading-tight tracking-tight">
                {policy.name}
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-[12.5px]">
                Owner {owner?.name} ·{" "}
                {approvedVersion ? `current ${approvedVersion}` : "no approved version yet"}
              </SheetDescription>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <StatePill state={reviewState} size="md" />
              {escalation && <EscalationStatusIndicator escalation={escalation} />}
            </div>
          </div>

          {/* Annual-review clock */}
          <div
            className="flex items-center justify-between rounded-xl border px-4 py-2.5"
            style={{
              borderColor: `color-mix(in oklab, var(--color-${reviewState === "overdue" ? "destructive" : reviewState === "expiring" ? "warning" : "success"}) 30%, transparent)`,
            }}
          >
            <div className="text-[11px] font-medium text-muted-foreground">
              Annual review due {fmtDate(policy.reviewDue)}
            </div>
            <div
              className={cn(
                "num text-[13px] font-semibold",
                reviewState === "overdue"
                  ? "text-destructive"
                  : reviewState === "expiring"
                    ? "text-warning"
                    : "text-success",
              )}
            >
              {reviewCountdownLabel(policy)}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-5 space-y-5 pb-6">
          {/* Approval workflow */}
          <section className="rounded-xl border border-border/60 bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Approval workflow
              </div>
              {latest && <VersionStatusPill status={latest.status} />}
            </div>
            <ApprovalStepper current={step} />

            {/* Gate copy */}
            <div className="mt-4">
              {latest?.status === "approved" ? (
                <button
                  type="button"
                  onClick={onOpenEsap}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5 text-[12px] font-semibold text-success transition-colors hover:bg-success/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <CircleCheck className="h-3.5 w-3.5" aria-hidden /> In the <A t="ESAP" /> register
                  — open it <ArrowUpRight className="h-3 w-3" aria-hidden />
                </button>
              ) : latest?.status === "rejected" ? (
                <p className="text-[12px] font-medium text-destructive">
                  Rejected — upload a revised version to resubmit.
                </p>
              ) : (
                <p className="text-[12px] text-muted-foreground">
                  Not yet in the <A t="ESAP" /> Register — approval pending.
                  {approvedVersion && (
                    <span className="mt-0.5 block text-[11px]">
                      Approved {approvedVersion} remains in force until this version is approved.
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Workflow actions (role-gated) */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {latest?.status === "draft" && (
                <Button
                  size="sm"
                  className="h-8 rounded-lg text-[12px]"
                  onClick={doSubmit}
                  disabled={!mayEdit}
                  title={mayEdit ? undefined : "Requires the Maintainer role (switch in Masters)"}
                >
                  Submit for approval
                </Button>
              )}
              {latest?.status === "submitted" && (
                <>
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 rounded-lg text-[12px]"
                    onClick={() => doDecide("approved")}
                    disabled={!mayApprove}
                    title={
                      mayApprove ? undefined : "Requires the Approver role (switch in Masters)"
                    }
                  >
                    {!mayApprove && <Lock className="h-3.5 w-3.5" aria-hidden />}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg text-[12px]"
                    onClick={() => doDecide("rejected")}
                    disabled={!mayApprove}
                    title={
                      mayApprove ? undefined : "Requires the Approver role (switch in Masters)"
                    }
                  >
                    Reject
                  </Button>
                </>
              )}
              {!mayApprove && latest?.status === "submitted" && (
                <span className="text-[11px] text-muted-foreground">
                  Approval is limited to the Approver role — change it in Masters.
                </span>
              )}
            </div>
          </section>

          {/* APPLICABLE ACTS & WHY THEY ARE APPLICABLE */}
          <section className="space-y-4">
            {/* Applicable Acts */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <span>Applicable Acts</span>
                  <span className="text-destructive">*</span>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                </div>
                <button
                  type="button"
                  onClick={() => setWhyOpen(!whyOpen)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  <span>Why are they applicable?</span>
                  <HelpCircle className="h-3.5 w-3.5 text-primary/80" />
                </button>
              </div>

              <div
                onClick={() => setActsOpen(!actsOpen)}
                className="flex h-9 w-full items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-[12.5px] font-medium shadow-sm cursor-pointer hover:bg-muted/30 select-none"
              >
                <span className="text-foreground">{mapping.actName}</span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", actsOpen && "rotate-180")} />
              </div>

              {actsOpen && (
                <div className="rounded-lg border border-border/40 bg-muted/10 p-3.5 text-[12px] text-muted-foreground space-y-1">
                  <p className="font-bold text-foreground">Governing Legislation:</p>
                  <p>
                    This policy is legally governed by the <span className="font-semibold text-foreground">{mapping.actName}</span>, which defines statutory mandates and minimum compliance expectations.
                  </p>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground mt-1">
                Choose the Acts that apply to this policy
              </p>
            </div>

            {/* Why They Are Applicable? */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <span>Why They Are Applicable?</span>
                  <span className="text-destructive">*</span>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  <span>What does this mean?</span>
                  <HelpCircle className="h-3.5 w-3.5 text-primary/80" />
                </button>
              </div>

              <div
                onClick={() => setWhyOpen(!whyOpen)}
                className="flex h-9 w-full items-center justify-between rounded-lg border border-border/60 bg-background px-3 py-2 text-[12.5px] font-medium shadow-sm cursor-pointer hover:bg-muted/30 select-none"
              >
                <span className="text-foreground truncate pr-4">{mapping.whyApplicableSummary}</span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", whyOpen && "rotate-180")} />
              </div>

              {whyOpen && (
                <div className="rounded-lg border border-border/40 bg-muted/10 p-3.5 text-[12px] space-y-3 text-muted-foreground">
                  <div>
                    <span className="font-bold text-foreground block">Business Activity & Context</span>
                    <span className="block mt-0.5 text-muted-foreground leading-normal">{mapping.context}</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">Compliance Obligation</span>
                    <span className="block mt-0.5 text-muted-foreground leading-normal">{mapping.obligation}</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">Key Relevance</span>
                    <span className="block mt-0.5 text-muted-foreground leading-normal">{mapping.relevance}</span>
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">Applicable Sections / Regulatory Authority</span>
                    <span className="block mt-0.5 text-primary font-mono text-[11.5px] bg-primary/5 px-2 py-1 rounded border border-primary/10 mt-1">{mapping.authority}</span>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground mt-1">
                Select the reason this policy is applicable under the chosen Acts
              </p>
            </div>
          </section>

          {/* Upload new version */}
          <section>
            <div className="section-label mb-2">Upload new version</div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={doUpload}
            />
            <button
              type="button"
              onClick={() => (mayEdit ? fileRef.current?.click() : undefined)}
              disabled={!mayEdit}
              className={cn(
                "flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                mayEdit
                  ? "hover:border-primary/50 hover:bg-muted/40"
                  : "cursor-not-allowed opacity-60",
              )}
              title={mayEdit ? undefined : "Requires the Maintainer role (switch in Masters)"}
            >
              <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden />
              <span className="text-[12.5px] font-medium">
                {mayEdit ? "Drop a file or click to upload" : "Upload requires the Maintainer role"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                Adds a new draft version, pending submission (UI stub — no file is stored)
              </span>
            </button>
          </section>

          {/* Version history timeline */}
          <section>
            <div className="section-label mb-2">Version history</div>
            <ol className="space-y-3">
              {versions.map((v, i) => (
                <li key={`${v.version}-${i}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold",
                        v.status === "approved"
                          ? "bg-success/15 text-success"
                          : v.status === "rejected"
                            ? "bg-destructive/12 text-destructive"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i === 0 ? "★" : ""}
                    </span>
                    {i < versions.length - 1 && (
                      <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="num text-[13px] font-semibold">{v.version}</span>
                      <VersionStatusPill status={v.status} />
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <User className="h-3 w-3" aria-hidden />
                      {personById(v.uploadedBy)?.name ?? v.uploadedBy} · uploaded{" "}
                      {fmtDate(v.uploadedAt)}
                      {v.approvedOn && (
                        <>
                          {" · "}approved {fmtDate(v.approvedOn)}
                          {v.approvedBy
                            ? ` by ${personById(v.approvedBy)?.name ?? v.approvedBy}`
                            : ""}
                        </>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <DocChip
                        name={v.doc.name}
                        size={v.doc.size !== "—" ? v.doc.size : undefined}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
