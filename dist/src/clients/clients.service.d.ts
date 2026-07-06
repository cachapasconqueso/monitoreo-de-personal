import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
export declare class ClientsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateClientDto): Promise<{
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
    }>;
    findAll(search?: string): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    }>;
    update(id: string, dto: UpdateClientDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
