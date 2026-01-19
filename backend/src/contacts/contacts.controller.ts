import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { Contact } from './contact.entity';

// Ideally use JwtAuthGuard here, assuming AuthModule exports it
// @UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Post()
    create(@Body() createContactDto: Partial<Contact>, @Request() req) {
        // req.user would be populated by JWT strategy
        return this.contactsService.create(createContactDto, req.user);
    }

    @Get()
    findAll() {
        return this.contactsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.contactsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateContactDto: Partial<Contact>) {
        return this.contactsService.update(id, updateContactDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.contactsService.remove(id);
    }
}
