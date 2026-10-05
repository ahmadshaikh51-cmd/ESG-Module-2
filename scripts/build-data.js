import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const excelPath = 'C:\\Users\\Infoage_01\\Downloads\\TMPL-ESG Data_Inception to Dec 2025 (2) 1.xlsx';
const wb = XLSX.readFile(excelPath);

const PROJECTS_META = [
  {
    id: 'TMBPL',
    name: 'TMBPL',
    client: 'MBMT',
    vehicleType: 'E-Bus',
    businessType: 'B2G',
    trackerFleetSize: 57,
    misStatus: 'Available (Oct-23 to Jul-26)',
    hasMonthlyData: true,
  },
  {
    id: 'TUPL',
    name: 'TUPL',
    client: 'UMC',
    vehicleType: 'E-Bus',
    businessType: 'B2G',
    trackerFleetSize: 20,
    misStatus: 'Available (Mar-24 to Jun-26)',
    hasMonthlyData: true,
  },
  {
    id: 'TEOPL',
    name: 'TEOPL',
    client: 'Volvo Eicher Commercial Vehicle Ltd',
    vehicleType: 'E-Bus',
    businessType: 'B2B',
    trackerFleetSize: 63,
    misStatus: 'Available (Jan-25 to Mar-26)',
    hasMonthlyData: true,
  },
  {
    id: 'NTSPL',
    name: 'NTSPL',
    client: 'Nagpur Municipal Corporation (Wathoda & Khapri)',
    vehicleType: 'E-Bus',
    businessType: 'B2G',
    trackerFleetSize: 235,
    misStatus: 'Available (Jul-25 to Mar-26)',
    hasMonthlyData: true,
  },
  {
    id: 'UCL',
    name: 'UCL',
    client: 'Ultratech Cement Limited',
    vehicleType: 'E-Truck',
    businessType: 'B2B',
    trackerFleetSize: 70,
    misStatus: 'Available (Mar-25 to Jul-26)',
    hasMonthlyData: true,
  },
  {
    id: 'SCL',
    name: 'SCL',
    client: 'Star Cement Limited',
    vehicleType: 'E-Truck',
    businessType: 'B2B',
    trackerFleetSize: 5,
    misStatus: 'Available (Nov-25 to Jul-26)',
    hasMonthlyData: true,
  },
  {
    id: 'JM_BAXI',
    name: 'JM BAXI',
    client: 'JM Baxi (Kandla Port)',
    vehicleType: 'E-Truck',
    businessType: 'B2B',
    trackerFleetSize: 36,
    misStatus: 'Available (May-26 to Jul-26)',
    hasMonthlyData: true,
  },
  {
    id: 'WONDERVOLT',
    name: 'Wondervolt',
    client: 'Wonder Cement Limited',
    vehicleType: 'E-Truck',
    businessType: 'B2B',
    trackerFleetSize: 6,
    misStatus: 'No monthly MIS data in source files',
    hasMonthlyData: false,
  },
  {
    id: 'JNPT',
    name: 'JNPT',
    client: 'Port of Singapore Authority',
    vehicleType: 'E-Truck',
    businessType: 'B2B',
    trackerFleetSize: 25,
    misStatus: 'No monthly MIS data in source files',
    hasMonthlyData: false,
  },
  {
    id: 'BMCT',
    name: 'BMCT',
    client: 'Gateway Terminal of India',
    vehicleType: 'E-Truck',
    businessType: 'B2B',
    trackerFleetSize: 49,
    misStatus: 'No monthly MIS data in source files',
    hasMonthlyData: false,
  },
];

const NON_OPERATIONAL_PROJECTS = [
  { name: 'Tata Steel (Kalamboli/Khapoli/Taloja)', client: 'Tata Steel Limited', type: 'E-Truck' },
  { name: 'Jindal Steel (Angul)', client: 'Jindal Steel Limited', type: 'E-Truck' },
  { name: 'Pune', client: 'Pune Mahanagar Parivahan Mandal Limited', type: 'E-Bus' },
  { name: 'Delhi', client: 'Delhi Transport Corporation', type: 'E-Bus' },
  { name: 'Maharashtra 7 depots', client: 'Multiple municipal corporations', type: 'E-Bus' },
];

