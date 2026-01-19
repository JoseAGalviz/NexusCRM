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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    chatService;
    server;
    connectedUsers = new Map();
    constructor(chatService) {
        this.chatService = chatService;
    }
    handleConnection(client) {
        const userId = client.handshake.query.userId;
        if (userId) {
            this.connectedUsers.set(client.id, userId);
            client.join(userId);
            this.broadcastOnlineUsers();
            console.log(`Client connected: ${client.id} (User: ${userId})`);
        }
    }
    handleDisconnect(client) {
        if (this.connectedUsers.has(client.id)) {
            this.connectedUsers.delete(client.id);
            this.broadcastOnlineUsers();
            console.log(`Client disconnected: ${client.id}`);
        }
    }
    broadcastOnlineUsers() {
        const uniqueOnlineUsers = Array.from(new Set(this.connectedUsers.values()));
        this.server.emit('onlineUsers', uniqueOnlineUsers);
    }
    async handleJoinChannel(channelId, client) {
        console.log(`Client ${client.id} joining channel ${channelId}`);
        const userId = this.connectedUsers.get(client.id);
        if (!userId) {
            return { error: 'Unauthorized' };
        }
        const canJoin = await this.chatService.validateUserInChannel(userId, channelId);
        if (!canJoin) {
            console.log(`Client ${client.id} (User ${userId}) denied access to channel ${channelId}`);
            return { error: 'Forbidden' };
        }
        client.join(channelId);
        return { event: 'joined', channelId };
    }
    async handleMessage(payload) {
        console.log(`[sendMessage] Received payload:`, JSON.stringify(payload));
        try {
            if (!payload.channelId || !payload.userId || !payload.content) {
                console.error(`[sendMessage] Invalid payload - missing required fields`);
                throw new Error('Invalid payload: channelId, userId, and content are required');
            }
            const savedMessage = await this.chatService.saveMessage(payload.channelId, payload.userId, payload.content, payload.replyToId);
            console.log(`Broadcasting newMessage to room ${payload.channelId}`);
            this.server.to(payload.channelId).emit('newMessage', savedMessage);
            if (savedMessage.channel.isDirectMessage) {
                const otherMember = savedMessage.channel.members.find(m => m.id !== payload.userId);
                if (otherMember) {
                    console.log(`Emitting notification to user ${otherMember.id}`);
                    this.server.to(otherMember.id).emit('notification', {
                        type: 'message',
                        senderId: payload.userId,
                        senderName: `${savedMessage.sender.firstName} ${savedMessage.sender.lastName}`,
                        content: payload.content,
                        channelId: payload.channelId,
                        createdAt: savedMessage.createdAt
                    });
                }
            }
            return savedMessage;
        }
        catch (error) {
            console.error(`[sendMessage] Error:`, error.message);
            console.error(`[sendMessage] Payload was:`, JSON.stringify(payload));
            throw error;
        }
    }
    async handleEditMessage(payload) {
        const editedMessage = await this.chatService.editMessage(payload.messageId, payload.userId, payload.newContent);
        this.server.to(payload.channelId).emit('messageEdited', editedMessage);
        return editedMessage;
    }
    async handleDeleteMessage(payload) {
        let deletedMessage;
        if (payload.deleteForAll) {
            deletedMessage = await this.chatService.deleteMessageForAll(payload.messageId, payload.userId);
        }
        else {
            deletedMessage = await this.chatService.deleteMessageForSelf(payload.messageId, payload.userId);
        }
        this.server.to(payload.channelId).emit('messageDeleted', { messageId: payload.messageId, deleteForAll: payload.deleteForAll, userId: payload.userId });
        return deletedMessage;
    }
    async handleMarkAsRead(payload) {
        await this.chatService.markMessagesAsRead(payload.channelId, payload.userId);
        this.server.to(payload.channelId).emit('messagesRead', {
            channelId: payload.channelId,
            readByUserId: payload.userId,
            readAt: new Date()
        });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinChannel'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('editMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleEditMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('deleteMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDeleteMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('markAsRead'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkAsRead", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map