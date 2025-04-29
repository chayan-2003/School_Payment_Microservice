// transaction-status.service.ts

import { Injectable } from '@nestjs/common';
import { MongodbService } from '../transactions/mongodb.service'; 
import { ObjectId } from 'mongodb';

@Injectable()
export class TransactionStatusService {
    constructor(private readonly mongoService: MongodbService) {}
    async getTransactionStatus(customOrderId: string) {
    
      
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
               customOrderId: customOrderId,
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
              customOrderId: 1,
            },
          },
        ];
      
        console.log('Final Aggregation Pipeline:', JSON.stringify(pipeline, null, 2));
      
        // Execute aggregation query
        return this.mongoService.getCollection('Order').aggregate(pipeline).toArray();
      }
}
