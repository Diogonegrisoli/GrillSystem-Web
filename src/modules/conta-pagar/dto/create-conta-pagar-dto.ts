import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive } from "class-validator";
import { TipoPagamento } from "../conta-pagar.entity";

export class CreateContaPagarDto {
    @IsNumber({}, { message: 'O valor deve ser numerico.' })
    @IsPositive({ message: 'O valor deve ser maior que zero.' })
    valor!: number;

    @IsEnum(TipoPagamento, { message: 'Tipo de pagamento invalido.' })
    tipoPagamento!: TipoPagamento;

    @IsNotEmpty({ message: 'A data de vencimento deve ser informada.' })
    @IsDateString({}, { message: 'A data de vencimento deve ser uma data valida.' })
    dataVencimento!: string;

    @IsOptional()
    @IsDateString({}, { message: 'A data de pagamento deve ser uma data valida.' })
    dataPagamento?: string;

    @IsNumber({}, { message: 'O pedido de compra deve ser numerico.' })
    pedidoCompraId!: number;
}
