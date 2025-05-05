export class ContractTypeResponseDto {
  id!: string;
  label!: string;
  text!: string;
  statuses?: { id: string; status: string[]; available_from?: Date }[];
  created!: Date;
  updated!: Date;
}
