import { IsArray, IsOptional, IsDateString } from 'class-validator';
import { BadgeStatusType } from '@prisma/client';

export class CreateBadgeStatusDto {
  @IsArray()
  status!: BadgeStatusType[];

  @IsOptional()
  @IsDateString()
  available_from?: string;

  @IsOptional()
  @IsArray()
  contractTypeIds?: string[];
}
