import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContractTypeDto } from './dto/create-contract-type.dto';
import { UpdateContractTypeDto } from './dto/update-contract-type.dto';
import { ContractTypeResponseDto } from './dto/contract-type-response.dto';
import { BadgeStatus, ContractType } from '@prisma/client';

@Injectable()
export class ContractTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createContractTypeDto: CreateContractTypeDto,
  ): Promise<ContractTypeResponseDto> {
    const { badgeStatusIds, ...data } = createContractTypeDto;

    const contractType = await this.prisma.contractType.create({
      data: {
        ...data,
        statuses: badgeStatusIds
          ? {
              connect: badgeStatusIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        statuses: true,
      },
    });

    return this.mapToResponseDto(contractType);
  }

  async findAll(): Promise<ContractTypeResponseDto[]> {
    const contractTypes = await this.prisma.contractType.findMany({
      include: {
        statuses: true,
      },
    });

    return contractTypes.map((type) => this.mapToResponseDto(type));
  }

  async findOne(id: string): Promise<ContractTypeResponseDto> {
    const contractType = await this.prisma.contractType.findUnique({
      where: { id },
      include: {
        statuses: true,
      },
    });

    if (!contractType) {
      throw new NotFoundException(`Contract type with ID ${id} not found`);
    }

    return this.mapToResponseDto(contractType);
  }

  async update(
    id: string,
    updateContractTypeDto: UpdateContractTypeDto,
  ): Promise<ContractTypeResponseDto> {
    const { badgeStatusIds, ...data } = updateContractTypeDto;

    // Check if the contract type exists
    await this.findOne(id);

    const contractType = await this.prisma.contractType.update({
      where: { id },
      data: {
        ...data,
        statuses: badgeStatusIds
          ? {
              set: badgeStatusIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        statuses: true,
      },
    });

    return this.mapToResponseDto(contractType);
  }

  async remove(id: string): Promise<void> {
    // Check if the contract type exists
    await this.findOne(id);

    await this.prisma.contractType.delete({
      where: { id },
    });
  }

  private mapToResponseDto(
    contractType: ContractType & { statuses?: BadgeStatus[] },
  ): ContractTypeResponseDto {
    return {
      id: contractType.id,
      label: contractType.label,
      text: contractType.text,
      statuses: contractType.statuses?.map((status) => ({
        id: status.id,
        status: status.status,
        available_from: status.available_from ?? undefined,
      })),
      created: contractType.created,
      updated: contractType.updated,
    };
  }
}
