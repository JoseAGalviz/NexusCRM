import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    private connectedUsers;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private broadcastOnlineUsers;
    handleJoinChannel(channelId: string, client: Socket): Promise<{
        error: string;
        event?: undefined;
        channelId?: undefined;
    } | {
        event: string;
        channelId: string;
        error?: undefined;
    }>;
    handleMessage(payload: {
        channelId: string;
        userId: string;
        content: string;
        replyToId?: string;
    }): Promise<import("./message.entity").Message>;
    handleEditMessage(payload: {
        messageId: string;
        userId: string;
        newContent: string;
        channelId: string;
    }): Promise<import("./message.entity").Message>;
    handleDeleteMessage(payload: {
        messageId: string;
        userId: string;
        channelId: string;
        deleteForAll: boolean;
    }): Promise<any>;
    handleMarkAsRead(payload: {
        channelId: string;
        userId: string;
    }): Promise<void>;
}
