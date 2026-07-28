import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = async (p: string) => bcrypt.hash(p, 10);

  const jefe = await prisma.user.upsert({
    where: { email: 'jefe@empresa.com' },
    update: {},
    create: {
      name: 'Juan Pérez (Jefe)',
      email: 'jefe@empresa.com',
      password: await hash('admin123'),
      role: 'JEFE',
      phone: '0987654321',
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@empresa.com' },
    update: {},
    create: {
      name: 'María García (Supervisora)',
      email: 'supervisor@empresa.com',
      password: await hash('super123'),
      role: 'SUPERVISOR',
      phone: '0912345678',
      supervisorId: jefe.id,
    },
  });

  const empleado1 = await prisma.user.upsert({
    where: { email: 'carlos@empresa.com' },
    update: {},
    create: {
      name: 'Carlos Rodríguez',
      email: 'carlos@empresa.com',
      password: await hash('emp123'),
      role: 'EMPLEADO',
      phone: '0998877665',
      supervisorId: supervisor.id,
    },
  });

  const empleado2 = await prisma.user.upsert({
    where: { email: 'ana@empresa.com' },
    update: {},
    create: {
      name: 'Ana Torres',
      email: 'ana@empresa.com',
      password: await hash('emp123'),
      role: 'EMPLEADO',
      phone: '0991122334',
      supervisorId: supervisor.id,
    },
  });

  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: 'client-1' },
      update: {},
      create: {
        id: 'client-1',
        name: 'Supermercado El Centro',
        address: 'Av. Huayna Cápac 3-45, Cuenca',
        lat: -2.8974,
        lng: -79.0045,
        phone: '072-123456',
        email: 'centro@supermercado.com',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-2' },
      update: {},
      create: {
        id: 'client-2',
        name: 'Farmacia Salud Total',
        address: 'Calle Gran Colombia 7-89, Cuenca',
        lat: -2.9006,
        lng: -79.0021,
        phone: '072-234567',
        email: 'salud@farmacia.com',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-3' },
      update: {},
      create: {
        id: 'client-3',
        name: 'Librería El Saber',
        address: 'Benigno Malo 6-55, Cuenca',
        lat: -2.8951,
        lng: -79.0060,
        phone: '072-345678',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-4' },
      update: {},
      create: {
        id: 'client-4',
        name: 'Restaurante Típico Cuencano',
        address: 'Hermano Miguel 4-32, Cuenca',
        lat: -2.8988,
        lng: -79.0078,
        phone: '072-456789',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-5' },
      update: {},
      create: {
        id: 'client-5',
        name: 'Taller Mecánico Auto Express',
        address: 'Av. España 15-40, Cuenca',
        lat: -2.9043,
        lng: -79.0112,
        phone: '072-567890',
      },
    }),
  ]);

  console.log('Seed completado:');
  console.log('- Jefe:', jefe.email, '/ Contraseña: admin123');
  console.log('- Supervisor:', supervisor.email, '/ Contraseña: super123');
  console.log('- Empleado 1:', empleado1.email, '/ Contraseña: emp123');
  console.log('- Empleado 2:', empleado2.email, '/ Contraseña: emp123');
  console.log('- Clientes creados:', clients.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
