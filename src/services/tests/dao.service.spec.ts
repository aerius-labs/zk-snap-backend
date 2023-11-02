import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';

import { Dao } from '../../entities/dao.entity';
import { DaoService } from '../dao.service';
import { CreateDaoDto, UpdateDaoDto } from '../../dtos/dao.dto';
import {
  createMerkleProof,
  createMerkleRoot,
} from '../../utils/merkleTreeUtils';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
        where: { id },
      };
      expect(daoRepository.findOne).toHaveBeenCalledWith(options);
    });
  });

  describe('getMerkleProof', () => {
    const daoId = '123';
    const members = [
      'B62qqN8ErUKLx7EhvgMBRQK56AyQborFFnVkjXjvmS679Qwor7b4QE8',
      'B62qp3g6RievigAvtVpho8JGiu4bLBHqX5cfVNSiWHiTrS9XK9B5SYY',
    ];
    const membersRoot = createMerkleRoot(members);
    const memberPublicKey = members[0];
    const memberIndex = members.findIndex(
      (member) => member === memberPublicKey,
    );
    const proof = createMerkleProof(members, memberIndex);

    it('should return a merkle proof', async () => {
      const daoRepository = {
        findOne: jest.fn().mockResolvedValue({
          id: daoId,
          membersRoot: membersRoot.getRoot().toString(),
          members: members,
        }),
      };
      const daoService = new DaoService(daoRepository as any);

      const result = await daoService.getMerkleProof(daoId, memberPublicKey);
      expect(result).toEqual(JSON.stringify(proof));
      const options: FindOneOptions<Dao> = {
        where: { id: daoId },
      };
      expect(daoRepository.findOne).toHaveBeenCalledWith(options);
    });

    it('should throw a NotFoundException if dao is not found', async () => {
      const daoRepository = {
        findOne: jest.fn().mockResolvedValue(undefined),
      };
      const daoService = new DaoService(daoRepository as any);

      await expect(
        daoService.getMerkleProof(daoId, memberPublicKey),
      ).rejects.toThrowError(NotFoundException);
      const options: FindOneOptions<Dao> = {
        where: { id: daoId },
      };
      expect(daoRepository.findOne).toHaveBeenCalledWith(options);
    });

    it('should throw a BadRequestException if member is not in dao', async () => {
      const daoRepository = {
        findOne: jest.fn().mockResolvedValue({
          id: daoId,
          membersRoot: membersRoot.getRoot().toString(),
          members: members,
        }),
      };
      const daoService = new DaoService(daoRepository as any);

      const invalidMemberPublicKey = 'invalid-public-key';
      await expect(
        daoService.getMerkleProof(daoId, invalidMemberPublicKey),
      ).rejects.toThrowError(BadRequestException);
      const options: FindOneOptions<Dao> = {
        where: { id: daoId },
      };
      expect(daoRepository.findOne).toHaveBeenCalledWith(options);
    });
  });

  describe('update', () => {
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

    it('should update the dao', async () => {
      const daoData: UpdateDaoDto = {
        name: 'Test DAO',
        description: 'This is a test DAO',
        logo: 'https://example.com/logo.png',
        members: [],
      };
      const daoRepository = {
        update: jest.fn().mockResolvedValue({ affected: 1 }),
        findOne: jest.fn().mockResolvedValue({ ...dao, ...daoData }),
      };
      const daoService = new DaoService(daoRepository as any);

      await daoService.update(id, daoData);

      const updatedDao = await daoService.findOne(id);
      expect(updatedDao).toEqual({ ...dao, ...daoData });
      expect(daoRepository.update).toHaveBeenCalledWith(id, daoData);
      const options: FindOneOptions<Dao> = {
        where: { id },
      };
      expect(daoRepository.findOne).toHaveBeenCalledWith(options);
    });

    it('should throw a NotFoundException if dao is not found', async () => {
      const daoData: UpdateDaoDto = {
        name: 'Test DAO',
        description: 'This is a test DAO',
        logo: 'https://example.com/logo.png',
        members: [],
      };
      const daoRepository = {
        save: jest.fn().mockResolvedValue({ affected: 1 }),
        findOne: jest.fn().mockResolvedValue({ dao }),
      };
      const daoService = new DaoService(daoRepository as any);
      daoRepository.findOne.mockResolvedValue(undefined);

      await expect(daoService.update('123', daoData)).rejects.toThrowError(
        NotFoundException,
      );
      const options: FindOneOptions<Dao> = {
        where: { id: '123' },
      };
      expect(daoRepository.findOne).toHaveBeenCalledWith(options);
      expect(daoRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const daoId = '123';

    it('should remove the dao', async () => {
      const daoRepository = {
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
        findOne: jest.fn().mockResolvedValue({ id: daoId } as Dao),
      };
      const daoService = new DaoService(daoRepository as any);

      await daoService.remove(daoId);
      expect(daoRepository.delete).toHaveBeenCalledWith({ id: daoId });
    });

    it('should throw a NotFoundException if dao is not found', async () => {
      const daoRepository = {
        delete: jest.fn().mockResolvedValue({ affected: 0 }),
        findOne: jest.fn().mockResolvedValue(null),
      };

      await expect(daoService.remove(daoId)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
