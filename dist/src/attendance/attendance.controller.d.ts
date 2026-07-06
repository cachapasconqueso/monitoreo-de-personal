import { AttendanceService } from './attendance.service';
import { CheckInDto, CheckOutDto, LunchStartDto, LunchEndDto } from './dto/attendance.dto';
export declare class AttendanceController {
    private service;
    constructor(service: AttendanceService);
    today(req: any): Promise<{
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
    checkIn(req: any, dto: CheckInDto): Promise<{
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
    checkOut(req: any, dto: CheckOutDto): Promise<{
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
    lunchStart(req: any, dto: LunchStartDto): Promise<{
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
    lunchEnd(req: any, dto: LunchEndDto): Promise<{
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
    myHistory(req: any, from?: string, to?: string): Promise<{
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
    team(date?: string): Promise<({
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
    earlyDepartures(date?: string): Promise<({
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
    all(userId?: string, from?: string, to?: string): Promise<({
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
