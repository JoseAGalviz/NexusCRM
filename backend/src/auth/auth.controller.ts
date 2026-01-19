import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) { }

    @Post('login')
    async login(@Body() req) {
        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() body) {
        // Basic registration for demo purposes
        // Ideally use DTOs with validation
        const user = await this.usersService.create({
            email: body.email,
            passwordHash: body.password, // Service will hash it
            firstName: body.firstName,
            lastName: body.lastName,
            role: body.role, // Include role from body
        });
        const { passwordHash, ...result } = user;
        return result;
    }
}
