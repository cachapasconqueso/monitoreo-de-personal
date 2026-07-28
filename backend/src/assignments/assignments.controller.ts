import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, CreateRouteTemplateDto } from './dto/assignment.dto';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private service: AssignmentsService) {}

  @Post()
  @Roles(Role.SUPERVISOR, Role.JEFE)
  assign(@Request() req, @Body() dto: CreateAssignmentDto) {
    return this.service.assign(req.user.id, dto);
  }

  @Get('my-route')
  @Roles(Role.EMPLEADO)
  myRoute(@Request() req, @Query('date') date?: string) {
    return this.service.getByEmployee(req.user.id, date);
  }

  @Get('my-week')
  @Roles(Role.EMPLEADO)
  myWeek(@Request() req, @Query('date') date?: string) {
    return this.service.getMyWeek(req.user.id, date);
  }

  @Get('by-supervisor')
  @Roles(Role.SUPERVISOR, Role.JEFE)
  bySupervisor(@Request() req, @Query('date') date?: string) {
    return this.service.getBySupervisor(req.user.id, date);
  }

  @Get('employee/:employeeId')
  @Roles(Role.SUPERVISOR, Role.JEFE)
  byEmployee(@Param('employeeId') employeeId: string, @Query('date') date?: string) {
    return this.service.getByEmployee(employeeId, date);
  }

  @Get('all')
  @Roles(Role.JEFE)
  all(@Query('date') date?: string) {
    return this.service.getAllForJefe(date);
  }

  @Delete(':id')
  @Roles(Role.SUPERVISOR, Role.JEFE)
  remove(@Param('id') id: string, @Request() req) {
    return this.service.remove(id, req.user.id);
  }

  @Post('recurring')
  @Roles(Role.SUPERVISOR, Role.JEFE)
  createRecurring(@Request() req, @Body() dto: CreateRouteTemplateDto) {
    return this.service.createTemplate(req.user.id, dto);
  }

  @Get('recurring/employee/:employeeId')
  @Roles(Role.SUPERVISOR, Role.JEFE)
  recurringByEmployee(@Param('employeeId') employeeId: string) {
    return this.service.getTemplatesByEmployee(employeeId);
  }

  @Delete('recurring/:id')
  @Roles(Role.SUPERVISOR, Role.JEFE)
  removeRecurring(@Param('id') id: string, @Request() req) {
    return this.service.deleteTemplate(id, req.user.id);
  }
}
