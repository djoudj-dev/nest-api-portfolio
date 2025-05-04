import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Helper method to generate and update tokens
   */
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
    @Param('id', ParseIntPipe) id: number,
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
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: JwtPayload,
  ) {
    await this.adminService.remove(id);
    await this.generateAndUpdateTokens(user);
  }
}
