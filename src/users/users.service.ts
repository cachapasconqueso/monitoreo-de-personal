import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El correo ya está registrado');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    });
  }

  async findAll(role?: string) {
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

  async findOne(id: string) {
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
    return user;
  }

  async findEmployeesBySupervisor(supervisorId: string) {
    return this.prisma.user.findMany({
      where: { supervisorId, active: true },
      select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true },
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

  async update(id: string, data: Partial<CreateUserDto>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, phone: true },
    });
  }

  async deactivate(id: string) {
    return this.prisma.user.update({ where: { id }, data: { active: false } });
  }
}
