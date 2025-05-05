export class BadgeStatusResponseDto {
  id: string;
  status: string[];
  available_from?: Date;
  contractTypes?: { id: string; label: string; text: string }[];
  created: Date;
  updated: Date;
}
