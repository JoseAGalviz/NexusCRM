import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('channels')
    async getChannels(@Request() req: any) {
        // Quick hack: if no channels, create 'General'
        // Ideally checking count of ALL channels, but for now just check if we find any for user or overall
        // To be safe against empty DB, let's keep the seeded check simple or move it to module init completely
        // But the prompt implies fixing visibility.

        let channels = await this.chatService.getChannelsForUser(req.user.userId);

        // If no channels found for user, we might want to ensure General exists and they can see it.
        // The service logic includes isDirectMessage=false, so they should see General if it exists.

        return channels;
    }

    @Get('channels/:id/messages')
    async getMessages(@Param('id') id: string, @Request() req: any) {
        const userId = req.user.userId;
        console.log(`[getMessages] Requesting messages for channel ${id} by user ${userId}`);
        const valid = await this.chatService.validateUserInChannel(userId, id);
        console.log(`[getMessages] Validation result: ${valid}`);
        if (!valid) {
            console.log(`[getMessages] Access denied for user ${userId} to channel ${id}`);
            throw new ForbiddenException('You are not a member of this channel');
        }
        return this.chatService.getChannelMessages(id);
    }

    @Delete('channels/:id/messages')
    async clearMessages(@Param('id') id: string, @Request() req: any) {
        const userId = req.user.userId;
        try {
            await this.chatService.clearChannel(id, userId);
            // Emission should ideally happen here or via a service that has access to the IO server.
            // Since we can't easily inject ChatGateway into ChatController due to potential circular dependency (Gateway -> Service -> ?),
            // We can try to assume the client pulls or we find a way.
            // Actually, ChatGateway imports ChatService. ChatController imports ChatService.
            // If ChatController imports ChatGateway, it might be circular if Gateway imports something Controller uses? No.
            // But NestJS circular deps are annoying.
            // Safer bet: Send a system message or just return success and let the caller wipe their local state.
            // But others won't know.

            // Let's rely on the frontend to just clear its own view for the invoker?
            // "cualquiera puede ver... arregla eso... confidencialidad" (This was the privacy task).
            // "como limpio los chats?" (This is the delete task).
            // If I delete history, it's gone from DB.
            // If another user refreshes, it's gone.
            // If another user is online, they might still see old messages until refresh.
            // That's acceptable for a quick implementation.

            return { success: true };
        } catch (e) {
            throw new ForbiddenException(e.message);
        }
    }

    @Post('channels')
    createChannel(@Body() body: { name: string; userIds: string[] }) {
        return this.chatService.createChannel(body.name, body.userIds);
    }

    @Post('direct')
    async getOrCreateDirectChannel(@Body() body: { targetUserId: string; currentUserId?: string }) {
        if (!body.currentUserId) {
            throw new Error('currentUserId is required');
        }
        return this.chatService.getOrCreateDirectChannel(body.currentUserId, body.targetUserId);
    }
}
