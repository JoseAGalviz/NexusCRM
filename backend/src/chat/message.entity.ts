import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Channel } from './channel.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    content: string;

    @ManyToOne(() => User)
    sender: User;

    @ManyToOne(() => Channel)
    channel: Channel;

    @ManyToOne(() => Message, { nullable: true })
    replyTo: Message;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    editedAt: Date;

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ type: 'simple-json', nullable: true })
    deletedFor: string[]; // Array of user IDs who deleted this message for themselves

    @Column({ type: 'timestamp', nullable: true })
    readAt: Date;
}
