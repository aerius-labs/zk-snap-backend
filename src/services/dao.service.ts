import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindOptionsWhere } from 'typeorm';

import { Dao } from '../entities/dao.entity';
import { NewDaoDto, UpdateDaoDto } from 'src/dtos/dao.dto';
import { Proposal } from 'src/entities/proposal.entity';
import { ProposalService } from './proposal.service';

@Injectable()
export class DaoService {
  constructor(
    @InjectRepository(Dao)
    private daoRepository: Repository<Dao>,
    private proposalService: ProposalService,
  ) {}

  async create(data: NewDaoDto): Promise<Dao> {
    const dao = this.daoRepository.create(data);
    try {
      return await this.daoRepository.save(dao);
    } catch (error) {
      throw new BadRequestException('Failed to create Dao');
    }
  }

  findAll(): Promise<Dao[]> {
    try {
      return this.daoRepository.find();
    } catch (error) {
      throw new BadRequestException('Failed to find Daos');
    }
  }

  findOne(id: string): Promise<Dao> {
    const options: FindOneOptions<Dao> = {
      where: { id },
    };
    try {
      return this.daoRepository.findOne(options);
    } catch (error) {
      throw new BadRequestException('Failed to find Dao');
    }
  }

  async findProposalsByDaoId(id: string): Promise<Proposal[]> {
    return await this.proposalService.findByDaolId(id);
  }

  async update(id: string, data: UpdateDaoDto): Promise<void> {
    // TODO :- check if this ID exist or not
    const options: FindOptionsWhere<Dao> = {
      id,
    };
    try {
      await this.daoRepository.update(options, data);
    } catch (error) {
      throw new BadRequestException('Failed to update Dao');
    }
  }

  async remove(id: string): Promise<void> {
    // TODO :- check if this ID exist or not
    const options: FindOptionsWhere<Dao> = {
      id,
    };
    try {
      await this.daoRepository.delete(options);
    } catch (error) {
      throw new BadRequestException('Failed to delete Dao');
    }
  }
}
