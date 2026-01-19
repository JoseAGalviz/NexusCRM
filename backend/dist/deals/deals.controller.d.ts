import { DealsService } from './deals.service';
import { Deal, DealStage } from './deal.entity';
export declare class DealsController {
    private readonly dealsService;
    constructor(dealsService: DealsService);
    create(createDealDto: Partial<Deal>, req: any): Promise<Deal>;
    findAll(): Promise<Deal[]>;
    updateStage(id: string, stage: DealStage): Promise<Deal>;
}
