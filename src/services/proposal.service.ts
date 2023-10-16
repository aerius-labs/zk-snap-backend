import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FindOneOptions, Repository } from "typeorm";
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
        return this.proposalRepository.find();
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
        throw new NotFoundException(`Proposal with proposal_id ${dao_id} not found`);
        }
        return proposal;
    }

    async update(id: string, data: Partial<Proposal>): Promise<void> {
        await this.findOne(id); // This is to ensure the entity exists and to throw an exception if not
        await this.proposalRepository.update(id, data);
    }

    async remove(id: string): Promise<void> {
        await this.proposalRepository.delete(id);
    }
}