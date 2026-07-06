import { PrismaService } from '../prisma/prisma.service';
import { CheckInVisitDto, CheckOutVisitDto } from './dto/visit.dto';
export declare class VisitsService {
    private prisma;
    constructor(prisma: PrismaService);
    private todayDate;
    checkIn(employeeId: string, dto: CheckInVisitDto): Promise<{
        client: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            lat: number;
            lng: number;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lat: number | null;
        lng: number | null;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        status: import("@prisma/client").$Enums.VisitStatus;
        employeeId: string;
        clientId: string;
        assignmentId: string | null;
        comment: string | null;
    }>;
    checkOut(employeeId: string, dto: CheckOutVisitDto): Promise<{
        client: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            lat: number;
            lng: number;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lat: number | null;
        lng: number | null;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        status: import("@prisma/client").$Enums.VisitStatus;
        employeeId: string;
        clientId: string;
        assignmentId: string | null;
        comment: string | null;
    }>;
    getMyTodayVisits(employeeId: string): Promise<({
        client: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            lat: number;
            lng: number;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lat: number | null;
        lng: number | null;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        status: import("@prisma/client").$Enums.VisitStatus;
        employeeId: string;
        clientId: string;
        assignmentId: string | null;
        comment: string | null;
    })[]>;
    getVisitsByEmployee(employeeId: string, from?: string, to?: string): Promise<({
        client: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            lat: number;
            lng: number;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lat: number | null;
        lng: number | null;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        status: import("@prisma/client").$Enums.VisitStatus;
        employeeId: string;
        clientId: string;
        assignmentId: string | null;
        comment: string | null;
    })[]>;
    getAllVisits(date?: string, employeeId?: string): Promise<({
        client: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            address: string;
            lat: number;
            lng: number;
            notes: string | null;
        };
        employee: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lat: number | null;
        lng: number | null;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        status: import("@prisma/client").$Enums.VisitStatus;
        employeeId: string;
        clientId: string;
        assignmentId: string | null;
        comment: string | null;
    })[]>;
    updateComment(visitId: string, employeeId: string, comment: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        lat: number | null;
        lng: number | null;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        status: import("@prisma/client").$Enums.VisitStatus;
        employeeId: string;
        clientId: string;
        assignmentId: string | null;
        comment: string | null;
    }>;
}
