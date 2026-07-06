import { PrismaService } from '../prisma/prisma.service';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    private todayDate;
    private calcWorkedMinutes;
    getTodayAttendance(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        lunchStart: Date | null;
        lunchEnd: Date | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        workedMinutes: number | null;
        earlyDeparture: boolean;
    } | null>;
    checkIn(userId: string, timestamp?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        lunchStart: Date | null;
        lunchEnd: Date | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        workedMinutes: number | null;
        earlyDeparture: boolean;
    }>;
    checkOut(userId: string, timestamp?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        lunchStart: Date | null;
        lunchEnd: Date | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        workedMinutes: number | null;
        earlyDeparture: boolean;
    }>;
    lunchStart(userId: string, timestamp?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        lunchStart: Date | null;
        lunchEnd: Date | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        workedMinutes: number | null;
        earlyDeparture: boolean;
    }>;
    lunchEnd(userId: string, timestamp?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        lunchStart: Date | null;
        lunchEnd: Date | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        workedMinutes: number | null;
        earlyDeparture: boolean;
    }>;
    getMyHistory(userId: string, from?: string, to?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        lunchStart: Date | null;
        lunchEnd: Date | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        workedMinutes: number | null;
        earlyDeparture: boolean;
    }[]>;
    getTeamAttendance(date?: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        lunchStart: Date | null;
        lunchEnd: Date | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        workedMinutes: number | null;
        earlyDeparture: boolean;
    })[]>;
    getEarlyDepartures(date?: string): Promise<({
        user: {
            id: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            avatarUrl: string | null;
            supervisedBy: {
                id: string;
                name: string;
            } | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        lunchStart: Date | null;
        lunchEnd: Date | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        workedMinutes: number | null;
        earlyDeparture: boolean;
    })[]>;
    getAllAttendance(userId?: string, from?: string, to?: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        lunchStart: Date | null;
        lunchEnd: Date | null;
        status: import("@prisma/client").$Enums.AttendanceStatus;
        workedMinutes: number | null;
        earlyDeparture: boolean;
    })[]>;
}
