import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './channel.entity';
import { Message } from './message.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { User } from '../users/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Channel, Message, User])],
    controllers: [ChatController],
    providers: [ChatGateway, ChatService],
    exports: [ChatService],
})
export class ChatModule { }
