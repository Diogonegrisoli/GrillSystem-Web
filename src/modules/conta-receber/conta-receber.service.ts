import { Injectable, NotFoundException } from "@nestjs/common";
import { ensureDateNotBefore, ensurePositive } from "src/common/business-rules";
import { ContaReceber, StatusPagamento } from "./conta-receber.entity";
import { CreateContaReceberDto } from "./dto/create-conta-receber-dto";
import { UpdateContaReceberDto } from "./dto/update-conta-receber-dto";

@Injectable()
export class ContaReceberService {
    async findOne(id: number): Promise<ContaReceber | null> {
        return ContaReceber.findOne({ where: { id } });
    }

    async findAll(): Promise<ContaReceber[]> {
        return ContaReceber.find();
    }

    async create(dados: CreateContaReceberDto): Promise<ContaReceber> {
        const dataEmissao = new Date();
        const dataVencimento = new Date(dados.dataVencimento);
        const dataRecebimento = dados.dataRecebimento ? new Date(dados.dataRecebimento) : null;

        ensurePositive(dados.valor, 'valor');
        ensureDateNotBefore(dataVencimento, dataEmissao, 'dataVencimento', 'dataEmissao');
        ensureDateNotBefore(dataRecebimento, dataEmissao, 'dataRecebimento', 'dataEmissao');

        const contaReceber = ContaReceber.create({
            valor: dados.valor,
            dataEmissao,
            dataVencimento,
            dataRecebimento,
            tipoPagamento: dados.tipoPagamento,
            pedidoVendaId: dados.pedidoVendaId,
            statusPagamento: dataRecebimento ? StatusPagamento.PAGO : StatusPagamento.PENDENTE,
        });

        return contaReceber.save();
    }

    async update(id: number, dados: UpdateContaReceberDto): Promise<ContaReceber> {
        const contaReceber = await this.findOne(id);

        if (!contaReceber) {
            throw new NotFoundException('Conta a receber nao encontrada.');
        }

        const dataVencimento = dados.dataVencimento ? new Date(dados.dataVencimento) : contaReceber.dataVencimento;
        const dataRecebimento = dados.dataRecebimento === null
            ? null
            : dados.dataRecebimento
                ? new Date(dados.dataRecebimento)
                : contaReceber.dataRecebimento;

        if (dados.valor !== undefined) {
            ensurePositive(dados.valor, 'valor');
        }

        ensureDateNotBefore(dataVencimento, contaReceber.dataEmissao, 'dataVencimento', 'dataEmissao');
        ensureDateNotBefore(dataRecebimento, contaReceber.dataEmissao, 'dataRecebimento', 'dataEmissao');

        Object.assign(contaReceber, {
            ...dados,
            dataVencimento,
            dataRecebimento,
            statusPagamento: dados.statusPagamento ?? (dataRecebimento ? StatusPagamento.PAGO : StatusPagamento.PENDENTE),
        });

        return contaReceber.save();
    }

    async remove(id: number): Promise<void> {
        const contaReceber = await this.findOne(id);

        if (!contaReceber) {
            throw new NotFoundException('Conta a receber nao encontrada.');
        }

        await contaReceber.remove();
    }

}
