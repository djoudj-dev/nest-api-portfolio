// This is a mock implementation since we don't have the actual passport dependencies installed
// In a real implementation, you would import these from the actual packages
// import { Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class LocalAuthGuard extends AuthGuard('local') {}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LocalStrategy } from '../strategies/local.strategy';
import { RequestWithUser } from '../../admin/interfaces/jwt-payload.interface';

@Injectable()
export class LocalAuthGuard implements CanActivate {
  constructor(private localStrategy: LocalStrategy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Type assertion to ensure we're working with the expected types
    // Using type assertion to avoid unsafe member access
    const body = request.body as { email?: string; password?: string };

    if (!body.email || !body.password) {
      throw new UnauthorizedException('Email and password are required');
    }

    try {
      // Use the local strategy to validate the credentials
      const result = await this.localStrategy.validate(
        body.email,
        body.password,
      );

      // Attach the user to the request
      request.user = {
        sub: 0, // This would be the user ID in a real implementation
        email: result.email,
        role: 'ADMIN' as const, // This would be the user role in a real implementation
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      };
    } catch (error: unknown) {
      console.error('Authentication failed:', error);
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }
}
