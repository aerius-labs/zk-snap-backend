import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuid } from 'uuid';

import { Proposal } from '../entities/proposal.entity';
import { NewProposalDto, UpdateProposalDto } from 'src/dtos/proposal.dto';
import { EncryptionService } from './encryption.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ZkProof } from 'src/entities/zk-proof.entity';
import { AggregatorProofInputs } from 'src/dtos/circuit.dto';
import { Dao } from 'src/entities/dao.entity';
import * as schedule from 'node-schedule';
import { testnet } from 'src/utils/drand-client';
import { parseBigInt } from 'src/utils/big-int-string';
import { PrivateKey } from 'paillier-bigint';

@Injectable()
export class ProposalService {
  constructor(
    @InjectRepository(Dao)
    private daoRepository: Repository<Dao>,
    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,
    @InjectRepository(ZkProof)
    private zkProofRepository: Repository<ZkProof>,
    private encryptionService: EncryptionService,
    private eventEmitter: EventEmitter2,
  ) {}

  // TODO - No two proposals should have eqaul title
  async create(data: NewProposalDto): Promise<Proposal> {
    // const dao = await this.daoService.findOne(data.dao_id);
    // if (!dao) {
    //   throw new BadRequestException(
    //     `Dao with ID ${data.dao_id} does not exist`,
    //   );
    // }
    // if (!dao.members.includes(data.creator)) {
    //   throw new BadRequestException(
    //     `Creator ${data.creator} is not a member of Dao with ID ${data.dao_id}`,
    //   );
    // }
    const enc = await this.encryptionService.generateEncryptedKeys(
      data.end_time,
    );

    let proposal = this.proposalRepository.create(data);
    proposal.encryption_key_pair.public_key = enc.pub_key;
    proposal.encryption_key_pair.private_key = enc.pvt_key;

    try {
      const createdProposal = await this.proposalRepository.save(proposal);

      this.scheduleEvent(createdProposal.id, createdProposal.end_time);
      
      this.eventEmitter.emit('proposal.created', createdProposal.id);

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
    console.log(`Event ended for proposal: ${proposalId}`);
    const proposal = await this.findOne(proposalId);
    const encrypted_votes = proposal.zk_proof.publicInput.slice(-2);
    const enc_pvt_key = proposal.encryption_key_pair.private_key;
    const dec_pvt_key = await this.encryptionService.decrypt(
      testnet(),
      enc_pvt_key,
    );
    proposal.encryption_key_pair.private_key = dec_pvt_key.value;
    await this.revealResult(dec_pvt_key.value, encrypted_votes)
    const options: FindOptionsWhere<Proposal> = {
      id: proposalId,
    };
    try {
      await this.proposalRepository.update(options, proposal);
    } catch (error) {
      throw new BadRequestException('Failed to update Proposal');
    }
  }

  private async revealResult(pvt_key: string, vote: string[]): Promise<void>{
    const new_private_key: PrivateKey = parseBigInt(pvt_key)
    vote.map((v) => {
      new_private_key.decrypt(BigInt(v))
    })
    console.log("decrypted votes" ,vote)
    console.log("decrypted private key",new_private_key)
    
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
    console.log(data);
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
    // Store incoming proof as latest proof in Proposal
    // Store latest proof for proposal in DB
    console.log('Storing proof', proof);
    const options: FindOptionsWhere<Proposal> = {
      id: proof.proposalId,
    };
    const updatedProposal = await this.proposalRepository.update(options, {
      zk_proof: proof.generatedProof,
    });
    console.log('Updated proposal', updatedProposal);
    // Emit an event to pickup the next items
    console.log('proof stored');
    this.eventEmitter.emit('proof.stored');
  }
}
