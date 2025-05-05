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

    // Log the request user for debugging
    console.log('AdminRoleGuard - request.user:', request.user);

    if (!request.user) {
      console.log('AdminRoleGuard - User not authenticated');
      throw new ForbiddenException('User not authenticated');
    }

    // Log the role for debugging
    console.log('AdminRoleGuard - user.role:', request.user.role);
    console.log('AdminRoleGuard - Role.ADMIN:', Role.ADMIN);
    console.log('AdminRoleGuard - typeof user.role:', typeof request.user.role);
    console.log('AdminRoleGuard - typeof Role.ADMIN:', typeof Role.ADMIN);
    console.log(
      'AdminRoleGuard - user.role === Role.ADMIN:',
      request.user.role === Role.ADMIN,
    );

    if (request.user.role !== Role.ADMIN) {
      console.log('AdminRoleGuard - User is not admin');
      throw new ForbiddenException('Requires admin role');
    }

    return true;
  }
}
