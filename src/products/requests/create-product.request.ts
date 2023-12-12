import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
  Length,
  MaxLength,
  MinLength,
  IsInt,
  Min,
  Max,
  IsString,
  IsPositive,
  IsNumber,
  minLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

// https://github.com/typestack/class-validator#validation-decorators
export class CreateProductRequest {
  // @IsOptional()
  @IsString()
  @Length(3, 300)
  name: string = '';

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value)) // Transform giá trị thành số
  price?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value)) // Transform giá trị thành số
  comparative?: number;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  tag: string;

  @IsOptional()
  @IsString()
  imgUrl0: string;

  @IsOptional()
  @IsString()
  imgUrl1: string;

  @IsOptional()
  @IsString()
  imgUrl2: string;

  @IsOptional()
  @IsString()
  imgUrl3: string;

  @IsOptional()
  @IsString()
  imgUrl4: string;

  @IsOptional()
  @IsString()
  imgUrl5: string;

  @IsOptional()
  @IsString()
  imgUrl6: string;

  @IsOptional()
  @IsString()
  imgUrl7: string;

  @IsOptional()
  @IsString()
  imgUrl8: string;

  @IsOptional()
  @IsString()
  imgUrl9: string;
}
