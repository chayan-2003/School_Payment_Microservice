import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TransactionStatusService } from './transaction-status.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard'; // Import the guard if needed

@Controller('transaction-status')
 @UseGuards(JwtAuthGuard) // Uncomment if you want to protect this route with JWT authentication
export class TransactionStatusController {
  constructor(private readonly transactionStatusService: TransactionStatusService) {}
  @Get(':customOrderId')
  async getTransactionStatus(@Param('customOrderId') customOrderId: string) {
    return this.transactionStatusService.getTransactionStatus(customOrderId);
  }
}
