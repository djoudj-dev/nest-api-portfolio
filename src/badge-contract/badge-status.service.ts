import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBadgeStatusDto } from './dto/create-badge-status.dto';
import { UpdateBadgeStatusDto } from './dto/update-badge-status.dto';
import { BadgeStatusResponseDto } from './dto/badge-status-response.dto';
import { BadgeStatus, ContractType } from '@prisma/client';

@Injectable()
export class BadgeStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createBadgeStatusDto: CreateBadgeStatusDto,
  ): Promise<BadgeStatusResponseDto> {
    const { contractTypeIds, ...data } = createBadgeStatusDto;

    const badgeStatus = await this.prisma.badgeStatus.create({
      data: {
        ...data,
        contractTypes: contractTypeIds
          ? {
              connect: contractTypeIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        contractTypes: true,
      },
    });

    return this.mapToResponseDto(badgeStatus);
  }

  async findAll(): Promise<BadgeStatusResponseDto[]> {
    const badgeStatuses = await this.prisma.badgeStatus.findMany({
      include: {
        contractTypes: true,
      },
    });

    return badgeStatuses.map((status) => this.mapToResponseDto(status));
  }

  async findOne(id: string): Promise<BadgeStatusResponseDto> {
    const badgeStatus = await this.prisma.badgeStatus.findUnique({
      where: { id },
      include: {
        contractTypes: true,
      },
    });

    if (!badgeStatus) {
      throw new NotFoundException(`Badge status with ID ${id} not found`);
    }

    return this.mapToResponseDto(badgeStatus);
  }

  async update(
    id: string,
    updateBadgeStatusDto: UpdateBadgeStatusDto,
  ): Promise<BadgeStatusResponseDto> {
    const { contractTypeIds, ...data } = updateBadgeStatusDto;

    // Check if the badge status exists
    await this.findOne(id);

    const badgeStatus = await this.prisma.badgeStatus.update({
      where: { id },
      data: {
        ...data,
        contractTypes: contractTypeIds
          ? {
              set: contractTypeIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        contractTypes: true,
      },
    });

    return this.mapToResponseDto(badgeStatus);
  }

  async remove(id: string): Promise<void> {
    // Check if the badge status exists
    await this.findOne(id);

    await this.prisma.badgeStatus.delete({
      where: { id },
    });
  }

  private mapToResponseDto(
    badgeStatus: BadgeStatus & { contractTypes?: ContractType[] },
  ): BadgeStatusResponseDto {
    return {
      id: badgeStatus.id,
      status: badgeStatus.status,
      available_from: badgeStatus.available_from ?? undefined,
      contractTypes: badgeStatus.contractTypes?.map((ct) => ({
        id: ct.id,
        label: ct.label,
        text: ct.text,
      })),
      created: badgeStatus.created,
      updated: badgeStatus.updated,
    };
  }
}
