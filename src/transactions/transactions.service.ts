import { Injectable } from '@nestjs/common';
import { MongodbService } from './mongodb.service';
import { ObjectId } from 'mongodb';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { GetSchoolDto } from './dto/get-school.dto';
@Injectable()
export class TransactionsService {
  constructor(private readonly mongoService: MongodbService) { }


  async getAllTransactions(dto: GetTransactionsDto) {
    const {
      school_id,

      status,
      sortBy = 'payment_time',
      sortOrder = 'asc',
      limit = '10',
      page = '1',
      startDate,
      endDate,
      collectId
    } = dto;

    const limitNumber = parseInt(limit, 10) || 10;
    const pageNumber = parseInt(page, 10) || 1;
    const offset = (pageNumber - 1) * limitNumber;

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'OrderStatus',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'order_status',
        },
      },
      { $unwind: '$order_status' },
    ];

    // Filter by collectId
    if (collectId) {
      const collectObjectId = new ObjectId(collectId);
      pipeline.push({
        $match: {
          _id: collectObjectId,
        },
      });
    }
    // Filter by status
    if (status && status.length > 0) {
      pipeline.push({
        $match: {
          $or: status.map((s) => ({
            'order_status.status': { $regex: new RegExp(`^${s}$`, 'i') },
          })),
        },
      });
    }

    // Filter by school_id
    if (school_id && school_id.length > 0) {
      const schoolObjectIds = school_id.map((id) => new ObjectId(id));
      pipeline.push({
        $match: {
          school_id: { $in: schoolObjectIds },
        },
      });
    }

    // Filter by date range
    const dateFilter: any = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        dateFilter.$gte = start;
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        dateFilter.$lte = end;
      }
    }
    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({
        $match: {
          'order_status.payment_time': dateFilter,
        },
      });
    }

    pipeline.push({
      $addFields: {
        'order_status.transaction_amount': {
          $toDouble: '$order_status.transaction_amount',
        },
      },
    });

    let sortField: string;
    switch (sortBy) {
      case 'transaction_amount':
        sortField = 'order_status.transaction_amount';
        break;
      case 'order_amount':
        sortField = 'order_status.order_amount';
        break;
      case 'status':
        sortField = 'order_status.status';
        break;
      default:
        sortField = 'order_status.payment_time';
    }

    const sort: any = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    pipeline.push({ $sort: sort });

    pipeline.push({
      $project: {
        collect_id: '$_id',
        school_id: 1,
        gateway_name: 1,
        order_amount: '$order_status.order_amount',
        transaction_amount: '$order_status.transaction_amount',
        status: '$order_status.status',
        payment_time: '$order_status.payment_time',
        custom_order_id: '$customOrderId',
      },
    });

    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limitNumber });

    const countPipeline = [...pipeline.slice(0, -2), { $count: 'totalEntries' }];

    const transactions = await this.mongoService
      .getCollection('Order')
      .aggregate(pipeline)
      .toArray();

    const totalCountResult = await this.mongoService
      .getCollection('Order')
      .aggregate(countPipeline)
      .toArray();

    const totalEntries = totalCountResult.length > 0 ? totalCountResult[0].totalEntries : 0;
    const totalPages = Math.ceil(totalEntries / limitNumber);

    return {
      data: transactions,
      meta: {
        pageNumber,
        pageSize: limitNumber,
        totalEntries,
        totalPages,
      },
    };
  }
  async getTransactionsBySchool(dto: GetSchoolDto) {
    const { school_id } = dto;

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'OrderStatus',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'order_status',
        },
      },
      { $unwind: '$order_status' },
      {
        $match: {
          school_id: new ObjectId(school_id),
        },
      },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway_name: 1,
          order_amount: '$order_status.order_amount',
          transaction_amount: '$order_status.transaction_amount',
          status: '$order_status.status',
          payment_time: '$order_status.payment_time',
        },
      },
    ];

    console.log('Final Aggregation Pipeline:', JSON.stringify(pipeline, null, 2));

    // Execute aggregation query
    return this.mongoService.getCollection('Order').aggregate(pipeline).toArray();
  }
}