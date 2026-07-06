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
exports.VisitsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const visits_service_1 = require("./visits.service");
const visit_dto_1 = require("./dto/visit.dto");
let VisitsController = class VisitsController {
    service;
    constructor(service) {
        this.service = service;
    }
    checkIn(req, dto) {
        return this.service.checkIn(req.user.id, dto);
    }
    checkOut(req, dto) {
        return this.service.checkOut(req.user.id, dto);
    }
    today(req) {
        return this.service.getMyTodayVisits(req.user.id);
    }
    myHistory(req, from, to) {
        return this.service.getVisitsByEmployee(req.user.id, from, to);
    }
    byEmployee(employeeId, from, to) {
        return this.service.getVisitsByEmployee(employeeId, from, to);
    }
    all(date, employeeId) {
        return this.service.getAllVisits(date, employeeId);
    }
    updateComment(id, req, comment) {
        return this.service.updateComment(id, req.user.id, comment);
    }
};
exports.VisitsController = VisitsController;
__decorate([
    (0, common_1.Post)('check-in'),
    (0, roles_decorator_1.Roles)(client_1.Role.EMPLEADO),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, visit_dto_1.CheckInVisitDto]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('check-out'),
    (0, roles_decorator_1.Roles)(client_1.Role.EMPLEADO),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, visit_dto_1.CheckOutVisitDto]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Get)('today'),
    (0, roles_decorator_1.Roles)(client_1.Role.EMPLEADO),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "today", null);
__decorate([
    (0, common_1.Get)('my-history'),
    (0, roles_decorator_1.Roles)(client_1.Role.EMPLEADO),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "myHistory", null);
__decorate([
    (0, common_1.Get)('by-employee/:employeeId'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERVISOR, client_1.Role.JEFE),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "byEmployee", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPERVISOR, client_1.Role.JEFE),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "all", null);
__decorate([
    (0, common_1.Patch)(':id/comment'),
    (0, roles_decorator_1.Roles)(client_1.Role.EMPLEADO),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('comment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], VisitsController.prototype, "updateComment", null);
exports.VisitsController = VisitsController = __decorate([
    (0, common_1.Controller)('visits'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [visits_service_1.VisitsService])
], VisitsController);
//# sourceMappingURL=visits.controller.js.map