import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AttendanceService } from './attendance.service';
import { CheckInDto, CheckOutDto, LunchStartDto, LunchEndDto } from './dto/attendance.dto';

@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Get('today')
  today(@Request() req) {
    return this.service.getTodayAttendance(req.user.id);
  }

  @Post('check-in')
  @Roles(Role.EMPLEADO)
  checkIn(@Request() req, @Body() dto: CheckInDto) {
    return this.service.checkIn(req.user.id, dto.timestamp);
  }

  @Post('check-out')
  @Roles(Role.EMPLEADO)
  checkOut(@Request() req, @Body() dto: CheckOutDto) {
    return this.service.checkOut(req.user.id, dto.timestamp);
  }

  @Post('lunch-start')
  @Roles(Role.EMPLEADO)
  lunchStart(@Request() req, @Body() dto: LunchStartDto) {
    return this.service.lunchStart(req.user.id, dto.timestamp);
  }

  @Post('lunch-end')
  @Roles(Role.EMPLEADO)
  lunchEnd(@Request() req, @Body() dto: LunchEndDto) {
    return this.service.lunchEnd(req.user.id, dto.timestamp);
  }

  @Get('my-history')
  myHistory(@Request() req, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.getMyHistory(req.user.id, from, to);
  }

  @Get('team')
  @Roles(Role.SUPERVISOR, Role.JEFE)
  team(@Query('date') date?: string) {
    return this.service.getTeamAttendance(date);
  }

  @Get('early-departures')
  @Roles(Role.SUPERVISOR, Role.JEFE)
  earlyDepartures(@Query('date') date?: string) {
    return this.service.getEarlyDepartures(date);
  }

  @Get('all')
  @Roles(Role.JEFE)
  all(@Query('userId') userId?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.getAllAttendance(userId, from, to);
  }
}
