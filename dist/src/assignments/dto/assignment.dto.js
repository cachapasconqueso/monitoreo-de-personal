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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRouteTemplateDto = exports.RemoveAssignmentDto = exports.CreateAssignmentDto = exports.AssignmentItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AssignmentItemDto {
    clientId;
    order;
}
exports.AssignmentItemDto = AssignmentItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssignmentItemDto.prototype, "clientId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AssignmentItemDto.prototype, "order", void 0);
class CreateAssignmentDto {
    employeeId;
    date;
    clients;
}
exports.CreateAssignmentDto = CreateAssignmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAssignmentDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AssignmentItemDto),
    __metadata("design:type", Array)
], CreateAssignmentDto.prototype, "clients", void 0);
class RemoveAssignmentDto {
    assignmentId;
}
exports.RemoveAssignmentDto = RemoveAssignmentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RemoveAssignmentDto.prototype, "assignmentId", void 0);
class CreateRouteTemplateDto {
    employeeId;
    clients;
    daysOfWeek;
    startDate;
    endDate;
}
exports.CreateRouteTemplateDto = CreateRouteTemplateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRouteTemplateDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AssignmentItemDto),
    __metadata("design:type", Array)
], CreateRouteTemplateDto.prototype, "clients", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], CreateRouteTemplateDto.prototype, "daysOfWeek", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRouteTemplateDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRouteTemplateDto.prototype, "endDate", void 0);
//# sourceMappingURL=assignment.dto.js.map