function excelDateToYYYYMM(val) {
  if (typeof val === 'number') {
    const date = XLSX.SSF.parse_date_code(val);
    const y = date.y;
    const m = String(date.m).padStart(2, '0');
    return `${y}-${m}`;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed === '-' || trimmed.startsWith('Total')) return null;
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    }
  }
  return null;
}

function cleanVal(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const s = v.trim().replace(/,/g, '');
    if (s === '' || s === '-' || s === ' -   ' || s === 'No Data') return null;
    const n = Number(s);
    return isNaN(n) ? null : n;
  }
  return null;
}

const sheetsMap = {
  'TMBPL': 'TMBPL',
  'TUPL': 'TUPL',
  'TEOPL': 'TEOPL',
  'NTSPL': 'NTSPL',
  'UCL': 'UCL',
  'SCL': 'SCL',
  'JM_BAXI': 'JM BAXI',
};

const monthlyRecords = [];

Object.entries(sheetsMap).forEach(([projId, sheetName]) => {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return;
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  let headerIdx = -1;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i] || [];
    if (row.some(c => String(c).trim().toLowerCase() === 'month')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return;
  
  const headers = rows[headerIdx].map(h => String(h).replace(/[\r\n]+/g, ' ').trim());
  const monthCol = headers.findIndex(h => /^month$/i.test(h));
  const vehicleCol = headers.findIndex(h => /vehicle.*count/i.test(h));
  const kmCol = headers.findIndex(h => /run.*km/i.test(h));
  const tonnageCol = headers.findIndex(h => /tonnage/i.test(h));
  const passCol = headers.findIndex(h => /passenger.*count/i.test(h));
  const kwhCol = headers.findIndex(h => {
    const norm = h.toLowerCase();
    if (norm.includes('mwh')) return false;
    return norm.includes('kwh') || norm.includes('energy') || norm.includes('consumption');
  });

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row[monthCol] === undefined || row[monthCol] === null) continue;
    const monthCell = row[monthCol];
    if (String(monthCell).trim().startsWith('Total')) continue;
    
    const yyyymm = excelDateToYYYYMM(monthCell);
    if (!yyyymm) continue;
    
    const vehicles = cleanVal(row[vehicleCol]);
    const distanceKm = cleanVal(row[kmCol]);
    const tonnageMt = tonnageCol !== -1 ? cleanVal(row[tonnageCol]) : null;
    const passengers = passCol !== -1 ? cleanVal(row[passCol]) : null;
    const energyKwh = cleanVal(row[kwhCol]);

    // Derived formulas
    const dieselSavedL = distanceKm != null ? distanceKm / 3 : null;
    const co2t = dieselSavedL != null ? (dieselSavedL * 2.64) / 1000 : null;
    const noxKg = dieselSavedL != null ? dieselSavedL * 0.0048 : null;
    const so2Kg = dieselSavedL != null ? dieselSavedL * 0.04 : null;
    const pm25Kg = distanceKm != null ? distanceKm * 4e-6 : null;
    const pm10Kg = pm25Kg != null ? pm25Kg / 0.15 : null;
    const trees = co2t != null ? co2t * 42 : null;

    // Quality flags
    let vehicleQuality = vehicles != null ? 'reported' : 'missing';
    let kmQuality = distanceKm != null ? 'reported' : 'missing';
    let energyQuality = energyKwh != null ? 'reported' : 'missing';

    // Rule overrides per prompt
    if (projId === 'TMBPL') {
      const monthNum = parseInt(yyyymm.replace('-', ''));
      if (monthNum >= 202310 && monthNum <= 202403) {
        energyQuality = 'assumed';
      }
    }

    if (projId === 'TUPL' && yyyymm === '2026-07') {
      kmQuality = 'extrapolated';
      // Note: energy in TUPL Jul-26 is reported actual 135,739 kWh
      energyQuality = 'reported';
    }

    if (projId === 'TEOPL' && ['2026-04','2026-05','2026-06','2026-07'].includes(yyyymm)) {
      kmQuality = 'extrapolated';
      if (energyKwh != null) energyQuality = 'extrapolated';
    }

    if (projId === 'NTSPL' && ['2026-04','2026-05','2026-06','2026-07'].includes(yyyymm)) {
      kmQuality = 'extrapolated';
      vehicleQuality = 'carried_forward';
    }

    let derivedQuality = 'reported';
    if (kmQuality === 'extrapolated' || kmQuality === 'assumed') {
      derivedQuality = kmQuality;
    }

    monthlyRecords.push({
      projectId: projId,
      month: yyyymm,
      metrics: {
        vehicles,
        distanceKm,
        tonnageMt,
        passengers,
        energyKwh,
        dieselSavedL,
        co2t,
        noxKg,
        so2Kg,
        pm25Kg,
        pm10Kg,
        trees,
      },
      quality: {
        vehicles: vehicleQuality,
        distanceKm: kmQuality,
        energyKwh: energyQuality,
        derived: derivedQuality,
      },
    });
  }
});

