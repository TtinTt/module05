import { IsEmail, IsNotEmpty, IsOptional, IsStrongPassword, Length, MaxLength, MinLength } from "class-validator";

// https://github.com/typestack/class-validator#validation-decorators
export class UpdateUserRequest {
    @IsOptional()
    @MaxLength(50)
    firstName: string;

    @IsOptional()
    @MaxLength(50)
    lastName: string;

    @IsOptional()
    @Length(8, 20)
    @IsStrongPassword()
    password?: string;
}
