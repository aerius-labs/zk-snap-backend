import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, ObjectId } from 'typeorm';
import { Dao } from '../entities/dao.entity';

@Injectable()
export class DaoService {
  constructor(
    @InjectRepository(Dao)
    private daoRepository: Repository<Dao>,
  ) {}

  create(data: Omit<Dao, 'id'>): Promise<Dao> {
    const dao = this.daoRepository.create(data);
    return this.daoRepository.save(dao);
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
