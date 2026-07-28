// Distancia entre dos coordenadas usando la fórmula de Haversine, en metros.
export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Umbral a partir del cual un check-in se considera fuera del sitio del cliente.
export const OFF_SITE_THRESHOLD_METERS = 300;

export function isVisitOffSite(visit: { lat?: number | null; lng?: number | null }, client: { lat: number; lng: number }): boolean {
  if (visit.lat == null || visit.lng == null) return false;
  return distanceMeters(visit.lat, visit.lng, client.lat, client.lng) > OFF_SITE_THRESHOLD_METERS;
}

function csvEscape(value: unknown): string {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const lines = [headers.map(csvEscape).join(','), ...rows.map((r) => r.map(csvEscape).join(','))];
  // BOM para que Excel detecte UTF-8 correctamente
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface EmployeeAttendanceLike {
  userId: string;
  status: string;
  earlyDeparture: boolean;
  workedMinutes: number | null;
}

export interface EmployeeVisitLike {
  employeeId: string;
  status: string;
}

export interface EmployeeRankingRow {
  id: string;
  name: string;
  daysPresent: number;
  attendanceRate: number;
  punctualityRate: number;
  avgWorkedMinutes: number;
  visitsCompleted: number;
}

export function buildRanking(
  employees: { id: string; name: string }[],
  attendance: EmployeeAttendanceLike[],
  visits: EmployeeVisitLike[],
  totalDays: number,
): EmployeeRankingRow[] {
  return employees
    .map((emp) => {
      const empAttendance = attendance.filter((a) => a.userId === emp.id);
      const present = empAttendance.filter((a) => a.status === 'COMPLETED' || a.status === 'ACTIVE' || a.status === 'ON_LUNCH');
      const completedDays = empAttendance.filter((a) => a.workedMinutes != null);
      const onTime = completedDays.filter((a) => !a.earlyDeparture);
      const avgWorked = completedDays.length
        ? Math.round(completedDays.reduce((sum, a) => sum + (a.workedMinutes || 0), 0) / completedDays.length)
        : 0;
      const visitsCompleted = visits.filter((v) => v.employeeId === emp.id && v.status === 'COMPLETED').length;

      return {
        id: emp.id,
        name: emp.name,
        daysPresent: present.length,
        attendanceRate: totalDays > 0 ? Math.round((present.length / totalDays) * 100) : 0,
        punctualityRate: completedDays.length > 0 ? Math.round((onTime.length / completedDays.length) * 100) : 0,
        avgWorkedMinutes: avgWorked,
        visitsCompleted,
      };
    })
    .sort((a, b) => b.visitsCompleted - a.visitsCompleted || b.attendanceRate - a.attendanceRate);
}
