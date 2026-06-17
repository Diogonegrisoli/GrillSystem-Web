import { IsInt, IsNumber, IsOptional, IsPositive, MaxLength, Min, MinLength } from "class-validator";

export class UpdateProdutoDto {
    @IsOptional()
    @MinLength(6, { message: 'O codigo deve ter no minimo 6 caracteres.' })
    @MaxLength(8, { message: 'O codigo deve ter no maximo 8 caracteres.' })
    codigo?: string;

    @IsOptional()
    @MinLength(10, { message: 'A descricao deve ter no minimo 10 caracteres.' })
    @MaxLength(150, { message: 'A descricao deve ter no maximo 150 caracteres.' })
    descricao?: string;

    @IsOptional()
    @IsNumber({}, { message: 'O preco deve ser numerico.' })
    @IsPositive({ message: 'O preco deve ser maior que zero.' })
    preco?: number;

    @IsOptional()
    @IsInt({ message: 'A quantidade deve ser um numero inteiro.' })
    @Min(0, { message: 'A quantidade nao pode ser menor que zero.' })
    quantidade?: number;
}
