import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto, CreateRouteTemplateDto } from './dto/assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  private parseDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private todayDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private mondayOf(date: Date): Date {
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday;
  }

  private async materializeForDate(dayStart: Date) {
    const dayOfWeek = dayStart.getDay();

    const templates = await this.prisma.routeTemplate.findMany({
      where: {
        active: true,
        daysOfWeek: { has: dayOfWeek },
        startDate: { lte: dayStart },
        OR: [{ endDate: null }, { endDate: { gte: dayStart } }],
      },
      include: { clients: true },
    });

    for (const template of templates) {
      const skipped = await this.prisma.routeTemplateException.findUnique({
        where: { templateId_date: { templateId: template.id, date: dayStart } },
      });
      if (skipped) continue;

      for (const tc of template.clients) {
        await this.prisma.clientAssignment.upsert({
          where: {
            clientId_employeeId_date: {
              clientId: tc.clientId,
              employeeId: template.employeeId,
              date: dayStart,
            },
          },
          create: {
            clientId: tc.clientId,
            employeeId: template.employeeId,
            supervisorId: template.supervisorId,
            date: dayStart,
            order: tc.order,
            templateId: template.id,
          },
          update: {},
        });
      }
    }
  }

  async assign(supervisorId: string, dto: CreateAssignmentDto) {
    const date = this.parseDate(dto.date);
    const created: any[] = [];

    for (const item of dto.clients) {
      const assignment = await this.prisma.clientAssignment.upsert({
        where: {
          clientId_employeeId_date: {
            clientId: item.clientId,
            employeeId: dto.employeeId,
            date,
          },
        },
        create: {
          clientId: item.clientId,
          employeeId: dto.employeeId,
          supervisorId,
          date,
          order: item.order ?? 0,
        },
        update: { order: item.order ?? 0 },
        include: { client: true, employee: { select: { id: true, name: true } } },
      });
      created.push(assignment);
    }

    return created;
  }

  async createTemplate(supervisorId: string, dto: CreateRouteTemplateDto) {
    const startDate = this.parseDate(dto.startDate);
    const endDate = dto.endDate ? this.parseDate(dto.endDate) : null;

    const template = await this.prisma.routeTemplate.create({
      data: {
        employeeId: dto.employeeId,
        supervisorId,
        daysOfWeek: dto.daysOfWeek,
        startDate,
        endDate,
        clients: {
          create: dto.clients.map((c, i) => ({ clientId: c.clientId, order: c.order ?? i })),
        },
      },
      include: { clients: { include: { client: true } } },
    });

    if (dto.daysOfWeek.includes(startDate.getDay())) {
      await this.materializeForDate(startDate);
    }

    return template;
  }

  async getTemplatesByEmployee(employeeId: string) {
    return this.prisma.routeTemplate.findMany({
      where: { employeeId, active: true },
      include: { clients: { include: { client: true }, orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteTemplate(templateId: string, supervisorId: string) {
    const template = await this.prisma.routeTemplate.findUnique({ where: { id: templateId } });
    if (!template || template.supervisorId !== supervisorId) throw new NotFoundException('Ruta recurrente no encontrada');

    return this.prisma.routeTemplate.update({
      where: { id: templateId },
      data: { active: false },
    });
  }

  async getByEmployee(employeeId: string, date?: string) {
    const dayStart = date ? this.parseDate(date) : this.todayDate();
    await this.materializeForDate(dayStart);

    return this.prisma.clientAssignment.findMany({
      where: { employeeId, date: dayStart },
      include: {
        client: true,
        visits: {
          where: { date: dayStart },
          orderBy: { checkIn: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async getMyWeek(employeeId: string, date?: string) {
    const base = date ? this.parseDate(date) : this.todayDate();
    const monday = this.mondayOf(base);

    const days: { date: string; dayOfWeek: number; assignments: any[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      await this.materializeForDate(d);

      const dayAssignments = await this.prisma.clientAssignment.findMany({
        where: { employeeId, date: d },
        include: {
          client: true,
          visits: { where: { date: d }, orderBy: { checkIn: 'asc' } },
        },
        orderBy: { order: 'asc' },
      });

      days.push({
        date: this.formatDate(d),
        dayOfWeek: d.getDay(),
        assignments: dayAssignments,
      });
    }

    return days;
  }

  async getBySupervisor(supervisorId: string, date?: string) {
    const dayStart = date ? this.parseDate(date) : this.todayDate();
    await this.materializeForDate(dayStart);

    return this.prisma.clientAssignment.findMany({
      where: { supervisorId, date: dayStart },
      include: {
        client: true,
        employee: { select: { id: true, name: true, avatarUrl: true } },
        visits: { where: { date: dayStart } },
      },
      orderBy: [{ employee: { name: 'asc' } }, { order: 'asc' }],
    });
  }

  async remove(assignmentId: string, supervisorId: string) {
    const a = await this.prisma.clientAssignment.findUnique({ where: { id: assignmentId } });
    if (!a || a.supervisorId !== supervisorId) throw new NotFoundException('Asignación no encontrada');

    if (a.templateId) {
      await this.prisma.routeTemplateException.upsert({
        where: { templateId_date: { templateId: a.templateId, date: a.date } },
        create: { templateId: a.templateId, date: a.date },
        update: {},
      });
    }

    return this.prisma.clientAssignment.delete({ where: { id: assignmentId } });
  }

  async getAllForJefe(date?: string) {
    const dayStart = date ? this.parseDate(date) : this.todayDate();
    await this.materializeForDate(dayStart);

    return this.prisma.clientAssignment.findMany({
      where: { date: dayStart },
      include: {
        client: true,
        employee: { select: { id: true, name: true, avatarUrl: true, role: true } },
        supervisor: { select: { id: true, name: true } },
        visits: { where: { date: dayStart } },
      },
      orderBy: [{ employee: { name: 'asc' } }, { order: 'asc' }],
    });
  }
}
