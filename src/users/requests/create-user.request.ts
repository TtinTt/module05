import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsStrongPassword,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
  IsString,
} from 'class-validator';
import { getCurrentTimeString } from 'src/common/function';

// https://github.com/typestack/class-validator#validation-decorators
export class CreateUserRequest {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  @Length(8, 255)
  @IsStrongPassword()
  password: string;

  @IsString()
  date: string = getCurrentTimeString();
}
