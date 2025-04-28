import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { MongodbService } from './mongodb.service'; // Assuming you have a MongoDB service  

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService,  MongodbService],
})
export class TransactionsModule {}