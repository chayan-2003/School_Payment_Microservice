import { Controller, Get, Param } from '@nestjs/common';
import { TransactionStatusService } from './transaction-status.service';

@Controller('transaction-status')
export class TransactionStatusController {
  constructor(private readonly transactionStatusService: TransactionStatusService) {}
  @Get(':customOrderId')
  async getTransactionStatus(@Param('customOrderId') customOrderId: string) {
    return this.transactionStatusService.getTransactionStatus(customOrderId);
  }
}
