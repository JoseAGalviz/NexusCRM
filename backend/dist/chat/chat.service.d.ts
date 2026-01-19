import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { Channel } from './channel.entity';
import { User } from '../users/user.entity';
export declare class ChatService implements OnModuleInit {
    private messagesRepository;
    private channelsRepository;
    private usersRepository;
    constructor(messagesRepository: Repository<Message>, channelsRepository: Repository<Channel>, usersRepository: Repository<User>);
    onModuleInit(): Promise<void>;
    saveMessage(channelId: string, userId: string, content: string, replyToId?: string): Promise<Message>;
    getChannelMessages(channelId: string): Promise<Message[]>;
    getChannelsForUser(userId: string): Promise<Channel[]>;
    createChannel(name: string, userIds: string[]): Promise<Channel>;
    editMessage(messageId: string, userId: string, newContent: string): Promise<Message>;
    deleteMessageForSelf(messageId: string, userId: string): Promise<Message>;
    deleteMessageForAll(messageId: string, userId: string): Promise<Message>;
    markMessagesAsRead(channelId: string, userId: string): Promise<void>;
    getOrCreateDirectChannel(userAId: string, userBId: string): Promise<Channel>;
    clearChannel(channelId: string, userId: string): Promise<void>;
    validateUserInChannel(userId: string, channelId: string): Promise<boolean>;
}
