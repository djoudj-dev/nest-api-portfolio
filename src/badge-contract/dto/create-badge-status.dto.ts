import { IsArray, IsOptional, IsDateString } from 'class-validator';
import { BadgeStatus } from '@prisma/client';

export class CreateBadgeStatusDto {
  @IsArray()
  status: BadgeStatus[];

  @IsOptional()
  @IsDateString()
  available_from?: string;

  @IsOptional()
  @IsArray()
  contractTypeIds?: string[];
}
