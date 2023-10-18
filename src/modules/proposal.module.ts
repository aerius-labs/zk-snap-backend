import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalController } from '../controllers/proposal.controller';
import { ProposalService } from '../services/proposal.service';
import { Proposal } from '../entities/proposal.entity';
import { DaoService } from 'src/services/dao.service';
import { Dao } from 'src/entities/dao.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Proposal]), TypeOrmModule.forFeature([Dao])],
    controllers: [ProposalController],
    providers: [ProposalService, DaoService],
    exports: [ProposalService],
  })
  export class ProposalModule {}