const issues = [
  {
    id: 'iss-1',
    projectId: 'UCL',
    month: '2025-03 to 2025-05',
    metric: 'energyKwh',
    severity: 'review',
    message: 'kWh column appears shifted 1 month relative to MWh (e.g. Apr-25 kWh=75,108 while Mar-25 MWh=75.1). May-25 & Jun-25 MWh both 148.4. Needs verification.',
    sourceRef: 'UCL Sheet rows 5-7',
  },
  {
    id: 'iss-2',
    projectId: 'NTSPL',
    metric: 'energyKwh',
    severity: 'info',
    message: 'Energy is blank in kWh and 0 in MWh for all months (Jul-25 to Jul-26). Displays as "No energy data".',
    sourceRef: 'NTSPL Sheet Energy column',
  },
  {
    id: 'iss-3',
    projectId: 'TEOPL',
    month: '2026-01 to 2026-03',
    metric: 'energyKwh',
    severity: 'review',
    message: 'kWh is blank Jan-26 to Mar-26; Jul-25 kWh (508,207) is ~2.5x adjacent months (outlier).',
    sourceRef: 'TEOPL Sheet Energy column',
  },
  {
    id: 'iss-4',
    projectId: 'JM_BAXI',
    month: '2026-05',
    metric: 'distanceKm',
    severity: 'info',
    message: 'Run km and derived metrics are text "-" while vehicles (14) and energy (20 MWh) are reported.',
    sourceRef: 'JM BAXI Sheet row 5',
  },
  {
    id: 'iss-5',
    projectId: 'JM_BAXI',
    metric: 'derivedMetrics',
    severity: 'info',
    message: 'Derived values in source sheet are rounded to integers (e.g., PM2.5 displays 0). Note reduced precision.',
    sourceRef: 'JM BAXI Sheet',
  },
  {
    id: 'iss-6',
    projectId: 'UCL',
    severity: 'info',
    message: 'Sheet header contains copy-paste error (TMBPL company name & depot location). Client and type correctly mapped from Category Summary.',
    sourceRef: 'UCL Sheet header row 1-3',
  },
  {
    id: 'iss-7',
    projectId: 'SCL',
    severity: 'info',
    message: 'Sheet header contains copy-paste error (TMBPL company name & depot location). Client and type correctly mapped from Category Summary.',
    sourceRef: 'SCL Sheet header row 1-3',
  },
  {
    id: 'iss-8',
    projectId: 'NTSPL',
    metric: 'vehicles',
    severity: 'info',
    message: 'Fleet size mismatch: Tracker fleet size (235) vs latest MIS active count (100).',
    sourceRef: 'Category Summary vs NTSPL Sheet',
  },
  {
    id: 'iss-9',
    projectId: 'UCL',
    metric: 'vehicles',
    severity: 'info',
    message: 'Fleet size mismatch: Tracker fleet size (70) vs latest MIS active count (67).',
    sourceRef: 'Category Summary vs UCL Sheet',
  },
  {
    id: 'iss-10',
    projectId: 'JM_BAXI',
    metric: 'vehicles',
    severity: 'info',
    message: 'Fleet size mismatch: Tracker fleet size (36) vs latest MIS active count (18).',
    sourceRef: 'Category Summary vs JM BAXI Sheet',
  },
];

const outData = {
  projects: PROJECTS_META,
  nonOperationalProjects: NON_OPERATIONAL_PROJECTS,
  monthlyRecords,
  issues,
};

fs.writeFileSync(
  path.join(process.cwd(), 'src/lib/esg-site-monitoring-data.json'),
  JSON.stringify(outData, null, 2)
);

console.log('Successfully updated src/lib/esg-site-monitoring-data.json');
