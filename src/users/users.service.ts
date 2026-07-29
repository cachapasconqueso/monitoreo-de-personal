import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateWorkScheduleDto } from './dto/work-schedule.dto';

interface Requester {
  id: string;
  role: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(requester: Requester, dto: CreateUserDto) {
    if (requester.role === 'SUPERVISOR') {
      if (dto.role && dto.role !== 'EMPLEADO') {
        throw new ForbiddenException('Un supervisor solo puede crear empleados');
      }
      dto.role = 'EMPLEADO' as CreateUserDto['role'];
      dto.supervisorId = requester.id;
    }

    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El correo ya está registrado');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    });
  }

  async findAll(requester: Requester, role?: string) {
    if (requester.role === 'SUPERVISOR') {
      return this.findEmployeesBySupervisor(requester.id);
    }

    return this.prisma.user.findMany({
      where: { active: true, ...(role ? { role: role as any } : {}) },
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        avatarUrl: true, createdAt: true, supervisorId: true,
        supervisedBy: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(requester: Requester, id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        avatarUrl: true, createdAt: true, supervisorId: true,
        supervisedBy: { select: { id: true, name: true } },
        employees: { select: { id: true, name: true, role: true } },
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (requester.role === 'SUPERVISOR' && user.supervisorId !== requester.id) {
      throw new ForbiddenException('No puedes ver un usuario que no es tu empleado');
    }

    return user;
  }

  async findEmployeesBySupervisor(supervisorId: string) {
    return this.prisma.user.findMany({
      where: { supervisorId, active: true },
      select: {
        id: true, name: true, email: true, role: true, phone: true, avatarUrl: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateLocation(userId: string, lat: number, lng: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLat: lat, lastLng: lng, lastLocationAt: new Date() },
      select: { id: true, lastLat: true, lastLng: true, lastLocationAt: true },
    });
  }

  async getTeamLocations(supervisorId?: string) {
    return this.prisma.user.findMany({
      where: {
        role: 'EMPLEADO',
        active: true,
        lastLat: { not: null },
        ...(supervisorId ? { supervisorId } : {}),
      },
      select: {
        id: true, name: true, avatarUrl: true,
        lastLat: true, lastLng: true, lastLocationAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(requester: Requester, id: string, data: Partial<CreateUserDto>) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('Usuario no encontrado');

    if (requester.role === 'SUPERVISOR') {
      if (target.supervisorId !== requester.id) {
        throw new ForbiddenException('Solo puedes editar a tus propios empleados');
      }
      if (data.role !== undefined || data.supervisorId !== undefined) {
        throw new ForbiddenException('No tienes permiso para modificar ese campo');
      }
    }

    const updateData: Partial<CreateUserDto> = { ...data };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, phone: true },
    });
  }

  async deactivate(requester: Requester, id: string) {
    if (requester.role === 'SUPERVISOR') {
      const target = await this.prisma.user.findUnique({ where: { id } });
      if (!target || target.supervisorId !== requester.id) {
        throw new ForbiddenException('Solo puedes eliminar a tus propios empleados');
      }
    }
    return this.prisma.user.update({ where: { id }, data: { active: false } });
  }

  private async assertOwnsEmployee(requester: Requester, employeeId: string) {
    if (requester.role !== 'SUPERVISOR') return;
    const employee = await this.prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee || employee.supervisorId !== requester.id) {
      throw new ForbiddenException('No puedes gestionar el horario de un empleado que no es tuyo');
    }
  }

  async getSchedules(requester: Requester, employeeId: string) {
    await this.assertOwnsEmployee(requester, employeeId);
    return this.prisma.workSchedule.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addSchedule(requester: Requester, employeeId: string, dto: CreateWorkScheduleDto) {
    await this.assertOwnsEmployee(requester, employeeId);

    // Un mismo día no puede quedar cubierto por dos bloques de horario a la vez:
    // se quita el día nuevo de cualquier bloque existente que lo incluyera (el más
    // reciente gana), borrando el bloque si se queda sin días.
    const existing = await this.prisma.workSchedule.findMany({ where: { employeeId } });
    for (const s of existing) {
      const remainingDays = s.daysOfWeek.filter((d) => !dto.daysOfWeek.includes(d));
      if (remainingDays.length === s.daysOfWeek.length) continue;
      if (remainingDays.length === 0) {
        await this.prisma.workSchedule.delete({ where: { id: s.id } });
      } else {
        await this.prisma.workSchedule.update({ where: { id: s.id }, data: { daysOfWeek: remainingDays } });
      }
    }

    return this.prisma.workSchedule.create({ data: { employeeId, ...dto } });
  }

  async removeSchedule(requester: Requester, scheduleId: string) {
    const schedule = await this.prisma.workSchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw new NotFoundException('Horario no encontrado');
    await this.assertOwnsEmployee(requester, schedule.employeeId);
    return this.prisma.workSchedule.delete({ where: { id: scheduleId } });
  }
}
