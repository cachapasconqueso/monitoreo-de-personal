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
exports.VisitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VisitsService = class VisitsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    todayDate() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    async checkIn(employeeId, dto) {
        const date = this.todayDate();
        const now = dto.timestamp ? new Date(dto.timestamp) : new Date();
        const existing = await this.prisma.visit.findFirst({
            where: { employeeId, clientId: dto.clientId, date, status: 'IN_PROGRESS' },
        });
        if (existing)
            throw new common_1.BadRequestException('Ya tienes una visita activa en este cliente');
        return this.prisma.visit.create({
            data: {
                employeeId,
                clientId: dto.clientId,
                assignmentId: dto.assignmentId,
                date,
                checkIn: now,
                status: 'IN_PROGRESS',
                lat: dto.lat,
                lng: dto.lng,
            },
            include: { client: true },
        });
    }
    async checkOut(employeeId, dto) {
        const visit = await this.prisma.visit.findUnique({ where: { id: dto.visitId } });
        if (!visit || visit.employeeId !== employeeId)
            throw new common_1.NotFoundException('Visita no encontrada');
        if (visit.status !== 'IN_PROGRESS')
            throw new common_1.BadRequestException('La visita no está en progreso');
        const now = dto.timestamp ? new Date(dto.timestamp) : new Date();
        return this.prisma.visit.update({
            where: { id: dto.visitId },
            data: { checkOut: now, comment: dto.comment, status: 'COMPLETED', lat: dto.lat, lng: dto.lng },
            include: { client: true },
        });
    }
    async getMyTodayVisits(employeeId) {
        const date = this.todayDate();
        return this.prisma.visit.findMany({
            where: { employeeId, date },
            include: { client: true },
            orderBy: { checkIn: 'asc' },
        });
    }
    async getVisitsByEmployee(employeeId, from, to) {
        return this.prisma.visit.findMany({
            where: {
                employeeId,
                ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
            },
            include: { client: true },
            orderBy: { date: 'desc' },
            take: 100,
        });
    }
    async getAllVisits(date, employeeId) {
        const d = date ? new Date(date) : undefined;
        const dayStart = d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : undefined;
        return this.prisma.visit.findMany({
            where: {
                ...(dayStart ? { date: dayStart } : {}),
                ...(employeeId ? { employeeId } : {}),
            },
            include: {
                client: true,
                employee: { select: { id: true, name: true, avatarUrl: true } },
            },
            orderBy: { checkIn: 'desc' },
            take: 200,
        });
    }
    async updateComment(visitId, employeeId, comment) {
        const visit = await this.prisma.visit.findUnique({ where: { id: visitId } });
        if (!visit || visit.employeeId !== employeeId)
            throw new common_1.NotFoundException('Visita no encontrada');
        return this.prisma.visit.update({
            where: { id: visitId },
            data: { comment },
        });
    }
};
exports.VisitsService = VisitsService;
exports.VisitsService = VisitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VisitsService);
//# sourceMappingURL=visits.service.js.map