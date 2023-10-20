import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoController } from '../controllers/dao.controller';
import { DaoService } from '../services/dao.service';
import { Dao } from '../entities/dao.entity';
import { Proposal } from 'src/entities/proposal.entity';
import { ProposalService } from 'src/services/proposal.service';
import { EncryptionService } from 'src/services/encryption.sevice';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dao]),
    TypeOrmModule.forFeature([Proposal]),
  ],
  controllers: [DaoController],
  providers: [DaoService, ProposalService, EncryptionService],
  exports: [DaoService],
})
export class DaoModule {}
