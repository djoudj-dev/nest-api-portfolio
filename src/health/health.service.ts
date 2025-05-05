// src/health/health.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`; // simple ping DB
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      return { status: 'fail', database: 'disconnected', error: error.message };
    }
  }
}
