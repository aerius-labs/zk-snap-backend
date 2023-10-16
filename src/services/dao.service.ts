import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, ObjectId } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Dao } from '../entities/dao.entity';
import { constants } from 'src/constants';
import { NewDaoDto } from 'src/dtos/dao.dto';

@Injectable()
export class DaoService {
  constructor(
    @InjectRepository(Dao)
    private daoRepository: Repository<Dao>,
  ) {}

  async create(data: NewDaoDto): Promise<Dao> {
    console.log('reached dao service create');
    console.log('data: ', data);
    const dao = this.daoRepository.create(data);
    try {
      console.log('saved', dao);
      return await this.daoRepository.save(dao);
    } catch (error) {
      console.log('error', error);
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

  async update(id: string, data: Partial<Dao>): Promise<void> {
    await this.daoRepository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    await this.daoRepository.delete(id);
  }
}
