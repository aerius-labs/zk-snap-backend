import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalController } from '../controllers/proposal.controller';
import { ProposalService } from '../services/proposal.service';
import { Proposal } from '../entities/proposal.entity';
import { EncryptionService } from '../services/encryption.service';
import { DaoService } from '../services/dao.service';
import { HttpModule } from '@nestjs/axios';
import { Dao } from '../entities/dao.entity';
import { ZkProof } from '../entities/zk-proof.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal, Dao, ZkProof]), HttpModule],
  controllers: [ProposalController],
  providers: [ProposalService, EncryptionService, DaoService],
  exports: [ProposalService],
})
export class ProposalModule {}
