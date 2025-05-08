import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AuthGuard } from './guards/auth.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { GetUser } from './decorators/get-user.decorator';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private async generateAndUpdateTokens(
    user: JwtPayload,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // Generate new tokens
    const payload = { sub: user.sub, email: user.email, role: user.role };
    const access_token = await this.adminService.generateAccessToken(payload);
    const refresh_token = await this.adminService.generateRefreshToken(payload);

    // Update tokens in database
    await this.adminService.updateToken(user.sub, access_token);
    await this.adminService.updateRefreshToken(user.sub, refresh_token);

    return { access_token, refresh_token };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  register(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.register(createAdminDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.adminService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(AuthGuard, AdminRoleGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
    @GetUser() user: JwtPayload,
  ) {
    const result = await this.adminService.update(id, updateAdminDto);
    const tokens = await this.generateAndUpdateTokens(user);

    return {
      ...result,
      ...tokens,
    };
  }

  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @GetUser() user: JwtPayload) {
    await this.adminService.remove(id);
    await this.generateAndUpdateTokens(user);
  }

  /**
   * Request a password reset
   * @param dto Request password reset DTO containing the email
   * @returns A message indicating that the reset email has been sent
   */
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    try {
      return await this.adminService.requestPasswordReset(dto);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      throw error;
    }
  }

  /**
   * Reset password using a token
   * @param dto Reset password DTO containing the token and new password
   * @returns A message indicating that the password has been reset
   */
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.adminService.resetPassword(dto);
  }
}
