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
import { NewDaoDto, UpdateDaoDto } from 'src/dtos/dao.dto';
import { Dao } from 'src/entities/dao.entity';

@Controller('dao')
export class DaoController {
  constructor(private readonly daoService: DaoService) {}

  @Post()
  async create(@Body() createDaoDto: NewDaoDto) {
    return this.daoService.create(createDaoDto);
  }

  @Get('info')
  async findInfoAllDao() {
    const daos = await this.daoService.findAll();
    const transformedDaos = daos.map((dao: Dao) => ({
      id: dao.id,
      name: dao.name,
      logo: dao.logo,
      membersCount: Array.isArray(dao.members) ? dao.members.length : 0,
    }));
    return transformedDaos;
  }

  @Get()
  findAll() {
    return this.daoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const dao = await this.daoService.findOne(id);
    const proposals = await this.daoService.findProposalsByDaoId(id);

    return {
      dao: dao,
      proposals: proposals,
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDaoDto: UpdateDaoDto) {
    return this.daoService.update(id, updateDaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.daoService.remove(id);
  }
}
