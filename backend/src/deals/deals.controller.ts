import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { DealsService } from './deals.service';
import { Deal, DealStage } from './deal.entity';

@Controller('deals')
export class DealsController {
    constructor(private readonly dealsService: DealsService) { }

    @Post()
    create(@Body() createDealDto: Partial<Deal>, @Request() req) {
        // Assuming req.user is populated by AuthGuard in a real scenario
        return this.dealsService.create(createDealDto, req.user);
    }

    @Get()
    findAll() {
        return this.dealsService.findAll();
    }

    @Patch(':id/stage')
    updateStage(@Param('id') id: string, @Body('stage') stage: DealStage) {
        return this.dealsService.updateStage(id, stage);
    }
}
