import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Contact } from '../contacts/contact.entity';

export enum DealStage {
    PROSPECT = 'prospect', // Prospectos
    NEGOTIATION = 'negotiation', // Negociación
    WON = 'won', // Cierre
    LOST = 'lost', // Perdido
}

@Entity('deals')
export class Deal {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('decimal', { precision: 10, scale: 2 })
    value: number;

    @Column({ nullable: true })
    companyName: string;

    @Column({
        type: 'simple-enum',
        enum: DealStage,
        default: DealStage.PROSPECT,
    })
    stage: DealStage;

    @ManyToOne(() => User, { nullable: true })
    assignedTo: User;

    @ManyToOne(() => Contact, { nullable: true }) // Optional link to a specific contact person
    contact: Contact;

    @Column({ nullable: true })
    expectedCloseDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
