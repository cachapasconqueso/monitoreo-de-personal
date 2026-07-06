"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AssignmentsService = class AssignmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    parseDate(dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    todayDate() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    formatDate(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    mondayOf(date) {
        const day = date.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(date);
        monday.setDate(date.getDate() + diff);
        return monday;
    }
    async materializeForDate(dayStart) {
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
            if (skipped)
                continue;
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
    async assign(supervisorId, dto) {
        const date = this.parseDate(dto.date);
        const created = [];
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
    async createTemplate(supervisorId, dto) {
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
    async getTemplatesByEmployee(employeeId) {
        return this.prisma.routeTemplate.findMany({
            where: { employeeId, active: true },
            include: { clients: { include: { client: true }, orderBy: { order: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteTemplate(templateId, supervisorId) {
        const template = await this.prisma.routeTemplate.findUnique({ where: { id: templateId } });
        if (!template || template.supervisorId !== supervisorId)
            throw new common_1.NotFoundException('Ruta recurrente no encontrada');
        return this.prisma.routeTemplate.update({
            where: { id: templateId },
            data: { active: false },
        });
    }
    async getByEmployee(employeeId, date) {
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
    async getMyWeek(employeeId, date) {
        const base = date ? this.parseDate(date) : this.todayDate();
        const monday = this.mondayOf(base);
        const days = [];
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
    async getBySupervisor(supervisorId, date) {
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
    async remove(assignmentId, supervisorId) {
        const a = await this.prisma.clientAssignment.findUnique({ where: { id: assignmentId } });
        if (!a || a.supervisorId !== supervisorId)
            throw new common_1.NotFoundException('Asignación no encontrada');
        if (a.templateId) {
            await this.prisma.routeTemplateException.upsert({
                where: { templateId_date: { templateId: a.templateId, date: a.date } },
                create: { templateId: a.templateId, date: a.date },
                update: {},
            });
        }
        return this.prisma.clientAssignment.delete({ where: { id: assignmentId } });
    }
    async getAllForJefe(date) {
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
};
exports.AssignmentsService = AssignmentsService;
exports.AssignmentsService = AssignmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssignmentsService);
//# sourceMappingURL=assignments.service.js.map