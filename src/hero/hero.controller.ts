import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Body,
  Param,
  Put,
  Delete, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HeroService } from './hero.service';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { AuthGuard } from '../admin/guards/auth.guard';
import { AdminRoleGuard } from '../admin/guards/admin-role.guard';

@Controller('hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @UseGuards(AuthGuard, AdminRoleGuard)
  @Post('upload-cv/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/cv',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadCv(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const filePath = `/uploads/cv/${file.filename}`;
    await this.heroService.update(id, { cv_path: filePath });

    return {
      filename: file.filename,
      path: filePath,
      url: `http://localhost:3000${filePath}`,
    };
  }

  @UseGuards(AuthGuard, AdminRoleGuard)
  @Post()
  create(@Body() createHeroDto: CreateHeroDto) {
    return this.heroService.create(createHeroDto);
  }

  @Get()
  findAll() {
    return this.heroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.heroService.findOne(id);
  }

  @UseGuards(AuthGuard, AdminRoleGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateHeroDto: UpdateHeroDto) {
    return this.heroService.update(id, updateHeroDto);
  }

  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.heroService.remove(id);
  }
}
