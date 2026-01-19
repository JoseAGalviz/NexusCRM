import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('channels')
export class Channel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // "General", "Sales", "Direct-User1-User2"

    @Column({ default: false })
    isDirectMessage: boolean;

    @ManyToMany(() => User, { cascade: true })
    @JoinTable()
    members: User[];

    @CreateDateColumn()
    createdAt: Date;
}
