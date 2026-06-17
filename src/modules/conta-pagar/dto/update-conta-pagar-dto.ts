import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive } from "class-validator";
import { StatusContaPagar, TipoPagamento } from "../conta-pagar.entity";

export class UpdateContaPagarDto {
    @IsOptional()
    @IsNumber({}, { message: 'O valor deve ser numerico.' })
    @IsPositive({ message: 'O valor deve ser maior que zero.' })
    valor?: number;

    @IsOptional()
    @IsEnum(TipoPagamento, { message: 'Tipo de pagamento invalido.' })
    tipoPagamento?: TipoPagamento;

    @IsOptional()
    @IsDateString({}, { message: 'A data de vencimento deve ser uma data valida.' })
    dataVencimento?: string;

    @IsOptional()
    @IsDateString({}, { message: 'A data de pagamento deve ser uma data valida.' })
    dataPagamento?: string | null;

    @IsOptional()
    @IsEnum(StatusContaPagar, { message: 'Status invalido.' })
    status?: StatusContaPagar;

    @IsOptional()
    @IsNumber({}, { message: 'O pedido de compra deve ser numerico.' })
    pedidoCompraId?: number;
}
