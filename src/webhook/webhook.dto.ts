import {
    IsString,
    IsNumber,
    IsOptional,
    IsDateString,
    ValidateNested,
    IsObject,
    IsMongoId
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class OrderInfoDto {
    @IsString()
    @IsMongoId({ message: 'order_id must be a valid MongoDB ObjectId' })
    order_id!: string;
  
    @IsNumber()
    order_amount!: number;
  
    @IsNumber()
    transaction_amount!: number;
  
    @IsString()
    gateway!: string;
  
    @IsString()
    @IsOptional()
    bank_reference?: string;
  
    @IsString()
    status!: string;
  
    @IsString()
    payment_mode!: string;
  
    @IsString()
    @IsOptional()
    payment_details?: string;
  
    @IsString()
    @IsOptional()
    payment_message?: string;
  
    @IsDateString()
    payment_time!: string;
  
    @IsString()
    @IsOptional()
    error_message?: string;
  }
  export class UpdateTransactionStatusDto {
    @IsNumber()
    status!: number;
    @IsObject()
    @ValidateNested()
    @Type(() => OrderInfoDto)
  order_info!: OrderInfoDto;
  }

  