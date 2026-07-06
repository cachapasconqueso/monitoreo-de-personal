import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckInVisitDto, CheckOutVisitDto } from './dto/visit.dto';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  private todayDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  async checkIn(employeeId: string, dto: CheckInVisitDto) {
    const date = this.todayDate();
    const now = dto.timestamp ? new Date(dto.timestamp) : new Date();

    const existing = await this.prisma.visit.findFirst({
      where: { employeeId, clientId: dto.clientId, date, status: 'IN_PROGRESS' },
    });
    if (existing) throw new BadRequestException('Ya tienes una visita activa en este cliente');

    return this.prisma.visit.create({
      data: {
        employeeId,
        clientId: dto.clientId,
        assignmentId: dto.assignmentId,
        date,
        checkIn: now,
        status: 'IN_PROGRESS',
        lat: dto.lat,
        lng: dto.lng,
      },
      include: { client: true },
    });
  }

  async checkOut(employeeId: string, dto: CheckOutVisitDto) {
    const visit = await this.prisma.visit.findUnique({ where: { id: dto.visitId } });
    if (!visit || visit.employeeId !== employeeId) throw new NotFoundException('Visita no encontrada');
    if (visit.status !== 'IN_PROGRESS') throw new BadRequestException('La visita no está en progreso');

    const now = dto.timestamp ? new Date(dto.timestamp) : new Date();
    return this.prisma.visit.update({
      where: { id: dto.visitId },
      data: { checkOut: now, comment: dto.comment, status: 'COMPLETED', lat: dto.lat, lng: dto.lng },
      include: { client: true },
    });
  }

  async getMyTodayVisits(employeeId: string) {
    const date = this.todayDate();
    return this.prisma.visit.findMany({
      where: { employeeId, date },
      include: { client: true },
      orderBy: { checkIn: 'asc' },
    });
  }

  async getVisitsByEmployee(employeeId: string, from?: string, to?: string) {
    return this.prisma.visit.findMany({
      where: {
        employeeId,
        ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
      },
      include: { client: true },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  async getAllVisits(date?: string, employeeId?: string) {
    const d = date ? new Date(date) : undefined;
    const dayStart = d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : undefined;

    return this.prisma.visit.findMany({
      where: {
        ...(dayStart ? { date: dayStart } : {}),
        ...(employeeId ? { employeeId } : {}),
      },
      include: {
        client: true,
        employee: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { checkIn: 'desc' },
      take: 200,
    });
  }

  async updateComment(visitId: string, employeeId: string, comment: string) {
    const visit = await this.prisma.visit.findUnique({ where: { id: visitId } });
    if (!visit || visit.employeeId !== employeeId) throw new NotFoundException('Visita no encontrada');

    return this.prisma.visit.update({
      where: { id: visitId },
      data: { comment },
    });
  }
}
