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
exports.CheckOutVisitDto = exports.CheckInVisitDto = void 0;
const class_validator_1 = require("class-validator");
class CheckInVisitDto {
    clientId;
    assignmentId;
    timestamp;
    lat;
    lng;
}
exports.CheckInVisitDto = CheckInVisitDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckInVisitDto.prototype, "clientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckInVisitDto.prototype, "assignmentId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckInVisitDto.prototype, "timestamp", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CheckInVisitDto.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CheckInVisitDto.prototype, "lng", void 0);
class CheckOutVisitDto {
    visitId;
    timestamp;
    comment;
    lat;
    lng;
}
exports.CheckOutVisitDto = CheckOutVisitDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckOutVisitDto.prototype, "visitId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckOutVisitDto.prototype, "timestamp", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckOutVisitDto.prototype, "comment", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CheckOutVisitDto.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CheckOutVisitDto.prototype, "lng", void 0);
//# sourceMappingURL=visit.dto.js.map