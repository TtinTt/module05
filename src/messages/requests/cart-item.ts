import {
  IsEmail,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsString,
  IsPositive,
  IsOptional,
  IsObject,
  IsPhoneNumber,
  IsDateString,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CartItem {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  quantity: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  product_id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  comparative: number;

  @IsOptional()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsNotEmpty()
  @IsArray()
  img?: string[];
}
