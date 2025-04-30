import { Module } from '@nestjs/common';
import { PaymentsController } from './payment.controller';
import { PaymentsService } from './payment.service';
import { HttpModule } from '@nestjs/axios';
import {JwtStrategy} from 'src/auth/jwt.strategy'; // Assuming you have a JWT strategy for authentication
@Module({
  imports: [HttpModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, JwtStrategy], // Include JwtStrategy if you are using JWT authentication
  exports: [PaymentsService],
})
export class PaymentModule {}