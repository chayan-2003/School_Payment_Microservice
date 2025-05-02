import { Transform } from 'class-transformer';
import { IsIn, IsNumberString, IsOptional, IsString, IsMongoId } from 'class-validator';

export class GetTransactionsDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(v => v.toLowerCase().trim());
    if (typeof value === 'string') return value.split(',').map(v => v.toLowerCase().trim());
    return [];
  })
  @IsString({ each: true, message: 'Each status must be a string.' })
  @IsIn(['success', 'pending', 'failed'], {
    each: true,
    message: 'Each status must be one of the following: success, pending, or failed.',
  })
  status?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(v => v.trim());
    return [];
  })
  @IsString({ each: true, message: 'Each school_id must be a string.' })
  @IsMongoId({ each: true, message: 'Each school_id must be a valid MongoDB ObjectId.' })
  school_id?: string[];

  @IsOptional()
  @IsOptional()
  @IsIn(['payment_time', 'transaction_amount', 'order_amount'], {
    message: 'SortBy must be one of the following: payment_time, transaction_amount, or order_amount.',
  })
  sortBy: string = 'payment_time';

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'SortOrder must be either "asc" or "desc".',
  })
  sortOrder: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsNumberString({}, { message: 'Page must be a numeric string.' })
  page: string = '1';

  @IsOptional()
  @IsNumberString({}, { message: 'Limit must be a numeric string.' })
  limit: string = '10';

  @IsOptional()
  @IsString({ message: 'StartDate must be a valid string.' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: 'EndDate must be a valid string.' })
  endDate?: string;
  @IsOptional()
  @IsMongoId({ message: 'CollectId must be a valid MongoDB ObjectId.' })
  collectId?: string; 
  
}