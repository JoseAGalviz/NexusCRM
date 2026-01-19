import { Repository } from 'typeorm';
import { Deal, DealStage } from './deal.entity';
import { User } from '../users/user.entity';
export declare class DealsService {
    private dealsRepository;
    constructor(dealsRepository: Repository<Deal>);
    create(createDealDto: Partial<Deal>, user: User): Promise<Deal>;
    findAll(): Promise<Deal[]>;
    updateStage(id: string, stage: DealStage): Promise<Deal>;
    getTotalRevenue(userId?: string): Promise<number>;
    getActiveDealsCount(userId?: string): Promise<number>;
    getWinRate(userId?: string): Promise<number>;
    getFunnelStats(userId?: string): Promise<any>;
}
