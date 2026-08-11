import React, { createContext, useContext, useState, useEffect } from "react";

export type ChargerStatus = "available" | "charging" | "faulted" | "maintenance";

export interface ChargerSession {
  sessionId: string;
  vehicleNumber: string;
  fleet: string;
  socCurrent: number;
  socTarget: number;
  powerKw: number;
  voltage: number;
  current: number;
  energyDelivered: number;
  efficiency: number;
  costInr: number;
  durationMin: number;
  etaMins: number;
}

export interface Charger {
  id: string;
  depotId: string;
  depotName: string;
  status: ChargerStatus;
  powerRatingKw: number;
  connectorType: string;
  voltage: number;
  current: number;
  powerFactor: number;
  temperature: number;
  firmware: string;
  commsStatus: "online" | "offline";
  ocppStatus: string;
  heartbeatSecs: number;
  manufacturer: string;
  model: string;
  currentSession: ChargerSession | null;
}

export interface WaitingVehicle {
  id: string;
  vehicleNumber: string;
  socCurrent: number;
  socRequired: number;
  nextTripTime: string;
  departureTime: string;
  priority: "high" | "medium" | "low";
  recommendedChargerId: string;
  estimatedWaitMins: number;
  queuePosition: number;
  aiPriorityScore: number;
}

export interface MaintenanceItem {
  id: string;
  chargerId: string;
  depotName: string;
  faultType: string;
  priority: "critical" | "warning" | "healthy";
  assignedEngineer: string;
  slaCountdownSecs: number;
  status: "scheduled" | "in_progress" | "completed";
  checklist: { id: string; label: string; checked: boolean }[];
  notes: string;
}

export interface TodSession {
  id: string;
  vehicleNumber: string;
  chargerId: string;
  hour: number;
  durationHours: number;
  demandKw: number;
  costInr: number;
}

export interface BillReconciliation {
  id: string;
  month: string;
  depotName: string;
  discomBillKwh: number;
  discomAmount: number;
  meterKwh: number;
  calculatedKwh: number;
  calculatedAmount: number;
  variancePct: number;
  status: "pending" | "approved";
}

interface ChargingSystemContextType {
  chargers: Charger[];
  queue: WaitingVehicle[];
  maintenance: MaintenanceItem[];
  todSessions: TodSession[];
  bills: BillReconciliation[];
  startChargerSession: (chargerId: string, vehicleNumber: string) => void;
  stopChargerSession: (chargerId: string) => void;
  restartCharger: (chargerId: string) => void;
  resetCharger: (chargerId: string) => void;
  updateChargerStatus: (chargerId: string, status: ChargerStatus) => void;
  reorderQueue: (draggedId: string, hoverId: string) => void;
  moveQueueItem: (id: string, direction: "up" | "down") => void;
  updateSessionHour: (sessionId: string, newHour: number) => void;
  toggleChecklistItem: (maintenanceId: string, checklistId: string) => void;
  completeMaintenanceItem: (maintenanceId: string) => void;
  approveBill: (billId: string) => void;
}

const ChargingSystemContext = createContext<ChargingSystemContextType | undefined>(undefined);

