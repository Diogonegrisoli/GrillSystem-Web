import { IsInt, IsNotEmpty, IsNumber, IsPositive, MaxLength, Min, MinLength } from "class-validator";

export class CreateProdutoDto {
    @IsNotEmpty({ message: 'O codigo deve ser informado.' })
    @MinLength(6, { message: 'O codigo deve ter no minimo 6 caracteres.' })
    @MaxLength(8, { message: 'O codigo deve ter no maximo 8 caracteres.' })
    codigo!: string;

    @IsNotEmpty({ message: 'A descricao deve ser informada.' })
    @MinLength(10, { message: 'A descricao deve ter no minimo 10 caracteres.' })
    @MaxLength(150, { message: 'A descricao deve ter no maximo 150 caracteres.' })
    descricao!: string;

    @IsNumber({}, { message: 'O preco deve ser numerico.' })
    @IsPositive({ message: 'O preco deve ser maior que zero.' })
    preco!: number;

    @IsInt({ message: 'A quantidade deve ser um numero inteiro.' })
    @Min(0, { message: 'A quantidade nao pode ser menor que zero.' })
    quantidade!: number;
}
