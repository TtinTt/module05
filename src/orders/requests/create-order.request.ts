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
class Address {
  @IsNotEmpty()
  @IsString()
  @Length(3, 80)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  address: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  phoneNumber: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateOrderRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsArray()
  cart: CartItem[];

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => Address)
  address: Address;

  @IsOptional()
  @IsString()
  date?: string = getCurrentTimeString();

  @IsOptional()
  @IsInt()
  @Min(-2)
  @Max(5)
  status: number = 0;
}
