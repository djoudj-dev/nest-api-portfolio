import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';

@Injectable()
export class HeroService {
  constructor(private prisma: PrismaService) {}

  async create(createHeroDto: CreateHeroDto) {
    return this.prisma.hero.create({
      data: createHeroDto,
    });
  }

  async findAll() {
    return this.prisma.hero.findMany();
  }

  async findOne(id: string) {
    return this.prisma.hero.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateHeroDto: UpdateHeroDto) {
    return this.prisma.hero.update({
      where: { id },
      data: updateHeroDto,
    });
  }

  async remove(id: string) {
    return this.prisma.hero.delete({
      where: { id },
    });
  }
}
