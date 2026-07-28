import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { VisitsService } from './visits.service';
import { CheckInVisitDto, CheckOutVisitDto } from './dto/visit.dto';

@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VisitsController {
  constructor(private service: VisitsService) {}

  @Post('check-in')
  @Roles(Role.EMPLEADO)
  checkIn(@Request() req, @Body() dto: CheckInVisitDto) {
    return this.service.checkIn(req.user.id, dto);
  }

  @Post('check-out')
  @Roles(Role.EMPLEADO)
  checkOut(@Request() req, @Body() dto: CheckOutVisitDto) {
    return this.service.checkOut(req.user.id, dto);
  }

  @Get('today')
  @Roles(Role.EMPLEADO)
  today(@Request() req) {
    return this.service.getMyTodayVisits(req.user.id);
  }

  @Get('my-history')
  @Roles(Role.EMPLEADO)
  myHistory(@Request() req, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.getVisitsByEmployee(req.user.id, from, to);
  }

  @Get('by-employee/:employeeId')
  @Roles(Role.SUPERVISOR, Role.JEFE)
  async byEmployee(
    @Request() req,
    @Param('employeeId') employeeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    await this.service.assertEmployeeOwnership(req.user, employeeId);
    return this.service.getVisitsByEmployee(employeeId, from, to);
  }

  @Get('all')
  @Roles(Role.SUPERVISOR, Role.JEFE)
  all(
    @Request() req,
    @Query('date') date?: string,
    @Query('employeeId') employeeId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.getAllVisits(req.user, date, employeeId, from, to);
  }

  @Patch(':id/comment')
  @Roles(Role.EMPLEADO)
  updateComment(@Param('id') id: string, @Request() req, @Body('comment') comment: string) {
    return this.service.updateComment(id, req.user.id, comment);
  }
}