const INITIAL_CHARGERS: Charger[] = [
  {
    id: "TV-KHA-01",
    depotId: "dep_khapri",
    depotName: "Khapri",
    status: "charging",
    powerRatingKw: 240,
    connectorType: "CCS2 Dual",
    voltage: 680,
    current: 310,
    powerFactor: 0.98,
    temperature: 42,
    firmware: "v4.1.12-PROD",
    commsStatus: "online",
    ocppStatus: "Heartbeat Ok",
    heartbeatSecs: 8,
    manufacturer: "Delta Electronics",
    model: "UFC 200",
    currentSession: {
      sessionId: "sess_01",
      vehicleNumber: "MH-31-EQ-1002",
      fleet: "Nagpur Metro feeder",
      socCurrent: 62,
      socTarget: 90,
      powerKw: 210,
      voltage: 678,
      current: 309,
      energyDelivered: 84.5,
      efficiency: 94.2,
      costInr: 932,
      durationMin: 28,
      etaMins: 14,
    },
  },
  {
    id: "TV-KHA-02",
    depotId: "dep_khapri",
    depotName: "Khapri",
    status: "available",
    powerRatingKw: 120,
    connectorType: "CCS2 Single",
    voltage: 0,
    current: 0,
    powerFactor: 1.0,
    temperature: 28,
    firmware: "v4.1.10-PROD",
    commsStatus: "online",
    ocppStatus: "Available",
    heartbeatSecs: 14,
    manufacturer: "Delta Electronics",
    model: "DC Fast 120",
    currentSession: null,
  },
  {
    id: "TV-WAD-01",
    depotId: "dep_wadi",
    depotName: "Wadi",
    status: "charging",
    powerRatingKw: 240,
    connectorType: "CCS2 Dual",
    voltage: 645,
    current: 220,
    powerFactor: 0.96,
    temperature: 45,
    firmware: "v3.8.9-PROD",
    commsStatus: "online",
    ocppStatus: "Heartbeat Ok",
    heartbeatSecs: 12,
    manufacturer: "ABB",
    model: "Terra 184",
    currentSession: {
      sessionId: "sess_02",
      vehicleNumber: "MH-31-EQ-1005",
      fleet: "Wadi Shuttle",
      socCurrent: 44,
      socTarget: 80,
      powerKw: 142,
      voltage: 645,
      current: 220,
      energyDelivered: 112.4,
      efficiency: 92.8,
      costInr: 1236,
      durationMin: 46,
      etaMins: 22,
    },
  },
  {
    id: "TV-WAD-02",
    depotId: "dep_wadi",
    depotName: "Wadi",
    status: "faulted",
    powerRatingKw: 120,
    connectorType: "CCS2 Single",
    voltage: 0,
    current: 0,
    powerFactor: 0,
    temperature: 68,
    firmware: "v3.8.5-PROD",
    commsStatus: "offline",
    ocppStatus: "Faulted - Temp Alert",
    heartbeatSecs: 900,
    manufacturer: "ABB",
    model: "Terra 124",
    currentSession: null,
  },
  {
    id: "TV-BKC-01",
    depotId: "dep_bkc",
    depotName: "BKC Mumbai",
    status: "charging",
    powerRatingKw: 240,
    connectorType: "CCS2 Dual",
    voltage: 710,
    current: 320,
    powerFactor: 0.99,
    temperature: 48,
    firmware: "v4.5.2-PROD",
    commsStatus: "online",
    ocppStatus: "Heartbeat Ok",
    heartbeatSecs: 5,
    manufacturer: "Delta Electronics",
    model: "UFC 200",
    currentSession: {
      sessionId: "sess_03",
      vehicleNumber: "MH-02-FL-4001",
      fleet: "BKC Premium Line",
      socCurrent: 78,
      socTarget: 95,
      powerKw: 227,
      voltage: 708,
      current: 320,
      energyDelivered: 54.2,
      efficiency: 95.1,
      costInr: 650,
      durationMin: 18,
      etaMins: 8,
    },
  },
  {
    id: "TV-BKC-02",
    depotId: "dep_bkc",
    depotName: "BKC Mumbai",
    status: "maintenance",
    powerRatingKw: 240,
    connectorType: "CCS2 Dual",
    voltage: 0,
    current: 0,
    powerFactor: 0,
    temperature: 24,
    firmware: "v4.5.1-MAINT",
    commsStatus: "online",
    ocppStatus: "Maintenance Mode",
    heartbeatSecs: 20,
    manufacturer: "Delta Electronics",
    model: "UFC 200",
    currentSession: null,
  },
];

