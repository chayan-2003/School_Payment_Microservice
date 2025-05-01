import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { WebhookService } from './webhook.service';
import { UpdateTransactionStatusDto } from './dto/webhook.dto'; 
import { JwtAuthGuard } from '../auth/jwt.guard';
@Controller('webhook')
@UseGuards(JwtAuthGuard) 
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async handleWebhook(@Body() payload: UpdateTransactionStatusDto, @Res() res: Response) {
    try {
      console.log('Received webhook payload:', payload);

      await this.webhookService.updateTransactionStatus(payload);

   
      return res.status(200).json({ message: 'Transaction updated successfully' });
    } catch (error) {
      console.error('Error handling webhook:', error);

   
      return res.status(500).json({
        message: 'Failed to update transaction',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
