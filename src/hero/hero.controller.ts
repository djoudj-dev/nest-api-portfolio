import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { HeroService } from './hero.service';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';

@Controller('hero')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Post('upload-cv')
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
  uploadCv(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      path: `/uploads/cv/${file.filename}`,
      url: `http://localhost:3000/uploads/cv/${file.filename}`,
    };
  }

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

  @Put(':id')
  update(@Param('id') id: string, @Body() updateHeroDto: UpdateHeroDto) {
    return this.heroService.update(id, updateHeroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.heroService.remove(id);
  }
}
