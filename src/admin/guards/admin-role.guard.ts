import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { RequestWithUser } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (request.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Requires admin role');
    }

    return true;
  }
}
