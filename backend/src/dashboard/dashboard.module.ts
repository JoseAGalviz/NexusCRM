import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DealsModule } from '../deals/deals.module';
import { ContactsModule } from '../contacts/contacts.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
    imports: [DealsModule, ContactsModule, TasksModule],
    controllers: [DashboardController],
})
export class DashboardModule { }
