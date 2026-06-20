import { IsEnum, IsOptional, Matches, MaxLength, MinLength } from "class-validator";
import { TipoCliente } from "../cliente.entity";

export class UpdateClienteDto {
    @IsOptional()
    @MinLength(3, { message: 'O nome deve ter no minimo 3 caracteres.' })
    @MaxLength(200, { message: 'O nome deve ter no maximo 200 caracteres.' })
    nome?: string;

    @IsOptional()
    @Matches(/(^\d{11}$)|(^\d{14}$)|(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/, { message: 'O CPF/CNPJ esta incorreto.' })
    cpfCnpj?: string;

    @IsOptional()
    @IsEnum(TipoCliente, { message: 'O tipo deve ser fisica ou juridica.' })
    tipo?: TipoCliente;

    @IsOptional()
    @MaxLength(15, { message: 'O telefone deve ter no maximo 15 caracteres.' })
    telefone?: string;

    @IsOptional()
    @MinLength(15, { message: 'O endereco deve ter no minimo 15 caracteres.' })
    @MaxLength(300, { message: 'O endereco deve ter no maximo 300 caracteres.' })
    endereco?: string;
}
