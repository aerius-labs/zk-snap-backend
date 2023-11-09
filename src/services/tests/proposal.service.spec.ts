import { ProposalService } from '../proposal.service';
import { FindOneOptions, Repository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Proposal } from '../../entities/proposal.entity';
import { DaoService } from '../dao.service';
import { Dao } from '../../entities/dao.entity';
import { v4 as uuid } from 'uuid';
import { EncryptionService } from '../encryption.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ZkProof } from 'src/entities/zk-proof.entity';
import { createdProposalDto } from 'src/dtos/proposal.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProposalService', () => {
  let proposalService: ProposalService;
  let proposalRepository: Repository<Proposal>;
  let encryptionService: EncryptionService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProposalService,
        {
          provide: getRepositoryToken(Proposal),
          useClass: Repository,
        },
        {
          provide: EncryptionService,
          useValue: {
            generateEncryptedKeys: jest.fn().mockResolvedValue({
              pub_key: 'publicKey',
              pvt_key: 'privateKey',
            }),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    proposalService = module.get<ProposalService>(ProposalService);
    proposalRepository = module.get<Repository<Proposal>>(
      getRepositoryToken(Proposal),
    );
    encryptionService = module.get<EncryptionService>(EncryptionService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('create', () => {
    it('should create a new proposal', async () => {
      const createProposalDto: createdProposalDto = {
        creator: 'creatorId',
        title: 'proposalTitle',
        description: 'proposalDescription',
        dao_id: 'daoId',
        start_time: new Date(Date.now() + 100001),
        end_time: new Date(Date.now() + 1000000),
        voting_options: ['yes', 'no'],
      };
      const enc = await encryptionService.generateEncryptedKeys(
        createProposalDto.end_time,
      );

      let proposal = proposalRepository.create(createProposalDto);
      proposal.id = uuid();
      proposal.encryption_key_pair.public_key = enc.pub_key;
      proposal.encryption_key_pair.private_key = enc.pvt_key;

      jest.spyOn(encryptionService, 'generateEncryptedKeys').mockResolvedValue({
        pub_key: 'publicKey',
        pvt_key: 'privateKey',
      });

      const mockCreate = jest.fn().mockReturnValue(proposal);
      const mockSave = jest.fn().mockResolvedValue(proposal);
      jest.spyOn(proposalRepository, 'create').mockImplementation(mockCreate);
      jest.spyOn(proposalRepository, 'save').mockImplementation(mockSave);

      const createdProposal = await proposalRepository.save(proposal);

      expect(createdProposal).toBeDefined();
      expect(createdProposal.id).toBeDefined();
      expect(createdProposal.creator).toEqual(createProposalDto.creator);
      expect(createdProposal.title).toEqual(createProposalDto.title);
      expect(createdProposal.description).toEqual(
        createProposalDto.description,
      );
      expect(createdProposal.dao_id).toEqual(createProposalDto.dao_id);
      expect(createdProposal.start_time).toEqual(createProposalDto.start_time);
      expect(createdProposal.end_time).toEqual(createProposalDto.end_time);
      expect(createdProposal.voting_options).toEqual(
        createProposalDto.voting_options,
      );

      // Test event emitter
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'proposal.created',
        createdProposal,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of proposals', async () => {
      const mockProposals: Proposal[] = [
        {
          _id: new ObjectId(),
          id: '1',
          creator: 'creatorId',
          title: 'proposalTitle',
          description: 'proposalDescription',
          dao_id: 'daoId',
          start_time: new Date(Date.now() + 100001),
          end_time: new Date(Date.now() + 1000000),
          voting_options: ['yes', 'no'],
          encryption_key_pair: {
            public_key: 'publicKey',
            private_key: 'privateKey',
          },
          status: 'NOT_STARTED',
          result: [],
          zk_proof: null,
        },
        {
          _id: new ObjectId(),
          id: '2',
          creator: 'creatorId2',
          title: 'proposalTitle2',
          description: 'proposalDescription2',
          dao_id: 'daoId2',
          start_time: new Date(Date.now() + 100002),
          end_time: new Date(Date.now() + 1000001),
          voting_options: ['yes', 'no', 'abstain'],
          encryption_key_pair: {
            public_key: 'publicKey2',
            private_key: 'privateKey2',
          },
          status: 'NOT_STARTED',
          result: [],
          zk_proof: null,
        },
      ];

      jest.spyOn(proposalRepository, 'find').mockResolvedValue(mockProposals);

      const proposals = await proposalService.findAll();

      expect(proposals).toEqual(mockProposals);
    });
  });

  describe('findOne', () => {
    it('should return a proposal', async () => {
      const mockProposal: Proposal = {
        _id: new ObjectId(),
        id: '1',
        creator: 'creatorId',
        title: 'proposalTitle',
        description: 'proposalDescription',
        dao_id: 'daoId',
        start_time: new Date(Date.now() + 100001),
        end_time: new Date(Date.now() + 1000000),
        voting_options: ['yes', 'no'],
        encryption_key_pair: {
          public_key: 'publicKey',
          private_key: 'privateKey',
        },
        status: 'NOT_STARTED',
        result: [],
        zk_proof: null,
      };

      jest.spyOn(proposalRepository, 'findOne').mockResolvedValue(mockProposal);

      const proposal = await proposalService.findOne('1');

      expect(proposal).toEqual(mockProposal);
    });
    it('should throw an error if proposal not found', async () => {
      jest.spyOn(proposalRepository, 'findOne').mockResolvedValue(null);

      const id = '1';
      await expect(proposalService.findOne(id)).rejects.toThrow(
        new NotFoundException(`Proposal with id ${id} not found`),
      );
    });
  });

  describe('findByDaoId', () => {
    it('should return an array of proposals', async () => {
      const mockProposals: Proposal[] = [
        {
          _id: new ObjectId(),
          id: '1',
          creator: 'creatorId',
          title: 'proposalTitle',
          description: 'proposalDescription',
          dao_id: 'daoId',
          start_time: new Date(Date.now() + 100001),
          end_time: new Date(Date.now() + 1000000),
          voting_options: ['yes', 'no'],
          encryption_key_pair: {
            public_key: 'publicKey',
            private_key: 'privateKey',
          },
          status: 'NOT_STARTED',
          result: [],
          zk_proof: null,
        },
        {
          _id: new ObjectId(),
          id: '2',
          creator: 'creatorId2',
          title: 'proposalTitle2',
          description: 'proposalDescription2',
          dao_id: 'daoId2',
          start_time: new Date(Date.now() + 100002),
          end_time: new Date(Date.now() + 1000001),
          voting_options: ['yes', 'no', 'abstain'],
          encryption_key_pair: {
            public_key: 'publicKey2',
            private_key: 'privateKey2',
          },
          status: 'NOT_STARTED',
          result: [],
          zk_proof: null,
        },
      ];

      jest.spyOn(proposalRepository, 'find').mockResolvedValue(mockProposals);

      const proposals = await proposalService.findByDaolId('daoId');
      expect(proposals).toEqual(mockProposals);
    });

    it('should throw an error if dao not found', async () => {
      jest.spyOn(proposalRepository, 'find').mockResolvedValue(null);

      const dao_id = '1';
      await expect(proposalService.findByDaolId(dao_id)).rejects.toThrow(
        new NotFoundException(`Proposal with dao_id ${dao_id} not found`),
      );
    });
  });

  describe('revealVote', () => {});

  describe('update', () => {
    const mockProposal: Proposal = {
        _id: new ObjectId(),
        id: '1',
        creator: 'creatorId',
        title: 'proposalTitle',
        description: 'proposalDescription',
        dao_id: 'daoId',
        start_time: new Date(Date.now() + 100001),
        end_time: new Date(Date.now() + 1000000),
        voting_options: ['yes', 'no'],
        encryption_key_pair: {
          public_key: 'publicKey',
          private_key: 'privateKey',
        },
        status: 'NOT_STARTED',
        result: [],
        zk_proof: null,
      };

      const updateProposalDto = {
        creator: 'creatorId',
        title: 'proposalTitleNew',
        description: 'proposalDescriptionNew',
        dao_id: 'daoId',
        start_time: new Date(Date.now() + 100001),
        end_time: new Date(Date.now() + 1000000),
        voting_options: ['yes', 'no'],
      };
    it('should update a proposal', async () => {
      const updatedResult = { ...mockProposal, ...updateProposalDto };
      jest
        .spyOn(proposalRepository, 'findOne')
        .mockResolvedValue(updatedResult as Proposal);   
      jest
        .spyOn(proposalRepository, 'update')
        .mockResolvedValue(updatedResult as any);

      const result = await proposalService.update('1', updateProposalDto);

      expect(result).toEqual(updatedResult);

      expect(proposalRepository.update).toHaveBeenCalledWith(
        { id: '1' },
        updateProposalDto,
      );
      const options: FindOneOptions<Proposal> = {
        where: { id: '1' },
      };
      expect(proposalRepository.findOne).toHaveBeenCalledWith(options);
    });

    it('should throw an error if proposal not found', async () => {
        jest.spyOn(proposalRepository, 'findOne').mockResolvedValue(null);
        jest.spyOn(proposalRepository, 'update').mockResolvedValue({affected: 0} as any);

        const id = '1';
        await expect(proposalService.update(id, updateProposalDto)).rejects.toThrow(
          new NotFoundException(`Proposal with id ${id} not found`),
        );
    });

  });

  describe('remove', () => {});
});
