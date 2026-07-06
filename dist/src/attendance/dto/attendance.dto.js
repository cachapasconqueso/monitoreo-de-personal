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
exports.UpdateAttendanceDto = exports.LunchEndDto = exports.LunchStartDto = exports.CheckOutDto = exports.CheckInDto = void 0;
const class_validator_1 = require("class-validator");
class CheckInDto {
    timestamp;
}
exports.CheckInDto = CheckInDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckInDto.prototype, "timestamp", void 0);
class CheckOutDto {
    timestamp;
}
exports.CheckOutDto = CheckOutDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckOutDto.prototype, "timestamp", void 0);
class LunchStartDto {
    timestamp;
}
exports.LunchStartDto = LunchStartDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LunchStartDto.prototype, "timestamp", void 0);
class LunchEndDto {
    timestamp;
}
exports.LunchEndDto = LunchEndDto;
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LunchEndDto.prototype, "timestamp", void 0);
class UpdateAttendanceDto {
    notes;
}
exports.UpdateAttendanceDto = UpdateAttendanceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAttendanceDto.prototype, "notes", void 0);
//# sourceMappingURL=attendance.dto.js.map