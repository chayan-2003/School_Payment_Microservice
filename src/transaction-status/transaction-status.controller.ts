import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TransactionStatusService } from './transaction-status.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard'; // Import the guard if needed
import { GetTransactionStatusDto } from './dto/get-transaction-status.dto';

@Controller('transaction-status')
@UseGuards(JwtAuthGuard) // Uncomment if you want to protect this route with JWT authentication
export class TransactionStatusController {
  constructor(private readonly transactionStatusService: TransactionStatusService) { }

  @Get(':customOrderId')
  async getTransactionStatus(@Param() params: GetTransactionStatusDto) {
    return this.transactionStatusService.getTransactionStatus(params);
  }
}
