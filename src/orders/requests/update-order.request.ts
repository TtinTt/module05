import { Min, IsOptional, IsInt, Max, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { CartItem } from './cart-item';

export class UpdateOrderRequest {
  @IsInt()
  @Min(-2)
  @Max(5)
  status: number = 0;
}
