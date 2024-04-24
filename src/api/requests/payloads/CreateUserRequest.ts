import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export default class CreateUserRequest {
    @IsString({ message: "Email is required" })
    @IsEmail({}, { message: "Email must be a valid email" })
        email: string;

    @IsStrongPassword({ minLength: 6, minLowercase: 1, minNumbers: 1, minSymbols: 1, minUppercase: 1 }, { message: "Password should be a minimum of 6 characters, with at least 1 uppercase, 1 lowercase, 1 number and 1 special character" })
        password: string;

    @IsString({ message: "First Name is required." })
        firstName: string;

    @IsString({ message: "Last Name is required." })
        lastName: string;

    @IsString({ message: "Phone Number is required." })
        phoneNumber: string;
}