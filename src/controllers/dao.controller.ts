import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UsePipes,
  NotFoundException,
} from '@nestjs/common';
import { DaoService } from '../services/dao.service';
import { CreateDaoDto, UpdateDaoDto } from '../dtos/dao.dto';
import { Dao } from '../entities/dao.entity';
import { extractDaoDetails } from '../utils/filter';
import { NewProposalDto } from '../dtos/proposal.dto';
import { ProposalService } from '../services/proposal.service';
import { ValidationPipe } from '../pipes/create-dao.pipe';
@Controller('dao')
export class DaoController {
  constructor(
    private readonly daoService: DaoService,
    private readonly proposalService: ProposalService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createDaoDto: CreateDaoDto) {
    return await this.daoService.create(createDaoDto);
  }

  @Get(':daoId/merkle-proof/:memberPublicKey')
  async getMerkleProof(
    @Param('daoId') daoId: string,
    @Param('memberPublicKey') memberPublicKey: string,
  ) {
    return await this.daoService.getMerkleProof(daoId, memberPublicKey);
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
      throw new NotFoundException(
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
    const proposals = await this.proposalService.findByDaolId(id);
    return extractDaoDetails(dao, proposals);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  update(@Param('id') id: string, @Body() updateDaoDto: UpdateDaoDto) {
    return this.daoService.update(id, updateDaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.daoService.remove(id);
  }
}
