import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { DaoService } from '../services/dao.service';
import { NewDaoDto, UpdateDaoDto } from 'src/dtos/dao.dto';
import { Dao } from 'src/entities/dao.entity';
import { extractDaoDetails } from 'src/utils/filter';
import { ProposalController } from './proposal.controller';
import { NewProposalDto } from 'src/dtos/proposal.dto';
import { ProposalService } from 'src/services/proposal.service';
import { EncryptionService } from 'src/services/encryption.service';

@Controller('dao')
export class DaoController {
  constructor(
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService,
  ) {}

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

  @Post('proposal')
  async createProposal(@Body() newProposal: NewProposalDto) {
    const dao = await this.daoService.findOne(newProposal.dao_id);
    if (!dao) {
      throw new BadRequestException(
        `Dao with ID ${newProposal.dao_id} does not exist`,
      );
    }
    if (!dao.members.includes(newProposal.creator)) {
      throw new BadRequestException(
        `Creator ${newProposal.creator} is not a member of Dao with ID ${newProposal.dao_id}`,
      );
    }
    return await this.proposalService.create(newProposal);
  }

  @Get()
  findAll() {
    return this.daoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const dao = await this.daoService.findOne(id);
    const proposals = await this.daoService.findProposalsByDaoId(id);
    return extractDaoDetails(dao, proposals);
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
