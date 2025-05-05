// This is a mock implementation since we don't have the actual passport dependencies installed
// In a real implementation, you would import these from the actual packages
// import { Strategy } from 'passport-local';
// import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy {
  constructor(private authService: AuthService) {
    // In a real implementation with passport, you would call super() here
    // super({
    //   usernameField: 'email',
    // });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<{ email: string; access_token: string; refresh_token: string }> {
    try {
      const result = await this.authService.login(email, password);
      // If login is successful, return the user (without password)
      return {
        email,
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      };
    } catch (error: unknown) {
      console.error('Authentication failed:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
