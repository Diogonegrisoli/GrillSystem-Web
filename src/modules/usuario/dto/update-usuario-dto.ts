import { IsEmail, IsNumber, IsOptional, MinLength } from "class-validator";

export class UpdateUsuarioDto {
    @IsOptional()
    @IsEmail({}, { message: 'Informe um e-mail valido.' })
    email?: string;

    @IsOptional()
    @MinLength(6, { message: 'A senha deve ter no minimo 6 caracteres.' })
    senha?: string;

    @IsOptional()
    @IsNumber({}, { message: 'O funcionario deve ser numerico.' })
    funcionarioId?: number;
}
