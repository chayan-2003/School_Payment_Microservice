import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { WebhookService } from './webhook.service';
import { UpdateTransactionStatusDto } from './webhook.dto'; // Import the DTO

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async handleWebhook(@Body() payload: UpdateTransactionStatusDto, @Res() res: Response) {
    try {
      console.log('Received webhook payload:', payload);

      // Pass the validated payload to the service
      await this.webhookService.updateTransactionStatus(payload);

      // Return a successful response
      return res.status(200).json({ message: 'Transaction updated successfully' });
    } catch (error) {
      console.error('Error handling webhook:', error);

      // Return a failure response in case of error
      return res.status(500).json({
        message: 'Failed to update transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
