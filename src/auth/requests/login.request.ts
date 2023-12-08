import {
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
  Length,
} from 'class-validator';
import { UserType } from 'src/users/enums/user-role.enum';

export class LoginRequest {
  @IsNotEmpty()
  @Length(4, 100)
  email: string;

  @IsNotEmpty()
  @Length(8, 100)
  @IsStrongPassword()
  password: string;

  // @IsOptional()
  type: UserType = UserType.customer;
}
