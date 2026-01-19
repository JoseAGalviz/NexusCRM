import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ContactsService {
    constructor(
        @InjectRepository(Contact)
        private contactsRepository: Repository<Contact>,
    ) { }

    async create(createContactDto: Partial<Contact>, user: User): Promise<Contact> {
        const contact = this.contactsRepository.create({
            ...createContactDto,
            assignedTo: user,
        });
        return this.contactsRepository.save(contact);
    }

    async findAll(): Promise<Contact[]> {
        return this.contactsRepository.find({ relations: ['assignedTo'] });
    }

    async findOne(id: string): Promise<Contact | null> {
        return this.contactsRepository.findOne({ where: { id }, relations: ['assignedTo'] });
    }

    async update(id: string, updateContactDto: Partial<Contact>): Promise<Contact | null> {
        await this.contactsRepository.update(id, updateContactDto);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.contactsRepository.delete(id);
    }
}
