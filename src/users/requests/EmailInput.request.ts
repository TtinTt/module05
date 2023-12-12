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
} from 'class-validator';

// https://github.com/typestack/class-validator#validation-decorators
export class EmailInput {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;
}
