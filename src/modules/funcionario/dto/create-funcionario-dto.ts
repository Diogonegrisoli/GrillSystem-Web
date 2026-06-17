import { IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";

export class CreateFuncionarioDto {
    @IsNotEmpty({ message: 'O nome deve ser informado.' })
    @MinLength(3, { message: 'O nome deve ter no minimo 3 caracteres.' })
    @MaxLength(200, { message: 'O nome deve ter no maximo 200 caracteres.' })
    nome!: string;

    @IsNotEmpty({ message: 'O CPF deve ser informado.' })
    @Matches(/(^\d{11}$)|(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)/, { message: 'O CPF esta incorreto.' })
    cpf!: string;
}
