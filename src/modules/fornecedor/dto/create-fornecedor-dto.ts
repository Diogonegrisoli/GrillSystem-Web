import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";

export class CreateFornecedorDto {
    @IsNotEmpty({ message: 'O nome fantasia deve ser informado.' })
    @MinLength(3, { message: 'O nome fantasia deve ter no minimo 3 caracteres.' })
    @MaxLength(200, { message: 'O nome fantasia deve ter no maximo 200 caracteres.' })
    nomeFantasia!: string;

    @IsNotEmpty({ message: 'A razao social deve ser informada.' })
    @MinLength(3, { message: 'A razao social deve ter no minimo 3 caracteres.' })
    @MaxLength(200, { message: 'A razao social deve ter no maximo 200 caracteres.' })
    razaoSocial!: string;

    @IsNotEmpty({ message: 'O CNPJ deve ser informado.' })
    @Matches(/(^\d{14}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/, { message: 'O CNPJ esta incorreto.' })
    cnpj!: string;

    @IsEmail({}, { message: 'Informe um e-mail valido.' })
    email!: string;

    @IsNotEmpty({ message: 'O endereco deve ser informado.' })
    @MinLength(15, { message: 'O endereco deve ter no minimo 15 caracteres.' })
    @MaxLength(300, { message: 'O endereco deve ter no maximo 300 caracteres.' })
    endereco!: string;
}
