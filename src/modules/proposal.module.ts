import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalController } from '../controllers/proposal.controller';
import { ProposalService } from '../services/proposal.service';
import { Proposal } from '../entities/proposal.entity';
import { DaoService } from 'src/services/dao.service';
import { Dao } from 'src/entities/dao.entity';
import { EncryptionService } from 'src/services/encryption.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal]),
    TypeOrmModule.forFeature([Dao]),
    HttpModule,
  ],
  controllers: [ProposalController],
  providers: [ProposalService, DaoService, EncryptionService],
  exports: [ProposalService],
})
export class ProposalModule {}
