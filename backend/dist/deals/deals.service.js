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
exports.DealsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const deal_entity_1 = require("./deal.entity");
let DealsService = class DealsService {
    dealsRepository;
    constructor(dealsRepository) {
        this.dealsRepository = dealsRepository;
    }
    async create(createDealDto, user) {
        const deal = this.dealsRepository.create({
            ...createDealDto,
            assignedTo: user,
        });
        return this.dealsRepository.save(deal);
    }
    async findAll() {
        return this.dealsRepository.find({ relations: ['assignedTo'] });
    }
    async updateStage(id, stage) {
        await this.dealsRepository.update(id, { stage });
        return this.dealsRepository.findOneOrFail({ where: { id } });
    }
    async getTotalRevenue(userId) {
        const query = this.dealsRepository
            .createQueryBuilder('deal')
            .select('SUM(deal.value)', 'sum')
            .where('deal.stage = :stage', { stage: deal_entity_1.DealStage.WON });
        if (userId) {
            query.andWhere('deal.assignedToId = :userId', { userId });
        }
        const { sum } = await query.getRawOne();
        return parseFloat(sum || '0');
    }
    async getActiveDealsCount(userId) {
        if (userId) {
            return this.dealsRepository.count({
                where: [
                    { stage: deal_entity_1.DealStage.PROSPECT, assignedTo: { id: userId } },
                    { stage: deal_entity_1.DealStage.NEGOTIATION, assignedTo: { id: userId } }
                ]
            });
        }
        return this.dealsRepository.count({
            where: [
                { stage: deal_entity_1.DealStage.PROSPECT },
                { stage: deal_entity_1.DealStage.NEGOTIATION }
            ]
        });
    }
    async getWinRate(userId) {
        const whereClosed = [
            { stage: deal_entity_1.DealStage.WON },
            { stage: deal_entity_1.DealStage.LOST }
        ];
        if (userId) {
            const closedCount = await this.dealsRepository.count({
                where: [
                    { stage: deal_entity_1.DealStage.WON, assignedTo: { id: userId } },
                    { stage: deal_entity_1.DealStage.LOST, assignedTo: { id: userId } }
                ]
            });
            if (closedCount === 0)
                return 0;
            const wonCount = await this.dealsRepository.count({
                where: { stage: deal_entity_1.DealStage.WON, assignedTo: { id: userId } }
            });
            return (wonCount / closedCount) * 100;
        }
        const totalClosed = await this.dealsRepository.count({ where: whereClosed });
        if (totalClosed === 0)
            return 0;
        const won = await this.dealsRepository.count({ where: { stage: deal_entity_1.DealStage.WON } });
        return (won / totalClosed) * 100;
    }
    async getFunnelStats(userId) {
        const query = this.dealsRepository
            .createQueryBuilder('deal')
            .select('deal.stage')
            .addSelect('COUNT(*)', 'count')
            .groupBy('deal.stage');
        if (userId) {
            query.where('deal.assignedToId = :userId', { userId });
        }
        const stats = await query.getRawMany();
        return stats.reduce((acc, curr) => {
            acc[curr.deal_stage] = parseInt(curr.count, 10);
            return acc;
        }, {});
    }
};
exports.DealsService = DealsService;
exports.DealsService = DealsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(deal_entity_1.Deal)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DealsService);
//# sourceMappingURL=deals.service.js.map