import { Controller, Post, Get, Param, Patch, Delete, Body } from '@nestjs/common';
import { ProposalService } from '../services/proposal.service'; // Ensure correct path
import { ProposalDto } from '../dtos/proposal.dto'; // Adjust to your DTO
import { Proposal } from '../entities/proposal.entity'; // Adjust to your Entity

@Controller('proposal')
export class ProposalController {
  constructor(private readonly proposalService: ProposalService) {}

  @Post()
  async create(@Body() createProposalDto: ProposalDto) {
    return this.proposalService.create(createProposalDto);
  }

  @Get()
  findAll() {
    return this.proposalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proposalService.findOne(id);
  }

  // Method to fetch by proposal_id (if proposal_id is different from primary id)
  @Get('by-dao-id/:dao_id')
  findByProposalId(@Param('dao_id') dao_id: string) {
    return this.proposalService.findByDaolId(dao_id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProposalDto: Partial<Proposal>) {
    return this.proposalService.update(id, updateProposalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proposalService.remove(id);
  }
}
