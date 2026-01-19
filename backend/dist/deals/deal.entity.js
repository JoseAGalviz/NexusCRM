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
exports.Deal = exports.DealStage = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const contact_entity_1 = require("../contacts/contact.entity");
var DealStage;
(function (DealStage) {
    DealStage["PROSPECT"] = "prospect";
    DealStage["NEGOTIATION"] = "negotiation";
    DealStage["WON"] = "won";
    DealStage["LOST"] = "lost";
})(DealStage || (exports.DealStage = DealStage = {}));
let Deal = class Deal {
    id;
    title;
    value;
    companyName;
    stage;
    assignedTo;
    contact;
    expectedCloseDate;
    createdAt;
    updatedAt;
};
exports.Deal = Deal;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Deal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Deal.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Deal.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Deal.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'simple-enum',
        enum: DealStage,
        default: DealStage.PROSPECT,
    }),
    __metadata("design:type", String)
], Deal.prototype, "stage", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], Deal.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => contact_entity_1.Contact, { nullable: true }),
    __metadata("design:type", contact_entity_1.Contact)
], Deal.prototype, "contact", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Deal.prototype, "expectedCloseDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Deal.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Deal.prototype, "updatedAt", void 0);
exports.Deal = Deal = __decorate([
    (0, typeorm_1.Entity)('deals')
], Deal);
//# sourceMappingURL=deal.entity.js.map