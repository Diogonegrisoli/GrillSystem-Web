import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: 'O email deve ser valido.' })
    @IsNotEmpty({ message: 'O email deve ser informado.' })
    email!: string;

    @IsNotEmpty({ message: 'A senha deve ser informada.' })
    @MinLength(6, { message: 'A senha deve ter no minimo 6 caracteres.' })
    senha!: string;
}
