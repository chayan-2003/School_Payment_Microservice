import { IsNotEmpty, IsString, IsEmail, Length } from "class-validator";

export class AuthDto {
   @IsString()
    public name!: string;
   @IsEmail()
    public email!: string;

   @IsNotEmpty()
    @IsString()
    @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
    public password!: string;
}