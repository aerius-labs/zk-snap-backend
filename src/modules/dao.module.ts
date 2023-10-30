import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoController } from '../controllers/dao.controller';
import { DaoService } from '../services/dao.service';
import { Dao } from '../entities/dao.entity';
import { Proposal } from '../entities/proposal.entity';
import { ProposalService } from '../services/proposal.service';
import { EncryptionService } from '../services/encryption.service';
import { ProposalController } from '../controllers/proposal.controller';
import { ZkProof } from '../entities/zk-proof.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dao, Proposal, ZkProof])],
  controllers: [DaoController],
  providers: [DaoService, ProposalService, EncryptionService],
  exports: [DaoService],
})
export class DaoModule {}
