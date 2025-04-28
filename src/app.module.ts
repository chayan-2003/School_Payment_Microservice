// filepath: d:\Microservices\payment\src\app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { TransactionsModule } from './transactions/transactions.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes environment variables globally available
    }),
 
    TransactionsModule,
 
  ],
})
export class AppModule {}