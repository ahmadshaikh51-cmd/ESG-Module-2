/**
 * Site monitoring workflow — Data-Aware Field Observations & Ambient Tracking (Phase 6).
 *
 * Captures qualitative observations, compliance status, risk severity, photographic
 * evidence, and corrective action lifecycle, linked to quantitative Environment Metadata.
 * Also manages ambient parameter readings (Air, Water, Noise) against CPCB limits.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ESG_GROUP,
  ESG_TODAY,
  INITIAL_DRINKING_WATER_RECORDS,
  INITIAL_VEHICLE_DATA_RECORDS,
  INITIAL_WASTE_WATER_RECORDS,
  MONITORING_PARAMS,
  MONITORING_READINGS,
  monitoringParamByKey,
  type DrinkingWaterRecord,
  type LabTestTypeKey,
  type MonitoringAreaKey,
  type Provenance,
  type VehicleDataRecord,
  type WasteWaterRecord,
} from "./esg-data";

export type ComplianceStatus =
  | "compliant"
  | "partially_compliant"
  | "non_compliant"
  | "not_applicable";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type ActionStatus = "open" | "in_progress" | "closed" | "overdue";

export interface MonitoringEvidence {
  id: string;
  name: string;
  type: "photo" | "document" | "manifest" | "lab_report";
  size: string;
  url?: string;
  uploadedAt: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  ownerId: string;
  ownerName: string;
  targetDate: string;
  status: ActionStatus;
  closureDate?: string;
  closureRemarks?: string;
}

export interface SiteObservation {
  id: string;
  entityId: string;
  depotId: string;
  depotName: string;
  entityName: string;
  monitoringDate: string; // "YYYY-MM-DD"
  period: string; // derived "YYYY-MM"
  monitorId: string;
  monitorName: string;
  monitoringArea: MonitoringAreaKey;
  areaLabel: string;
  observation: string;
  compliance: ComplianceStatus;
  severity: SeverityLevel;
  evidence: MonitoringEvidence[];
  correctiveAction?: CorrectiveAction;
  metadataSnapshot?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_SITE_OBSERVATIONS: SiteObservation[] = [
  {
    id: "obs-2026-001",
    entityId: "mbmt",
    depotId: "kashimira",
    depotName: "Kashimira Depot",
    entityName: "MBMT E-Bus Operations",
    monitoringDate: "2026-07-14",
    period: "2026-07",
    monitorId: "rahul",
    monitorName: "Rahul Patil",
    monitoringArea: "hazardous_waste",
    areaLabel: "Hazardous Waste Management",
    observation:
      "Oil leakage observed near charging bay 3 spill containment tray. Secondary containment pallet showed hairline crack; approx 5L used gear oil seeped into catchment sump.",
    compliance: "non_compliant",
    severity: "high",
    evidence: [
      {
        id: "ev-001",
        name: "bay3_spill_tray_leak.jpg",
        type: "photo",
        size: "2.4 MB",
        uploadedAt: "2026-07-14T10:15:00+05:30",
      },
      {
        id: "ev-002",
        name: "sump_inspection_log.pdf",
        type: "document",
        size: "420 KB",
        uploadedAt: "2026-07-14T10:20:00+05:30",
      },
    ],
    correctiveAction: {
      id: "ca-001",
      description:
        "Replace damaged secondary spill containment pallet with MPCB-certified HDPE unit; deploy emergency spill absorption pads in bay 3.",
      ownerId: "rohan",
      ownerName: "Rohan Desai",
      targetDate: "2026-07-18",
      status: "in_progress",
    },
    metadataSnapshot: {
      wasteType: "Oil",
      quantity: "450 Litres",
      storage: "Dedicated Bunded Haz Shed (Bay 2)",
    },
    createdAt: "2026-07-14T10:30:00+05:30",
    updatedAt: "2026-07-14T10:30:00+05:30",
  },
  {
    id: "obs-2026-002",
    entityId: "mbmt",
    depotId: "kashimira",
    depotName: "Kashimira Depot",
    entityName: "MBMT E-Bus Operations",
    monitoringDate: "2026-07-12",
    period: "2026-07",
    monitorId: "priya",
    monitorName: "Priya Nair",
    monitoringArea: "drinking_water",
    areaLabel: "Drinking Water & Potability",
    observation:
      "RO purification unit and commercial water cooler inspected in driver rest room. Tested water TDS: 142 ppm (well within IS 10500 potable limit). Sanitisation log and filter tags verified current.",
    compliance: "compliant",
    severity: "low",
    evidence: [
      {
        id: "ev-003",
        name: "ro_filter_potability_certificate.pdf",
        type: "lab_report",
        size: "1.1 MB",
        uploadedAt: "2026-07-12T14:00:00+05:30",
      },
    ],
    metadataSnapshot: {
      drinkingWaterLitres: "4,800 Litres",
      tdsPpm: 142,
      waterSource: "Municipal Tap + 50 LPH RO Unit",
    },
    createdAt: "2026-07-12T14:15:00+05:30",
    updatedAt: "2026-07-12T14:15:00+05:30",
  },
  {
    id: "obs-2026-003",
    entityId: "mbmt",
    depotId: "bhayandar",
    depotName: "Bhayandar Depot",
    entityName: "MBMT E-Bus Operations",
    monitoringDate: "2026-07-10",
    period: "2026-07",
    monitorId: "rahul",
    monitorName: "Rahul Patil",
    monitoringArea: "energy_vehicle",
    areaLabel: "Energy Consumption & Vehicle Data",
    observation:
      "Reviewed end-of-month charging telemetry: 45 electric buses completed 386,060 km drawing 455,150 kWh (1.18 kWh/km intensity). Rooftop solar array generation meter calibrated; zero feeder line anomalies.",
    compliance: "compliant",
    severity: "low",
    evidence: [
      {
        id: "ev-004",
        name: "bhayandar_energy_telematics_sync.pdf",
        type: "document",
        size: "890 KB",
        uploadedAt: "2026-07-10T16:30:00+05:30",
      },
    ],
    metadataSnapshot: {
      vehicleCount: "45 Buses",
      runKm: "386,060 km",
      energyKwh: "455,150 kWh",
      energyIntensity: "1.18 kWh/km",
    },
    createdAt: "2026-07-10T16:45:00+05:30",
    updatedAt: "2026-07-10T16:45:00+05:30",
  },
  {
    id: "obs-2026-004",
    entityId: "mbmt",
    depotId: "bhayandar",
    depotName: "Bhayandar Depot",
    entityName: "MBMT E-Bus Operations",
    monitoringDate: "2026-06-25",
    period: "2026-06",
    monitorId: "priya",
    monitorName: "Priya Nair",
    monitoringArea: "non_hazardous_waste",
    areaLabel: "Non-Hazardous Solid Waste",
    observation:
      "Canteen food waste bin found mixed with plastic cutlery and cardboard drink cups. Segregation at source not being enforced by canteen contractor.",
    compliance: "partially_compliant",
    severity: "medium",
    evidence: [
      {
        id: "ev-005",
        name: "canteen_waste_unsegregated.jpg",
        type: "photo",
        size: "1.8 MB",
        uploadedAt: "2026-06-25T11:00:00+05:30",
      },
    ],
    correctiveAction: {
      id: "ca-002",
      description:
        "Provide color-coded two-bin waste station with Marathi/Hindi pictorial signage in canteen and conduct vendor awareness briefing.",
      ownerId: "arjun",
      ownerName: "Arjun Mehta",
      targetDate: "2026-07-05", // past date -> Overdue
      status: "open",
    },
    metadataSnapshot: {
      dryWaste: "140 Kg",
      wetWaste: "160 Kg",
      disposal: "MBMC Municipal Composting",
    },
    createdAt: "2026-06-25T11:30:00+05:30",
    updatedAt: "2026-06-25T11:30:00+05:30",
  },
  {
    id: "obs-2026-005",
    entityId: "silvassa",
    depotId: "silvassa-depot",
    depotName: "Silvassa Depot",
    entityName: "Silvassa City SPV",
    monitoringDate: "2026-07-08",
    period: "2026-07",
    monitorId: "rahul",
    monitorName: "Rahul Patil",
    monitoringArea: "wastewater",
    areaLabel: "Wastewater & Effluent (ETP/STP)",
    observation:
      "Wash bay oil-water separator and sand filtration unit inspected during active bus washing cycle. Treated water recycled 100% back into chassis wash pump. Effluent pH 7.2, BOD 18 mg/L (well within PCC threshold).",
    compliance: "compliant",
    severity: "low",
    evidence: [
      {
        id: "ev-006",
        name: "etp_water_lab_report_jul26.pdf",
        type: "lab_report",
        size: "950 KB",
        uploadedAt: "2026-07-08T15:20:00+05:30",
      },
    ],
    metadataSnapshot: {
      effluentTreated: "8.5 KL",
      treatmentFacility: "Depot ETP",
      mode: "100% Recycled for Bus Washing (ZLD)",
    },
    createdAt: "2026-07-08T15:30:00+05:30",
    updatedAt: "2026-07-08T15:30:00+05:30",
  },
  {
    id: "obs-2026-006",
    entityId: "mbmt",
    depotId: "kashimira",
    depotName: "Kashimira Depot",
    entityName: "MBMT E-Bus Operations",
    monitoringDate: "2026-07-04",
    period: "2026-07",
    monitorId: "priya",
    monitorName: "Priya Nair",
    monitoringArea: "waste_disposal",
    areaLabel: "Waste Disposal & Recycler Dispatches",
    observation:
      "Verified Form 10 hazardous waste manifest (MPCB/HW/2026/07-882) for 450L spent lubricant dispatch to EcoLube Recycling Ltd. Transporter vehicle GPS tracked and authorized driver certificate verified.",
    compliance: "compliant",
    severity: "low",
    evidence: [
      {
        id: "ev-007",
        name: "form_10_manifest_ecolube.pdf",
        type: "manifest",
        size: "1.4 MB",
        uploadedAt: "2026-07-04T12:00:00+05:30",
      },
    ],
    metadataSnapshot: {
      manifestNumber: "MPCB/HW/2026/07-882",
      transporter: "CleanEarth Environmental Logistics",
      receiver: "Maharashtra Enviro Power Ltd",
    },
    createdAt: "2026-07-04T12:15:00+05:30",
    updatedAt: "2026-07-04T12:15:00+05:30",
  },
  {
    id: "obs-2026-007",
    entityId: "mbmt",
    depotId: "bhayandar",
    depotName: "Bhayandar Depot",
    entityName: "MBMT E-Bus Operations",
    monitoringDate: "2026-06-18",
    period: "2026-06",
    monitorId: "rahul",
    monitorName: "Rahul Patil",
    monitoringArea: "haz_consumption",
    areaLabel: "Hazardous Material Consumption",
    observation:
      "Workshop flammable storage cabinet grounding wire was loose. Spark risk identified during solvent dispensing.",
    compliance: "non_compliant",
    severity: "critical",
    evidence: [
      {
        id: "ev-008",
        name: "grounding_wire_loose.jpg",
        type: "photo",
        size: "3.1 MB",
        uploadedAt: "2026-06-18T09:30:00+05:30",
      },
      {
        id: "ev-009",
        name: "grounding_rectification_signed.pdf",
        type: "document",
        size: "520 KB",
        uploadedAt: "2026-06-19T11:00:00+05:30",
      },
    ],
    correctiveAction: {
      id: "ca-003",
      description:
        "Fasten heavy-duty copper bonding clip to grounding busbar; test earth resistance (< 1.0 Ohm).",
      ownerId: "prakash",
      ownerName: "Prakash Joshi",
      targetDate: "2026-06-20",
      status: "closed",
      closureDate: "2026-06-19",
      closureRemarks:
        "Electrical team installed certified copper earthing strap and verified resistance at 0.42 Ohm.",
    },
    metadataSnapshot: {
      dielectricCoolant: "40 Litres",
      gearLubricant: "25 Litres",
    },
    createdAt: "2026-06-18T10:00:00+05:30",
    updatedAt: "2026-06-19T11:15:00+05:30",
  },
];

/* ----------------------------- parameter readings ---------------------------- */

