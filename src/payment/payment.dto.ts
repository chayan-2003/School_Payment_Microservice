import { IsNotEmpty, IsString, IsUrl, Matches } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
    @IsString()
    @Matches(/^[a-f\d]{24}$/i, { message: 'school_id must be a valid MongoDB ObjectId' }) // Enforce valid MongoDB ObjectId
    school_id!: string;

  @IsNotEmpty()
    @IsString()
    @Matches(/^\d+$/, { message: 'amount must be a numeric string' }) // Ensure amount is numeric
    amount!: string;

  @IsNotEmpty()
    @IsUrl({}, { message: 'callback_url must be a valid URL' }) // Enforce valid URL format
    callback_url!: string;
}