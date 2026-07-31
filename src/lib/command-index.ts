import {
  Globe,
  Leaf,
  ShieldAlert,
  Users,
  FileOutput,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type CommandItem = {
  id: string;
  label: string;
  keywords: string;
  href: string;
  group: "Pages" | "Routes" | "Drivers" | "Segments";
  icon: LucideIcon;
  meta?: string;
};

const PAGES: CommandItem[] = [
  { id: "esg-overview", label: "ESG Overview", keywords: "esg overview dashboard carbon emissions water waste electricity metrics", href: "/esg?area=overview", group: "Pages", icon: Globe },
  { id: "esg-projects", label: "ESG Projects", keywords: "esg projects carbon offsets solar transition charger installation fleet conversion", href: "/esg?area=projects", group: "Pages", icon: Leaf },
  { id: "esg-esms", label: "ESG ESMS", keywords: "esg esms policy social governance labor safety health audits training", href: "/esg?area=esms", group: "Pages", icon: ShieldAlert },
  { id: "esg-vendors", label: "ESG Vendors", keywords: "esg vendors suppliers supply chain ethics assessment", href: "/esg?area=vendors", group: "Pages", icon: Users },
  { id: "esg-reports", label: "ESG Reports", keywords: "esg reports brsr sustainability export download pdf", href: "/esg?area=reports", group: "Pages", icon: FileOutput },
  { id: "esg-masters", label: "ESG Masters", keywords: "esg masters configuration parameters settings goals thresholds", href: "/esg?area=masters", group: "Pages", icon: Settings },
];

export function buildCommandIndex(): CommandItem[] {
  return PAGES;
}

export const COMMAND_INDEX = buildCommandIndex();
