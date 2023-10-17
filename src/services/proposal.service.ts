import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FindOneOptions, FindOptionsWhere, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import {Proposal} from '../entities/proposal.entity'
import {ProposalDto} from 'src/dtos/proposal.dto'
import { promises } from "dns";

@Injectable()
export class ProposalService {
    constructor(
        @InjectRepository(Proposal)
        private proposalRepository: Repository<Proposal>,
    ) {}

    async create(data: ProposalDto): Promise<Proposal> {
        const proposal = this.proposalRepository.create(data);
        try {
            return await this.proposalRepository.save(proposal);
        } catch (error) {
            throw new BadRequestException("Failed to create proposal");
        }
    }

    findAll(): Promise<Proposal []> {
        try {
            return this.proposalRepository.find();
        } catch (error) {
            throw new BadRequestException('Failed to find Daos');
        }
    }

    findOne(id: string): Promise<Proposal> {
        const options: FindOneOptions<Proposal> = {
            where: {id},
        }
        return this.proposalRepository.findOne(options);
    }

    async findByDaolId(dao_id: string): Promise<Proposal> {
        // Assuming dao_id is a column in the Proposal entity
        const proposal = await this.proposalRepository.findOne({ where: { dao_id } });
        if (!proposal) {
        throw new NotFoundException(`Proposal with dao_id ${dao_id} not found`);
        }
        return proposal;
    }

    async update(id: string, data: Partial<Proposal>): Promise<void> {
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
}