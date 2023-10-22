import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ProposalService } from '../services/proposal.service';
import { NewProposalDto, UpdateProposalDto } from '../dtos/proposal.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { Proposal } from 'src/entities/proposal.entity';
import { DaoService } from 'src/services/dao.service';
import { PublicKey } from 'paillier-bigint';
import { getRandomNBitNumber } from 'src/utils';

@Controller('proposal')
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly daoService: DaoService,
  ) {}

  @Post()
  async create(@Body() createProposalDto: NewProposalDto) {
    return this.proposalService.create(createProposalDto);
  }

  @Get()
  findAll() {
    return this.proposalService.findAll();
  }

  @Post(':id') 
  castVote(@Body() userProof: string) {
    // TODO - transfer user proof to aggregator

  }

  @Post('base-proof/:id')
  async storeBaseProof(@Param('id') id: string, @Body() baseProof: string) {
    return await this.proposalService.storeBaseProof(id, baseProof)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const proposal = await this.proposalService.findOne(id);

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }
    const dao = await this.daoService.findOne(proposal.dao_id);

    if (!dao) {
      throw new NotFoundException('DAO not found for the given proposal');
    }

    return {
      creatorID: proposal.creator,
      proposalID: proposal.id,
      title: proposal.title,
      end_time: proposal.end_time,
      start_time: proposal.start_time,
      description: proposal.description,
      encryptionKeys: proposal.encryption_key_pair,
      daoName: dao.name,
      daoId: dao.id,
      membersRoot: dao.membersRoot,
    };
  }

  @Get('by-dao-id/:dao_id')
  findByProposalId(@Param('dao_id') dao_id: string) {
    return this.proposalService.findByDaolId(dao_id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProposalDto: UpdateProposalDto,
  ) {
    return this.proposalService.update(id, updateProposalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proposalService.remove(id);
  }

  @OnEvent('proposal.created')
  async generateAggregatorBaseProof(proposalId: string) {
    const proposal = await this.proposalService.findOne(proposalId);

    try {
      const aggBaseProof =
        await this.generateAggregatorBaseProofWitness(proposal);

      // TODO - uncomment when aggregator endpoint is ready
      // const response = await lastValueFrom(
      //   this.httpService.post(
      //     `<AGGREGATOR_ENDPOINT>`,
      //     { witness: aggBaseProof },
      //     {
      //       headers: {
      //         'Content-Type': 'application/json',
      //       },
      //     },
      //   ),
      // );
    } catch (error) {
      console.error('Error handling ProposalCreatedEvent:', error);
    }
  }

  // TODO - Needs to be trustless.
  private async generateAggregatorBaseProofWitness(
    proposal: Proposal,
  ): Promise<string> {
    try {
      const dao = await this.daoService.findOne(proposal.dao_id);
      if (!dao) throw new Error('DAO not found');

      const encryptionPublicKeyJson = JSON.parse(
        proposal.encryption_key_pair.public_key,
      );
      const encryptionPublicKey = new PublicKey(
        BigInt(encryptionPublicKeyJson.n.slice(0, -1)),
        BigInt(encryptionPublicKeyJson.g.slice(0, -1)),
      );

      const bitLength = parseInt(process.env.BIT_LENGTH);
      if (!bitLength)
        throw new Error('BIT_LENGTH environment variable is not defined');
      const rEncryption = getRandomNBitNumber(bitLength);

      const initVoteCount = [];
      for (let i = 0; i < 2; i++) {
        const enc = encryptionPublicKey.encrypt(1n, rEncryption);
        initVoteCount.push(enc.toString());
      }

      const witness = {
        encryption_public_key: proposal.encryption_key_pair.public_key,
        proposal_id: proposal.id,
        members_root: dao.membersRoot,
        nonce: '0',
        old_vote_count: initVoteCount,
        new_vote_count: initVoteCount,
      };

      return JSON.stringify(witness);
    } catch (error) {
      console.error('Error generating Aggregator Base Proof Witness:', error);
      throw error;
    }
  }
}
