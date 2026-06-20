import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ensureDateNotBefore } from "src/common/business-rules";
import { ContaReceber, StatusPagamento, TipoPagamentoReceber } from "src/modules/conta-receber/conta-receber.entity";
import { Produto } from "src/modules/produto/produto.entity";
import { In } from "typeorm";
import { CreatePedidoVendaDto } from "./dto/create-pedido-venda-dto";
import { UpdatePedidoVendaDto } from "./dto/update-pedido-venda-dto";
import { ItemPedidoVenda, PedidoVenda, StatusPedido } from "./pedido-venda.entity";

@Injectable()
export class PedidoVendaService {
    async findOne(id: number): Promise<PedidoVenda | null> {
        return PedidoVenda.findOne({
            where: { id },
            relations: {
                cliente: true,
                funcionario: true,
                produtos: true,
                contaReceber: true,
            },
        });
    }

    async findAll(): Promise<PedidoVenda[]> {
        return PedidoVenda.find({
            relations: {
                cliente: true,
                funcionario: true,
                produtos: true,
            },
        });
    }

    async create(dados: CreatePedidoVendaDto): Promise<PedidoVenda> {
        const dataPedido = new Date();
        const dataEntrega = dados.dataEntrega ? new Date(dados.dataEntrega) : dataPedido;
        const calculated = await this.calculateItems(dados.produtoIds, dados.itens);

        ensureDateNotBefore(dataEntrega, dataPedido, 'dataEntrega', 'dataPedido');

        const pedidoVenda = await PedidoVenda.create({
            dataPedido,
            dataEntrega,
            status: StatusPedido.PENDENTE,
            valorTotal: calculated.valorTotal,
            clienteId: dados.clienteId,
            funcionarioId: dados.funcionarioId,
            produtos: calculated.produtos,
            itens: calculated.itens,
        }).save();

        await ContaReceber.create({
            valor: calculated.valorTotal,
            dataEmissao: dataPedido,
            dataVencimento: dataEntrega,
            dataRecebimento: null,
            tipoPagamento: TipoPagamentoReceber.DINHEIRO,
            statusPagamento: StatusPagamento.PENDENTE,
            pedidoVendaId: pedidoVenda.id,
        }).save();

        return pedidoVenda;
    }

    async update(id: number, dados: UpdatePedidoVendaDto): Promise<PedidoVenda> {
        const pedidoVenda = await this.findOne(id);
        if (!pedidoVenda) throw new NotFoundException('Pedido de venda nao encontrado.');

        const dataEntrega = dados.dataEntrega ? new Date(dados.dataEntrega) : pedidoVenda.dataEntrega;
        ensureDateNotBefore(dataEntrega, pedidoVenda.dataPedido, 'dataEntrega', 'dataPedido');

        let produtos = pedidoVenda.produtos;
        let itens = pedidoVenda.itens;
        let valorTotal = Number(pedidoVenda.valorTotal);

        if (dados.produtoIds || dados.itens) {
            const calculated = await this.calculateItems(dados.produtoIds ?? [], dados.itens);
            produtos = calculated.produtos;
            itens = calculated.itens;
            valorTotal = calculated.valorTotal;
        }

        const { produtoIds, itens: ignoredItems, ...editableData } = dados;
        Object.assign(pedidoVenda, { ...editableData, dataEntrega, produtos, itens, valorTotal });
        const saved = await pedidoVenda.save();

        const conta = pedidoVenda.contaReceber ?? await ContaReceber.findOne({ where: { pedidoVendaId: id } });
        if (conta) {
            conta.valor = valorTotal;
            conta.dataVencimento = dataEntrega;
            await conta.save();
        }

        return saved;
    }

    async remove(id: number): Promise<void> {
        const pedidoVenda = await this.findOne(id);
        if (!pedidoVenda) throw new NotFoundException('Pedido de venda nao encontrado.');
        if (pedidoVenda.contaReceber) await pedidoVenda.contaReceber.remove();
        await pedidoVenda.remove();
    }

    private async calculateItems(produtoIds: number[], requestedItems?: CreatePedidoVendaDto['itens']) {
        const sourceItems = requestedItems?.length
            ? requestedItems
            : produtoIds.map((produtoId) => ({ produtoId, quantidade: 1, valorUnitario: 0, total: 0 }));

        if (!sourceItems.length) throw new BadRequestException('Informe ao menos um produto.');

        const ids = [...new Set(sourceItems.map((item) => Number(item.produtoId)))];
        const produtos = await Produto.findBy({ id: In(ids) });
        if (produtos.length !== ids.length) throw new BadRequestException('Um ou mais produtos nao foram encontrados.');

        const productMap = new Map(produtos.map((produto) => [produto.id, produto]));
        const itens: ItemPedidoVenda[] = sourceItems.map((item) => {
            const quantidade = Number(item.quantidade);
            const produto = productMap.get(Number(item.produtoId));
            if (!produto || !Number.isInteger(quantidade) || quantidade < 1) {
                throw new BadRequestException('A quantidade de cada produto deve ser um inteiro maior que zero.');
            }
            const valorUnitario = Number(produto.preco);
            return { produtoId: produto.id, quantidade, valorUnitario, total: valorUnitario * quantidade };
        });

        return {
            produtos,
            itens,
            valorTotal: itens.reduce((total, item) => total + item.total, 0),
        };
    }
}
