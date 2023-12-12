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
} from 'class-validator';
import { CartItem } from 'src/orders/requests/cart-item';
// https://github.com/typestack/class-validator#validation-decorators
export class UpdateUserRequest {
  //   @IsNotEmpty()
  //   @IsInt()
  //   @Min(0)
  //   user_id: number;

  //   @IsNotEmpty()
  //   @IsEmail()
  //   email: string;

  @IsOptional()
  @Length(8, 255)
  @IsStrongPassword()
  password?: string;

  @IsOptional()
  @MaxLength(50)
  bday: string;

  @IsOptional()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status: number;

  @IsOptional()
  @MaxLength(255)
  add_address: string;

  @IsOptional()
  @MaxLength(15)
  phone: string;

  @IsOptional()
  cart: CartItem[];

  @IsOptional()
  @MaxLength(45)
  code: string;

  @IsOptional()
  @MaxLength(255)
  img: string;

  @IsOptional()
  @MaxLength(255)
  verifed: number;
}
