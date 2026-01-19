import { User } from '../users/user.entity';
export declare class Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    assignedTo: User;
    createdAt: Date;
    updatedAt: Date;
}
