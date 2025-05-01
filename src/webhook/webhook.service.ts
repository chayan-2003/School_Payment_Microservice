import { Injectable } from '@nestjs/common';
import { MongodbService } from '../transactions/mongodb.service';
import { UpdateTransactionStatusDto } from './dto/webhook.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class WebhookService {
  constructor(private readonly mongoService: MongodbService) {}

  async updateTransactionStatus(updateTransactionStatusDto: UpdateTransactionStatusDto): Promise<void> {
    const { order_info } = updateTransactionStatusDto;

  
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

    if (result.matchedCount === 0) {
      throw new Error(`No transaction found with order_id: ${order_info.order_id}`);
    }

    // Create a webhook log in the MongoDB collection
    const webhookLogData = {
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
      receivedAt: new Date(), // Add a timestamp for when the webhook was received
    };

    await this.mongoService.getCollection('WebhookLog').insertOne(webhookLogData);

    console.log(`Transaction updated and webhook log created for order_id: ${order_info.order_id}`);
  }
}