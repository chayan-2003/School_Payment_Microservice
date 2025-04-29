import { Module } from '@nestjs/common';
import { TransactionStatusController } from './transaction-status.controller';
import { TransactionStatusService } from './transaction-status.service';
import { MongodbService } from '../transactions/mongodb.service'; 

@Module({
  controllers: [TransactionStatusController],
  providers: [TransactionStatusService, MongodbService],
})
export class TransactionStatusModule {}