export type ReadingCell = { value: number | null; source: "manual" | "excel"; prov?: Provenance };

const keyOf = (paramKey: string, entityId: string, depotId: string, period: string) =>
  `${paramKey}|${entityId}|${depotId}|${period}`;

export type MonitoringBreach = {
  paramKey: string;
  entityId: string;
  depotId: string;
  period: string;
  value: number;
};

const ALL_DEPOTS = ESG_GROUP.entities.flatMap((e) =>
  e.depots.map((d) => ({ entityId: e.id, depotId: d.id })),
);

export interface MonitoringWorkflow {
  // Observations Workflow
  observations: SiteObservation[];
  addObservation: (obs: Omit<SiteObservation, "id" | "createdAt" | "updatedAt">) => void;
  updateObservation: (id: string, obs: Partial<SiteObservation>) => void;
  deleteObservation: (id: string) => void;
  closeCorrectiveAction: (id: string, closureRemarks: string, closureDate?: string) => void;
  updateActionStatus: (id: string, status: ActionStatus, remarks?: string) => void;

  // Parameter limits & readings workflow
  readingFor: (paramKey: string, entityId: string, depotId: string, period: string) => ReadingCell;
  setReading: (
    paramKey: string,
    entityId: string,
    depotId: string,
    period: string,
    value: number | null,
  ) => void;
  importReadings: (
    entityId: string,
    depotId: string,
    period: string,
    rows: { paramKey: string; value: number }[],
    sourceName: string,
  ) => void;
  breachesForPeriod: (period: string) => MonitoringBreach[];
}

