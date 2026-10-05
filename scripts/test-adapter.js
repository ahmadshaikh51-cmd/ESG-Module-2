import {
  computeAggregateKpis,
  getProjectComparisonRows,
  INITIAL_FILTERS,
} from '../src/lib/esg-site-monitoring-adapter.ts';

const kpis = computeAggregateKpis(INITIAL_FILTERS);
console.log('=== KPI AGGREGATE VERIFICATION ===');
console.log('Total Distance (km):', Math.round(kpis.totalDistanceKm).toLocaleString());
console.log('Total Energy (kWh):', Math.round(kpis.totalEnergyKwh).toLocaleString());
console.log('Active Vehicles:', kpis.activeVehicles);
console.log('Estimated CO2 Avoided (t):', Math.round(kpis.totalCo2t).toLocaleString());
console.log('Estimated Diesel Saved (L):', Math.round(kpis.totalDieselSavedL).toLocaleString());

console.log('\n=== DISTANCE BY PROJECT ===');
const rows = getProjectComparisonRows(INITIAL_FILTERS);
rows.forEach((r) => {
  if (r.hasMonthlyData) {
    console.log(
      `${r.name} (${r.client}): Distance=${Math.round(r.distanceKm || 0).toLocaleString()}, Energy=${Math.round(
        r.energyKwh || 0
      ).toLocaleString()}, Vehicles=${r.latestVehicles} (${r.lastMonth})`
    );
  }
});
