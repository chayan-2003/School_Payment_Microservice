import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { MongodbService } from '../transactions/mongodb.service'; // Ensure this is imported
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { PrismaService } from 'prisma/prisma.service';
@Module({
  controllers: [WebhookController],
  providers: [WebhookService, MongodbService, JwtStrategy, PrismaService],
})
export class WebhookModule {}