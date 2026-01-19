import { User } from '../users/user.entity';
export declare class Channel {
    id: string;
    name: string;
    isDirectMessage: boolean;
    members: User[];
    createdAt: Date;
}
