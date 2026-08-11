import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Database,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { setCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · ESG Data Portal" },
      {
        name: "description",
        content: "One source of truth for ESG data, compliance, governance and reporting.",
      },
    ],
  }),
  component: LoginPage,
});

const DEMO_EMAILS = [
  { email: "esg.lead@transvolt.in", label: "ESG Team / ESG Lead" },
  { email: "depot.manager@transvolt.in", label: "Site / Depot Manager" },
  { email: "project.manager@transvolt.in", label: "Project Manager" },
  { email: "approver@transvolt.in", label: "ESG Approver" },
  { email: "reviewer@transvolt.in", label: "ESG Reviewer" },
  { email: "legal@transvolt.in", label: "Compliance & Legal" },
  { email: "operations@transvolt.in", label: "Energy & Operations" },
  { email: "hse@transvolt.in", label: "HSE / EHS User" },
  { email: "hr@transvolt.in", label: "HR / People User" },
  { email: "finance@transvolt.in", label: "Finance & Accounts" },
  { email: "admin@transvolt.in", label: "ESG Administrator" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("esg.lead@transvolt.in");
  const [password, setPassword] = useState("demo12345");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error("Email required");
      return;
    }
    
    setIsSigningIn(true);
    setCurrentUser({
      email: email.trim(),
      provider: "password",
      name: email.split("@")[0].replace(".", " ").toUpperCase() + " (Demo)",
    });

    window.setTimeout(() => {
      setIsSigningIn(false);
      toast.success("Signed in successfully", {
        description: `Logged in as ${email}`,
      });
      void navigate({ to: "/esg" });
    }, 800);
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col md:flex-row overflow-x-hidden select-none">
      {/* Background Hero Glows and Grid */}
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-[0.20]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 hero-glow opacity-[0.60]" aria-hidden />

      {/* LEFT / BRAND PANEL */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-12 lg:p-16 border-r border-border/50 relative z-10 bg-card/15 backdrop-blur-[2px]">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="h-8.5 w-8.5 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center">
            <Database className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <div className="text-[15px] font-extrabold tracking-tight text-foreground uppercase">
              Transvolt
            </div>
            <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Fleet & ESG Governance
            </div>
          </div>
        </div>

        {/* Product Pitch & Governance Chain */}
        <div className="my-auto py-10 md:py-0 space-y-8">
          <div className="space-y-3">
            <h1 className="text-[28px] md:text-[34px] font-extrabold tracking-tight text-foreground leading-[1.1]">
              ESG Data Portal
            </h1>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground max-w-md">
              One source of truth for ESG data, compliance and reporting. Validated datasets built for institutional transparency and lender auditing.
            </p>
          </div>

          {/* Staged Governance Flow Chart */}
          <div className="space-y-2 max-w-md">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Institutional Governance Flow
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["DATA", "VALIDATION", "COMPLIANCE", "APPROVAL", "REPORTING"].map((step, idx) => (
                <div key={step} className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.75 bg-muted/80 border border-border/60 text-muted-foreground rounded-lg">
                    {step}
                  </span>
                  {idx < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/45 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Credibility Points */}
          <div className="space-y-3 max-w-md">
            <div className="flex gap-3">
              <span className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </span>
              <div>
                <h4 className="text-[12.5px] font-bold text-foreground">Centralized ESG Data Governance</h4>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">Role-based controls safeguard audit metrics.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </span>
              <div>
                <h4 className="text-[12.5px] font-bold text-foreground">Project-Level Compliance & Monitoring</h4>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">Continuous tracking of permits, audits, and ESAP plans.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Activity className="h-4 w-4 text-primary" />
              </span>
              <div>
                <h4 className="text-[12.5px] font-bold text-foreground">Audit-Ready Reporting & Traceability</h4>
                <p className="text-[11.5px] text-muted-foreground mt-0.5">Approved source metrics feed multiple compliance reports automatically.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10.5px] text-muted-foreground/60 font-semibold tracking-wide">
          Authorized access only • ESG Data Governance Platform
        </div>
      </div>

      {/* RIGHT / LOGIN FORM PANEL */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16 relative z-10 bg-background/90 md:bg-transparent">
        <div className="w-full max-w-[390px] space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-[20px] font-extrabold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-[12.5px] text-muted-foreground">Sign in to the ESG Data Portal</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-bold text-muted-foreground">Work Email / Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@transvolt.in"
                  className="w-full h-10 pl-9.5 pr-3 rounded-xl border border-border bg-card/60 text-[12.5px] focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50 transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-bold text-muted-foreground">Password</Label>
                <button
                  type="button"
                  onClick={() => toast.info("Contact ESG Admin to reset your password.")}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-10 pl-9.5 pr-10 rounded-xl border border-border bg-card/60 text-[12.5px] focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-muted-foreground/60 hover:text-foreground cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Compact Workspace / Role Selection (directly above sign-in) */}
            <div className="space-y-1.5">
              <Label className="text-[12px] font-bold text-muted-foreground">Sign in as</Label>
              <select
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  setPassword("demo12345");
                }}
                className="w-full h-10 px-3 rounded-xl border border-border bg-card/60 text-[12.5px] font-semibold focus:outline-none focus:border-primary/60 transition-colors cursor-pointer"
              >
                {DEMO_EMAILS.map((item) => (
                  <option key={item.email} value={item.email}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Remember Me checkbox */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border bg-card/60 text-primary focus:ring-primary/40 cursor-pointer"
              />
              <label htmlFor="remember" className="text-[12px] text-muted-foreground cursor-pointer font-medium select-none">
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isSigningIn}
              className="w-full h-10 rounded-xl text-[12.5px] font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              {isSigningIn ? "Signing you in…" : "Sign In"}
            </Button>
          </form>

          {/* Secure Access subtext */}
          <div className="rounded-xl border border-border/60 bg-card/50 p-3 text-[11.5px] text-muted-foreground/80 leading-normal">
            <span className="font-bold text-foreground block">Secure role-based access</span>
            Your workspace, projects, data and approvals are determined by your assigned permissions.
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => toast.info("Need support? Raise a ticket at esg.support@transvolt.in")}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Need help? Contact ESG Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
