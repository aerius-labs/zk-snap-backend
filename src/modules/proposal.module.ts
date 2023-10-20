import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalController } from '../controllers/proposal.controller';
import { ProposalService } from '../services/proposal.service';
import { Proposal } from '../entities/proposal.entity';
import { EncryptionService } from 'src/services/encryption.service';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal])],
  controllers: [ProposalController],
  providers: [ProposalService, EncryptionService],
  exports: [ProposalService],
})
export class ProposalModule {}
