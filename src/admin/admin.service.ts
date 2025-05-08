import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminResponseDto } from './dto/admin-response.dto';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
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
      role: Role.ADMIN, // Set the role to ADMIN for the first user
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

  /**
   * Request a password reset
   * @param dto Request password reset DTO containing the email
   * @returns A message indicating that the reset email has been sent
   */
  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<{ message: string }> {
    const user = await this.findByEmail(dto.email);

    // Always return success even if user not found (security best practice)
    if (!user) {
      return { message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation.' };
    }

    // Generate a unique reset token
    const resetToken = uuidv4();

    // Set token expiration (default: 1 hour)
    const expirationTime = new Date();
    const resetExpiration = this.configService.get<number>('PASSWORD_RESET_EXPIRATION') || 3600;
    expirationTime.setSeconds(expirationTime.getSeconds() + resetExpiration);

    // Save the reset token and expiration to the user record
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        reset_password_token: resetToken,
        reset_token_expires: expirationTime,
      },
    });

    // Send the password reset email
    await this.mailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.email, // Using email as username
    );

    return { message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation.' };
  }

  /**
   * Reset password using a token
   * @param dto Reset password DTO containing the token and new password
   * @returns A message indicating that the password has been reset
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    // Validate password confirmation
    if (dto.password !== dto.passConfirm) {
      throw new ConflictException('Les mots de passe ne correspondent pas');
    }

    // Find user by reset token
    const user = await this.prisma.user.findFirst({
      where: {
        reset_password_token: dto.token,
        reset_token_expires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Update the user's password and clear the reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_password_token: null,
        reset_token_expires: null,
      },
    });

    return { message: 'Votre mot de passe a été réinitialisé avec succès' };
  }
}
