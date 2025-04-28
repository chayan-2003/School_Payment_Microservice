import { Injectable } from '@nestjs/common';
import { MongodbService } from './mongodb.service';
import { ObjectId } from 'mongodb';

@Injectable()
export class TransactionsService {
  constructor(private readonly mongoService: MongodbService) {}

  async getAllTransactions(
    status: string | string[],
    school_id: string | string[],
    sortBy: string = 'payment_time',
    sortOrder: 'asc' | 'desc' = 'asc',
    limit: number = 10,
    offset: number = 0,
    startDate?: string,
    endDate?: string,
  ) {
    console.log('Received status:', status);
    console.log('Received school_id:', school_id);
    console.log('Sort by:', sortBy);
    console.log('Sort order:', sortOrder);
    console.log('Limit:', limit);
    console.log('Offset:', offset);
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

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

    // Apply status filter if provided
    if (status) {
      const statusArray = Array.isArray(status) ? status : status.split(',');
      pipeline.push({
        $match: {
          $or: statusArray.map((s) => ({
            'order_status.status': { $regex: new RegExp(`^${s}$`, 'i') },
          })),
        },
      });
    }

    // Apply school_id filter if provided
    if (school_id) {
      const schoolIdArray = Array.isArray(school_id)
        ? school_id.map((id) => new ObjectId(id))
        : school_id.split(',').map((id) => new ObjectId(id));

      pipeline.push({
        $match: {
          school_id: { $in: schoolIdArray },
        },
      });
    }

    // Apply date range filter for payment_time
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

    console.log('Pipeline after filters:', JSON.stringify(pipeline, null, 2));

    // Add transaction amount field
    pipeline.push({
      $addFields: {
        'order_status.transaction_amount': { $toDouble: '$order_status.transaction_amount' },
      },
    });

    // Determine the sort field
    let sortField = sortBy;
    if (sortBy === 'transaction_amount') {
      sortField = 'order_status.transaction_amount';
    } else if (sortBy === 'order_amount') {
      sortField = 'order_status.order_amount';
    } else if (sortBy === 'status') {
      sortField = 'order_status.status';
    } else if (sortBy === 'payment_time') {
      sortField = 'order_status.payment_time';
    }

    const sort = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;

    pipeline.push({ $sort: sort });

    // Project required fields
    pipeline.push({
      $project: {
        collect_id: '$_id',
        school_id: 1,
        gateway_name: 1,
        order_amount: '$order_status.order_amount',
        transaction_amount: '$order_status.transaction_amount',
        status: '$order_status.status',
        payment_time: '$order_status.payment_time',
        custom_order_id: '$order_status.customOrderId',
      },
    });

    // Pagination stage
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: limit });

    // Count total entries (for pagination metadata)
    const countPipeline = [
      ...pipeline.slice(0, -2), // Remove skip and limit stages
      { $count: 'totalEntries' }, // Count total documents matching the filters
    ];

    // Execute the aggregation for transactions and count
    const transactions = await this.mongoService.getCollection('Order').aggregate(pipeline).toArray();
    const totalCountResult = await this.mongoService.getCollection('Order').aggregate(countPipeline).toArray();
    const totalEntries = totalCountResult.length > 0 ? totalCountResult[0].totalEntries : 0;

    const totalPages = Math.ceil(totalEntries / limit); // Calculate total pages

    // Return transactions with pagination meta information
    return {
      data: transactions,
      meta: {
        pageNumber: Math.floor(offset / limit) + 1, // Calculate the current page (1-based index)
        pageSize: limit,
        totalEntries,
        totalPages,
      },
    };
  }
}