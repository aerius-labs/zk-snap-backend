import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DaoModule } from './modules/dao.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGODB_URL,
      entities: ['src/**/**.entity{.ts,.js}'],
      synchronize: true,
    }),
    DaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
