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
export class CreateUserRequest {
  // @IsNotEmpty()
  // @MinLength(4)
  // @MaxLength(10)
  // username: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;

  // @IsOptional()
  // @MaxLength(50)
  // firstName: string;

  // @IsOptional()
  // @MaxLength(50)
  // lastName: string;

  @IsNotEmpty()
  @Length(8, 255)
  @IsStrongPassword()
  password: string;

  // @IsOptional()
  // @Min(1)
  // @Max(2)
  // gender: number;

  // @IsOptional()
  // // @IsPhoneNumber('VN')
  // phoneNumber: string;

  // @IsOptional()
  // @MaxLength(255)
  // address: string;
}
