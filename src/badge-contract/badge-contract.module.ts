import { Module } from '@nestjs/common';
import { BadgeStatusController } from './badge-status.controller';
import { BadgeStatusService } from './badge-status.service';
import { ContractTypeController } from './contract-type.controller';
import { ContractTypeService } from './contract-type.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BadgeStatusController, ContractTypeController],
  providers: [BadgeStatusService, ContractTypeService],
  exports: [BadgeStatusService, ContractTypeService],
})
export class BadgeContractModule {}
