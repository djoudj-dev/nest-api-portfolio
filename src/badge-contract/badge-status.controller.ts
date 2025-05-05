import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BadgeStatusService } from './badge-status.service';
import { CreateBadgeStatusDto } from './dto/create-badge-status.dto';
import { UpdateBadgeStatusDto } from './dto/update-badge-status.dto';
import { AuthGuard } from '../admin/guards/auth.guard';
import { AdminRoleGuard } from '../admin/guards/admin-role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('badge-status')
@UseGuards(AuthGuard, AdminRoleGuard)
export class BadgeStatusController {
  constructor(private readonly badgeStatusService: BadgeStatusService) {}

  @ApiBearerAuth('jwt')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBadgeStatusDto: CreateBadgeStatusDto) {
    return this.badgeStatusService.create(createBadgeStatusDto);
  }

  @Get()
  findAll() {
    return this.badgeStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.badgeStatusService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBadgeStatusDto: UpdateBadgeStatusDto,
  ) {
    return this.badgeStatusService.update(id, updateBadgeStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.badgeStatusService.remove(id);
  }
}
