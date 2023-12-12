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
export class resetPassUserRequest {
  @IsNotEmpty()
  @Length(6)
  code: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(8, 255)
  @IsStrongPassword()
  password?: string;
}
