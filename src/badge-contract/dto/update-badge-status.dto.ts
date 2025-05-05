import { PartialType } from '@nestjs/mapped-types';
import { CreateBadgeStatusDto } from './create-badge-status.dto';

export class UpdateBadgeStatusDto extends PartialType(CreateBadgeStatusDto) {}