const INITIAL_QUEUE: WaitingVehicle[] = [
  {
    id: "q_01",
    vehicleNumber: "MH-31-EQ-1008",
    socCurrent: 22,
    socRequired: 90,
    nextTripTime: "16:30",
    departureTime: "16:15",
    priority: "high",
    recommendedChargerId: "TV-KHA-02",
    estimatedWaitMins: 5,
    queuePosition: 1,
    aiPriorityScore: 94,
  },
  {
    id: "q_02",
    vehicleNumber: "MH-31-EQ-1014",
    socCurrent: 35,
    socRequired: 80,
    nextTripTime: "17:00",
    departureTime: "16:45",
    priority: "medium",
    recommendedChargerId: "TV-KHA-02",
    estimatedWaitMins: 15,
    queuePosition: 2,
    aiPriorityScore: 78,
  },
  {
    id: "q_03",
    vehicleNumber: "MH-31-EQ-1120",
    socCurrent: 45,
    socRequired: 85,
    nextTripTime: "18:00",
    departureTime: "17:30",
    priority: "low",
    recommendedChargerId: "TV-KHA-01",
    estimatedWaitMins: 35,
    queuePosition: 3,
    aiPriorityScore: 61,
  },
  {
    id: "q_04",
    vehicleNumber: "MH-02-FL-4008",
    socCurrent: 18,
    socRequired: 95,
    nextTripTime: "16:45",
    departureTime: "16:30",
    priority: "high",
    recommendedChargerId: "TV-BKC-01",
    estimatedWaitMins: 10,
    queuePosition: 4,
    aiPriorityScore: 92,
  },
];

const INITIAL_MAINTENANCE: MaintenanceItem[] = [
  {
    id: "maint_01",
    chargerId: "TV-WAD-02",
    depotName: "Wadi",
    faultType: "Thermal Overload Sensor Failure",
    priority: "critical",
    assignedEngineer: "Rajesh Kumar",
    slaCountdownSecs: 1400,
    status: "in_progress",
    checklist: [
      { id: "chk_1", label: "Perform visual connector inspection", checked: true },
      { id: "chk_2", label: "Verify cabinet exhaust fan functionality", checked: true },
      { id: "chk_3", label: "Clean thermal sink & debris filters", checked: false },
      { id: "chk_4", label: "Recalibrate heat sensors & boot test", checked: false },
    ],
    notes: "Exhaust fan clean but sensor reads 68C constantly. Running calibration.",
  },
  {
    id: "maint_02",
    chargerId: "TV-BKC-02",
    depotName: "BKC Mumbai",
    faultType: "Scheduled Preventive Maintenance",
    priority: "warning",
    assignedEngineer: "Sarah Fernandes",
    slaCountdownSecs: 7200,
    status: "scheduled",
    checklist: [
      { id: "chk_1", label: "Perform insulation resistance check", checked: false },
      { id: "chk_2", label: "Tighten busbars & electrical links", checked: false },
      { id: "chk_3", label: "Firmware audit & secure logs check", checked: false },
    ],
    notes: "6-month routine preventative checks.",
  },
];

const INITIAL_TOD_SESSIONS: TodSession[] = [
  {
    id: "tod_01",
    vehicleNumber: "MH-31-EQ-1002",
    chargerId: "TV-KHA-01",
    hour: 10,
    durationHours: 2,
    demandKw: 150,
    costInr: 1800,
  },
  {
    id: "tod_02",
    vehicleNumber: "MH-31-EQ-1005",
    chargerId: "TV-WAD-01",
    hour: 14,
    durationHours: 3,
    demandKw: 100,
    costInr: 3200,
  },
  {
    id: "tod_03",
    vehicleNumber: "MH-02-FL-4001",
    chargerId: "TV-BKC-01",
    hour: 18,
    durationHours: 1.5,
    demandKw: 200,
    costInr: 4500,
  },
  {
    id: "tod_04",
    vehicleNumber: "MH-31-EQ-1008",
    chargerId: "TV-KHA-02",
    hour: 6,
    durationHours: 4,
    demandKw: 90,
    costInr: 2400,
  },
];

