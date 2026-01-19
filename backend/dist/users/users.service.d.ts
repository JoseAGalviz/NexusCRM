import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(userData: Partial<User>): Promise<User>;
    findOneByEmail(email: string): Promise<User | null>;
    findOneById(id: string): Promise<User | null>;
    findAll(): Promise<User[]>;
}
