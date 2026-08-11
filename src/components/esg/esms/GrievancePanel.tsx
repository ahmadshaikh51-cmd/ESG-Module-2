import { Scale } from "lucide-react";
import { EmptyState, PanelCard } from "../primitives";

export function GrievancePanel() {
  return (
    <PanelCard>
      <div className="border-b border-border/60 px-5 py-3.5">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <Scale className="h-4 w-4 text-primary" aria-hidden /> Grievance Register
        </h3>
        <p className="text-[12px] text-muted-foreground">
          Track and resolve community and workplace grievances.
        </p>
      </div>
      <EmptyState
        icon={Scale}
        title="Grievance registry is empty"
        hint="No active grievance records or tracking logs have been submitted in this scope."
      />
    </PanelCard>
  );
}
