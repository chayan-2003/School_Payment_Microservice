import { Module } from '@nestjs/common';
import { TransactionStatusController } from './transaction-status.controller';
import { TransactionStatusService } from './transaction-status.service';
import { MongodbService } from '../transactions/mongodb.service'; 
import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  controllers: [TransactionStatusController],
  providers: [TransactionStatusService, MongodbService, JwtStrategy],
})
export class TransactionStatusModule {}