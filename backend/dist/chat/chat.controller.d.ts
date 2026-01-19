import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getChannels(req: any): Promise<import("./channel.entity").Channel[]>;
    getMessages(id: string, req: any): Promise<import("./message.entity").Message[]>;
    clearMessages(id: string, req: any): Promise<{
        success: boolean;
    }>;
    createChannel(body: {
        name: string;
        userIds: string[];
    }): Promise<import("./channel.entity").Channel>;
    getOrCreateDirectChannel(body: {
        targetUserId: string;
        currentUserId?: string;
    }): Promise<import("./channel.entity").Channel>;
}
