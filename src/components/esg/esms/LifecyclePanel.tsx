import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PanelCard, useEsg } from "../primitives";
import {
  ArrowDown,
  Globe,
  UserCog,
  ShieldCheck,
  ArrowLeftRight,
  Zap,
  Trash2,
  Heart,
  Circle,
  Target,
  Waypoints,
  MapPin,
  HelpCircle,
  FileText,
  TrendingUp,
  RotateCcw,
  Database,
  ArrowRight,
  Layers,
  ArrowUpRight,
  ClipboardList,
  Settings,
  Activity,
  X,
  UploadCloud,
  Upload,
  Download,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  entityById,
  fmtDate,
  isEsmsSubAvailable,
  lifecycleDaysInStage,
  lifecycleIsBottleneck,
  lifecycleStageByKey,
  lifecycleStageCounts,
  PROJECT_LIFECYCLES,
} from "@/lib/esg-data";

// Vertical connection line
function VerticalLine() {
  return <div className="w-[1px] h-6 bg-border mx-auto" />;
}

// Top-level flowchart nodes
function Node({
  title,
  subtitle,
  variant = "default",
  onClick,
}: {
  title: string;
  subtitle?: string;
  variant?: "primary" | "default" | "active";
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-[260px] flex flex-col items-center justify-center p-3.5 rounded-xl border bg-card text-center transition-all hover:-translate-y-0.5 hover:shadow-md z-10",
        variant === "primary" &&
          "bg-primary text-primary-foreground border-primary rounded-full py-2.5",
        variant === "active" &&
          "border-primary/60 shadow-[0_0_0_2px_rgba(var(--primary),0.2)] bg-card",
        onClick ? "cursor-pointer" : "cursor-default",
      )}
    >
      <span
        className={cn(
          "text-[12.5px] font-bold leading-tight",
          variant === "primary" && "text-primary-foreground",
          variant === "active" && "text-primary",
        )}
      >
        {title}
      </span>
      {subtitle && (
        <span className="text-[10.5px] text-muted-foreground mt-0.5 leading-tight">{subtitle}</span>
      )}
    </div>
  );
}

// Branch column header (Environment, Labour, OH&S)
function BranchHeader({
  title,
  color,
  icon: Icon,
}: {
  title: string;
  color: "green" | "orange" | "red";
  icon: any;
}) {
  const colorClasses = {
    green: "bg-success/15 text-success border-success/30",
    orange: "bg-warning/15 text-warning border-warning/30",
    red: "bg-destructive/15 text-destructive border-destructive/30",
  };

  return (
    <div
      className={cn(
        "w-full py-2.5 px-4 rounded-lg border flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider mb-4",
        colorClasses[color],
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {title}
    </div>
  );
}

// Standard branch nodes (Permits, Compliance)
function BranchNode({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full flex flex-col items-start p-3.5 rounded-xl border border-border bg-card hover:-translate-y-0.5 transition-transform shadow-sm mb-3",
        onClick ? "cursor-pointer hover:shadow-md" : "cursor-default",
      )}
    >
      <span className="text-[11.5px] font-bold text-foreground">{title}</span>
      <span className="text-[10.5px] text-muted-foreground leading-tight mt-0.5">{subtitle}</span>
    </div>
  );
}

// Solid action buttons
function BranchAction({
  title,
  color,
  onClick,
}: {
  title: string;
  color: "green" | "orange" | "red";
  onClick?: () => void;
}) {
  const colorClasses = {
    green: "bg-success text-success-foreground hover:bg-success/90",
    orange: "bg-warning text-warning-foreground hover:bg-warning/90",
    red: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full py-2.5 px-4 rounded-md text-center text-[11.5px] font-bold cursor-pointer transition-colors mb-3 shadow-sm",
        colorClasses[color],
      )}
    >
      {title}
    </div>
  );
}

