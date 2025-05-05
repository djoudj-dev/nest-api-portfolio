import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateContractTypeDto {
  @IsString()
  label: string;

  @IsString()
  text: string;

  @IsOptional()
  @IsArray()
  badgeStatusIds?: string[];
}
