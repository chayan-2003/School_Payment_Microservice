import { IsString } from 'class-validator';

export class GetTransactionStatusDto {
  @IsString({ message: 'Custom Order ID must be a string.' })
    customOrderId!: string;
}