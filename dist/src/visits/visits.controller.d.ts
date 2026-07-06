import { VisitsService } from './visits.service';
import { CheckInVisitDto, CheckOutVisitDto } from './dto/visit.dto';
export declare class VisitsController {
    private service;
    constructor(service: VisitsService);
    checkIn(req: any, dto: CheckInVisitDto): Promise<{
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
    checkOut(req: any, dto: CheckOutVisitDto): Promise<{
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
    today(req: any): Promise<({
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
    myHistory(req: any, from?: string, to?: string): Promise<({
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
    byEmployee(employeeId: string, from?: string, to?: string): Promise<({
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
    all(date?: string, employeeId?: string): Promise<({
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
    updateComment(id: string, req: any, comment: string): Promise<{
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
