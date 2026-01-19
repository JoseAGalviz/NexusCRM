import { User } from '../users/user.entity';
import { Contact } from '../contacts/contact.entity';
export declare enum DealStage {
    PROSPECT = "prospect",
    NEGOTIATION = "negotiation",
    WON = "won",
    LOST = "lost"
}
export declare class Deal {
    id: string;
    title: string;
    value: number;
    companyName: string;
    stage: DealStage;
    assignedTo: User;
    contact: Contact;
    expectedCloseDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
