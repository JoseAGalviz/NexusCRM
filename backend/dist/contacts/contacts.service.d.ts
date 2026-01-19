import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { User } from '../users/user.entity';
export declare class ContactsService {
    private contactsRepository;
    constructor(contactsRepository: Repository<Contact>);
    create(createContactDto: Partial<Contact>, user: User): Promise<Contact>;
    findAll(): Promise<Contact[]>;
    findOne(id: string): Promise<Contact | null>;
    update(id: string, updateContactDto: Partial<Contact>): Promise<Contact | null>;
    remove(id: string): Promise<void>;
}
