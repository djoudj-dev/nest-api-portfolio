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
import { GetUser } from './decorators/get-user.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminDto: UpdateAdminDto,
    @GetUser() user: { sub: number; email: string },
  ) {
    const result = await this.adminService.update(id, updateAdminDto);

    // Generate new tokens
    const payload = { sub: user.sub, email: user.email };
    const access_token = await this.adminService.generateAccessToken(payload);
    const refresh_token = await this.adminService.generateRefreshToken(payload);

    // Update tokens in database
    await this.adminService.updateToken(user.sub, access_token);
    await this.adminService.updateRefreshToken(user.sub, refresh_token);

    return {
      ...result,
      access_token,
      refresh_token,
    };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: { sub: number; email: string },
  ) {
    await this.adminService.remove(id);

    // Generate new tokens
    const payload = { sub: user.sub, email: user.email };
    const access_token = await this.adminService.generateAccessToken(payload);
    const refresh_token = await this.adminService.generateRefreshToken(payload);

    // Update tokens in database
    await this.adminService.updateToken(user.sub, access_token);
    await this.adminService.updateRefreshToken(user.sub, refresh_token);
  }
}
