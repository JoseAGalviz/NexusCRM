import { User } from '../users/user.entity';
import { Channel } from './channel.entity';
export declare class Message {
    id: string;
    content: string;
    sender: User;
    channel: Channel;
    replyTo: Message;
    createdAt: Date;
    editedAt: Date;
    isDeleted: boolean;
    deletedFor: string[];
    readAt: Date;
}
