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
export class UpdateAdminRequest {
  @IsOptional()
  @Length(8, 255)
  @IsStrongPassword()
  resetPassword?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status: number;
}
