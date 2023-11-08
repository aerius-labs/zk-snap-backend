import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Proposal } from '../entities/proposal.entity';
import {
  createdProposalDto as NewProposalDto,
  UpdateProposalDto,
} from '../dtos/proposal.dto';
import { EncryptionService } from './encryption.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as schedule from 'node-schedule';
import { testnet } from '../utils/drand-client';
import { parseBigInt } from '../utils/big-int-string';
import { PrivateKey, PublicKey } from 'paillier-bigint';
import { calculateActualResults } from '../utils';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ProposalService {
  constructor(
    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,
    private encryptionService: EncryptionService,
    private eventEmitter: EventEmitter2,
  ) {}

  // TODO - No two proposals should have eqaul title
  async create(data: NewProposalDto): Promise<Proposal> {
    data.start_time = new Date(data.start_time);
    data.end_time = new Date(data.end_time);
    if (data.start_time instanceof Date && data.end_time instanceof Date) {
      const currentMillis = Date.now();
      const startTimeMillis = new Date(data.start_time).getTime();
      const endTimeMillis = new Date(data.end_time).getTime();

      if (startTimeMillis > endTimeMillis) {
        throw new HttpException(
          'end_time should be greater than the start_time',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (startTimeMillis <= currentMillis || endTimeMillis <= currentMillis) {
        throw new HttpException(
          'start_time and end_time should be greater than the current date and time',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        'start_time and end_time should be valid date objects',
        HttpStatus.BAD_REQUEST,
      );
    }

    const enc = await this.encryptionService.generateEncryptedKeys(
      data.end_time,
    );

    let proposal = this.proposalRepository.create(data);
    proposal.id = uuid();
    proposal.encryption_key_pair.public_key = enc.pub_key;
    proposal.encryption_key_pair.private_key = enc.pvt_key;

    try {
      const createdProposal = await this.proposalRepository.save(proposal);

      this.scheduleEvent(createdProposal.id, createdProposal.end_time);

      this.eventEmitter.emit('proposal.created', createdProposal.id);

      console.log('Proposal created');
      return createdProposal;
    } catch (error) {
      throw new BadRequestException('Failed to create proposal');
    }
  }

  private scheduleEvent(proposalId: string, endTime: Date): void {
    schedule.scheduleJob(proposalId, endTime, () => {
      this.handleEventEnd(proposalId);
    });
  }

  private async handleEventEnd(proposalId: string): Promise<void> {
    const proposal = await this.findOne(proposalId);
    const encrypted_votes = proposal.zk_proof.publicInput.slice(-2);
    const enc_pvt_key = proposal.encryption_key_pair.private_key;
    const dec_pvt_key = await this.encryptionService.decrypt(
      testnet(),
      enc_pvt_key,
    );
    proposal.encryption_key_pair.private_key = dec_pvt_key.value;
    proposal.result = await this.revealResult(
      dec_pvt_key.value,
      encrypted_votes,
    );
    proposal.status = 'FINISHED';
    const options: FindOptionsWhere<Proposal> = {
      id: proposalId,
    };
    try {
      await this.proposalRepository.update(options, proposal);
    } catch (error) {
      throw new BadRequestException('Failed to update Proposal');
    }
  }

  async revealVote(id: string): Promise<string[]> {
    const proposal = await this.findOne(id);
    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }
    if (proposal.zk_proof === null) {
      throw new HttpException(
        'Zk proof not found for the given proposal',
        HttpStatus.NOT_FOUND,
      );
    }
    // TODO - check if proposal is finished or not

    const actualResults = calculateActualResults(
      parseInt(proposal.result[0]),
      parseInt(proposal.result[1]),
    );
    return actualResults.map((r) => r.toString());
  }

  private async revealResult(
    pvt_key: string,
    vote: string[],
  ): Promise<string[]> {
    const parsed_priv_key_json = parseBigInt(pvt_key);
    const new_private_key: PrivateKey = new PrivateKey(
      parsed_priv_key_json.lambda,
      parsed_priv_key_json.mu,
      new PublicKey(
        parsed_priv_key_json.publicKey.n,
        parsed_priv_key_json.publicKey.g,
      ),
      parsed_priv_key_json._p,
      parsed_priv_key_json._q,
    );
    const decrypted_votes = [];
    for (const v of vote) {
      const decrypted_vote = new_private_key.decrypt(BigInt(v));
      decrypted_votes.push(decrypted_vote.toString());
    }
    return decrypted_votes;
  }

  findAll(): Promise<Proposal[]> {
    try {
      return this.proposalRepository.find();
    } catch (error) {
      throw new BadRequestException('Failed to find Daos');
    }
  }

  findOne(id: string): Promise<Proposal> {
    const options: FindOneOptions<Proposal> = {
      where: { id },
    };
    return this.proposalRepository.findOne(options);
  }

  async findByDaolId(dao_id: string): Promise<Proposal[]> {
    const proposals = await this.proposalRepository.find({
      where: { dao_id },
    });
    if (!proposals) {
      throw new NotFoundException(`Proposal with dao_id ${dao_id} not found`);
    }
    return proposals;
  }

  async update(id: string, data: UpdateProposalDto): Promise<void> {
    // TODO :- check if this ID exist or not
    const options: FindOptionsWhere<Proposal> = {
      id,
    };
    try {
      await this.proposalRepository.update(options, data);
    } catch (error) {
      throw new BadRequestException('Failed to update Proposal');
    }
  }

  async remove(id: string): Promise<void> {
    // TODO :- check if this ID exist or not
    const options: FindOptionsWhere<Proposal> = {
      id,
    };
    try {
      await this.proposalRepository.delete(options);
    } catch (error) {
      throw new BadRequestException('Failed to delete Proposal');
    }
  }

  async storeProof(proof: any): Promise<void> {
    const options: FindOptionsWhere<Proposal> = {
      id: proof.proposalId,
    };
    const updatedProposal = await this.proposalRepository.update(options, {
      zk_proof: proof.generatedProof,
    });
    if (!updatedProposal) {
      throw new NotFoundException('Proposal not found');
    }
    this.eventEmitter.emit('proof.stored');
    console.log('Proof stored');
  }
}
