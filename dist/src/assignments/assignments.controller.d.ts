import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, CreateRouteTemplateDto } from './dto/assignment.dto';
export declare class AssignmentsController {
    private service;
    constructor(service: AssignmentsService);
    assign(req: any, dto: CreateAssignmentDto): Promise<any[]>;
    myRoute(req: any, date?: string): Promise<({
        client: {
            id: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string;
            lat: number;
            lng: number;
            phone: string | null;
            email: string | null;
            notes: string | null;
        };
        visits: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            clientId: string;
            lat: number | null;
            lng: number | null;
            date: Date;
            checkIn: Date | null;
            assignmentId: string | null;
            checkOut: Date | null;
            comment: string | null;
            status: import("@prisma/client").$Enums.VisitStatus;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        supervisorId: string;
        order: number;
        clientId: string;
        templateId: string | null;
        date: Date;
    })[]>;
    myWeek(req: any, date?: string): Promise<{
        date: string;
        dayOfWeek: number;
        assignments: any[];
    }[]>;
    bySupervisor(req: any, date?: string): Promise<({
        employee: {
            id: string;
            name: string;
            avatarUrl: string | null;
        };
        client: {
            id: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string;
            lat: number;
            lng: number;
            phone: string | null;
            email: string | null;
            notes: string | null;
        };
        visits: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            clientId: string;
            lat: number | null;
            lng: number | null;
            date: Date;
            checkIn: Date | null;
            assignmentId: string | null;
            checkOut: Date | null;
            comment: string | null;
            status: import("@prisma/client").$Enums.VisitStatus;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        supervisorId: string;
        order: number;
        clientId: string;
        templateId: string | null;
        date: Date;
    })[]>;
    byEmployee(employeeId: string, date?: string): Promise<({
        client: {
            id: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string;
            lat: number;
            lng: number;
            phone: string | null;
            email: string | null;
            notes: string | null;
        };
        visits: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            clientId: string;
            lat: number | null;
            lng: number | null;
            date: Date;
            checkIn: Date | null;
            assignmentId: string | null;
            checkOut: Date | null;
            comment: string | null;
            status: import("@prisma/client").$Enums.VisitStatus;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        supervisorId: string;
        order: number;
        clientId: string;
        templateId: string | null;
        date: Date;
    })[]>;
    all(date?: string): Promise<({
        employee: {
            id: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
            avatarUrl: string | null;
        };
        supervisor: {
            id: string;
            name: string;
        };
        client: {
            id: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string;
            lat: number;
            lng: number;
            phone: string | null;
            email: string | null;
            notes: string | null;
        };
        visits: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string;
            clientId: string;
            lat: number | null;
            lng: number | null;
            date: Date;
            checkIn: Date | null;
            assignmentId: string | null;
            checkOut: Date | null;
            comment: string | null;
            status: import("@prisma/client").$Enums.VisitStatus;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        supervisorId: string;
        order: number;
        clientId: string;
        templateId: string | null;
        date: Date;
    })[]>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        supervisorId: string;
        order: number;
        clientId: string;
        templateId: string | null;
        date: Date;
    }>;
    createRecurring(req: any, dto: CreateRouteTemplateDto): Promise<{
        clients: ({
            client: {
                id: string;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                address: string;
                lat: number;
                lng: number;
                phone: string | null;
                email: string | null;
                notes: string | null;
            };
        } & {
            id: string;
            order: number;
            clientId: string;
            templateId: string;
        })[];
    } & {
        id: string;
        daysOfWeek: number[];
        startDate: Date;
        endDate: Date | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        supervisorId: string;
    }>;
    recurringByEmployee(employeeId: string): Promise<({
        clients: ({
            client: {
                id: string;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                address: string;
                lat: number;
                lng: number;
                phone: string | null;
                email: string | null;
                notes: string | null;
            };
        } & {
            id: string;
            order: number;
            clientId: string;
            templateId: string;
        })[];
    } & {
        id: string;
        daysOfWeek: number[];
        startDate: Date;
        endDate: Date | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        supervisorId: string;
    })[]>;
    removeRecurring(id: string, req: any): Promise<{
        id: string;
        daysOfWeek: number[];
        startDate: Date;
        endDate: Date | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string;
        supervisorId: string;
    }>;
}
