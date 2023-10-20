import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalController } from '../controllers/proposal.controller';
import { ProposalService } from '../services/proposal.service';
import { Proposal } from '../entities/proposal.entity';
import { DaoService } from 'src/services/dao.service';
import { Dao } from 'src/entities/dao.entity';
import { EncryptionService } from 'src/services/encryption.service';
import { ProposalCreatedListener } from 'src/listeners/proposal.listener';


@Module({
  imports: [TypeOrmModule.forFeature([Proposal])],
  controllers: [ProposalController],
  providers: [
    ProposalService,
    DaoService,
    EncryptionService,
    ProposalCreatedListener,
  ],
  exports: [ProposalService],
})
export class ProposalModule {}
