import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        phone: string | null;
        createdAt: Date;
    }>;
    findAll(role?: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        phone: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        supervisorId: string | null;
        supervisedBy: {
            id: string;
            name: string;
        } | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        phone: string | null;
        avatarUrl: string | null;
        createdAt: Date;
        supervisorId: string | null;
        supervisedBy: {
            id: string;
            name: string;
        } | null;
        employees: {
            id: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
        }[];
    }>;
    findEmployeesBySupervisor(supervisorId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        phone: string | null;
        avatarUrl: string | null;
    }[]>;
    updateLocation(userId: string, lat: number, lng: number): Promise<{
        id: string;
        lastLat: number | null;
        lastLng: number | null;
        lastLocationAt: Date | null;
    }>;
    getTeamLocations(supervisorId?: string): Promise<{
        id: string;
        name: string;
        avatarUrl: string | null;
        lastLat: number | null;
        lastLng: number | null;
        lastLocationAt: Date | null;
    }[]>;
    update(id: string, data: Partial<CreateUserDto>): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        phone: string | null;
    }>;
    deactivate(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        phone: string | null;
        avatarUrl: string | null;
        active: boolean;
        lastLat: number | null;
        lastLng: number | null;
        lastLocationAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        supervisorId: string | null;
    }>;
}
