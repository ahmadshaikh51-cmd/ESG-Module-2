import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const excelPath = 'C:\\Users\\Infoage_01\\Downloads\\TMPL-ESG Data_Inception to Dec 2025 (2) 1.xlsx';
const wb = XLSX.readFile(excelPath);
const sheets = ['TMBPL', 'TUPL', 'TEOPL', 'NTSPL', 'UCL', 'SCL', 'JM BAXI'];

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

const summary = {};

sheets.forEach(s => {
  const sheet = wb.Sheets[s];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  let headerIdx = -1;
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const row = rows[i] || [];
    if (row.some(c => String(c).trim().toLowerCase() === 'month')) {
      headerIdx = i;
      break;
    }
  }
  
  const headers = rows[headerIdx].map(h => String(h).replace(/[\r\n]+/g, ' ').trim());
  const monthCol = headers.findIndex(h => /^month$/i.test(h));
  const vehicleCol = headers.findIndex(h => /vehicle.*count/i.test(h));
  const kmCol = headers.findIndex(h => /run.*km/i.test(h));
  const kwhCol = headers.findIndex(h => {
    const norm = h.toLowerCase();
    if (norm.includes('mwh')) return false;
    return norm.includes('kwh') || norm.includes('energy') || norm.includes('consumption');
  });
  
  let totalKm = 0;
  let totalKwh = 0;
  let latestVehicles = null;
  let latestMonth = null;
  
  const records = [];
  
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row[monthCol] === undefined || row[monthCol] === null) continue;
    const monthCell = row[monthCol];
    if (String(monthCell).trim().startsWith('Total')) continue;
    
    const yyyymm = excelDateToYYYYMM(monthCell);
    if (!yyyymm) continue;
    
    const km = cleanVal(row[kmCol]);
    const kwh = cleanVal(row[kwhCol]);
    const veh = cleanVal(row[vehicleCol]);
    
    let isExtrapolated = false;
    if (s === 'TUPL' && yyyymm === '2026-07') isExtrapolated = true;
    if (s === 'TEOPL' && ['2026-04','2026-05','2026-06','2026-07'].includes(yyyymm)) isExtrapolated = true;
    if (s === 'NTSPL' && ['2026-04','2026-05','2026-06','2026-07'].includes(yyyymm)) isExtrapolated = true;
    
    records.push({ month: yyyymm, km, kwh, veh, isExtrapolated });
    
    if (!isExtrapolated) {
      if (km != null) totalKm += km;
      if (kwh != null) totalKwh += kwh;
      if (veh != null) {
        latestVehicles = veh;
        latestMonth = yyyymm;
      }
    }
  }
  
  summary[s] = { totalKm, totalKwh, latestVehicles, latestMonth, count: records.length, records };
});

console.log('SUMMARY PER PROJECT:');
sheets.forEach(s => {
  const p = summary[s];
  console.log(`${s}: Distance=${p.totalKm.toLocaleString()}, Energy=${p.totalKwh.toLocaleString()}, Vehicles=${p.latestVehicles} (${p.latestMonth})`);
});

const allKm = Object.values(summary).reduce((acc, x) => acc + x.totalKm, 0);
const allKwh = Object.values(summary).reduce((acc, x) => acc + x.totalKwh, 0);
const allVeh = Object.values(summary).reduce((acc, x) => acc + (x.latestVehicles || 0), 0);

console.log('\n--- AGGREGATE VERIFICATION ---');
console.log('Total distance (reported only):', allKm, '| Expected: 18167329');
console.log('Total energy (kWh, reported only):', allKwh, '| Expected: 22716232');
console.log('Latest reported vehicles sum:', allVeh, '| Expected: 330');
