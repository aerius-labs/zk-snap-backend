import { Test, TestingModule } from '@nestjs/testing';
import { Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DaoService } from './dao.service';
import { Dao } from '../entities/dao.entity';
import { NewDaoDto, UpdateDaoDto } from 'src/dtos/dao.dto';
import { BadRequestException } from '@nestjs/common';

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('DaoService', () => {
  let service: DaoService;
  let repo: Repository<Dao>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DaoService,
        {
          provide: getRepositoryToken(Dao),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DaoService>(DaoService);
    repo = module.get<Repository<Dao>>(getRepositoryToken(Dao));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new dao', async () => {
      const dto: NewDaoDto = {
        name: 'Sample DAO',
        description: 'This DAO is created for test',
        logo: 'logo.png',
        membersRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
      };
      const dao = new Dao();
      jest.spyOn(repo, 'create').mockReturnValue(dao);
      jest.spyOn(repo, 'save').mockResolvedValue(dao);

      expect(await service.create(dto)).toEqual(dao);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(dao);
    });

    it('should throw an error if saving fails', async () => {
      const dto: NewDaoDto = {
        name: 'Test Dao',
        description: 'This DAO is created for test',
        membersRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
      };
      jest.spyOn(repo, 'save').mockRejectedValue(new Error('Database error'));

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of daos', async () => {
      const dao = new Dao();
      jest.spyOn(repo, 'find').mockResolvedValue([dao]);

      expect(await service.findAll()).toEqual([dao]);
      expect(repo.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a dao if found', async () => {
      const dao = new Dao();
      jest.spyOn(repo, 'findOne').mockResolvedValue(dao);

      expect(await service.findOne('1')).toEqual(dao);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return null if not found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      expect(await service.findOne('1')).toBeNull();
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });

  describe('update', () => {
    it('should update a dao', async () => {
      const updateData: UpdateDaoDto = {
        name: 'Updated Dao',
        description: 'This DAO is updated',
        logo: 'logo.png',
        membersRoot:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
      };
      jest.spyOn(repo, 'update').mockResolvedValue({} as UpdateResult);

      await service.update('1', updateData);
      expect(repo.update).toHaveBeenCalledWith({ id: '1' }, updateData);
    });
  });

  describe('remove', () => {
    it('should delete a dao', async () => {
      jest.spyOn(repo, 'delete').mockResolvedValue({} as any);

      await service.remove('1');
      expect(repo.delete).toHaveBeenCalledWith({ id: '1' });
    });
  });
});
