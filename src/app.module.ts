// filepath: d:\Microservices\payment\src\app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { TransactionsModule } from './transactions/transactions.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TransactionStatusModule } from './transaction-status/transaction-status.module';
import { WebhookModule } from './webhook/webhook.module';
import { PaymentModule } from './payment/payment.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes environment variables globally available
    }),
 
    TransactionsModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    TransactionStatusModule,
    WebhookModule,
    PaymentModule,
 
  ],
})
export class AppModule {}