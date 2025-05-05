import { BadgeStatusType } from '@prisma/client';

export class BadgeStatusResponseDto {
  id: string;
  status: BadgeStatusType[];
  available_from?: Date;
  contractTypes?: { id: string; label: string; text: string }[];
  created: Date;
  updated: Date;
}
