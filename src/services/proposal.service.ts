import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FindOneOptions, FindOptionsWhere, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import {Proposal} from '../entities/proposal.entity'
import {NewProposalDto, UpdateProposalDto} from 'src/dtos/proposal.dto'
import { DaoService } from "./dao.service";
import { KeysService } from "./key-gen.sevice";
import { testnet } from "src/utils/drand-client";
import { stringifyBigInt } from "src/utils/big-int-string";

@Injectable()
export class ProposalService {
    constructor(
        @InjectRepository(Proposal)
        private proposalRepository: Repository<Proposal>,
        private daoService: DaoService,
        private keysService: KeysService,
    ) {}
    
    // TODO - No two proposals should have eqaul title
    async create(data: NewProposalDto): Promise<Proposal> {
        const dao = await this.daoService.findOne(data.dao_id);
        if (!dao) {
            throw new BadRequestException(`Dao with ID ${data.dao_id} does not exist`);
        }
        if (!dao.members.includes(data.creator)) { 
            throw new BadRequestException(`Creator ${data.creator} is not a member of Dao with ID ${data.dao_id}`);
        }
        const keys = await this.keysService.generatePallierKeys();

        // Serialize the object to a string
        const privateString = stringifyBigInt(keys.privateKey)

        // encrypt the private key
        const client = testnet();
        const encrypted = await this.keysService.encrypt(client, privateString, data.end_time.getTime());

        let proposal = this.proposalRepository.create(data);
        proposal.encryption_key_pair.public_key = stringifyBigInt(keys.publicKey)
        proposal.encryption_key_pair.private_key = encrypted
 
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
        const proposal = await this.proposalRepository.findOne({ where: { dao_id } });
        if (!proposal) {
        throw new NotFoundException(`Proposal with dao_id ${dao_id} not found`);
        }
        return proposal;
    }

    async update(id: string, data: UpdateProposalDto): Promise<void> {
        // TODO :- check if this ID exist or not
        console.log(data)
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