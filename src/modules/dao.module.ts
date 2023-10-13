import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoController } from '../controllers/dao.controller';
import { DaoService } from '../services/dao.service';
import { Dao } from '../entities/dao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dao])],
  controllers: [DaoController],
  providers: [DaoService],
  exports: [DaoService],
})
export class DaoModule {}
