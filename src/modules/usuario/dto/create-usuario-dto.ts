import { IsEmail, IsNotEmpty, IsNumber, MinLength } from "class-validator";

export class CreateUsuarioDto {
    @IsEmail({}, { message: 'Informe um e-mail valido.' })
    email!: string;

    @IsNotEmpty({ message: 'A senha deve ser informada.' })
    @MinLength(6, { message: 'A senha deve ter no minimo 6 caracteres.' })
    senha!: string;

    @IsNumber({}, { message: 'O funcionario deve ser numerico.' })
    funcionarioId!: number;
}
