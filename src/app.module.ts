import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

import { DaoModule } from './modules/dao.module';
import { DaoMiddleware } from './middlewares/dao.middleware';

import {ProposalModule} from './modules/proposal.module';
import {ProposalMiddleware} from './middlewares/proposal.middleware'
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGODB_URL,
      entities: [join(__dirname, '**', '**.entity.{ts,js}')],
      synchronize: true,
    }),
    DaoModule,
    ProposalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DaoMiddleware).forRoutes({
      path: 'dao',
      method: RequestMethod.POST,
    });
    consumer.apply(ProposalMiddleware).forRoutes({
      path: 'proposal',
      method: RequestMethod.POST,
    });
  }
}
