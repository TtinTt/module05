import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from "class-validator";

// https://github.com/typestack/class-validator#validation-decorators
export class CreateUserRequest {
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(10)
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @MaxLength(50)
    firstName: string;

    @IsOptional()
    @MaxLength(50)
    lastName: string;
}
