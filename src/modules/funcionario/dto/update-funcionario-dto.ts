import { IsEnum, IsOptional, Matches, MaxLength, MinLength } from "class-validator";
import { StatusFuncionario } from "../funcionario.entity";

export class UpdateFuncionarioDto {
    @IsOptional()
    @MinLength(3, { message: 'O nome deve ter no minimo 3 caracteres.' })
    @MaxLength(200, { message: 'O nome deve ter no maximo 200 caracteres.' })
    nome?: string;

    @IsOptional()
    @Matches(/(^\d{11}$)|(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)/, { message: 'O CPF esta incorreto.' })
    cpf?: string;

    @IsOptional()
    @IsEnum(StatusFuncionario, { message: 'Status invalido.' })
    status?: StatusFuncionario;
}
