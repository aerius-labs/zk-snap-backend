import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalController } from '../controllers/proposal.controller';
import { ProposalService } from '../services/proposal.service';
import { Proposal } from '../entities/proposal.entity';
import { EncryptionService } from 'src/services/encryption.service';
import { DaoService } from 'src/services/dao.service';
import { HttpModule } from '@nestjs/axios';
import { Dao } from 'src/entities/dao.entity';
import { ZkProof } from 'src/entities/zk-proof.entity';
import { RabbitMQService } from 'src/services/rabbitmq.service';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal, Dao, ZkProof]), HttpModule],
  controllers: [ProposalController],
  providers: [ProposalService, EncryptionService, DaoService, RabbitMQService],
  exports: [ProposalService],
})
export class ProposalModule {}
