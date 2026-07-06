import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto, CreateRouteTemplateDto } from './dto/assignment.dto';
export declare class AssignmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    private parseDate;
    private todayDate;
    private formatDate;
    private mondayOf;
    private materializeForDate;
    assign(supervisorId: string, dto: CreateAssignmentDto): Promise<any[]>;
    createTemplate(supervisorId: string, dto: CreateRouteTemplateDto): Promise<{
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
    getTemplatesByEmployee(employeeId: string): Promise<({
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
    deleteTemplate(templateId: string, supervisorId: string): Promise<{
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
    getByEmployee(employeeId: string, date?: string): Promise<({
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
    getMyWeek(employeeId: string, date?: string): Promise<{
        date: string;
        dayOfWeek: number;
        assignments: any[];
    }[]>;
    getBySupervisor(supervisorId: string, date?: string): Promise<({
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
    remove(assignmentId: string, supervisorId: string): Promise<{
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
    getAllForJefe(date?: string): Promise<({
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
}
