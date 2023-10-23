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
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ZkProof } from 'src/entities/zk-proof.entity';
import { EncryptionService } from 'src/services/encryption.service';

@Controller('proposal')
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly daoService: DaoService,
    private readonly httpService: HttpService,
    private readonly encryptionService: EncryptionService,
  ) {}

  proofs: ZkProof[] = [];

  @Post()
  async create(@Body() createProposalDto: NewProposalDto) {
    return this.proposalService.create(createProposalDto);
  }

  @Get()
  findAll() {
    return this.proposalService.findAll();
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

  @Post('proof')
  async storeProof(@Body() proof: any) {
    return this.storeProofs(proof);
  }

  @Post(':id/vote')
  async vote(@Param('id') id: string, @Body() voteProof: any) {
    console.log('id', id);
    console.log('voteProof', voteProof);

    return this.aggregateVote(id, voteProof);
  }

  @OnEvent('proposal.created')
  async generateAggregatorBaseProof(proposalId: string) {
    const proposal = await this.proposalService.findOne(proposalId);

    try {
      const aggBaseProof =
        await this.generateAggregatorBaseProofWitness(proposal);
      console.log('Aggregator Base Proof:', aggBaseProof);

      const response = await lastValueFrom(
        this.httpService.post(
          `http://localhost:3001/aggregator`,
          { type: 'base', witness: aggBaseProof, proposalId: proposalId },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      console.log('Aggregator Base Proof Response:', response.status);
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
        encryptionPublicKeyStr: proposal.encryption_key_pair.public_key,
        proposalIdStr: proposal.id,
        membersRootStr: dao.membersRoot,
        nonceStr: '0',
        oldVoteCountStr: initVoteCount,
        newVoteCountStr: initVoteCount,
      };

      return JSON.stringify(witness);
    } catch (error) {
      console.error('Error generating Aggregator Base Proof Witness:', error);
      throw error;
    }
  }

  async storeProofs(proof: ZkProof) {
    this.proofs.push(proof);
    console.log('Proof stored', proof);
  }

  async aggregateVote(id: string, vote: any) {
    const proposal = await this.proposalService.findOne(id);
    const dao = await this.daoService.findOne(proposal.dao_id);

    const witness: any = {};
    witness.encryptionPublicKeyStr = proposal.encryption_key_pair.public_key;
    witness.proposalIdStr = proposal.id;
    witness.membersRootStr = dao.membersRoot;
    witness.nonceStr = '0';
    witness.oldVoteCountStr = [
      this.proofs[this.proofs.length - 1].publicInput[
        this.proofs[this.proofs.length - 1].publicInput.length - 2
      ],
      this.proofs[this.proofs.length - 1].publicInput[
        this.proofs[this.proofs.length - 1].publicInput.length - 2
      ],
    ];

    witness.newVoteCountStr = [];
    for (let i = 0; i < 2; i++) {
      witness.newVoteCountStr.push(
        this.encryptionService.addCipherTexts(
          proposal.encryption_key_pair.public_key,
          vote.publicInput[vote.publicInput.length - 2 + i],
          witness.oldVoteCountStr[i],
        ),
      );
    }

    witness.selfProofStr = JSON.stringify(this.proofs[this.proofs.length - 1]);
    witness.userProofStr = JSON.stringify(vote);

    console.log('Witness', witness);

    const data = {
      type: 'recursive',
      witness: JSON.stringify(witness),
      proposalId: proposal.id,
    };

    const response = await lastValueFrom(
      this.httpService.post(`http://localhost:3001/aggregator`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    console.log('Aggregator Recursive Proof Response:', response.status);
  }
}
