import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DealsService } from '../deals/deals.service';
import { ContactsService } from '../contacts/contacts.service';
import { TasksService } from '../tasks/tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(
        private readonly dealsService: DealsService,
        private readonly contactsService: ContactsService,
        private readonly tasksService: TasksService,
    ) { }

    @Get('stats')
    async getStats(@Request() req) {
        // req.user is populated by JwtStrategy (returns { userId, email, role })
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
            newLeads: 12, // Mock for now until ContactsService has this
            funnel
        };
    }
}
