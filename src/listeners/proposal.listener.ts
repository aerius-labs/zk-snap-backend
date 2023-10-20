import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { PublicKey } from 'paillier-bigint';
import { lastValueFrom } from 'rxjs';
import { Dao } from 'src/entities/dao.entity';
import { Proposal } from 'src/entities/proposal.entity';
import { ProposalCreatedEvent } from 'src/events/proposal.event';
import { getRandomNBitNumber } from 'src/utils';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class ProposalCreatedListener {
  constructor(
    @InjectRepository(Dao)
    private readonly daoRepository: Repository<Dao>,
    private readonly httpService: HttpService,
  ) {}

  @OnEvent('proposal.created')
  async handleProposalCreatedEvent(event: ProposalCreatedEvent): Promise<void> {
    console.log('ProposalCreatedEvent', event.proposal);
    try {
      const aggBaseProof = await this.generateAggregatorBaseProofWitness(
        event.proposal,
      );

      const response = await lastValueFrom(
        this.httpService.post(
          `<AGGREGATOR_ENDPOINT>`,
          { witness: aggBaseProof },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      console.error('Error handling ProposalCreatedEvent:', error);
    }
  }

  // TODO - Needs to be trustless.
  private async generateAggregatorBaseProofWitness(
    proposal: Proposal,
  ): Promise<string> {
    const options: FindOneOptions<Dao> = {
      where: { id: proposal.dao_id },
    };
    try {
      const dao = await this.daoRepository.findOne(options);
      if (!dao) throw new Error('DAO not found');

      const encryptionPublicKeyJson = JSON.parse(
        proposal.encryption_key_pair.public_key,
      );
      console.log('encryptionPublicKeyJson', encryptionPublicKeyJson);
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
