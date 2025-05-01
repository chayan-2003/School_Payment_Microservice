import { IsMongoId ,IsString} from 'class-validator';

export class GetSchoolDto {
@IsString({ message: 'School ID must be a string.' })
@IsMongoId({ message: 'School ID must be a valid MongoDB ObjectId.' })
school_id!: string;
  
}