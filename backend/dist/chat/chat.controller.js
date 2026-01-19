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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getChannels(req) {
        let channels = await this.chatService.getChannelsForUser(req.user.userId);
        return channels;
    }
    async getMessages(id, req) {
        const userId = req.user.userId;
        console.log(`[getMessages] Requesting messages for channel ${id} by user ${userId}`);
        const valid = await this.chatService.validateUserInChannel(userId, id);
        console.log(`[getMessages] Validation result: ${valid}`);
        if (!valid) {
            console.log(`[getMessages] Access denied for user ${userId} to channel ${id}`);
            throw new common_1.ForbiddenException('You are not a member of this channel');
        }
        return this.chatService.getChannelMessages(id);
    }
    async clearMessages(id, req) {
        const userId = req.user.userId;
        try {
            await this.chatService.clearChannel(id, userId);
            return { success: true };
        }
        catch (e) {
            throw new common_1.ForbiddenException(e.message);
        }
    }
    createChannel(body) {
        return this.chatService.createChannel(body.name, body.userIds);
    }
    async getOrCreateDirectChannel(body) {
        if (!body.currentUserId) {
            throw new Error('currentUserId is required');
        }
        return this.chatService.getOrCreateDirectChannel(body.currentUserId, body.targetUserId);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('channels'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChannels", null);
__decorate([
    (0, common_1.Get)('channels/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Delete)('channels/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "clearMessages", null);
__decorate([
    (0, common_1.Post)('channels'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "createChannel", null);
__decorate([
    (0, common_1.Post)('direct'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getOrCreateDirectChannel", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map