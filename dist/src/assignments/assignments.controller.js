"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const assignments_service_1 = require("./assignments.service");
const assignment_dto_1 = require("./dto/assignment.dto");
let AssignmentsController = class AssignmentsController {
    service;
    constructor(service) {
        this.service = service;
    }
    assign(req, dto) {
        return this.service.assign(req.user.id, dto);
    }
    myRoute(req, date) {
        return this.service.getByEmployee(req.user.id, date);
    }
    myWeek(req, date) {
        return this.service.getMyWeek(req.user.id, date);
    }
    bySupervisor(req, date) {
        return this.service.getBySupervisor(req.user.id, date);
    }
    byEmployee(employeeId, date) {
        return this.service.getByEmployee(employeeId, date);
    }
    all(date) {
        return this.service.getAllForJefe(date);
    }
    remove(id, req) {
        return this.service.remove(id, req.user.id);
    }
    createRecurring(req, dto) {
        return this.service.createTemplate(req.user.id, dto);
    }
    recurringByEmployee(employeeId) {
        return this.service.getTemplatesByEmployee(employeeId);
    }
    removeRecurring(id, req) {
        return this.service.deleteTemplate(id, req.user.id);
    }
};
exports.AssignmentsController = AssignmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERVISOR, client_1.Role.JEFE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, assignment_dto_1.CreateAssignmentDto]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "assign", null);
__decorate([
    (0, common_1.Get)('my-route'),
    (0, roles_decorator_1.Roles)(client_1.Role.EMPLEADO),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "myRoute", null);
__decorate([
    (0, common_1.Get)('my-week'),
    (0, roles_decorator_1.Roles)(client_1.Role.EMPLEADO),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "myWeek", null);
__decorate([
    (0, common_1.Get)('by-supervisor'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERVISOR, client_1.Role.JEFE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "bySupervisor", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERVISOR, client_1.Role.JEFE),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "byEmployee", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, roles_decorator_1.Roles)(client_1.Role.JEFE),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "all", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERVISOR, client_1.Role.JEFE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('recurring'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERVISOR, client_1.Role.JEFE),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, assignment_dto_1.CreateRouteTemplateDto]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "createRecurring", null);
__decorate([
    (0, common_1.Get)('recurring/employee/:employeeId'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERVISOR, client_1.Role.JEFE),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "recurringByEmployee", null);
__decorate([
    (0, common_1.Delete)('recurring/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERVISOR, client_1.Role.JEFE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AssignmentsController.prototype, "removeRecurring", null);
exports.AssignmentsController = AssignmentsController = __decorate([
    (0, common_1.Controller)('assignments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [assignments_service_1.AssignmentsService])
], AssignmentsController);
//# sourceMappingURL=assignments.controller.js.map