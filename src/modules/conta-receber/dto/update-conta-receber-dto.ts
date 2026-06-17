import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive } from "class-validator";
import { StatusPagamento, TipoPagamentoReceber } from "../conta-receber.entity";

export class UpdateContaReceberDto {
    @IsOptional()
    @IsNumber({}, { message: 'O valor deve ser numerico.' })
    @IsPositive({ message: 'O valor deve ser maior que zero.' })
    valor?: number;

    @IsOptional()
    @IsDateString({}, { message: 'A data de vencimento deve ser uma data valida.' })
    dataVencimento?: string;

    @IsOptional()
    @IsDateString({}, { message: 'A data de recebimento deve ser uma data valida.' })
    dataRecebimento?: string | null;

    @IsOptional()
    @IsEnum(TipoPagamentoReceber, { message: 'Tipo de pagamento invalido.' })
    tipoPagamento?: TipoPagamentoReceber;

    @IsOptional()
    @IsEnum(StatusPagamento, { message: 'Status invalido.' })
    statusPagamento?: StatusPagamento;

    @IsOptional()
    @IsNumber({}, { message: 'O pedido de venda deve ser numerico.' })
    pedidoVendaId?: number;
}
