import { Injectable, NotFoundException } from "@nestjs/common";
import { ensureDateNotBefore, ensurePositive } from "src/common/business-rules";
import { ContaPagar, StatusContaPagar } from "./conta-pagar.entity";
import { CreateContaPagarDto } from "./dto/create-conta-pagar-dto";
import { UpdateContaPagarDto } from "./dto/update-conta-pagar-dto";

@Injectable()
export class ContaPagarService {
    async findOne(id: number): Promise<ContaPagar | null> {
        return ContaPagar.findOne({ where: { id } });
    }

    async findAll(): Promise<ContaPagar[]> {
        return ContaPagar.find();
    }

    async create(dados: CreateContaPagarDto): Promise<ContaPagar> {
        const dataEmissao = new Date();
        const dataVencimento = new Date(dados.dataVencimento);
        const dataPagamento = dados.dataPagamento ? new Date(dados.dataPagamento) : null;

        ensurePositive(dados.valor, 'valor');
        ensureDateNotBefore(dataVencimento, dataEmissao, 'dataVencimento', 'dataEmissao');
        ensureDateNotBefore(dataPagamento, dataEmissao, 'dataPagamento', 'dataEmissao');

        const contaPagar = ContaPagar.create({
            valor: dados.valor,
            tipoPagamento: dados.tipoPagamento,
            dataEmissao,
            dataVencimento,
            dataPagamento,
            pedidoCompraId: dados.pedidoCompraId,
            status: dataPagamento ? StatusContaPagar.PAGO : StatusContaPagar.PENDENTE,
        });

        return contaPagar.save();
    }

    async update(id: number, dados: UpdateContaPagarDto): Promise<ContaPagar> {
        const contaPagar = await this.findOne(id);

        if (!contaPagar) {
            throw new NotFoundException('Conta a pagar nao encontrada.');
        }

        const dataVencimento = dados.dataVencimento ? new Date(dados.dataVencimento) : contaPagar.dataVencimento;
        const dataPagamento = dados.dataPagamento === null
            ? null
            : dados.dataPagamento
                ? new Date(dados.dataPagamento)
                : contaPagar.dataPagamento;

        if (dados.valor !== undefined) {
            ensurePositive(dados.valor, 'valor');
        }

        ensureDateNotBefore(dataVencimento, contaPagar.dataEmissao, 'dataVencimento', 'dataEmissao');
        ensureDateNotBefore(dataPagamento, contaPagar.dataEmissao, 'dataPagamento', 'dataEmissao');

        Object.assign(contaPagar, {
            ...dados,
            dataVencimento,
            dataPagamento,
            status: dados.status ?? (dataPagamento ? StatusContaPagar.PAGO : StatusContaPagar.PENDENTE),
        });

        return contaPagar.save();
    }

    async remove(id: number): Promise<void> {
        const contaPagar = await this.findOne(id);

        if (!contaPagar) {
            throw new NotFoundException('Conta a pagar nao encontrada.');
        }

        await contaPagar.remove();
    }

}
