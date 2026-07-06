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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const WORKDAY_MINUTES = 480;
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    todayDate() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    calcWorkedMinutes(checkIn, checkOut, lunchStart, lunchEnd) {
        const total = (checkOut.getTime() - checkIn.getTime()) / 60000;
        let lunch = 0;
        if (lunchStart && lunchEnd) {
            lunch = (lunchEnd.getTime() - lunchStart.getTime()) / 60000;
        }
        return Math.round(total - lunch);
    }
    async getTodayAttendance(userId) {
        const date = this.todayDate();
        return this.prisma.attendance.findUnique({
            where: { userId_date: { userId, date } },
        });
    }
    async checkIn(userId, timestamp) {
        const date = this.todayDate();
        const now = timestamp ? new Date(timestamp) : new Date();
        const existing = await this.prisma.attendance.findUnique({
            where: { userId_date: { userId, date } },
        });
        if (existing?.checkIn)
            throw new common_1.BadRequestException('Ya registraste tu entrada hoy');
        return this.prisma.attendance.upsert({
            where: { userId_date: { userId, date } },
            create: { userId, date, checkIn: now, status: 'ACTIVE' },
            update: { checkIn: now, status: 'ACTIVE' },
        });
    }
    async checkOut(userId, timestamp) {
        const date = this.todayDate();
        const now = timestamp ? new Date(timestamp) : new Date();
        const attendance = await this.prisma.attendance.findUnique({
            where: { userId_date: { userId, date } },
        });
        if (!attendance?.checkIn)
            throw new common_1.BadRequestException('No has registrado tu entrada');
        if (attendance.checkOut)
            throw new common_1.BadRequestException('Ya registraste tu salida hoy');
        const workedMinutes = this.calcWorkedMinutes(attendance.checkIn, now, attendance.lunchStart, attendance.lunchEnd);
        const earlyDeparture = workedMinutes < WORKDAY_MINUTES;
        return this.prisma.attendance.update({
            where: { userId_date: { userId, date } },
            data: { checkOut: now, status: 'COMPLETED', workedMinutes, earlyDeparture },
        });
    }
    async lunchStart(userId, timestamp) {
        const date = this.todayDate();
        const now = timestamp ? new Date(timestamp) : new Date();
        const attendance = await this.prisma.attendance.findUnique({
            where: { userId_date: { userId, date } },
        });
        if (!attendance?.checkIn)
            throw new common_1.BadRequestException('No has registrado tu entrada');
        if (attendance.lunchStart)
            throw new common_1.BadRequestException('Ya registraste el inicio de almuerzo');
        return this.prisma.attendance.update({
            where: { userId_date: { userId, date } },
            data: { lunchStart: now, status: 'ON_LUNCH' },
        });
    }
    async lunchEnd(userId, timestamp) {
        const date = this.todayDate();
        const now = timestamp ? new Date(timestamp) : new Date();
        const attendance = await this.prisma.attendance.findUnique({
            where: { userId_date: { userId, date } },
        });
        if (!attendance?.lunchStart)
            throw new common_1.BadRequestException('No has registrado el inicio de almuerzo');
        if (attendance.lunchEnd)
            throw new common_1.BadRequestException('Ya registraste el fin de almuerzo');
        return this.prisma.attendance.update({
            where: { userId_date: { userId, date } },
            data: { lunchEnd: now, status: 'ACTIVE' },
        });
    }
    async getMyHistory(userId, from, to) {
        return this.prisma.attendance.findMany({
            where: {
                userId,
                ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
            },
            orderBy: { date: 'desc' },
            take: 30,
        });
    }
    async getTeamAttendance(date) {
        const d = date ? new Date(date) : this.todayDate();
        return this.prisma.attendance.findMany({
            where: { date: d },
            include: {
                user: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } },
            },
            orderBy: { user: { name: 'asc' } },
        });
    }
    async getEarlyDepartures(date) {
        const d = date ? new Date(date) : this.todayDate();
        return this.prisma.attendance.findMany({
            where: { date: d, earlyDeparture: true },
            include: {
                user: {
                    select: {
                        id: true, name: true, role: true, avatarUrl: true,
                        supervisedBy: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { checkOut: 'desc' },
        });
    }
    async getAllAttendance(userId, from, to) {
        return this.prisma.attendance.findMany({
            where: {
                ...(userId ? { userId } : {}),
                ...(from && to ? { date: { gte: new Date(from), lte: new Date(to) } } : {}),
            },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
            },
            orderBy: { date: 'desc' },
            take: 100,
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map