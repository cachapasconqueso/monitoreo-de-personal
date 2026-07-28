import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toBusinessDateOnly, parseDateOnly, formatDateOnly, businessDayOfWeek, businessMinutesOfDay } from '../common/business-date.util';

const WORKDAY_MINUTES = 480; // 8 horas, usado cuando el empleado no tiene horario configurado
const LATE_GRACE_MINUTES = 10; // tolerancia antes de marcar como tardanza

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private todayDate() {
    return toBusinessDateOnly();
  }

  private calcWorkedMinutes(checkIn: Date, checkOut: Date, lunchStart?: Date | null, lunchEnd?: Date | null): number {
    const total = (checkOut.getTime() - checkIn.getTime()) / 60000;
    let lunch = 0;
    if (lunchStart && lunchEnd) {
      lunch = (lunchEnd.getTime() - lunchStart.getTime()) / 60000;
    }
    return Math.round(total - lunch);
  }

  private scheduleToMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  private async todaysScheduleBlock(userId: string, dayOfWeek: number) {
    const schedules = await this.prisma.workSchedule.findMany({ where: { employeeId: userId } });
    return schedules.find((s) => s.daysOfWeek.includes(dayOfWeek)) ?? null;
  }

  private isLate(checkInTime: Date, scheduleStart?: string | null): boolean {
    if (!scheduleStart) return false;
    const arrivalMinutes = businessMinutesOfDay(checkInTime);
    return arrivalMinutes > this.scheduleToMinutes(scheduleStart) + LATE_GRACE_MINUTES;
  }

  private expectedWorkMinutes(scheduleStart?: string | null, scheduleEnd?: string | null): number {
    if (scheduleStart && scheduleEnd) {
      const diff = this.scheduleToMinutes(scheduleEnd) - this.scheduleToMinutes(scheduleStart);
      if (diff > 0) return diff;
    }
    return WORKDAY_MINUTES;
  }

  async getTodayAttendance(userId: string) {
    const date = this.todayDate();
    return this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date } },
    });
  }

  async checkIn(userId: string, timestamp?: string) {
    const date = this.todayDate();
    const now = timestamp ? new Date(timestamp) : new Date();

    const existing = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date } },
    });
    if (existing?.checkIn) throw new BadRequestException('Ya registraste tu entrada hoy');

    const block = await this.todaysScheduleBlock(userId, businessDayOfWeek(now));
    const late = this.isLate(now, block?.startTime);

    return this.prisma.attendance.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, checkIn: now, status: 'ACTIVE', late },
      update: { checkIn: now, status: 'ACTIVE', late },
    });
  }

  async checkOut(userId: string, timestamp?: string) {
    const date = this.todayDate();
    const now = timestamp ? new Date(timestamp) : new Date();

    const attendance = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date } },
    });
    if (!attendance?.checkIn) throw new BadRequestException('No has registrado tu entrada');
    if (attendance.checkOut) throw new BadRequestException('Ya registraste tu salida hoy');

    const block = await this.todaysScheduleBlock(userId, businessDayOfWeek(now));
    const workedMinutes = this.calcWorkedMinutes(
      attendance.checkIn,
      now,
      attendance.lunchStart,
      attendance.lunchEnd,
    );
    const earlyDeparture = workedMinutes < this.expectedWorkMinutes(block?.startTime, block?.endTime);

    return this.prisma.attendance.update({
      where: { userId_date: { userId, date } },
      data: { checkOut: now, status: 'COMPLETED', workedMinutes, earlyDeparture },
    });
  }

  async lunchStart(userId: string, timestamp?: string) {
    const date = this.todayDate();
    const now = timestamp ? new Date(timestamp) : new Date();

    const attendance = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date } },
    });
    if (!attendance?.checkIn) throw new BadRequestException('No has registrado tu entrada');
    if (attendance.lunchStart) throw new BadRequestException('Ya registraste el inicio de almuerzo');

    return this.prisma.attendance.update({
      where: { userId_date: { userId, date } },
      data: { lunchStart: now, status: 'ON_LUNCH' },
    });
  }

  async lunchEnd(userId: string, timestamp?: string) {
    const date = this.todayDate();
    const now = timestamp ? new Date(timestamp) : new Date();

    const attendance = await this.prisma.attendance.findUnique({
      where: { userId_date: { userId, date } },
    });
    if (!attendance?.lunchStart) throw new BadRequestException('No has registrado el inicio de almuerzo');
    if (attendance.lunchEnd) throw new BadRequestException('Ya registraste el fin de almuerzo');

    return this.prisma.attendance.update({
      where: { userId_date: { userId, date } },
      data: { lunchEnd: now, status: 'ACTIVE' },
    });
  }

  async getMyHistory(userId: string, from?: string, to?: string) {
    return this.prisma.attendance.findMany({
      where: {
        userId,
        ...(from && to ? { date: { gte: parseDateOnly(from), lte: parseDateOnly(to) } } : {}),
      },
      orderBy: { date: 'desc' },
      take: 30,
    });
  }

  async getTeamAttendance(date?: string, supervisorId?: string) {
    const d = date ? parseDateOnly(date) : this.todayDate();

    const employees = await this.prisma.user.findMany({
      where: { role: 'EMPLEADO', active: true, ...(supervisorId ? { supervisorId } : {}) },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
      orderBy: { name: 'asc' },
    });

    const records = await this.prisma.attendance.findMany({
      where: { date: d, userId: { in: employees.map((e) => e.id) } },
    });
    const byUserId = new Map(records.map((r) => [r.userId, r]));

    // Se incluye a todo el equipo, incluso a quienes no tienen registro ese día,
    // para que quien nunca marcó entrada aparezca como ausente en vez de desaparecer del panel.
    return employees.map((user) => {
      const r = byUserId.get(user.id);
      return {
        id: r?.id ?? `pending-${user.id}-${date ?? formatDateOnly(d)}`,
        checkIn: r?.checkIn ?? null,
        checkOut: r?.checkOut ?? null,
        lunchStart: r?.lunchStart ?? null,
        lunchEnd: r?.lunchEnd ?? null,
        status: r?.status ?? 'PENDING',
        workedMinutes: r?.workedMinutes ?? null,
        earlyDeparture: r?.earlyDeparture ?? false,
        late: r?.late ?? false,
        user,
      };
    });
  }

  async getIncompleteRoutes(date?: string, supervisorId?: string) {
    const d = date ? parseDateOnly(date) : this.todayDate();

    const checkedOut = await this.prisma.attendance.findMany({
      where: { date: d, checkOut: { not: null }, ...(supervisorId ? { user: { supervisorId } } : {}) },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
    if (checkedOut.length === 0) return [];

    const assignments = await this.prisma.clientAssignment.findMany({
      where: { date: d, employeeId: { in: checkedOut.map((a) => a.userId) } },
      include: { client: true, visits: { where: { date: d } } },
    });

    const byEmployee = new Map<string, typeof assignments>();
    for (const a of assignments) {
      if (!byEmployee.has(a.employeeId)) byEmployee.set(a.employeeId, []);
      byEmployee.get(a.employeeId)!.push(a);
    }

    const alerts: Array<{
      user: { id: string; name: string; avatarUrl: string | null };
      checkOut: Date;
      totalAssigned: number;
      pendingClients: { id: string; name: string }[];
    }> = [];

    for (const att of checkedOut) {
      const dayAssignments = byEmployee.get(att.userId) ?? [];
      const pending = dayAssignments.filter((a) => !a.visits.some((v) => v.status === 'COMPLETED'));
      if (pending.length > 0) {
        alerts.push({
          user: att.user,
          checkOut: att.checkOut as Date,
          totalAssigned: dayAssignments.length,
          pendingClients: pending.map((a) => ({ id: a.client.id, name: a.client.name })),
        });
      }
    }

    return alerts;
  }

  async getEarlyDepartures(date?: string, supervisorId?: string) {
    const d = date ? parseDateOnly(date) : this.todayDate();
    return this.prisma.attendance.findMany({
      where: {
        date: d,
        earlyDeparture: true,
        ...(supervisorId ? { user: { supervisorId } } : {}),
      },
      include: {
        user: {
          select: {
            id: true, name: true, role: true, avatarUrl: true,
            supervisedBy: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { checkOut: 'desc' },
    });
  }

  async getAllAttendance(requester: { id: string; role: string }, userId?: string, from?: string, to?: string) {
    const supervisorScope = requester.role === 'SUPERVISOR' ? { supervisorId: requester.id } : {};
    return this.prisma.attendance.findMany({
      where: {
        ...(userId ? { userId } : {}),
        user: supervisorScope,
        ...(from && to ? { date: { gte: parseDateOnly(from), lte: parseDateOnly(to) } } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { date: 'desc' },
      take: 200,
    });
  }
}
