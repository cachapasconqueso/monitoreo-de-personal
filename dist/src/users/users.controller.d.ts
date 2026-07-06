import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
    myEmployees(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.Role;
        phone: string | null;
        avatarUrl: string | null;
    }[]>;
    updateLocation(req: any, body: {
        lat: number;
        lng: number;
    }): Promise<{
        id: string;
        lastLat: number | null;
        lastLng: number | null;
        lastLocationAt: Date | null;
    }>;
    teamLocations(req: any, supervisorId?: string): Promise<{
        id: string;
        name: string;
        avatarUrl: string | null;
        lastLat: number | null;
        lastLng: number | null;
        lastLocationAt: Date | null;
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
    update(id: string, dto: Partial<CreateUserDto>): Promise<{
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
