import { DealsService } from '../deals/deals.service';
import { ContactsService } from '../contacts/contacts.service';
import { TasksService } from '../tasks/tasks.service';
export declare class DashboardController {
    private readonly dealsService;
    private readonly contactsService;
    private readonly tasksService;
    constructor(dealsService: DealsService, contactsService: ContactsService, tasksService: TasksService);
    getStats(req: any): Promise<{
        revenue: number;
        activeDeals: number;
        winRate: number;
        newLeads: number;
        funnel: any;
    }>;
}
