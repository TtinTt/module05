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

export class UpdateMessageRequest {
  @IsInt()
  @Min(0)
  id: number;

  @IsString()
  date?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(20)
  mess: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(8)
  phone: string;

  @IsInt()
  @Min(0)
  @Max(2)
  status: number;
}
