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
  Length,
  MinLength,
  IsInt,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CartItem } from './cart-item';
import { getCurrentTimeString } from 'src/common/function';

export class CreateMessageRequest {
  @IsOptional()
  @IsString()
  date?: string = getCurrentTimeString();

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  mess: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  phone: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  status: number = 1;
}
