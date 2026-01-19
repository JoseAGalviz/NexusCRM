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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const deals_service_1 = require("../deals/deals.service");
const contacts_service_1 = require("../contacts/contacts.service");
const tasks_service_1 = require("../tasks/tasks.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let DashboardController = class DashboardController {
    dealsService;
    contactsService;
    tasksService;
    constructor(dealsService, contactsService, tasksService) {
        this.dealsService = dealsService;
        this.contactsService = contactsService;
        this.tasksService = tasksService;
    }
    async getStats(req) {
        const userId = req.user.userId;
        const [revenue, activeDeals, winRate, funnel] = await Promise.all([
            this.dealsService.getTotalRevenue(userId),
            this.dealsService.getActiveDealsCount(userId),
            this.dealsService.getWinRate(userId),
            this.dealsService.getFunnelStats(userId),
        ]);
        return {
            revenue,
            activeDeals,
            winRate,
            newLeads: 12,
            funnel
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getStats", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [deals_service_1.DealsService,
        contacts_service_1.ContactsService,
        tasks_service_1.TasksService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map