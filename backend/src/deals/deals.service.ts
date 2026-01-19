import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal, DealStage } from './deal.entity';
import { User } from '../users/user.entity';

@Injectable()
export class DealsService {
    constructor(
        @InjectRepository(Deal)
        private dealsRepository: Repository<Deal>,
    ) { }

    async create(createDealDto: Partial<Deal>, user: User): Promise<Deal> {
        const deal = this.dealsRepository.create({
            ...createDealDto,
            assignedTo: user,
        });
        return this.dealsRepository.save(deal);
    }

    async findAll(): Promise<Deal[]> {
        return this.dealsRepository.find({ relations: ['assignedTo'] });
    }

    async updateStage(id: string, stage: DealStage): Promise<Deal> {
        await this.dealsRepository.update(id, { stage });
        return this.dealsRepository.findOneOrFail({ where: { id } });
    }

    // Dashboard Stats
    async getTotalRevenue(userId?: string): Promise<number> {
        const query = this.dealsRepository
            .createQueryBuilder('deal')
            .select('SUM(deal.value)', 'sum')
            .where('deal.stage = :stage', { stage: DealStage.WON });

        if (userId) {
            query.andWhere('deal.assignedToId = :userId', { userId });
        }

        const { sum } = await query.getRawOne();
        return parseFloat(sum || '0');
    }

    async getActiveDealsCount(userId?: string): Promise<number> {
        if (userId) {
            return this.dealsRepository.count({
                where: [
                    { stage: DealStage.PROSPECT, assignedTo: { id: userId } },
                    { stage: DealStage.NEGOTIATION, assignedTo: { id: userId } }
                ]
            });
        }
        return this.dealsRepository.count({
            where: [
                { stage: DealStage.PROSPECT },
                { stage: DealStage.NEGOTIATION }
            ]
        });
    }

    async getWinRate(userId?: string): Promise<number> {
        const whereClosed: any = [
            { stage: DealStage.WON },
            { stage: DealStage.LOST }
        ];

        if (userId) {
            const closedCount = await this.dealsRepository.count({
                where: [
                    { stage: DealStage.WON, assignedTo: { id: userId } },
                    { stage: DealStage.LOST, assignedTo: { id: userId } }
                ]
            });
            if (closedCount === 0) return 0;

            const wonCount = await this.dealsRepository.count({
                where: { stage: DealStage.WON, assignedTo: { id: userId } }
            });
            return (wonCount / closedCount) * 100;
        }

        const totalClosed = await this.dealsRepository.count({ where: whereClosed });
        if (totalClosed === 0) return 0;

        const won = await this.dealsRepository.count({ where: { stage: DealStage.WON } });
        return (won / totalClosed) * 100;
    }

    async getFunnelStats(userId?: string) {
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
}