const STORAGE_KEY = "voltline-site-observations";

export function getDerivedActionStatus(
  targetDate?: string,
  status?: ActionStatus,
): ActionStatus | undefined {
  if (!status) return undefined;
  if (status === "closed") return "closed";
  if (targetDate) {
    const todayStr = ESG_TODAY.toISOString().slice(0, 10);
    if (targetDate < todayStr) {
      return "overdue";
    }
  }
  return status;
}

export interface LabTestRecord {
  id: string;
  entityId: string;
  depotId: string;
  entityName: string;
  depotName: string;
  testType: LabTestTypeKey;
  testLabel: string;
  testDate: string;
  period: string;
  monitorName: string;
  results: Record<string, number | string | null>;
  evidence: MonitoringEvidence[];
  correctiveAction?: CorrectiveAction;
  overallCompliance: "within_limits" | "attention_required";
  testedCount: number;
  withinCount: number;
  exceedCount: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

const LAB_STORAGE_KEY = "voltline-lab-tests";

export const INITIAL_LAB_TEST_RECORDS: LabTestRecord[] = [
  {
    id: "lab-100",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    testType: "vehicle_data",
    testLabel: "Vehicle Data",
    testDate: "2026-08-01",
    period: "2026-08",
    monitorName: "Fleet Ops Lead",
    results: {
      vehicle_count: 45,
      run_km: 386060,
      energy_kwh: 455150,
    },
    evidence: [
      {
        id: "ev-veh-1",
        name: "Aug2026_MBMT_Fleet_Energy_Log.pdf",
        type: "document",
        size: "1.2 MB",
        uploadedAt: "2026-08-01T10:00:00Z",
      },
    ],
    overallCompliance: "within_limits",
    testedCount: 3,
    withinCount: 3,
    exceedCount: 0,
    remarks: "Monthly fleet operational log: 45 active buses, 386,060 km run, 455,150 kWh consumed (1.18 kWh/km).",
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "lab-101",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    testType: "dry_waste",
    testLabel: "Dry Waste",
    testDate: "2026-08-10",
    period: "2026-08",
    monitorName: "Store Supervisor",
    results: {
      date: 20260810,
      waste_type: null,
      qty_kg: 450,
    },
    evidence: [
      {
        id: "ev-lab-1",
        name: "Plastic_Waste_Recycling_Challan_Aug26.pdf",
        type: "document",
        size: "1.4 MB",
        uploadedAt: "2026-08-10T14:30:00Z",
      },
    ],
    overallCompliance: "within_limits",
    testedCount: 3,
    withinCount: 3,
    exceedCount: 0,
    remarks: "Plastic waste (450 kg) collected and dispatched to authorized MPCB recycler.",
    createdAt: "2026-08-10T14:30:00Z",
    updatedAt: "2026-08-10T14:30:00Z",
  },
  {
    id: "lab-102",
    entityId: "mbmt",
    depotId: "bhayandar",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Bhayandar Depot",
    testType: "wet_waste",
    testLabel: "Wet Waste",
    testDate: "2026-08-08",
    period: "2026-08",
    monitorName: "Facility Admin",
    results: {
      date: 20260808,
      waste_type: null,
      qty_kg: 280,
    },
    evidence: [
      {
        id: "ev-lab-2",
        name: "Canteen_Organic_Compost_Challan_Aug26.pdf",
        type: "document",
        size: "1.2 MB",
        uploadedAt: "2026-08-08T16:00:00Z",
      },
    ],
    overallCompliance: "within_limits",
    testedCount: 3,
    withinCount: 3,
    exceedCount: 0,
    remarks: "Canteen food waste and garden leaves (280 kg) processed in organic waste composter (OWC).",
    createdAt: "2026-08-08T16:00:00Z",
    updatedAt: "2026-08-08T16:00:00Z",
  },
  {
    id: "lab-103",
    entityId: "dnhdd",
    depotId: "silvassa-depot",
    entityName: "DNHDD (Silvassa)",
    depotName: "Silvassa Depot",
    testType: "hazardous_waste",
    testLabel: "Hazardous Waste",
    testDate: "2026-08-05",
    period: "2026-08",
    monitorName: "Workshop Engineer",
    results: {
      date: 20260805,
      vehicle_no: null,
      purpose: null,
      material_used: null,
      qty_litres: 45,
      qty_kg: null,
    },
    evidence: [
      {
        id: "ev-lab-3",
        name: "Hazardous_Used_Oil_Disposal_Manifest_Form10.pdf",
        type: "document",
        size: "1.2 MB",
        uploadedAt: "2026-08-05T11:00:00Z",
      },
    ],
    overallCompliance: "within_limits",
    testedCount: 5,
    withinCount: 5,
    exceedCount: 0,
    remarks: "Bus MH-04-GP-1204 scheduled hydraulic oil change (45 L) stored in secondary containment drum.",
    createdAt: "2026-08-05T11:00:00Z",
    updatedAt: "2026-08-05T11:00:00Z",
  },
  {
    id: "lab-104",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    testType: "drinking_water",
    testLabel: "Drinking Water",
    testDate: "2026-08-01",
    period: "2026-08",
    monitorName: "Facility Admin",
    results: {
      month_date: "Aug 2026",
      people_count: 120,
      qty_litres: 3600,
    },
    evidence: [
      {
        id: "ev-dw-1",
        name: "Aug2026_Drinking_Water_Dispenser_Log.pdf",
        type: "document",
        size: "950 KB",
        uploadedAt: "2026-08-01T10:00:00Z",
      },
    ],
    overallCompliance: "within_limits",
    testedCount: 3,
    withinCount: 3,
    exceedCount: 0,
    remarks: "Drinking water log: 120 staff/drivers, 3,600 litres consumed (30 L/person/month, ~1.0 L/person/day).",
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "lab-105",
    entityId: "mbmt",
    depotId: "bhayandar",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Bhayandar Depot",
    testType: "dry_waste",
    testLabel: "Dry Waste",
    testDate: "2026-06-15",
    period: "2026-06",
    monitorName: "Store In-charge",
    results: {
      date: 20260615,
      waste_type: null,
      qty_kg: 320,
    },
    evidence: [
      {
        id: "ev-lab-5",
        name: "Jun26_Cardboard_Recycling_Challan.pdf",
        type: "document",
        size: "1.1 MB",
        uploadedAt: "2026-06-15T15:00:00Z",
      },
    ],
    overallCompliance: "within_limits",
    testedCount: 3,
    withinCount: 3,
    exceedCount: 0,
    remarks: "Cardboard boxes, shipping cartons, and paper packaging waste (320 kg) collected for recycling.",
    createdAt: "2026-06-15T15:00:00Z",
    updatedAt: "2026-06-15T15:00:00Z",
  },
  {
    id: "lab-106",
    entityId: "mbmt",
    depotId: "kashimira",
    entityName: "MBMT (Mira-Bhayandar)",
    depotName: "Kashimira Depot",
    testType: "waste_water",
    testLabel: "Waste Water",
    testDate: "2026-08-01",
    period: "2026-08",
    monitorName: "ETP Operator",
    results: {
      month_date: "Aug 2026",
      qty_litres: 12500,
      sludge_qty: 350,
    },
    evidence: [
      {
        id: "ev-ww-1",
        name: "Aug2026_ETP_Effluent_Log_Challan.pdf",
        type: "document",
        size: "1.3 MB",
        uploadedAt: "2026-08-01T10:00:00Z",
      },
    ],
    overallCompliance: "within_limits",
    testedCount: 3,
    withinCount: 3,
    exceedCount: 0,
    remarks: "Depot wash-bay effluent treatment: 12,500 L treated and recycled; 350 kg dried sludge cake cleared to authorized disposal facility.",
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  },
];

export interface MonitoringWorkflow {
  // Field Observations
  observations: SiteObservation[];
  addObservation: (obs: Omit<SiteObservation, "id" | "createdAt" | "updatedAt">) => void;
  updateObservation: (id: string, patch: Partial<SiteObservation>) => void;
  deleteObservation: (id: string) => void;
  closeCorrectiveAction: (id: string, closureRemarks: string, closureDate?: string) => void;
  updateActionStatus: (id: string, status: ActionStatus, remarks?: string) => void;

