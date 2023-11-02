import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindOptionsWhere, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Dao } from '../entities/dao.entity';
import { CreateDaoDto, UpdateDaoDto } from 'src/dtos/dao.dto';
import { createMerkleProof, createMerkleRoot } from '../utils/merkleTreeUtils';
import { Field, Poseidon, PublicKey } from 'o1js';

@Injectable()
export class DaoService {
  constructor(
    @InjectRepository(Dao)
    private daoRepository: Repository<Dao>,
  ) {}

  async create(data: CreateDaoDto): Promise<Dao> {
    if (!data.members || data.members.length === 0) {
      throw new NotFoundException('DAO members list is empty');
    }

    const membersTree = createMerkleRoot(data.members);

    const dao = this.daoRepository.create(data);
    dao.membersRoot = membersTree.getRoot().toString();
    dao.id = uuidv4();
    try {
      return await this.daoRepository.save(dao);
    } catch (error) {
      throw new BadRequestException('Failed to create Dao');
    }
  }

  async getMerkleProof(daoId: string, memberPublicKey: string): Promise<string> {
    const dao = await this.findOne(daoId);
    if (!dao) {
      throw new NotFoundException('DAO not found');
    }

    const memberIndex = dao.members.findIndex(member => member === memberPublicKey);
    if (memberIndex === -1) {
      throw new NotFoundException('Member not found in DAO');
    }

    const merkleProof = createMerkleProof(dao.members, memberIndex);
    try {
      merkleProof
        .calculateRoot(Poseidon.hash([PublicKey.fromBase58(memberPublicKey).x]))
        .assertEquals(Field(dao.membersRoot));
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Invalid Merkle Proof');
    }
    return JSON.stringify(merkleProof.toJSON());
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
      throw new NotFoundException('Failed to find Dao');
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
