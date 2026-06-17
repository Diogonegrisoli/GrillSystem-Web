import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive } from "class-validator";
import { TipoPagamentoReceber } from "../conta-receber.entity";

export class CreateContaReceberDto {
    @IsNumber({}, { message: 'O valor deve ser numerico.' })
    @IsPositive({ message: 'O valor deve ser maior que zero.' })
    valor!: number;

    @IsNotEmpty({ message: 'A data de vencimento deve ser informada.' })
    @IsDateString({}, { message: 'A data de vencimento deve ser uma data valida.' })
    dataVencimento!: string;

    @IsOptional()
    @IsDateString({}, { message: 'A data de recebimento deve ser uma data valida.' })
    dataRecebimento?: string;

    @IsEnum(TipoPagamentoReceber, { message: 'Tipo de pagamento invalido.' })
    tipoPagamento!: TipoPagamentoReceber;

    @IsNumber({}, { message: 'O pedido de venda deve ser numerico.' })
    pedidoVendaId!: number;
}