// Meta Data Table component
function MetaDataCard({
  items,
  color,
}: {
  items: { label: string; icon?: any }[];
  color: "green" | "orange" | "red";
}) {
  const headerColors = {
    green: "bg-success text-success-foreground",
    orange: "bg-warning text-warning-foreground",
    red: "bg-destructive text-destructive-foreground",
  };

  return (
    <div className="w-full rounded-xl border border-border bg-card overflow-hidden mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={cn(
          "w-full px-3.5 py-2.5 text-[11px] font-bold flex justify-between items-center",
          headerColors[color],
        )}
      >
        <span>META DATA.xlsx</span>
        <ArrowDown className="w-3.5 h-3.5 opacity-70" />
      </div>
      <div className="flex flex-col">
        {items.map((item, i) => (
          <div
            key={i}
            className="px-3.5 py-2.5 text-[10.5px] text-muted-foreground border-b border-border last:border-0 hover:bg-muted/50 transition-colors flex items-center gap-2.5"
          >
            {item.icon ? (
              <item.icon className="w-3.5 h-3.5 opacity-60" />
            ) : (
              <Circle className="w-1.5 h-1.5 opacity-40 fill-current" />
            )}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function LifecycleNode({
  title,
  subtitle,
  icon: Icon,
  variant = "default",
  active = false,
  onClick,
}: {
  title: string;
  subtitle?: string;
  icon?: any;
  variant?: "start" | "process" | "decision" | "document" | "default";
  active?: boolean;
  onClick?: () => void;
}) {
  const isStart = variant === "start";
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col p-3.5 shadow-sm transition-all select-none border border-border bg-card",
        isStart ? "w-[240px] items-center justify-center rounded-full bg-slate-900 dark:bg-slate-950 text-white border-none py-2 px-5" : "w-[260px] items-start rounded-2xl",
        variant === "process" && "bg-primary text-primary-foreground border-none hover:bg-primary/95 shadow-sm",
        variant === "document" && "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50 text-blue-950 dark:text-blue-200 border border-solid",
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-md",
        active && "border-primary/60 shadow-[0_0_0_2px_rgba(var(--primary),0.2)] bg-primary/5"
      )}
    >
      <div className={cn("flex items-center gap-2 w-full", isStart && "justify-center")}>
        {Icon && (
          <span className={cn(
            "h-5 w-5 rounded-lg flex items-center justify-center shrink-0",
            (isStart || variant === "process") && "bg-white/15 text-white",
            variant === "document" && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
            (variant === "default" || variant === "decision") && "bg-muted text-muted-foreground",
            active && "bg-primary/10 text-primary"
          )}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
        <span className={cn(
          "text-[12px] font-bold leading-tight",
          (isStart || variant === "process") ? "text-white" : active ? "text-primary font-extrabold" : "text-foreground"
        )}>
          {title}
        </span>
      </div>
      {subtitle && !isStart && (
        <p className={cn(
          "text-[10px] mt-1.5 leading-snug",
          variant === "process" ? "text-white/80" : "text-muted-foreground"
        )}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function DecisionDiamond({ title }: { title: string }) {
  return (
    <div className="relative w-[110px] h-[110px] my-6 flex items-center justify-center shrink-0">
      {/* Rotated background */}
      <div className="absolute inset-0 bg-amber-500 dark:bg-amber-600 rotate-45 rounded-xl shadow-sm border-none pointer-events-none" />
      {/* Un-rotated content */}
      <div className="relative z-10 text-center px-3 rotate-0">
        <span className="text-[11.5px] font-bold text-white leading-tight block">
          {title}
        </span>
      </div>
    </div>
  );
}

function DownArrow() {
  return (
    <div className="flex flex-col items-center my-1.5 shrink-0">
      <div className="w-[1.5px] h-6 bg-border" />
      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-border -mt-[1px]" />
    </div>
  );
}

function SplitArrow() {
  return (
    <div className="w-full max-w-[660px] flex flex-col items-center my-2 relative shrink-0">
      <div className="w-[1.5px] h-4 bg-border" />
      <div className="w-[calc(50%+16px)] h-[1.5px] bg-border relative">
        <span className="absolute left-0 -translate-x-1/2 -top-4 text-[9px] font-bold text-muted-foreground uppercase bg-background px-1 whitespace-nowrap">Brownfield</span>
        <span className="absolute right-0 translate-x-1/2 -top-4 text-[9px] font-bold text-muted-foreground uppercase bg-background px-1 whitespace-nowrap">Greenfield / Vacant Land</span>
      </div>
      <div className="w-[calc(50%+16px)] flex justify-between">
        <div className="flex flex-col items-center">
          <div className="w-[1.5px] h-4 bg-border" />
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-border -mt-[1px]" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[1.5px] h-4 bg-border" />
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-border -mt-[1px]" />
        </div>
      </div>
    </div>
  );
}

function MergeArrow() {
  return (
    <div className="w-full max-w-[660px] flex flex-col items-center my-2 shrink-0">
      <div className="w-[calc(50%+16px)] flex justify-between">
        <div className="w-[1.5px] h-4 bg-border" />
        <div className="w-[1.5px] h-4 bg-border" />
      </div>
      <div className="w-[calc(50%+16px)] h-[1.5px] bg-border" />
      <div className="w-[1.5px] h-4 bg-border" />
      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-border -mt-[1px]" />
    </div>
  );
}

interface ScreeningDocVersion {
  version: string;
  fileType: string;
  uploadedBy: string;
  uploadedOn: string;
  status: "approved" | "under-review" | "draft";
  size: string;
}

interface ScreeningDoc {
  id: string;
  name: string;
  category: string;
  versions: ScreeningDocVersion[];
}

const DEFAULT_SC_DOCS: ScreeningDoc[] = [
  {
    id: "sc-doc-1",
    name: "Preliminary_E&S_Screening_Report_v1.0.pdf",
    category: "Preliminary E&S Screening Report",
    versions: [
      {
        version: "v1.0",
        fileType: "PDF",
        uploadedBy: "Arjun Mehta (ESMS Lead)",
        uploadedOn: "2026-06-15",
        status: "approved",
        size: "2.4 MB"
      }
    ]
  },
  {
    id: "sc-doc-2",
    name: "E&S_Screening_Checklist_v2.0.xlsx",
    category: "E&S Screening Checklist",
    versions: [
      {
        version: "v2.0",
        fileType: "XLSX",
        uploadedBy: "Arjun Mehta (ESMS Lead)",
        uploadedOn: "2026-07-02",
        status: "under-review",
        size: "840 KB"
      },
      {
        version: "v1.0",
        fileType: "XLSX",
        uploadedBy: "Arjun Mehta (ESMS Lead)",
        uploadedOn: "2026-06-18",
        status: "approved",
        size: "820 KB"
      }
    ]
  },
  {
    id: "sc-doc-3",
    name: "Initial_Site_Assessment_v1.1.docx",
    category: "Initial Site Assessment",
    versions: [
      {
        version: "v1.1",
        fileType: "DOCX",
        uploadedBy: "Sarah Jenkins (Site Inspector)",
        uploadedOn: "2026-07-10",
        status: "draft",
        size: "1.8 MB"
      },
      {
        version: "v1.0",
        fileType: "DOCX",
        uploadedBy: "Sarah Jenkins (Site Inspector)",
        uploadedOn: "2026-06-20",
        status: "approved",
        size: "1.7 MB"
      }
    ]
  }
];

const DEFAULT_ESDD_DOCS: ScreeningDoc[] = [
  {
    id: "esdd-doc-1",
    name: "ESDD_Audit_Report_v1.0.pdf",
    category: "Comprehensive ESDD Report",
    versions: [
      {
        version: "v1.0",
        fileType: "PDF",
        uploadedBy: "Arjun Mehta (ESMS Lead)",
        uploadedOn: "2026-07-15",
        status: "under-review",
        size: "3.1 MB"
      }
    ]
  }
];

export function LifecyclePanel() {
  const { goto, scope } = useEsg();
  const [mode, setMode] = useState<"all" | string>("all");
  const [activePanelTab, setActivePanelTab] = useState<"screening" | "esdd" | null>(null);

  const [documents, setDocuments] = useState<ScreeningDoc[]>(() => {
    try {
      const saved = localStorage.getItem("voltline-esms-screening-docs");
      return saved ? JSON.parse(saved) : DEFAULT_SC_DOCS;
    } catch {
      return DEFAULT_SC_DOCS;
    }
  });

  const [esddDocuments, setEsddDocuments] = useState<ScreeningDoc[]>(() => {
    try {
      const saved = localStorage.getItem("voltline-esms-esdd-docs");
      return saved ? JSON.parse(saved) : DEFAULT_ESDD_DOCS;
    } catch {
      return DEFAULT_ESDD_DOCS;
    }
  });

  const [expandedDocHistories, setExpandedDocHistories] = useState<Record<string, boolean>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("Preliminary E&S Screening Report");
  const [uploadName, setUploadName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [versionTargetDocId, setVersionTargetDocId] = useState<string | null>(null);
  const versionFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scope.entityId) {
      const proj = PROJECT_LIFECYCLES.find((p) => p.entityId === scope.entityId);
      if (proj) {
        setMode(proj.projectId);
      } else {
        setMode("all");
      }
    } else {
      setMode("all");
    }
    setActivePanelTab(null);
  }, [scope.entityId]);

  const counts = useMemo(() => lifecycleStageCounts(), []);
  const activeLifecycle =
    mode !== "all" ? PROJECT_LIFECYCLES.find((p) => p.projectId === mode) : undefined;
  const bottlenecked = PROJECT_LIFECYCLES.filter(lifecycleIsBottleneck);

  useEffect(() => {
    if (activePanelTab === "screening") {
      setUploadCategory("Preliminary E&S Screening Report");
    } else if (activePanelTab === "esdd") {
      setUploadCategory(
        activeLifecycle?.branch === "greenfield" ? "Comprehensive ESIA Report" : "Comprehensive ESDD Report"
      );
    }
    setIsUploading(false);
    setSelectedFile(null);
    setUploadName("");
  }, [activePanelTab, activeLifecycle?.branch]);

  const nodeTitle = useMemo(() => {
    if (!activeLifecycle) return "Project Initiation";
    if (activeLifecycle.projectId === "pl-mbmt") return "MBMT Initiation";
    if (activeLifecycle.projectId === "pl-silvassa") return "Silvassa Initiation";
    if (activeLifecycle.projectId === "pl-noida") return "Noida Initiation";
    const short = entityById(activeLifecycle.entityId)?.short || "Project";
    return `${short} Initiation`;
  }, [activeLifecycle]);

  const onOpen = (sub: string) => goto("esms", { sub });

  const saveDocs = (newDocs: ScreeningDoc[]) => {
    if (activePanelTab === "screening") {
      setDocuments(newDocs);
      localStorage.setItem("voltline-esms-screening-docs", JSON.stringify(newDocs));
    } else {
      setEsddDocuments(newDocs);
      localStorage.setItem("voltline-esms-esdd-docs", JSON.stringify(newDocs));
    }
  };

  const handleDownloadAll = () => {
    const currentDocs = activePanelTab === "screening" ? documents : esddDocuments;
    toast.success(`Downloading all ${activePanelTab === "screening" ? "screening" : "ESDD/ESIA"} documents...`, {
      description: `Initiated download for ${currentDocs.length} files.`,
    });
  };

  const handleDownloadSingle = (docName: string) => {
    toast.success(`Downloading ${docName}...`, {
      description: "Document download initiated successfully.",
    });
  };

  const handleViewSingle = (docName: string) => {
    toast.info(`Viewing ${docName} inside secure viewer...`, {
      description: "Visual rendering initialized.",
    });
  };

  const toggleHistory = (docId: string) => {
    setExpandedDocHistories(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const triggerNewVersionUpload = (docId: string) => {
    setVersionTargetDocId(docId);
    versionFileInputRef.current?.click();
  };

  const handleVersionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !versionTargetDocId) return;

    const targetDocs = activePanelTab === "screening" ? documents : esddDocuments;
    const doc = targetDocs.find(d => d.id === versionTargetDocId);
    if (!doc) return;

    const latest = doc.versions[0];
    let newVerStr = "v1.1";
    if (latest) {
      const verNum = parseFloat(latest.version.replace("v", ""));
      if (latest.status === "approved") {
        newVerStr = `v${Math.floor(verNum + 1.0).toFixed(1)}`;
      } else {
        newVerStr = `v${(verNum + 0.1).toFixed(1)}`;
      }
    }

    const newVersion: ScreeningDocVersion = {
      version: newVerStr,
      fileType: file.name.split(".").pop()?.toUpperCase() || "PDF",
      uploadedBy: "Arjun Mehta (ESMS Lead)",
      uploadedOn: new Date().toISOString().split("T")[0],
      status: "under-review",
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    };

    const updatedDocs = targetDocs.map(d => {
      if (d.id === versionTargetDocId) {
        return {
          ...d,
          versions: [newVersion, ...d.versions]
        };
      }
      return d;
    });

    saveDocs(updatedDocs);
    setVersionTargetDocId(null);
    if (versionFileInputRef.current) versionFileInputRef.current.value = "";
    toast.success(`Uploaded ${newVerStr} for ${doc.name}`, {
      description: "New version is pending review.",
    });
  };

  const handleNewDocUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    const nameToUse = uploadName.trim() || selectedFile.name.replace(/\.[^/.]+$/, "");
    const ext = selectedFile.name.split(".").pop()?.toUpperCase() || "PDF";
    
    const newDoc: ScreeningDoc = {
      id: `${activePanelTab === "screening" ? "sc" : "esdd"}-doc-${Date.now()}`,
      name: `${nameToUse.replace(/\s+/g, "_")}_v1.0.${ext.toLowerCase()}`,
      category: uploadCategory,
      versions: [
        {
          version: "v1.0",
          fileType: ext,
          uploadedBy: "Arjun Mehta (ESMS Lead)",
          uploadedOn: new Date().toISOString().split("T")[0],
          status: "draft",
          size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        }
      ]
    };

    const targetDocs = activePanelTab === "screening" ? documents : esddDocuments;
    saveDocs([newDoc, ...targetDocs]);
    setIsUploading(false);
    setUploadName("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("Document uploaded successfully", {
      description: `${nameToUse} has been added.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Controls from old flow */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Waypoints className="h-4 w-4 text-primary" aria-hidden />
          <Select value={mode} onValueChange={(val) => {
            setMode(val);
            setActivePanelTab(null);
          }}>
            <SelectTrigger className="h-8 w-[240px] text-[12px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[12px]">
                All projects — pipeline view
              </SelectItem>
              {PROJECT_LIFECYCLES.map((p) => (
                <SelectItem key={p.projectId} value={p.projectId} className="text-[12px]">
                  {p.project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {mode !== "all" && (
          <div className="flex flex-wrap items-center gap-3 text-[10.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full border border-foreground/25 bg-muted/50" />{" "}
              Start/end
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md border border-primary/25 bg-primary/8" /> Process
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md border border-warning/40 bg-warning/10" /> Decision
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md border border-dashed border-border bg-card" />{" "}
              Document
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md border border-destructive/60 bg-destructive/8" />{" "}
              Bottleneck
            </span>
          </div>
        )}
      </div>

      {activeLifecycle && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-2.5 text-[12px]">
          <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
          <span className="font-medium">{activeLifecycle.project}</span>
          <span className="text-muted-foreground">
            · {entityById(activeLifecycle.entityId)?.short} · in{" "}
            <span className="font-semibold">
              {lifecycleStageByKey(activeLifecycle.currentStage)?.label ||
                activeLifecycle.currentStage}
            </span>{" "}
            since {fmtDate(activeLifecycle.stageEnteredOn)}
          </span>
          {lifecycleIsBottleneck(activeLifecycle) && (
            <span className="rounded-md bg-destructive/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
              Bottlenecked
            </span>
          )}
        </div>
      )}

      {mode === "all" && bottlenecked.length > 0 && (
        <div className="rounded-xl border border-destructive/35 bg-destructive/6 px-4 py-2.5 text-[12px] font-medium text-destructive">
          {bottlenecked.length} project{bottlenecked.length === 1 ? "" : "s"} stuck beyond the
          normal window — {bottlenecked.map((p) => p.project).join(", ")}.
        </div>
      )}

      {/* Hidden inputs for uploads */}
      <input
        ref={versionFileInputRef}
        type="file"
        accept=".pdf,.xlsx,.docx,.doc"
        className="hidden"
        onChange={handleVersionFileChange}
      />

      <PanelCard>
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border/60 bg-card/45 backdrop-blur-xs min-h-[850px] transition-all duration-300">
          {/* Left Side: Lifecycle Flowchart */}
          <div className={cn(
            "p-6 flex flex-col items-center select-none transition-all duration-300 overflow-x-auto",
            activePanelTab ? "lg:w-[56%] w-full" : "w-full"
          )}>
            {mode === "all" ? (
              <>
              {/* Header and Legend Bar */}
              <div className="w-full max-w-[1100px] flex flex-wrap items-center justify-between gap-3 bg-card border border-border/50 rounded-xl p-4 shadow-sm">
                <div>
                  <h3 className="text-[13.5px] font-bold text-foreground leading-none flex items-center gap-2">
                    In-Depth ESMS — Project Lifecycle, Risk & Reporting
                  </h3>
                  <p className="text-[10.5px] text-muted-foreground mt-1 leading-none">
                    End-to-end Environmental & Social Management System flow
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[oklch(0.2_0.028_255)] border-none" /> Start / End
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md border border-border bg-card" /> Process
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md border border-warning/40 bg-warning/5" /> Decision
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-md border border-dashed border-border bg-card" /> Data / Doc
                  </span>
                </div>
              </div>

              {/* Obligations Banner */}
              <div className="w-full max-w-[1100px] mt-4 bg-primary/5 border border-primary/10 rounded-xl px-4 py-2 text-[10px] font-bold text-center text-primary tracking-wider uppercase">
                OBLIGATIONS & COMPLIANCE: National Permits & Licenses · IFC Performance Standards · Contractual Scope of Work
              </div>

              {/* Vertical Flowchart Stack */}
              <div className="flex flex-col items-center min-w-[700px] mt-4">
                {/* Stage 1: Initial Stages */}
                <LifecycleNode
                  title="New Project Opportunity"
                  icon={Target}
                  variant="start"
                />
                <DownArrow />
                <LifecycleNode
                  title="Preliminary E&S Screening"
                  subtitle="Before Bidding"
                  icon={Globe}
                  variant="process"
                />
                <DownArrow />
                <LifecycleNode
                  title="Project Type Classification"
                  icon={Layers}
                  variant="process"
                />
                
                {/* Split Arrow */}
                <SplitArrow />

                {/* Stage 2: Parallel Columns */}
                <div className="grid grid-cols-2 gap-8 w-full max-w-[660px] relative">
                  {/* Left Column: Brownfield */}
                  <div className="flex flex-col items-center h-full">
                    <LifecycleNode
                      title="Comprehensive ESDD"
                      subtitle="Env. & Social Due Diligence"
                      icon={ClipboardList}
                      variant="process"
                    />
                    <DownArrow />
                    <LifecycleNode
                      title="Risk Identification & Analysis"
                      icon={HelpCircle}
                      variant="process"
                    />
                    <DownArrow />
                    <LifecycleNode
                      title="Assign Risk Category"
                      subtitle="A/B/C/D"
                      icon={ShieldCheck}
                      variant="process"
                    />
                    <DownArrow />
                    <LifecycleNode
                      title="Formulate ESAP"
                      subtitle="Env. & Social Action Plan"
                      icon={FileText}
                      variant="document"
                    />
                    {/* Extension line to match height of Greenfield column and connect to MergeArrow */}
                    <div className="w-[1.5px] flex-grow bg-border shrink-0" />
                  </div>

                  {/* Right Column: Greenfield / Vacant Land */}
                  <div className="flex flex-col items-center h-full">
                    <LifecycleNode
                      title="Comprehensive ESIA"
                      subtitle="Env. & Social Impact Assmt."
                      icon={Globe}
                      variant="process"
                    />
                    <DownArrow />
                    <LifecycleNode
                      title="Risk Identification & Analysis"
                      icon={HelpCircle}
                      variant="process"
                    />
                    <DownArrow />
                    <LifecycleNode
                      title="Potential Impact Analysis"
                      icon={TrendingUp}
                      variant="process"
                    />
                    <DownArrow />
                    <LifecycleNode
                      title="Assign Risk Category"
                      subtitle="A/B/C/D"
                      icon={ShieldCheck}
                      variant="process"
                    />
                    <DownArrow />
                    <LifecycleNode
                      title="Formulate ESMP"
                      subtitle="Env. & Social Mgmt Plan"
                      icon={FileText}
                      variant="document"
                    />
                  </div>
                </div>

                {/* Stage 3: Convergence & Decision */}
                <MergeArrow />
                <LifecycleNode
                  title="Implement ESAP / ESMP"
                  icon={Settings}
                  variant="process"
                />
                <DownArrow />
                
                <div className="relative flex flex-col items-center w-full max-w-[660px]">
                  <LifecycleNode
                    title="Monitor & Review Implementation"
                    icon={Activity}
                    variant="process"
                  />
                  <DownArrow />
                  
                  {/* Risk Category Reduced? Decision (Centered Diamond) */}
                  <DecisionDiamond title="Risk Category Reduced?" />

                  {/* Vertical Line splitting to YES (straight down) */}
                  <div className="w-[1.5px] h-[40px] bg-border relative shrink-0">
                    <span className="absolute left-1/2 -translate-x-1/2 top-1 text-[9px] font-extrabold text-success uppercase bg-background px-1 leading-none">YES</span>
                  </div>
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-border -mt-[1px] mb-1.5 shrink-0" />

                  {/* Main YES Pathway (Centered) */}
                  <LifecycleNode
                    title="Maintain Operations"
                    subtitle="Lower Risk Profile"
                    icon={ShieldCheck}
                    variant="process"
                  />
                  <DownArrow />
                  <LifecycleNode
                    title="Ongoing Monitoring & Periodic Review"
                    icon={ClipboardList}
                    variant="process"
                  />

                  {/* Absolute Positioned Right Column (NO Pathway) */}
                  <div className="absolute left-[calc(50%+55px)] top-[165px] -translate-y-1/2 flex items-center z-10">
                    {/* Horizontal Connector Arrow */}
                    <div className="w-[175px] h-[1.5px] bg-border relative flex items-center shrink-0">
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-extrabold text-destructive uppercase bg-background px-1 leading-none">NO</span>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[4px] border-l-border border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent" />
                    </div>
                    
                    <div className="flex flex-col items-center shrink-0">
                      <LifecycleNode
                        title="Update ESAP / ESMP & Re-implement"
                        icon={RotateCcw}
                        variant="default"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center my-1.5 shrink-0">
                  <div className="w-[1.5px] h-12 bg-border" />
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-border -mt-[1px]" />
                </div>
                {/* Stage 4: Monitoring Framework & Reporting */}
                <LifecycleNode
                  title="ES Monitoring & Reporting Framework"
                  subtitle="Data Collection via Metadata Format"
                  icon={FileText}
                  variant="document"
                />
                <DownArrow />
                <LifecycleNode
                  title="Reporting Obligations"
                  icon={FileText}
                  variant="process"
                />
                
                {/* Splitter into 4 columns */}
                <div className="w-full max-w-[1100px] flex flex-col items-center my-2">
                  <div className="w-[1.5px] h-4 bg-border" />
                  <div className="w-[75%] h-[1.5px] bg-border" />
                  <div className="w-[75%] flex justify-between">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-[1.5px] h-4 bg-border" />
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-border -mt-[1px]" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reporting Obligations Grid */}
                <div className="grid grid-cols-4 gap-4 w-full max-w-[1100px] mt-2">
                  <div className="rounded-xl border border-border/50 bg-card p-3 shadow-sm text-center">
                    <span className="text-[11.5px] font-bold text-foreground block">BRSR / AMR / Impact Report</span>
                    <span className="block text-[9px] text-muted-foreground uppercase mt-1">National</span>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card p-3 shadow-sm text-center">
                    <span className="text-[11.5px] font-bold text-foreground block">IFC Lender Reports / CDP</span>
                    <span className="block text-[9px] text-muted-foreground uppercase mt-1">DFI</span>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card p-3 shadow-sm text-center">
                    <span className="text-[11.5px] font-bold text-foreground block">GHG Inventory</span>
                    <span className="block text-[9px] text-muted-foreground uppercase mt-1">Scope 1 / 2 / 3 Emissions</span>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-card p-3 shadow-sm text-center">
                    <span className="text-[11.5px] font-bold text-foreground block">Carbon Savings</span>
                    <span className="block text-[9px] text-muted-foreground uppercase mt-1">Avoidance Indicators</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
              <div className="flex flex-col items-center min-w-[850px] pb-12">
                {/* Trunk */}
                <Node title={nodeTitle} variant="primary" />
                <VerticalLine />
                <Node
                  title="Preliminary E&S Screening"
                  subtitle="Initial impact assessment report"
                  onClick={() => setActivePanelTab(activePanelTab === "screening" ? null : "screening")}
                  variant={activePanelTab === "screening" ? "active" : "default"}
                />
                <VerticalLine />
                <Node
                  title={activeLifecycle?.branch === "greenfield" ? "ESIA Report" : "ESDD Report"}
                  subtitle={
                    activeLifecycle?.branch === "greenfield"
                      ? "Environmental & Social Impact Assessment"
                      : "Environmental & Social Due Diligence"
                  }
                  onClick={() => setActivePanelTab(activePanelTab === "esdd" ? null : "esdd")}
                  variant={activePanelTab === "esdd" ? "active" : "default"}
                />
                <VerticalLine />
                <Node
                  title={activeLifecycle?.branch === "greenfield" ? "ESMP" : "ESAP"}
                  subtitle={
                    activeLifecycle?.branch === "greenfield"
                      ? "Environmental & Social Management Plan"
                      : "Environmental & Social Action Plan"
                  }
                  variant="active"
                  onClick={() => onOpen("esap")}
                />

                {/* Splitter */}
                <div className="w-[1px] h-6 bg-border" />
                <div className="w-[66.6%] h-[1px] bg-border" />
                <div className="w-[66.6%] flex justify-between">
                  <div className="w-[1px] h-6 bg-border" />
                  <div className="w-[1px] h-6 bg-border" />
                  <div className="w-[1px] h-6 bg-border" />
                </div>

                {/* Branches Grid */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-[950px]">
                  {/* Environment Branch */}
                  <div className="flex flex-col items-center w-full">
                    <BranchHeader title="Environment" color="green" icon={Globe} />
                    <BranchNode
                      title="Permits"
                      subtitle="Environmental clearance & licensing"
                      onClick={() => onOpen("policies")}
                    />
                    <BranchNode
                      title="Compliance"
                      subtitle="Statutory verification"
                      onClick={() => onOpen("policies")}
                    />
                    <BranchNode
                      title="Environmental Monitoring"
                      subtitle="Resource mapping"
                      onClick={() => onOpen("monitoring")}
                    />

                    <BranchAction
                      title="Environmental Monitoring"
                      color="green"
                      onClick={() => onOpen("monitoring")}
                    />

                    <MetaDataCard
                      color="green"
                      items={[
                        { label: "Vehicle", icon: ArrowLeftRight },
                        { label: "Energy", icon: Zap },
                        { label: "Waste", icon: Trash2 },
                        { label: "Consumption", icon: Heart },
                      ]}
                    />

                    <BranchAction title="Training" color="green" onClick={() => onOpen("training")} />
                    <BranchAction
                      title="Biannual monitoring"
                      color="green"
                      onClick={() => onOpen("assurance-calendar")}
                    />
                  </div>

                  {/* Labour Branch */}
                  <div className="flex flex-col items-center w-full">
                    <BranchHeader title="Labour" color="orange" icon={UserCog} />
                    <BranchNode
                      title="Permits"
                      subtitle="Labour law compliance"
                      onClick={() => onOpen("policies")}
                    />
                    <BranchNode
                      title="Compliance"
                      subtitle="Wage & Hour verification"
                      onClick={() => onOpen("policies")}
                    />
                    <BranchNode
                      title="Social Monitoring"
                      subtitle="Workforce demographics"
                      onClick={() => onOpen("monitoring")}
                    />

                    <BranchAction
                      title="Social Monitoring"
                      color="orange"
                      onClick={() => onOpen("monitoring")}
                    />

                    <MetaDataCard
                      color="orange"
                      items={[
                        { label: "Internal Grievance Tracker" },
                        { label: "Stakeholder Engagement Register" },
                        { label: "MOM Tracker" },
                      ]}
                    />

                    <BranchAction title="Training" color="orange" onClick={() => onOpen("training")} />
                    <BranchAction
                      title="Biannual monitoring"
                      color="orange"
                      onClick={() => onOpen("assurance-calendar")}
                    />
                  </div>

                  {/* OH&S Branch */}
                  <div className="flex flex-col items-center w-full">
                    <BranchHeader title="OH&S" color="red" icon={ShieldCheck} />
                    <BranchNode
                      title="Permits"
                      subtitle="Safety licensing"
                      onClick={() => onOpen("policies")}
                    />
                    <BranchNode
                      title="Compliance"
                      subtitle="Audit protocols"
                      onClick={() => onOpen("audit-internal")}
                    />
                    <BranchNode
                      title="Social Monitoring"
                      subtitle="Incident tracking"
                      onClick={() => onOpen("monitoring")}
                    />

                    <BranchAction
                      title="Social Monitoring"
                      color="red"
                      onClick={() => onOpen("monitoring")}
                    />

                    <MetaDataCard
                      color="red"
                      items={[
                        { label: "Accident / Incident Register" },
                        { label: "PPE Register" },
                        { label: "OHS Inspection Register" },
                        { label: "First Aid Register" },
                        { label: "Fire Extinguisher Register" },
                      ]}
                    />

                    <BranchAction title="Training" color="red" onClick={() => onOpen("training")} />
                    <BranchAction
                      title="Biannual monitoring"
                      color="red"
                      onClick={() => onOpen("assurance-calendar")}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

            {/* Right Side: Detail / Document Management Panel */}
            {activePanelTab && (
              <div className="lg:w-[44%] w-full p-6 space-y-6 bg-card/25 backdrop-blur-xs border-t lg:border-t-0 border-border/60 overflow-y-auto max-h-[1100px]">
                {/* Header with Close */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                      {activePanelTab === "screening" 
                        ? "Before Bidding" 
                        : activeLifecycle?.branch === "greenfield" 
                        ? "Impact Assessment" 
                        : "Due Diligence"}
                    </span>
                    <h2 className="text-[18px] font-bold text-foreground leading-snug tracking-tight mt-1 flex items-center gap-2">
                      {activePanelTab === "screening" 
                        ? "Preliminary E & S Screening" 
                        : activeLifecycle?.branch === "greenfield" 
                        ? "ESIA Report" 
                        : "ESDD Report"}
                    </h2>
                    <p className="text-[11.5px] text-muted-foreground leading-relaxed mt-2 pr-6">
                      {activePanelTab === "screening" 
                        ? "Initial Environmental & Social screening to identify potential E&S risks and determine the appropriate level of assessment required before bidding." 
                        : activeLifecycle?.branch === "greenfield" 
                        ? "Comprehensive Environmental & Social Impact Assessment report analyzing potential environmental/social impacts and outlining management plans." 
                        : "Comprehensive Environmental & Social Due Diligence report assessing compliance, identifying legacy issues, and defining corrective actions."}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => setActivePanelTab(null)}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Close panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <span className="inline-flex items-center gap-1 rounded-md bg-warning/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning border border-warning/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
                      In Progress
                    </span>
                  </div>
                </div>

                {/* Stage Information Card */}
                <div className="rounded-xl border border-border/60 bg-card p-4.5 space-y-3.5 shadow-xs">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border/40 pb-1.5">STAGE INFORMATION</span>
                  
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-[12px]">
                    <div>
                      <span className="text-muted-foreground text-[10.5px] block font-medium">Stage</span>
                      <span className="text-foreground font-semibold mt-0.5 block">
                        {activePanelTab === "screening" 
                          ? "Preliminary E & S Screening" 
                          : activeLifecycle?.branch === "greenfield" 
                          ? "ESIA Report" 
                          : "ESDD Report"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10.5px] block font-medium">Lifecycle Position</span>
                      <span className="text-foreground font-semibold mt-0.5 block">
                        {activePanelTab === "screening" ? "2 of the ESMS lifecycle" : "3 of the ESMS lifecycle"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground text-[10.5px] block font-medium">Purpose</span>
                      <span className="text-foreground font-medium mt-0.5 block leading-normal">
                        {activePanelTab === "screening" 
                          ? "Identify potential Environmental & Social risks before bidding and determine the appropriate level of assessment." 
                          : activeLifecycle?.branch === "greenfield" 
                          ? "Evaluate potential environmental and social impacts and define management plans (ESMP)." 
                          : "Evaluate environmental and social compliance and identify corrective action items (ESAP)."}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10.5px] block font-medium">Applicable To</span>
                      <span className="text-foreground font-semibold mt-0.5 block">All Projects</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10.5px] block font-medium">Next Assessment</span>
                      <span className="text-foreground font-semibold mt-0.5 block">
                        {activePanelTab === "screening" 
                          ? "ESDD / ESIA based on classification" 
                          : "ESMP / ESAP Formulation & Implementation"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Screening Documents Section */}
                <div className="space-y-4 pt-1.5">
                  <div className="flex justify-between items-center border-b border-border/60 pb-2.5">
                    <div>
                      <h4 className="text-[12px] font-bold text-foreground uppercase tracking-wider">
                        {activePanelTab === "screening" 
                          ? "SCREENING DOCUMENTS" 
                          : activeLifecycle?.branch === "greenfield" 
                          ? "ESIA DOCUMENTS" 
                          : "ESDD DOCUMENTS"}
                      </h4>
                      <p className="text-[10.5px] text-muted-foreground mt-0.5">
                        {activePanelTab === "screening" 
                          ? "Upload and manage documents associated with Preliminary E & S Screening." 
                          : activeLifecycle?.branch === "greenfield" 
                          ? "Upload and manage documents associated with ESIA Report." 
                          : "Upload and manage documents associated with ESDD Report."}
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadAll}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download All
                    </button>
                  </div>

                  {/* Upload Document Form / Toggle */}
                  {isUploading ? (
                    <form onSubmit={handleNewDocUpload} className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold uppercase text-foreground">Upload Document Details</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUploading(false);
                            setSelectedFile(null);
                          }}
                          className="text-[11px] text-muted-foreground hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10.5px] font-semibold text-muted-foreground uppercase mb-1">Document Category</label>
                          <select
                            value={uploadCategory}
                            onChange={(e) => setUploadCategory(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg p-2 text-[12px] text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            {activePanelTab === "screening" ? (
                              <>
                                <option value="Preliminary E&S Screening Report">Preliminary E&S Screening Report</option>
                                <option value="E&S Screening Checklist">E&S Screening Checklist</option>
                                <option value="Screening Data Sheet">Screening Data Sheet</option>
                                <option value="Initial Site Assessment">Initial Site Assessment</option>
                                <option value="Site Visit Notes">Site Visit Notes</option>
                                <option value="Supporting E&S Evidence">Supporting E&S Evidence</option>
                              </>
                            ) : activeLifecycle?.branch === "greenfield" ? (
                              <>
                                <option value="Comprehensive ESIA Report">Comprehensive ESIA Report</option>
                                <option value="ESIA Impact Study Draft">ESIA Impact Study Draft</option>
                                <option value="ESIA Non-Technical Summary">ESIA Non-Technical Summary</option>
                                <option value="Site Public Consultation Report">Site Public Consultation Report</option>
                                <option value="ESIA Stakeholder Engagement Plan">ESIA Stakeholder Engagement Plan</option>
                                <option value="Supporting ESIA Evidence">Supporting ESIA Evidence</option>
                              </>
                            ) : (
                              <>
                                <option value="Comprehensive ESDD Report">Comprehensive ESDD Report</option>
                                <option value="ESDD Due Diligence Checklist">ESDD Due Diligence Checklist</option>
                                <option value="ESDD Compliance Audit Report">ESDD Compliance Audit Report</option>
                                <option value="Site Legacy Contamination Study">Site Legacy Contamination Study</option>
                                <option value="Corrective Action Plan Draft">Corrective Action Plan Draft</option>
                                <option value="Supporting ESDD Evidence">Supporting ESDD Evidence</option>
                              </>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-semibold text-muted-foreground uppercase mb-1">Document Name (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Site Visit Notes July"
                            value={uploadName}
                            onChange={(e) => setUploadName(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg p-2 text-[12px] text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-semibold text-muted-foreground uppercase mb-1">Select File</label>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.xlsx,.docx,.doc"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                            }}
                          />
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border border-dashed border-border/80 hover:border-primary/50 rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-card/60 hover:bg-muted/40 transition-colors"
                          >
                            <UploadCloud className="h-6 w-6 text-muted-foreground" />
                            <span className="text-[12px] font-medium text-foreground">
                              {selectedFile ? selectedFile.name : "Click to select or drag and drop a file"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">PDF, XLSX, DOCX up to 10MB</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!selectedFile}
                        className="w-full bg-primary hover:bg-primary/95 text-white disabled:opacity-50 disabled:cursor-not-allowed py-2 px-3 rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
                      >
                        Upload Document
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsUploading(true)}
                      className="flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed border-border/80 hover:border-primary/50 hover:bg-muted/40 px-4 py-5 text-center transition-colors cursor-pointer"
                    >
                      <Upload className="h-5.5 w-5.5 text-muted-foreground" />
                      <span className="text-[12px] font-bold text-foreground">
                        {activePanelTab === "screening" 
                          ? "Upload screening document" 
                          : activeLifecycle?.branch === "greenfield" 
                          ? "Upload ESIA document" 
                          : "Upload ESDD document"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {activePanelTab === "screening" 
                          ? "Attach reports, checksheets, or site visit logs" 
                          : "Attach study findings, checklists, or audit reports"}
                      </span>
                    </button>
                  )}

                  {/* Document List */}
                  {(activePanelTab === "screening" ? documents : esddDocuments).length === 0 ? (
                    <div className="rounded-xl border border-border border-dashed p-8 text-center text-muted-foreground">
                      No documents uploaded yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {(activePanelTab === "screening" ? documents : esddDocuments).map((doc) => {
                        const latest = doc.versions[0];
                        if (!latest) return null;
                        const isExpanded = !!expandedDocHistories[doc.id];
                        
                        return (
                          <div key={doc.id} className="rounded-xl border border-border/60 bg-card/85 p-3.5 space-y-3 shadow-xs">
                            <div className="flex justify-between items-start gap-4">
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-bold text-[12.5px] text-foreground truncate max-w-[280px]">
                                    {doc.name}
                                  </span>
                                  <span className="text-[9.5px] font-extrabold uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded leading-none">
                                    {latest.version}
                                  </span>
                                  <span className="text-[9px] font-bold uppercase bg-primary/8 text-primary px-1.5 py-0.5 rounded leading-none">
                                    {latest.fileType}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                                  <span className="font-semibold text-foreground/80">{doc.category}</span>
                                  <span>·</span>
                                  <span>by {latest.uploadedBy.split(" ")[0]}</span>
                                  <span>·</span>
                                  <span className="num font-medium">{latest.uploadedOn}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <span className={cn(
                                  "inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider",
                                  latest.status === "approved" && "bg-success/10 text-success",
                                  latest.status === "under-review" && "bg-warning/10 text-warning",
                                  latest.status === "draft" && "bg-muted text-muted-foreground"
                                )}>
                                  {latest.status === "approved" ? "Approved" : latest.status === "under-review" ? "Under Review" : "Draft"}
                                </span>
                              </div>
                            </div>

                            {/* Document row actions */}
                            <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-[11px] font-semibold text-primary">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewSingle(doc.name)}
                                  className="hover:underline cursor-pointer"
                                >
                                  View
                                </button>
                                <span className="text-muted-foreground/30">·</span>
                                <button
                                  onClick={() => handleDownloadSingle(doc.name)}
                                  className="hover:underline cursor-pointer"
                                >
                                  Download
                                </button>
                                <span className="text-muted-foreground/30">·</span>
                                <button
                                  onClick={() => triggerNewVersionUpload(doc.id)}
                                  className="hover:underline cursor-pointer"
                                >
                                  Upload Version
                                </button>
                              </div>
                              <button
                                onClick={() => toggleHistory(doc.id)}
                                className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground hover:underline text-[10.5px] font-medium cursor-pointer"
                              >
                                {isExpanded ? "Hide History" : "Version History"}
                                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")} />
                              </button>
                            </div>

                            {/* Expanded Version History timeline */}
                            {isExpanded && (
                              <div className="border-t border-border/40 pt-3 mt-1.5 space-y-3 bg-muted/10 rounded-lg p-2.5">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Version Log</div>
                                <ol className="space-y-3 relative border-l border-border/80 pl-4 ml-1.5 text-left">
                                  {doc.versions.map((v, i) => (
                                    <li key={`${v.version}-${i}`} className="relative">
                                      {/* Timeline dot */}
                                      <span className={cn(
                                        "absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full border",
                                        v.status === "approved" ? "bg-success border-success" : v.status === "under-review" ? "bg-warning border-warning" : "bg-muted-foreground/60 border-muted-foreground/60"
                                      )} />
                                      <div className="text-[11.5px] flex items-center justify-between">
                                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                                          <span>Version {v.version}</span>
                                          <span className={cn(
                                            "text-[8.5px] font-bold uppercase px-1 rounded",
                                            v.status === "approved" && "bg-success/10 text-success",
                                            v.status === "under-review" && "bg-warning/10 text-warning",
                                            v.status === "draft" && "bg-muted text-muted-foreground"
                                          )}>
                                            {v.status}
                                          </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground num">{v.uploadedOn}</span>
                                      </div>
                                      <div className="text-[10.5px] text-muted-foreground mt-0.5">
                                        Uploaded by <strong className="text-foreground/80 font-medium">{v.uploadedBy}</strong> ({v.size})
                                      </div>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </PanelCard>
      </div>
    );
  }
