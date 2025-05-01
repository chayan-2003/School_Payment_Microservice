import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { GetSchoolDto } from './dto/get-school.dto';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) { }
  @Get()
  async getAllTransactions(@Query() query: GetTransactionsDto) {
    const transactionsResponse = await this.transactionsService.getAllTransactions(
      query,
    );

    const { data, meta } = transactionsResponse;

    const pageNumber = parseInt(query.page || '1', 10);
    const limitNumber = parseInt(query.limit || '10', 10);

    return {
      meta: {
        page: pageNumber,
        limit: limitNumber,
        totalEntries: meta.totalEntries,
        totalPages: meta.totalPages,
      },
      data,
    };
  }

  @Get('school/:school_id')
  async getTransactionsBySchool(@Param() params: GetSchoolDto) {
    console.log('Fetching transactions for schoolId:', params.school_id);

    const transactions = await this.transactionsService.getTransactionsBySchool(params);

    return {
      schoolId: params.school_id,
      transactions,
    };
  }
}
