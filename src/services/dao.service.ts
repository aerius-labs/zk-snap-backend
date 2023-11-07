import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindOptionsWhere, In } from 'typeorm';

import { Dao } from '../entities/dao.entity';
import { NewDaoDto, UpdateDaoDto } from 'src/dtos/dao.dto';

@Injectable()
export class DaoService {
  constructor(
    @InjectRepository(Dao)
    private daoRepository: Repository<Dao>,
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

  findDaosByIds(id: string[]): Promise<Dao[]> {
    try {
      return this.daoRepository.findBy({ id: In(id) });
    } catch (error) {
      throw new BadRequestException('failed to fetch DAOs');
    }
  }

  async findOne(id: string): Promise<Dao> {
    const options: FindOneOptions<Dao> = {
      where: { id },
    };
    try {
      return await this.daoRepository.findOne(options);
    } catch (error) {
      throw new BadRequestException('Failed to find Dao');
    }
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
