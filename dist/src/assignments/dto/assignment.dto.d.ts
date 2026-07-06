export declare class AssignmentItemDto {
    clientId: string;
    order?: number;
}
export declare class CreateAssignmentDto {
    employeeId: string;
    date: string;
    clients: AssignmentItemDto[];
}
export declare class RemoveAssignmentDto {
    assignmentId: string;
}
export declare class CreateRouteTemplateDto {
    employeeId: string;
    clients: AssignmentItemDto[];
    daysOfWeek: number[];
    startDate: string;
    endDate?: string;
}
