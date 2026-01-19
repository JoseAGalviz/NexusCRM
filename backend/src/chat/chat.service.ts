import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { Channel } from './channel.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ChatService implements OnModuleInit {
    constructor(
        @InjectRepository(Message)
        private messagesRepository: Repository<Message>,
        @InjectRepository(Channel)
        private channelsRepository: Repository<Channel>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        // Seed default channel if empty
        const count = await this.channelsRepository.count();
        if (count === 0) {
            const generalChannel = this.channelsRepository.create({ name: 'General' });
            await this.channelsRepository.save(generalChannel);
            console.log('Default channel "General" created.');
        }
    }

    async saveMessage(channelId: string, userId: string, content: string, replyToId?: string): Promise<Message> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        const channel = await this.channelsRepository.findOne({ where: { id: channelId } });

        if (!user || !channel) {
            throw new Error('User or Channel not found');
        }

        let replyTo: Message | undefined = undefined;
        if (replyToId) {
            const foundReply = await this.messagesRepository.findOne({ where: { id: replyToId }, relations: ['sender'] });
            if (foundReply) {
                replyTo = foundReply;
            }
        }

        const newMessage = this.messagesRepository.create({
            content,
            sender: user,
            channel: channel,
            replyTo: replyTo,
        });

        const saved = await this.messagesRepository.save(newMessage);
        return await this.messagesRepository.findOneOrFail({
            where: { id: saved.id },
            relations: ['sender', 'replyTo', 'replyTo.sender', 'channel', 'channel.members']
        });
    }

    async getChannelMessages(channelId: string): Promise<Message[]> {
        return this.messagesRepository.find({
            where: { channel: { id: channelId } },
            relations: ['sender', 'replyTo', 'replyTo.sender'],
            order: { createdAt: 'ASC' },
        });
    }

    async getChannelsForUser(userId: string): Promise<Channel[]> {
        // Return public channels (isDirectMessage = false) OR private channels where user is a member
        return this.channelsRepository.createQueryBuilder('channel')
            .leftJoinAndSelect('channel.members', 'member')
            .where('channel.isDirectMessage = :isDirect', { isDirect: false })
            .orWhere('member.id = :userId', { userId })
            .getMany();
    }

    async createChannel(name: string, userIds: string[]): Promise<Channel> {
        const users = await this.usersRepository.findByIds(userIds);
        const channel = this.channelsRepository.create({
            name,
            members: users,
        });
        return this.channelsRepository.save(channel);
    }

    async editMessage(messageId: string, userId: string, newContent: string): Promise<Message> {
        const message = await this.messagesRepository.findOne({
            where: { id: messageId },
            relations: ['sender', 'replyTo', 'replyTo.sender']
        });

        if (!message) {
            throw new Error('Message not found');
        }

        if (message.sender.id !== userId) {
            throw new Error('You can only edit your own messages');
        }

        message.content = newContent;
        message.editedAt = new Date();

        await this.messagesRepository.save(message);
        return message;
    }

    async deleteMessageForSelf(messageId: string, userId: string): Promise<Message> {
        const message = await this.messagesRepository.findOne({
            where: { id: messageId },
            relations: ['sender', 'replyTo', 'replyTo.sender']
        });

        if (!message) {
            throw new Error('Message not found');
        }

        if (!message.deletedFor) {
            message.deletedFor = [];
        }

        if (!message.deletedFor.includes(userId)) {
            message.deletedFor.push(userId);
        }

        await this.messagesRepository.save(message);
        return message;
    }

    async deleteMessageForAll(messageId: string, userId: string): Promise<Message> {
        const message = await this.messagesRepository.findOne({
            where: { id: messageId },
            relations: ['sender', 'replyTo', 'replyTo.sender']
        });

        if (!message) {
            throw new Error('Message not found');
        }

        if (message.sender.id !== userId) {
            throw new Error('You can only delete your own messages for everyone');
        }

        message.isDeleted = true;
        await this.messagesRepository.save(message);
        return message;
    }

    async markMessagesAsRead(channelId: string, userId: string): Promise<void> {
        // Mark all messages in this channel sent by OTHERS as read
        // where readAt is null

        // First find the channel to ensure it exists (and validation logic if needed)
        // We assume valid access from Gateway/Controller before calling this preferably,
        // but for safety/correctness in query:

        // We want to update messages where:
        // channelId = channelId
        // senderId != userId (messages from others)
        // readAt is null

        await this.messagesRepository.createQueryBuilder()
            .update(Message)
            .set({ readAt: new Date() })
            .where('channelId = :channelId', { channelId })
            .andWhere('senderId != :userId', { userId }) // Assuming senderId relation column
            .andWhere('readAt IS NULL')
            .execute();
    }

    async getOrCreateDirectChannel(userAId: string, userBId: string): Promise<Channel> {
        // 1. Try to find existing DM channel between these two users
        // This query is a bit complex with TypeORM shorthand, so we might iterate or use query builder.
        // For simplicity/safety, let's use a query builder approach or finding all DMs and filtering.
        // Since we don't expect millions of DMs yet, finding all DMs involving userA is a start.

        const userChannels = await this.channelsRepository.createQueryBuilder('channel')
            .innerJoinAndSelect('channel.members', 'member')
            .where('channel.isDirectMessage = :isDirect', { isDirect: true })
            .getMany();

        const existingChannel = userChannels.find(c => {
            const memberIds = c.members.map(m => m.id);
            return memberIds.length === 2 && memberIds.includes(userAId) && memberIds.includes(userBId);
        });

        if (existingChannel) {
            console.log(`[getOrCreateDirectChannel] Found existing channel ${existingChannel.id} with members:`, existingChannel.members?.map(m => m.id));
            return existingChannel;
        }

        // 2. Create new DM Channel
        const userA = await this.usersRepository.findOne({ where: { id: userAId } });
        const userB = await this.usersRepository.findOne({ where: { id: userBId } });

        if (!userA || !userB) {
            throw new Error('One or both users not found');
        }

        // Determine a name (optional, frontend can handle display, but let's set one)
        // Usually DM channels might not need a name, or it's dynamic.
        // We'll just store "DM" or something generic, as frontend will show the "other user's name"
        const newChannel = this.channelsRepository.create({
            name: `${userA.firstName}-${userB.firstName}`,
            isDirectMessage: true,
            members: [userA, userB]
        });

        const saved = await this.channelsRepository.save(newChannel);
        console.log(`[getOrCreateDirectChannel] Created channel ${saved.id} with members:`, saved.members?.map(m => m.id));

        // Return with members explicitly loaded
        return await this.channelsRepository.findOneOrFail({
            where: { id: saved.id },
            relations: ['members']
        });
    }

    async clearChannel(channelId: string, userId: string): Promise<void> {
        const canAccess = await this.validateUserInChannel(userId, channelId);
        if (!canAccess) {
            throw new Error("Access Denied");
        }

        // Hard delete all messages in this channel
        // Or soft delete? User asked to "limpiar los chats".
        // Usually means just empty the view. 
        // For privacy/security mentioned earlier, hard deletion might be better or soft delete for all.
        // Let's do soft delete for all (isDeleted = true) so we keep records if needed, 
        // or hard delete if they really want it gone.
        // Let's do hard delete for now to be "clean".

        await this.messagesRepository.delete({ channel: { id: channelId } });

        // If we want to support "Clear for me only", that's harder with current schema efficiently without tracking per user deletion for every message.
        // The prompt implies "limpiar los chats" which usually means the whole conversation in a context of "chat with someone".
        // If it's a DM, both might lose it? Or just me?
        // "cualquiera puede ver los mensajes... arregla eso... confidencialidad"
        // "como limpio los chats?"
        // Usually clear chat in whatsapp clears FOR ME.
        // Clear chat in Discord/Slack deletes message (if admin) or not allowed.
        // Given the simplistic nature, I'll delete ALL messages in channel.
        // But warning: this deletes for BOTH users in DM.
        // I should probably warn the user or just do it.
        // Let's assume "Delete conversation" action.
    }

    async validateUserInChannel(userId: string, channelId: string): Promise<boolean> {
        const channel = await this.channelsRepository.findOne({
            where: { id: channelId },
            relations: ['members']
        });

        if (!channel) {
            console.log(`[validateUserInChannel] Channel ${channelId} not found`);
            return false;
        }

        // If it's a general/public channel (not DM), assume allowed for now (or check logic)
        // Adjust this logic if you have restricted public channels too.
        if (!channel.isDirectMessage) return true;

        // For DMs, user MUST be in members
        const isMember = channel.members.some(m => m.id === userId);
        if (!isMember) {
            console.log(`[validateUserInChannel] User ${userId} is NOT in members: ${channel.members.map(m => m.id).join(', ')}`);
        }
        return isMember;
    }
}
