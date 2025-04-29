import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { MongodbService } from '../transactions/mongodb.service'; // Ensure this is imported

@Module({
  controllers: [WebhookController],
  providers: [WebhookService, MongodbService],
})
export class WebhookModule {}