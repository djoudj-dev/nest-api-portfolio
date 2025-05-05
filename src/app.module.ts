import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BadgeContractModule } from './badge-contract/badge-contract.module';

@Module({
  imports: [AdminModule, PrismaModule, BadgeContractModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
