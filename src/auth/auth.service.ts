import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import * as bcrypt from 'bcryptjs';
import { CreateAdminDto } from '../admin/dto/create-admin.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateAdminDto) {
    const { email, password, passConfirm } = dto;

    // Check if any users exist (only allow registration if no users exist)
    const userCount = await this.adminService.countUsers();
    if (userCount > 0) {
      throw new ForbiddenException(
        'Registration is not allowed. Admin user already exists.',
      );
    }

    if (password !== passConfirm) {
      throw new ConflictException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.adminService.create({
      email,
      password: hashedPassword,
      role: Role.ADMIN, // Set role to ADMIN for the first user
    });

    const payload = { sub: user.id, email: user.email, role: user.role };

    // Generate an access token and refresh token
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Save tokens to a database
    await this.adminService.updateToken(user.id, access_token);
    await this.adminService.updateRefreshToken(user.id, refresh_token);

    return {
      ...user,
      access_token,
      refresh_token,
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.adminService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, email: user.email, role: user.role };

    // Generate access token and refresh token
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Save tokens to database
    await this.adminService.updateToken(user.id, access_token);
    await this.adminService.updateRefreshToken(user.id, refresh_token);

    return {
      access_token,
      refresh_token,
    };
  }
}
