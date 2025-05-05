import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAdminDto } from '../admin/dto/create-admin.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  register(@Body() createAdminDto: CreateAdminDto) {
    return this.authService.register(createAdminDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(
    @Request() req: { user: { access_token: string; refresh_token: string } },
  ): { access_token: string; refresh_token: string } {
    // The LocalAuthGuard validates the credentials and attaches the user to the request
    // We just need to return the tokens from the request.user
    return {
      access_token: req.user.access_token,
      refresh_token: req.user.refresh_token,
    };
  }
}
