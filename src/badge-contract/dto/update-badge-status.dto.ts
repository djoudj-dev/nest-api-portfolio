import { PartialType } from '@nestjs/swagger';
import { CreateBadgeStatusDto } from './create-badge-status.dto';

export class UpdateBadgeStatusDto extends PartialType(CreateBadgeStatusDto) {}
