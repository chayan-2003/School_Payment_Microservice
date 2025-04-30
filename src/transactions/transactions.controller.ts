import { Controller, Get, Param, Query ,UseGuards} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
@Controller('transactions')
@UseGuards(JwtAuthGuard) 
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getAllTransactions(
    @Query('status') status: string | string[],
    @Query('school_id') school_id: string | string[],
    @Query('sortBy') sortBy: string = 'payment_time',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc',
    @Query('page') page: string = '1', // Page number from query, default '1'
    @Query('limit') limit: string = '10', // Limit from query, default '10'
    @Query('startDate') startDate?: string, // Optional start date
    @Query('endDate') endDate?: string, // Optional end date
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    console.log('Received status:', status);
    console.log('Received school_id:', school_id);
    console.log('Sort by:', sortBy);
    console.log('Sort order:', sortOrder);
    console.log('Page:', pageNumber);
    console.log('Limit:', limitNumber);
    console.log('Offset:', offset);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    // Call service and pass pagination and date filter params
    const transactionsResponse = await this.transactionsService.getAllTransactions(
      status,
      school_id,
      sortBy,
      sortOrder,
      limitNumber,
      offset,
      startDate,
      endDate,
    );

    // Extract pagination meta data
    const { data, meta } = transactionsResponse;

    // Return data with pagination meta information
    return {
      meta:
      {
      page: pageNumber,
      limit: limitNumber,
      totalEntries: meta.totalEntries,
      totalPages: meta.totalPages,
      },
      data,
    };
  }
  @Get('school/:schoolId')
  async getTransactionsBySchool(@Param('schoolId') schoolId: string) {
    console.log('Fetching transactions for schoolId:', schoolId);

    // Call service to fetch all transactions for the given schoolId
    const transactions = await this.transactionsService.getTransactionsBySchool(schoolId);

    // Return all transactions
    return {
      schoolId,
      transactions,
    };
  }
}