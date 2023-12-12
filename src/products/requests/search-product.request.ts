import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  IsNumber,
} from 'class-validator';

export class SearchProductRequest {
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

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value)) // Transform giá trị thành số
  maxPrice?: number = 0;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value)) // Transform giá trị thành số
  sortType: number = 0;

  @IsOptional()
  @IsString()
  category?: string = null;

  validate() {
    if (this.maxPrice < 0) {
      throw new Error('maxPrice must be a non-negative number');
    }
    if (this.sortType < 0) {
      throw new Error('sortType must be a non-negative number');
    }
  }
}
