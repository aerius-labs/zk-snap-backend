import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DaoService } from '../services/dao.service';
import { Dao } from '../entities/dao.entity';
import { NewDaoDto } from 'src/dtos/dao.dto';

@Controller('dao')
export class DaoController {
  constructor(private readonly daoService: DaoService) {}

  @Post()
  async create(@Body() createDaoDto: NewDaoDto) {
    return this.daoService.create(createDaoDto);
  }

  @Get()
  findAll() {
    return this.daoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.daoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDaoDto: Partial<Dao>) {
    return this.daoService.update(id, updateDaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.daoService.remove(id);
  }
}
