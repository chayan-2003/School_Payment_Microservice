import { Injectable } from '@nestjs/common';
import { MongodbService } from '../transactions/mongodb.service';
import { UpdateTransactionStatusDto } from './webhook.dto';
import { ObjectId } from 'mongodb';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class WebhookService {
  constructor(private readonly mongoService: MongodbService, private prisma:PrismaService) {}

  async updateTransactionStatus(updateTransactionStatusDto: UpdateTransactionStatusDto): Promise<void> {
    const { order_info } = updateTransactionStatusDto;

    // Prepare the update data based on the order_info
    const updateData = {
      order_amount: order_info.order_amount,
      transaction_amount: order_info.transaction_amount,
      gateway: order_info.gateway,
      bank_reference: order_info.bank_reference,
      status: order_info.status,
      payment_mode: order_info.payment_mode,
      payment_details: order_info.payment_details,
      payment_message: order_info.payment_message,
      payment_time: new Date(order_info.payment_time),
      error_message: order_info.error_message,
    };

    // Convert the order_id to ObjectId
    const objectId = new ObjectId(order_info.order_id);

    // Update the transaction in the MongoDB collection
    const result = await this.mongoService
      .getCollection('OrderStatus')
      .updateOne(
        { collect_id: objectId }, // Use the collect_id field to match the document
        { $set: updateData },
      );

    await this.prisma.WebhookLog.create({
      data: {
        order_id: order_info.order_id,
        order_amount: order_info.order_amount,
        transaction_amount: order_info.transaction_amount,
        gateway: order_info.gateway,
        bank_reference: order_info.bank_reference,
        status: order_info.status,
        payment_mode: order_info.payment_mode,
        payment_details: order_info.payment_details,
        payment_message: order_info.payment_message,
        payment_time: new Date(order_info.payment_time),
        error_message: order_info.error_message,
        // receivedAt will auto default to `now()`
      },
    });
    if (result.matchedCount === 0) {
      throw new Error(`No transaction found with order_id: ${order_info.order_id}`);
    }

    console.log(`Transaction updated successfully for order_id: ${order_info.order_id}`);
  }
}
