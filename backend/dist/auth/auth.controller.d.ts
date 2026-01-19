import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(req: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(body: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("../users/user.entity").UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
