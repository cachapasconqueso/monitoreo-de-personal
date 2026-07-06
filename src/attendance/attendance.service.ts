import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const WORKDAY_MINUTES = 480; // 8 horas

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private todayDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private calcWorkedMinutes(checkIn: Date, checkOut: Date, lunchStart?: Date | null, lunchEnd?: Date | null): number {
    const total = (checkOut.getTime() - checkIn.getTime()) / 60000;
    let lunch = 0;
    if (lunchStart && lunchEnd) {
      lunch = (lunchEnd.getTime() - lunchStart.getTime()) / 60000;
    }
    return Math.round(total - lunch);
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

    return this.prisma.attendance.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, checkIn: now, status: 'ACTIVE' },
      update: { checkIn: now, status: 'ACTIVE' },
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

    const workedMinutes = this.calcWorkedMinutes(
      attendance.checkIn,
      now,
      attendance.lunchStart,
      attendance.lunchEnd,
    );
    const earlyDeparture = workedMinutes < WORKDAY_MINUTES;

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
        ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
      },
      orderBy: { date: 'desc' },
      take: 30,
    });
  }

  async getTeamAttendance(date?: string) {
    const d = date ? new Date(date) : this.todayDate();
    return this.prisma.attendance.findMany({
      where: { date: d },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
      },
      orderBy: { user: { name: 'asc' } },
    });
  }

  async getEarlyDepartures(date?: string) {
    const d = date ? new Date(date) : this.todayDate();
    return this.prisma.attendance.findMany({
      where: { date: d, earlyDeparture: true },
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

  async getAllAttendance(userId?: string, from?: string, to?: string) {
    return this.prisma.attendance.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }
}