  // Laboratory Tests & Regulatory Parameters
  labTests: LabTestRecord[];
  addLabTest: (test: Omit<LabTestRecord, "id" | "createdAt" | "updatedAt">) => void;
  updateLabTest: (id: string, patch: Partial<LabTestRecord>) => void;
  deleteLabTest: (id: string) => void;
  closeLabTestAction: (id: string, closureRemarks: string, closureDate?: string) => void;

  // Vehicle Data Records (Operational Fleet Monitoring)
  vehicleData: VehicleDataRecord[];
  addVehicleData: (record: Omit<VehicleDataRecord, "id" | "createdAt" | "updatedAt">) => void;
  updateVehicleData: (id: string, patch: Partial<VehicleDataRecord>) => void;
  deleteVehicleData: (id: string) => void;

  // Drinking Water Records (Operational Headcount & Volume Log)
  drinkingWaterData: DrinkingWaterRecord[];
  addDrinkingWaterData: (record: Omit<DrinkingWaterRecord, "id" | "createdAt" | "updatedAt">) => void;
  updateDrinkingWaterData: (id: string, patch: Partial<DrinkingWaterRecord>) => void;
  deleteDrinkingWaterData: (id: string) => void;

  // Waste Water Records (Operational Effluent & Sludge Log)
  wasteWaterData: WasteWaterRecord[];
  addWasteWaterData: (record: Omit<WasteWaterRecord, "id" | "createdAt" | "updatedAt">) => void;
  updateWasteWaterData: (id: string, patch: Partial<WasteWaterRecord>) => void;
  deleteWasteWaterData: (id: string) => void;

