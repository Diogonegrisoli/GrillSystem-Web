import { ArrayNotEmpty, IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional } from "class-validator";
import { StatusPedido } from "../pedido-venda.entity";

export class UpdatePedidoVendaDto {
    @IsOptional()
    @IsDateString({}, { message: 'A data de entrega deve ser uma data valida.' })
    dataEntrega?: string;

    @IsOptional()
    @IsEnum(StatusPedido, { message: 'Status invalido.' })
    status?: StatusPedido;

    @IsOptional()
    @IsNumber({}, { message: 'O cliente deve ser numerico.' })
    clienteId?: number;

    @IsOptional()
    @IsArray({ message: 'Os produtos devem ser informados em uma lista.' })
    @ArrayNotEmpty({ message: 'Informe ao menos um produto.' })
    @IsInt({ each: true, message: 'Cada produto deve ser identificado por um numero inteiro.' })
    produtoIds?: number[];
}
