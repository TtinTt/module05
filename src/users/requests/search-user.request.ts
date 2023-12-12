import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  IsNumber,
} from 'class-validator';

export class SearchUserRequest {
  @IsString()
  name: string = '';

  @IsInt()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  page: number = 1;

  @IsInt()
  @IsPositive()
  @Max(1000)
  @Transform(({ value }) => parseInt(value))
  limit: number = 12;

  @Transform(({ value }) => parseFloat(value)) // Transform giá trị thành số
  @IsNumber()
  sortType: number = 0;
}
