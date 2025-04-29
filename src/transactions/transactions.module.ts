import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { MongodbService } from './mongodb.service'; // Assuming you have a MongoDB service  
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [HttpModule],
  controllers: [TransactionsController],
  providers: [TransactionsService,  MongodbService,JwtStrategy],


})
export class TransactionsModule {}