import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Request } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateWorkScheduleDto } from './dto/work-schedule.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles(Role.JEFE, Role.SUPERVISOR)
  create(@Request() req, @Body() dto: CreateUserDto) {
    return this.usersService.create(req.user, dto);
  }

  @Get()
  @Roles(Role.JEFE, Role.SUPERVISOR)
  findAll(@Request() req, @Query('role') role?: string) {
    return this.usersService.findAll(req.user, role);
  }

  @Get('my-employees')
  @Roles(Role.SUPERVISOR)
  myEmployees(@Request() req) {
    return this.usersService.findEmployeesBySupervisor(req.user.id);
  }

  @Patch('my-location')
  @Roles(Role.EMPLEADO)
  updateLocation(@Request() req, @Body() body: { lat: number; lng: number }) {
    return this.usersService.updateLocation(req.user.id, body.lat, body.lng);
  }

  @Get('team-locations')
  @Roles(Role.SUPERVISOR, Role.JEFE)
  teamLocations(@Request() req, @Query('supervisorId') supervisorId?: string) {
    const id = req.user.role === 'SUPERVISOR' ? req.user.id : supervisorId;
    return this.usersService.getTeamLocations(id);
  }

  @Get(':id/schedules')
  @Roles(Role.JEFE, Role.SUPERVISOR)
  getSchedules(@Request() req, @Param('id') id: string) {
    return this.usersService.getSchedules(req.user, id);
  }

  @Post(':id/schedules')
  @Roles(Role.JEFE, Role.SUPERVISOR)
  addSchedule(@Request() req, @Param('id') id: string, @Body() dto: CreateWorkScheduleDto) {
    return this.usersService.addSchedule(req.user, id, dto);
  }

  @Delete('schedules/:scheduleId')
  @Roles(Role.JEFE, Role.SUPERVISOR)
  removeSchedule(@Request() req, @Param('scheduleId') scheduleId: string) {
    return this.usersService.removeSchedule(req.user, scheduleId);
  }

  @Get(':id')
  @Roles(Role.JEFE, Role.SUPERVISOR)
  findOne(@Request() req, @Param('id') id: string) {
    return this.usersService.findOne(req.user, id);
  }

  @Patch(':id')
  @Roles(Role.JEFE, Role.SUPERVISOR)
  update(@Request() req, @Param('id') id: string, @Body() dto: Partial<CreateUserDto>) {
    return this.usersService.update(req.user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.JEFE)
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }
}
