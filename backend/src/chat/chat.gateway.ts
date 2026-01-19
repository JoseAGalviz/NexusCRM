import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
    cors: {
        origin: '*', // Adjust in production
    },
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // Map to track connected users: socketId -> userId
    private connectedUsers: Map<string, string> = new Map();

    constructor(private readonly chatService: ChatService) { }

    handleConnection(client: Socket) {
        // Client can send userId via query params which is common in socket.io
        const userId = client.handshake.query.userId as string;
        if (userId) {
            this.connectedUsers.set(client.id, userId);
            client.join(userId);
            this.broadcastOnlineUsers();
            console.log(`Client connected: ${client.id} (User: ${userId})`);
        }
    }

    handleDisconnect(client: Socket) {
        if (this.connectedUsers.has(client.id)) {
            this.connectedUsers.delete(client.id);
            this.broadcastOnlineUsers();
            console.log(`Client disconnected: ${client.id}`);
        }
    }

    private broadcastOnlineUsers() {
        const uniqueOnlineUsers = Array.from(new Set(this.connectedUsers.values()));
        this.server.emit('onlineUsers', uniqueOnlineUsers);
    }

    @SubscribeMessage('joinChannel')
    async handleJoinChannel(@MessageBody() channelId: string, @ConnectedSocket() client: Socket) {
        console.log(`Client ${client.id} joining channel ${channelId}`);
        const userId = this.connectedUsers.get(client.id);

        if (!userId) {
            // Should verify auth via token in socket handshake really, 
            // but here we rely on the map we built in handleConnection
            // If not found, maybe they are anonymous or connection logic failed
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

    @SubscribeMessage('sendMessage')
    async handleMessage(@MessageBody() payload: { channelId: string; userId: string; content: string; replyToId?: string }) {
        console.log(`[sendMessage] Received payload:`, JSON.stringify(payload));

        try {
            // Validate payload
            if (!payload.channelId || !payload.userId || !payload.content) {
                console.error(`[sendMessage] Invalid payload - missing required fields`);
                throw new Error('Invalid payload: channelId, userId, and content are required');
            }

            const savedMessage = await this.chatService.saveMessage(payload.channelId, payload.userId, payload.content, payload.replyToId);

            // Broadcast to channel room for real-time chat
            console.log(`Broadcasting newMessage to room ${payload.channelId}`);
            this.server.to(payload.channelId).emit('newMessage', savedMessage);

            // Handle Notifications for DMs
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
        } catch (error) {
            console.error(`[sendMessage] Error:`, error.message);
            console.error(`[sendMessage] Payload was:`, JSON.stringify(payload));
            throw error;
        }
    }

    @SubscribeMessage('editMessage')
    async handleEditMessage(@MessageBody() payload: { messageId: string; userId: string; newContent: string; channelId: string }) {
        const editedMessage = await this.chatService.editMessage(payload.messageId, payload.userId, payload.newContent);
        this.server.to(payload.channelId).emit('messageEdited', editedMessage);
        return editedMessage;
    }

    @SubscribeMessage('deleteMessage')
    async handleDeleteMessage(@MessageBody() payload: { messageId: string; userId: string; channelId: string; deleteForAll: boolean }) {
        let deletedMessage;
        if (payload.deleteForAll) {
            deletedMessage = await this.chatService.deleteMessageForAll(payload.messageId, payload.userId);
        } else {
            deletedMessage = await this.chatService.deleteMessageForSelf(payload.messageId, payload.userId);
        }
        this.server.to(payload.channelId).emit('messageDeleted', { messageId: payload.messageId, deleteForAll: payload.deleteForAll, userId: payload.userId });
        return deletedMessage;
    }

    @SubscribeMessage('markAsRead')
    async handleMarkAsRead(@MessageBody() payload: { channelId: string; userId: string }) {
        await this.chatService.markMessagesAsRead(payload.channelId, payload.userId);

        // Notify other members in the channel (specifically the sender) that messages were read
        // For simplicity, we just broadcast 'messagesRead' to the channel room
        this.server.to(payload.channelId).emit('messagesRead', {
            channelId: payload.channelId,
            readByUserId: payload.userId,
            readAt: new Date()
        });
    }
}
