import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    return this.prisma.client.create({ data: dto });
  }

  async findAll(search?: string) {
    return this.prisma.client.findMany({
      where: {
        active: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.client.update({ where: { id }, data: { active: false } });
  }
}
