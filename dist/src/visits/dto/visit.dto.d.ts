export declare class CheckInVisitDto {
    clientId: string;
    assignmentId?: string;
    timestamp?: string;
    lat?: number;
    lng?: number;
}
export declare class CheckOutVisitDto {
    visitId: string;
    timestamp?: string;
    comment?: string;
    lat?: number;
    lng?: number;
}
