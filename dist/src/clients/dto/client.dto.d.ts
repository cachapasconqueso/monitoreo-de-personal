export declare class CreateClientDto {
    name: string;
    address: string;
    lat: number;
    lng: number;
    phone?: string;
    email?: string;
    notes?: string;
}
export declare class UpdateClientDto {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
    phone?: string;
    email?: string;
    notes?: string;
    active?: boolean;
}
