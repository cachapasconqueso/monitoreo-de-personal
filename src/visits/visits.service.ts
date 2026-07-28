import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckInVisitDto, CheckOutVisitDto } from './dto/visit.dto';
import { toBusinessDateOnly, parseDateOnly } from '../common/business-date.util';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async checkIn(employeeId: string, dto: CheckInVisitDto) {
    const date = toBusinessDateOnly();
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
    const date = toBusinessDateOnly();
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
        ...(from && to ? { date: { gte: parseDateOnly(from), lte: parseDateOnly(to) } } : {}),
      },
      include: { client: true },
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  async assertEmployeeOwnership(requester: { id: string; role: string }, employeeId: string) {
    if (requester.role !== 'SUPERVISOR') return;
    const employee = await this.prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee || employee.supervisorId !== requester.id) {
      throw new NotFoundException('Empleado no encontrado');
    }
  }

  async getAllVisits(
    requester: { id: string; role: string },
    date?: string,
    employeeId?: string,
    from?: string,
    to?: string,
  ) {
    const dayStart = date ? parseDateOnly(date) : undefined;
    const supervisorScope = requester.role === 'SUPERVISOR' ? { supervisorId: requester.id } : {};

    return this.prisma.visit.findMany({
      where: {
        ...(dayStart ? { date: dayStart } : {}),
        ...(!dayStart && from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
        ...(employeeId ? { employeeId } : {}),
        employee: supervisorScope,
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
