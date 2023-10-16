import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindOptionsWhere } from 'typeorm';

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
    return this.daoRepository.find();
  }

  findOne(id: string): Promise<Dao> {
    const options: FindOneOptions<Dao> = {
      where: { id },
    };
    return this.daoRepository.findOne(options);
  }

  async update(id: string, data: UpdateDaoDto): Promise<void> {
    const options: FindOptionsWhere<Dao> = {
      id,
    };
    await this.daoRepository.update(options, data);
  }

  async remove(id: string): Promise<void> {
    const options: FindOptionsWhere<Dao> = {
      id,
    };
    await this.daoRepository.delete(options);
  }
}
