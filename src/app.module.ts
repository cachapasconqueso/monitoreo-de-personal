import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ClientsModule } from './clients/clients.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { VisitsModule } from './visits/visits.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AttendanceModule,
    ClientsModule,
    AssignmentsModule,
    VisitsModule,
  ],
})
export class AppModule {}
