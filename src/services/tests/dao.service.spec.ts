import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';

import { Dao } from '../../entities/dao.entity';
import { DaoService } from '../dao.service';
import { CreateDaoDto, UpdateDaoDto } from '../../dtos/dao.dto';
import { createMerkleRoot } from '../../utils/merkleTreeUtils';
import { FindOneOptions, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { NotFoundException } from '@nestjs/common';

describe('DaoService', () => {
  let daoService: DaoService;
  let daoRepository: Repository<Dao>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DaoService,
        {
          provide: getRepositoryToken(Dao),
          useClass: Repository,
        },
      ],
    }).compile();

    daoService = module.get<DaoService>(DaoService);
    daoRepository = module.get<Repository<Dao>>(getRepositoryToken(Dao));
  });

  describe('create', () => {
    it('should create a new dao', async () => {
      const createDaoDto: CreateDaoDto = {
        name: 'Test DAO',
        description: 'This is a test DAO',
        members: [
          'B62qqN8ErUKLx7EhvgMBRQK56AyQborFFnVkjXjvmS679Qwor7b4QE8',
          'B62qp3g6RievigAvtVpho8JGiu4bLBHqX5cfVNSiWHiTrS9XK9B5SYY',
        ],
        logo: 'https://example.com/logo.png',
      };

      const membersRoot = createMerkleRoot(createDaoDto.members);
      const dao: Dao = {
        id: v4(),
        ...createDaoDto,
        _id: new ObjectId(),
        membersRoot: membersRoot.getRoot().toString(),
        membersTree: null,
        logo: 'https://example.com/logo.png',
      };
      const daoRepository = {
        create: jest.fn().mockReturnValue(dao),
        save: jest.fn().mockResolvedValue(dao),
      };

      const daoService = new DaoService(daoRepository as any);
      const result = await daoService.create(createDaoDto);

      expect(result).toEqual(dao);
      expect(daoRepository.create).toHaveBeenCalledWith(createDaoDto);
      expect(daoRepository.save).toHaveBeenCalledWith(dao);
    });
  });

  describe('findAll', () => {
    it('should return an array of daos', async () => {
      const members = [
        'B62qqN8ErUKLx7EhvgMBRQK56AyQborFFnVkjXjvmS679Qwor7b4QE8',
        'B62qp3g6RievigAvtVpho8JGiu4bLBHqX5cfVNSiWHiTrS9XK9B5SYY',
      ];
      const membersRoot = createMerkleRoot(members);
      const dao: Dao = {
        id: v4(),
        name: 'Test DAO',
        description: 'This is a test DAO',
        _id: new ObjectId(),
        membersRoot: membersRoot.getRoot().toString(),
        members: members,
        membersTree: null,
        logo: 'https://example.com/logo.png',
      };

      const daoRepository = {
        find: jest.fn().mockResolvedValue([dao]),
      };

      jest.spyOn(daoRepository, 'find').mockResolvedValueOnce([dao]);

      const daoService = new DaoService(daoRepository as any);
      const result = await daoService.findAll();

      expect(result).toEqual([dao]);
      expect(daoRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const members = [
      'B62qqN8ErUKLx7EhvgMBRQK56AyQborFFnVkjXjvmS679Qwor7b4QE8',
      'B62qp3g6RievigAvtVpho8JGiu4bLBHqX5cfVNSiWHiTrS9XK9B5SYY',
    ];
    const membersRoot = createMerkleRoot(members);
    const id = v4();
    const dao: Dao = {
      id: id,
      name: 'Test DAO',
      description: 'This is a test DAO',
      _id: new ObjectId(),
      membersRoot: membersRoot.getRoot().toString(),
      members: members,
      membersTree: null,
      logo: 'https://example.com/logo.png',
    };

    it('should return a dao', async () => {
      const daoRepository = {
        findOne: jest.fn().mockResolvedValue(dao),
      };
      const daoService = new DaoService(daoRepository as any);

      const result = await daoService.findOne(id);

      expect(result).toEqual(dao);
      const options: FindOneOptions<Dao> = {
        where: { id },
      };
      expect(daoRepository.findOne).toHaveBeenCalledWith(options);
    });

    it('should throw a NotFoundException if dao is not found', async () => {
      const daoRepository = {
        findOne: jest.fn().mockRejectedValueOnce(new Error()),
      };
      const daoService = new DaoService(daoRepository as any);

      const id = '123';
      await expect(daoService.findOne(id)).rejects.toThrowError(
        NotFoundException,
      );
      const options: FindOneOptions<Dao> = {
        where: { id},
      };
      expect(daoRepository.findOne).toHaveBeenCalledWith(options);
    });
  });
});
