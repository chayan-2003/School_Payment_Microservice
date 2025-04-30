import { Controller, Post, Body, Res ,UseGuards} from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { Response } from 'express';
import { CreatePaymentDto } from '../payment/payment.dto';
import { JwtAuthGuard } from '../auth/jwt.guard'; 
@Controller('')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment')

  async createPayment(
    @Body() dto: CreatePaymentDto,
    @Res() res: Response,
  ) {
    try {
      console.log('Received body:', dto);
      const paymentResponse = await this.paymentsService.createPayment(dto);
      console.log('Payment response:', paymentResponse);
      return res.status(200).json(paymentResponse);
    } catch (error) {
      console.error('Error creating payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ message: 'Payment creation failed', error: errorMessage });
    }
  }
}