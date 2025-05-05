import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtService } from '@nestjs/jwt';

export interface CreateAdminInput {
  email: string;
  password: string;
  role?: Role;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateAdminDto) {
    const { email, password, passConfirm } = dto;

    // Check if any users exist (only allow registration if no users exist)
    const userCount = await this.countUsers();
    if (userCount > 0) {
      throw new ForbiddenException(
        'Registration is not allowed. Admin user already exists.',
      );
    }

    if (password !== passConfirm) {
      throw new ConflictException('Passwords do not match');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.create({
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
    await this.updateToken(user.id, access_token);
    await this.updateRefreshToken(user.id, refresh_token);

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
    const user = await this.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, email: user.email, role: user.role };

    // Generate an access token and refresh token
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Save tokens to a database
    await this.updateToken(user.id, access_token);
    await this.updateRefreshToken(user.id, refresh_token);

    return {
      access_token,
      refresh_token,
    };
  }

  async create(data: CreateAdminInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const user = await this.prisma.user.create({
      data,
    });

    return this.excludeSensitive(user);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.excludeSensitive(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, dto: UpdateAdminDto) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return this.excludeSensitive(updated);
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    await this.prisma.user.update({
      where: { id },
      data: { refresh_token: refreshToken },
    });
  }

  async updateToken(id: string, token: string) {
    await this.prisma.user.update({
      where: { id },
      data: { access_token: token },
    });
  }

  async generateAccessToken(payload: {
    sub: string;
    email: string;
    role: Role;
  }): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(payload: {
    sub: string;
    email: string;
    role: Role;
  }): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  }

  async remove(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }

  async countUsers(): Promise<number> {
    return this.prisma.user.count();
  }

  public excludeSensitive(user: User): AdminResponseDto {
    const { id, email, role, createdAt, updatedAt } = user as {
      id: string;
      email: string;
      role: Role;
      createdAt: Date;
      updatedAt: Date;
    };

    const dto = new AdminResponseDto();
    dto.id = id;
    dto.email = email;
    dto.role = role;
    dto.createdAt = createdAt;
    dto.updatedAt = updatedAt;
    return dto;
  }
}
