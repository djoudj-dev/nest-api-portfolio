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
import { ContractTypeService } from './contract-type.service';
import { CreateContractTypeDto } from './dto/create-contract-type.dto';
import { UpdateContractTypeDto } from './dto/update-contract-type.dto';
import { AuthGuard } from '../admin/guards/auth.guard';
import { AdminRoleGuard } from '../admin/guards/admin-role.guard';

@Controller('contract-type')
@UseGuards(AuthGuard, AdminRoleGuard)
export class ContractTypeController {
  constructor(private readonly contractTypeService: ContractTypeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createContractTypeDto: CreateContractTypeDto) {
    return this.contractTypeService.create(createContractTypeDto);
  }

  @Get()
  findAll() {
    return this.contractTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractTypeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContractTypeDto: UpdateContractTypeDto,
  ) {
    return this.contractTypeService.update(id, updateContractTypeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.contractTypeService.remove(id);
  }
}
