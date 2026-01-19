import { ContactsService } from './contacts.service';
import { Contact } from './contact.entity';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    create(createContactDto: Partial<Contact>, req: any): Promise<Contact>;
    findAll(): Promise<Contact[]>;
    findOne(id: string): Promise<Contact | null>;
    update(id: string, updateContactDto: Partial<Contact>): Promise<Contact | null>;
    remove(id: string): Promise<void>;
}
