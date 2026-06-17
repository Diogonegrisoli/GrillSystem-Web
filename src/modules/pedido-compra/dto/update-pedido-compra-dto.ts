import { ArrayNotEmpty, IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional } from "class-validator";
import { StatusCompra } from "../pedido-compra.entity";

export class UpdatePedidoCompraDto {
    @IsOptional()
    @IsDateString({}, { message: 'A data de entrega deve ser uma data valida.' })
    dataEntrega?: string;

    @IsOptional()
    @IsEnum(StatusCompra, { message: 'Status invalido.' })
    status?: StatusCompra;

    @IsOptional()
    @IsNumber({}, { message: 'O fornecedor deve ser numerico.' })
    fornecedorId?: number;

    @IsOptional()
    @IsNumber({}, { message: 'O funcionario deve ser numerico.' })
    funcionarioId?: number;

    @IsOptional()
    @IsArray({ message: 'Os produtos devem ser informados em uma lista.' })
    @ArrayNotEmpty({ message: 'Informe ao menos um produto.' })
    @IsInt({ each: true, message: 'Cada produto deve ser identificado por um numero inteiro.' })
    produtoIds?: number[];
}
