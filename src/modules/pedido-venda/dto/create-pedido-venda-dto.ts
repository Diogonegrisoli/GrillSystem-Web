import { ArrayNotEmpty, IsArray, IsDateString, IsInt, IsNumber, IsOptional } from "class-validator";

export class CreatePedidoVendaDto {
    @IsOptional()
    @IsDateString({}, { message: 'A data de entrega deve ser uma data valida.' })
    dataEntrega?: string;

    @IsNumber({}, { message: 'O cliente deve ser numerico.' })
    clienteId!: number;

    @IsArray({ message: 'Os produtos devem ser informados em uma lista.' })
    @ArrayNotEmpty({ message: 'Informe ao menos um produto.' })
    @IsInt({ each: true, message: 'Cada produto deve ser identificado por um numero inteiro.' })
    produtoIds!: number[];
}
