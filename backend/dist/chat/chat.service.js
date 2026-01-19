"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./message.entity");
const channel_entity_1 = require("./channel.entity");
const user_entity_1 = require("../users/user.entity");
let ChatService = class ChatService {
    messagesRepository;
    channelsRepository;
    usersRepository;
    constructor(messagesRepository, channelsRepository, usersRepository) {
        this.messagesRepository = messagesRepository;
        this.channelsRepository = channelsRepository;
        this.usersRepository = usersRepository;
    }
    async onModuleInit() {
        const count = await this.channelsRepository.count();
        if (count === 0) {
            const generalChannel = this.channelsRepository.create({ name: 'General' });
            await this.channelsRepository.save(generalChannel);
            console.log('Default channel "General" created.');
        }
    }
    async saveMessage(channelId, userId, content, replyToId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        const channel = await this.channelsRepository.findOne({ where: { id: channelId } });
        if (!user || !channel) {
            throw new Error('User or Channel not found');
        }
        let replyTo = undefined;
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
    async getChannelMessages(channelId) {
        return this.messagesRepository.find({
            where: { channel: { id: channelId } },
            relations: ['sender', 'replyTo', 'replyTo.sender'],
            order: { createdAt: 'ASC' },
        });
    }
    async getChannelsForUser(userId) {
        return this.channelsRepository.createQueryBuilder('channel')
            .leftJoinAndSelect('channel.members', 'member')
            .where('channel.isDirectMessage = :isDirect', { isDirect: false })
            .orWhere('member.id = :userId', { userId })
            .getMany();
    }
    async createChannel(name, userIds) {
        const users = await this.usersRepository.findByIds(userIds);
        const channel = this.channelsRepository.create({
            name,
            members: users,
        });
        return this.channelsRepository.save(channel);
    }
    async editMessage(messageId, userId, newContent) {
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
    async deleteMessageForSelf(messageId, userId) {
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
    async deleteMessageForAll(messageId, userId) {
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
    async markMessagesAsRead(channelId, userId) {
        await this.messagesRepository.createQueryBuilder()
            .update(message_entity_1.Message)
            .set({ readAt: new Date() })
            .where('channelId = :channelId', { channelId })
            .andWhere('senderId != :userId', { userId })
            .andWhere('readAt IS NULL')
            .execute();
    }
    async getOrCreateDirectChannel(userAId, userBId) {
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
        const userA = await this.usersRepository.findOne({ where: { id: userAId } });
        const userB = await this.usersRepository.findOne({ where: { id: userBId } });
        if (!userA || !userB) {
            throw new Error('One or both users not found');
        }
        const newChannel = this.channelsRepository.create({
            name: `${userA.firstName}-${userB.firstName}`,
            isDirectMessage: true,
            members: [userA, userB]
        });
        const saved = await this.channelsRepository.save(newChannel);
        console.log(`[getOrCreateDirectChannel] Created channel ${saved.id} with members:`, saved.members?.map(m => m.id));
        return await this.channelsRepository.findOneOrFail({
            where: { id: saved.id },
            relations: ['members']
        });
    }
    async clearChannel(channelId, userId) {
        const canAccess = await this.validateUserInChannel(userId, channelId);
        if (!canAccess) {
            throw new Error("Access Denied");
        }
        await this.messagesRepository.delete({ channel: { id: channelId } });
    }
    async validateUserInChannel(userId, channelId) {
        const channel = await this.channelsRepository.findOne({
            where: { id: channelId },
            relations: ['members']
        });
        if (!channel) {
            console.log(`[validateUserInChannel] Channel ${channelId} not found`);
            return false;
        }
        if (!channel.isDirectMessage)
            return true;
        const isMember = channel.members.some(m => m.id === userId);
        if (!isMember) {
            console.log(`[validateUserInChannel] User ${userId} is NOT in members: ${channel.members.map(m => m.id).join(', ')}`);
        }
        return isMember;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(channel_entity_1.Channel)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map