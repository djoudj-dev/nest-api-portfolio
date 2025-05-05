import { Role } from '@prisma/client';
import { Request } from 'express';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
  access_token?: string;
  refresh_token?: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