const INITIAL_BILLS: BillReconciliation[] = [
  {
    id: "bill_01",
    month: "June 2026",
    depotName: "Khapri",
    discomBillKwh: 45200,
    discomAmount: 361600,
    meterKwh: 44950,
    calculatedKwh: 44800,
    calculatedAmount: 358400,
    variancePct: 0.89,
    status: "approved",
  },
  {
    id: "bill_02",
    month: "June 2026",
    depotName: "Wadi",
    discomBillKwh: 58900,
    discomAmount: 471200,
    meterKwh: 57100,
    calculatedKwh: 56900,
    calculatedAmount: 455200,
    variancePct: 3.51,
    status: "pending",
  },
  {
    id: "bill_03",
    month: "June 2026",
    depotName: "BKC Mumbai",
    discomBillKwh: 78100,
    discomAmount: 702900,
    meterKwh: 77800,
    calculatedKwh: 77500,
    calculatedAmount: 697500,
    variancePct: 0.77,
    status: "approved",
  },
];

export const ChargingSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chargers, setChargers] = useState<Charger[]>(INITIAL_CHARGERS);
  const [queue, setQueue] = useState<WaitingVehicle[]>(INITIAL_QUEUE);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>(INITIAL_MAINTENANCE);
  const [todSessions, setTodSessions] = useState<TodSession[]>(INITIAL_TOD_SESSIONS);
  const [bills, setBills] = useState<BillReconciliation[]>(INITIAL_BILLS);

  // SLA countdown timer ticking down
  useEffect(() => {
    const timer = setInterval(() => {
      setMaintenance((prev) =>
        prev.map((item) => {
          if (item.status !== "completed" && item.slaCountdownSecs > 0) {
            return { ...item, slaCountdownSecs: item.slaCountdownSecs - 1 };
          }
          return item;
        }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const startChargerSession = (chargerId: string, vehicleNumber: string) => {
    setChargers((prev) =>
      prev.map((c) => {
        if (c.id === chargerId) {
          return {
            ...c,
            status: "charging",
            voltage: 680,
            current: 250,
            temperature: 36,
            currentSession: {
              sessionId: `sess_${Date.now()}`,
              vehicleNumber,
              fleet: "Ad-hoc Dispatch",
              socCurrent: 20,
              socTarget: 80,
              powerKw: 170,
              voltage: 680,
              current: 250,
              energyDelivered: 1.2,
              efficiency: 93.5,
              costInr: 15,
              durationMin: 1,
              etaMins: 35,
            },
          };
        }
        return c;
      }),
    );
  };

  const stopChargerSession = (chargerId: string) => {
    setChargers((prev) =>
      prev.map((c) => {
        if (c.id === chargerId) {
          return {
            ...c,
            status: "available",
            voltage: 0,
            current: 0,
            currentSession: null,
          };
        }
        return c;
      }),
    );
  };

  const restartCharger = (chargerId: string) => {
    setChargers((prev) =>
      prev.map((c) => {
        if (c.id === chargerId) {
          return {
            ...c,
            status: "available",
            voltage: 0,
            current: 0,
            ocppStatus: "Rebooting...",
            currentSession: null,
          };
        }
        return c;
      }),
    );
    // Simulate boot completion back to original state or available after 3 seconds
    setTimeout(() => {
      setChargers((prev) =>
        prev.map((c) => {
          if (c.id === chargerId) {
            return {
              ...c,
              ocppStatus: "Available",
            };
          }
          return c;
        }),
      );
    }, 3000);
  };

  const resetCharger = (chargerId: string) => {
    setChargers((prev) =>
      prev.map((c) => {
        if (c.id === chargerId) {
          return {
            ...c,
            status: "available",
            voltage: 0,
            current: 0,
            temperature: 26,
            ocppStatus: "Reset Completed",
            currentSession: null,
          };
        }
        return c;
      }),
    );
  };

  const updateChargerStatus = (chargerId: string, status: ChargerStatus) => {
    setChargers((prev) =>
      prev.map((c) => {
        if (c.id === chargerId) {
          return {
            ...c,
            status,
            currentSession: status !== "charging" ? null : c.currentSession,
          };
        }
        return c;
      }),
    );
  };

  const reorderQueue = (draggedId: string, hoverId: string) => {
    setQueue((prev) => {
      const copy = [...prev];
      const draggedIndex = copy.findIndex((q) => q.id === draggedId);
      const hoverIndex = copy.findIndex((q) => q.id === hoverId);
      if (draggedIndex === -1 || hoverIndex === -1) return prev;

      const [draggedItem] = copy.splice(draggedIndex, 1);
      copy.splice(hoverIndex, 0, draggedItem);

      // Re-assign queue positions
      return copy.map((item, index) => ({
        ...item,
        queuePosition: index + 1,
      }));
    });
  };

  const moveQueueItem = (id: string, direction: "up" | "down") => {
    setQueue((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;

      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[swapIdx];
      copy[swapIdx] = temp;

      return copy.map((item, index) => ({
        ...item,
        queuePosition: index + 1,
      }));
    });
  };

  const updateSessionHour = (sessionId: string, newHour: number) => {
    setTodSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          // Recompute cost based on time of day bands:
          // Peak (18-22): 10 INR/kWh
          // Normal (6-10, 14-18, 22-24): 8 INR/kWh
          // Off-Peak (0-6, 10-14): 6 INR/kWh
          const isPeak = newHour >= 18 && newHour <= 22;
          const isOffPeak = (newHour >= 0 && newHour < 6) || (newHour >= 10 && newHour < 14);
          const rate = isPeak ? 10 : isOffPeak ? 6 : 8;
          const newCost = s.demandKw * s.durationHours * rate;

          return {
            ...s,
            hour: newHour,
            costInr: newCost,
          };
        }
        return s;
      }),
    );
  };

  const toggleChecklistItem = (maintenanceId: string, checklistId: string) => {
    setMaintenance((prev) =>
      prev.map((m) => {
        if (m.id === maintenanceId) {
          const updatedChecklist = m.checklist.map((c) =>
            c.id === checklistId ? { ...c, checked: !c.checked } : c,
          );
          return {
            ...m,
            checklist: updatedChecklist,
          };
        }
        return m;
      }),
    );
  };

  const completeMaintenanceItem = (maintenanceId: string) => {
    setMaintenance((prev) =>
      prev.map((m) => {
        if (m.id === maintenanceId) {
          const chargerId = m.chargerId;
          setChargers((cList) =>
            cList.map((c) => (c.id === chargerId ? { ...c, status: "available" } : c)),
          );
          return {
            ...m,
            status: "completed",
            checklist: m.checklist.map((c) => ({ ...c, checked: true })),
          };
        }
        return m;
      }),
    );
  };

  const approveBill = (billId: string) => {
    setBills((prev) => prev.map((b) => (b.id === billId ? { ...b, status: "approved" } : b)));
  };

  return (
    <ChargingSystemContext.Provider
      value={{
        chargers,
        queue,
        maintenance,
        todSessions,
        bills,
        startChargerSession,
        stopChargerSession,
        restartCharger,
        resetCharger,
        updateChargerStatus,
        reorderQueue,
        moveQueueItem,
        updateSessionHour,
        toggleChecklistItem,
        completeMaintenanceItem,
        approveBill,
      }}
    >
      {children}
    </ChargingSystemContext.Provider>
  );
};

export const useChargingSystem = () => {
  const context = useContext(ChargingSystemContext);
  if (context === undefined) {
    throw new Error("useChargingSystem must be used within a ChargingSystemProvider");
  }
  return context;
};