  // Legacy Parameter Cells
  readingFor: (paramKey: string, entityId: string, depotId: string, period: string) => ReadingCell;
  setReading: (
    paramKey: string,
    entityId: string,
    depotId: string,
    period: string,
    value: number | null,
  ) => void;
  importReadings: (
    entityId: string,
    depotId: string,
    period: string,
    rows: { paramKey: string; value: number }[],
    sourceName: string,
  ) => void;
  breachesForPeriod: (period: string) => MonitoringBreach[];
}

export function useMonitoringWorkflow(): MonitoringWorkflow {
  // 1. Observations State
  const [observations, setObservations] = useState<SiteObservation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_SITE_OBSERVATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(observations));
    } catch {
      // ignore
    }
  }, [observations]);

  const addObservation = useCallback(
    (obs: Omit<SiteObservation, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newObs: SiteObservation = {
        ...obs,
        id: `obs-${Date.now().toString(36)}`,
        createdAt: now,
        updatedAt: now,
      };
      setObservations((prev) => [newObs, ...prev]);
    },
    [],
  );

  const updateObservation = useCallback((id: string, patch: Partial<SiteObservation>) => {
    setObservations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
      ),
    );
  }, []);

  const deleteObservation = useCallback((id: string) => {
    setObservations((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const closeCorrectiveAction = useCallback(
    (id: string, closureRemarks: string, closureDate?: string) => {
      const todayStr = (closureDate || new Date().toISOString()).slice(0, 10);
      setObservations((prev) =>
        prev.map((item) => {
          if (item.id !== id || !item.correctiveAction) return item;
          return {
            ...item,
            correctiveAction: {
              ...item.correctiveAction,
              status: "closed",
              closureRemarks,
              closureDate: todayStr,
            },
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [],
  );

  const updateActionStatus = useCallback(
    (id: string, status: ActionStatus, remarks?: string) => {
      setObservations((prev) =>
        prev.map((item) => {
          if (item.id !== id || !item.correctiveAction) return item;
          return {
            ...item,
            correctiveAction: {
              ...item.correctiveAction,
              status,
              closureRemarks: remarks ?? item.correctiveAction.closureRemarks,
              closureDate: status === "closed" ? new Date().toISOString().slice(0, 10) : undefined,
            },
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [],
  );

  // 2. Lab Tests State
  const [labTests, setLabTests] = useState<LabTestRecord[]>(() => {
    try {
      const stored = localStorage.getItem(LAB_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migrate any legacy noise test records to drinking_water
          return parsed.map((item: LabTestRecord) => {
            if ((item.testType as string) === "noise") {
              return {
                ...item,
                testType: "drinking_water" as LabTestTypeKey,
                testLabel: "Drinking Water",
                results: {
                  month_date: item.period || "Aug 2026",
                  people_count: 120,
                  qty_litres: 3600,
                },
                testedCount: 3,
                withinCount: 3,
                exceedCount: 0,
                overallCompliance: "within_limits" as const,
                remarks: "Depot drinking water log: 120 staff/drivers, 3,600 litres consumed.",
              };
            }
            if ((item.testType as string) === "soil_runoff") {
              return {
                ...item,
                testType: "waste_water" as LabTestTypeKey,
                testLabel: "Waste Water",
                results: {
                  month_date: item.period || "Aug 2026",
                  qty_litres: 12500,
                  sludge_qty: 350,
                },
                testedCount: 3,
                withinCount: 3,
                exceedCount: 0,
                overallCompliance: "within_limits" as const,
                remarks: "Depot effluent & sludge log: 12,500 L wash-bay effluent treated; 350 kg sludge cake cleared.",
              };
            }
            return item;
          });
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_LAB_TEST_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(labTests));
    } catch {
      // ignore
    }
  }, [labTests]);

  const addLabTest = useCallback((test: Omit<LabTestRecord, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newTest: LabTestRecord = {
      ...test,
      id: `lab-${Date.now().toString(36)}`,
      createdAt: now,
      updatedAt: now,
    };
    setLabTests((prev) => [newTest, ...prev]);
  }, []);

  const updateLabTest = useCallback((id: string, patch: Partial<LabTestRecord>) => {
    setLabTests((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
      ),
    );
  }, []);

  const deleteLabTest = useCallback((id: string) => {
    setLabTests((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const closeLabTestAction = useCallback(
    (id: string, closureRemarks: string, closureDate?: string) => {
      const todayStr = (closureDate || new Date().toISOString()).slice(0, 10);
      setLabTests((prev) =>
        prev.map((item) => {
          if (item.id !== id || !item.correctiveAction) return item;
          return {
            ...item,
            correctiveAction: {
              ...item.correctiveAction,
              status: "closed",
              closureRemarks,
              closureDate: todayStr,
            },
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [],
  );

  // 3. Vehicle Data State
  const [vehicleData, setVehicleData] = useState<VehicleDataRecord[]>(() => {
    try {
      const stored = localStorage.getItem("voltline-vehicle-data");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_VEHICLE_DATA_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("voltline-vehicle-data", JSON.stringify(vehicleData));
    } catch {
      // ignore
    }
  }, [vehicleData]);

  const addVehicleData = useCallback(
    (record: Omit<VehicleDataRecord, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newRec: VehicleDataRecord = {
        ...record,
        id: `veh-${Date.now().toString(36)}`,
        createdAt: now,
        updatedAt: now,
      };
      setVehicleData((prev) => [newRec, ...prev]);
    },
    [],
  );

  const updateVehicleData = useCallback((id: string, patch: Partial<VehicleDataRecord>) => {
    setVehicleData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
      ),
    );
  }, []);

  const deleteVehicleData = useCallback((id: string) => {
    setVehicleData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 4. Drinking Water State
  const [drinkingWaterData, setDrinkingWaterData] = useState<DrinkingWaterRecord[]>(() => {
    try {
      const stored = localStorage.getItem("voltline-drinking-water-data");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_DRINKING_WATER_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("voltline-drinking-water-data", JSON.stringify(drinkingWaterData));
    } catch {
      // ignore
    }
  }, [drinkingWaterData]);

  const addDrinkingWaterData = useCallback(
    (record: Omit<DrinkingWaterRecord, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newRec: DrinkingWaterRecord = {
        ...record,
        id: `dw-${Date.now().toString(36)}`,
        createdAt: now,
        updatedAt: now,
      };
      setDrinkingWaterData((prev) => [newRec, ...prev]);
    },
    [],
  );

  const updateDrinkingWaterData = useCallback((id: string, patch: Partial<DrinkingWaterRecord>) => {
    setDrinkingWaterData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
      ),
    );
  }, []);

  const deleteDrinkingWaterData = useCallback((id: string) => {
    setDrinkingWaterData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 5. Waste Water State
  const [wasteWaterData, setWasteWaterData] = useState<WasteWaterRecord[]>(() => {
    try {
      const stored = localStorage.getItem("voltline-waste-water-data");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_WASTE_WATER_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("voltline-waste-water-data", JSON.stringify(wasteWaterData));
    } catch {
      // ignore
    }
  }, [wasteWaterData]);

  const addWasteWaterData = useCallback(
    (record: Omit<WasteWaterRecord, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newRec: WasteWaterRecord = {
        ...record,
        id: `ww-${Date.now().toString(36)}`,
        createdAt: now,
        updatedAt: now,
      };
      setWasteWaterData((prev) => [newRec, ...prev]);
    },
    [],
  );

  const updateWasteWaterData = useCallback((id: string, patch: Partial<WasteWaterRecord>) => {
    setWasteWaterData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
      ),
    );
  }, []);

  const deleteWasteWaterData = useCallback((id: string) => {
    setWasteWaterData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 4. Ambient Lab Parameters State (Legacy Cells for backward compatibility)
  const [overrides, setOverrides] = useState<Record<string, ReadingCell>>({});

  const readingFor = useCallback(
    (paramKey: string, entityId: string, depotId: string, period: string): ReadingCell => {
      const k = keyOf(paramKey, entityId, depotId, period);
      if (overrides[k]) return overrides[k];
      const seed = MONITORING_READINGS.find(
        (r) =>
          r.paramKey === paramKey &&
          r.entityId === entityId &&
          r.depotId === depotId &&
          r.period === period,
      );
      if (seed) return { value: seed.value, source: seed.source, prov: seed.prov };
      return { value: null, source: "manual" };
    },
    [overrides],
  );

  const setReading = useCallback(
    (paramKey: string, entityId: string, depotId: string, period: string, value: number | null) => {
      setOverrides((o) => ({
        ...o,
        [keyOf(paramKey, entityId, depotId, period)]: { value, source: "manual" },
      }));
    },
    [],
  );

  const importReadings = useCallback(
    (
      entityId: string,
      depotId: string,
      period: string,
      rows: { paramKey: string; value: number }[],
      sourceName: string,
    ) => {
      const prov: Provenance = { source: sourceName, fetchedAt: ESG_TODAY.toISOString() };
      setOverrides((o) => {
        const next = { ...o };
        for (const row of rows) {
          next[keyOf(row.paramKey, entityId, depotId, period)] = {
            value: row.value,
            source: "excel",
            prov,
          };
        }
        return next;
      });
    },
    [],
  );

  const breachesForPeriod = useCallback(
    (period: string): MonitoringBreach[] => {
      const out: MonitoringBreach[] = [];
      for (const { entityId, depotId } of ALL_DEPOTS) {
        for (const p of MONITORING_PARAMS) {
          const cell = readingFor(p.key, entityId, depotId, period);
          if (cellBreaches(p.key, cell.value)) {
            out.push({ paramKey: p.key, entityId, depotId, period, value: cell.value as number });
          }
        }
      }
      return out;
    },
    [readingFor],
  );

  return useMemo(
    () => ({
      observations,
      addObservation,
      updateObservation,
      deleteObservation,
      closeCorrectiveAction,
      updateActionStatus,
      labTests,
      addLabTest,
      updateLabTest,
      deleteLabTest,
      closeLabTestAction,
      vehicleData,
      addVehicleData,
      updateVehicleData,
      deleteVehicleData,
      drinkingWaterData,
      addDrinkingWaterData,
      updateDrinkingWaterData,
      deleteDrinkingWaterData,
      wasteWaterData,
      addWasteWaterData,
      updateWasteWaterData,
      deleteWasteWaterData,
      readingFor,
      setReading,
      importReadings,
      breachesForPeriod,
    }),
    [
      observations,
      addObservation,
      updateObservation,
      deleteObservation,
      closeCorrectiveAction,
      updateActionStatus,
      labTests,
      addLabTest,
      updateLabTest,
      deleteLabTest,
      closeLabTestAction,
      vehicleData,
      addVehicleData,
      updateVehicleData,
      deleteVehicleData,
      drinkingWaterData,
      addDrinkingWaterData,
      updateDrinkingWaterData,
      deleteDrinkingWaterData,
      wasteWaterData,
      addWasteWaterData,
      updateWasteWaterData,
      deleteWasteWaterData,
      readingFor,
      setReading,
      importReadings,
      breachesForPeriod,
    ],
  );
}

/** True when a value breaches its parameter's regulatory limit. */
export function cellBreaches(paramKey: string, value: number | null): boolean {
  const p = monitoringParamByKey(paramKey);
  return value != null && p?.limit != null && value > p.limit;
}

export const MONITORING_CATEGORY_LABEL: Record<string, string> = {
  air: "Air",
  water: "Water",
  noise: "Noise",
  waste: "Waste",
};

