import React from "react";
import { SocialMonitoringDashboard } from "../monitoring/social/SocialMonitoringDashboard";
import { SocialRecordItem } from "./SocialDataEntry";

interface SocialMonitorViewProps {
  customRecords?: SocialRecordItem[];
  onNewRecordClick?: () => void;
  onStatusChange?: (id: string, newStatus: "Open" | "Closed") => void;
}

export function SocialMonitorView({}: SocialMonitorViewProps) {
  return <SocialMonitoringDashboard />;
}
