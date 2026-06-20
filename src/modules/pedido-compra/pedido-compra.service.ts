import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ensureDateNotBefore } from "src/common/business-rules";
import { ContaPagar, StatusContaPagar, TipoPagamento } from "src/modules/conta-pagar/conta-pagar.entity";
import { Produto } from "src/modules/produto/produto.entity";
import { In } from "typeorm";
import { CreatePedidoCompraDto } from "./dto/create-pedido-compra-dto";
import { UpdatePedidoCompraDto } from "./dto/update-pedido-compra-dto";
import { ItemPedidoCompra, PedidoCompra, StatusCompra } from "./pedido-compra.entity";

@Injectable()
export class PedidoCompraService {
    async findOne(id: number): Promise<PedidoCompra | null> {
        return PedidoCompra.findOne({
            where: { id },
            relations: {
                fornecedor: true,
                funcionario: true,
                produtos: true,
                contaPagar: true,
            },
        });
    }

    async findAll(): Promise<PedidoCompra[]> {
        return PedidoCompra.find({ relations: { fornecedor: true, funcionario: true, produtos: true } });
    }

    async create(dados: CreatePedidoCompraDto): Promise<PedidoCompra> {
        const dataPedido = new Date();
        const dataEntrega = dados.dataEntrega ? new Date(dados.dataEntrega) : dataPedido;
        const calculated = await this.calculateItems(dados.produtoIds, dados.itens);
        ensureDateNotBefore(dataEntrega, dataPedido, 'dataEntrega', 'dataPedido');

        const pedidoCompra = await PedidoCompra.create({
            dataPedido,
            dataEntrega,
            status: StatusCompra.PENDENTE,
            valorTotal: calculated.valorTotal,
            fornecedorId: dados.fornecedorId,
            funcionarioId: dados.funcionarioId,
            produtos: calculated.produtos,
            itens: calculated.itens,
        }).save();

        await ContaPagar.create({
            valor: calculated.valorTotal,
            tipoPagamento: dados.tipoPagamento ?? TipoPagamento.PIX,
            dataEmissao: dataPedido,
            dataVencimento: dataEntrega,
            dataPagamento: null,
            status: StatusContaPagar.PENDENTE,
            pedidoCompraId: pedidoCompra.id,
        }).save();

        return pedidoCompra;
    }

    async update(id: number, dados: UpdatePedidoCompraDto): Promise<PedidoCompra> {
        const pedidoCompra = await this.findOne(id);
        if (!pedidoCompra) throw new NotFoundException('Pedido de compra nao encontrado.');

        const dataEntrega = dados.dataEntrega ? new Date(dados.dataEntrega) : pedidoCompra.dataEntrega ?? pedidoCompra.dataPedido;
        ensureDateNotBefore(dataEntrega, pedidoCompra.dataPedido, 'dataEntrega', 'dataPedido');

        let produtos = pedidoCompra.produtos;
        let itens = pedidoCompra.itens;
        let valorTotal = Number(pedidoCompra.valorTotal);
        if (dados.produtoIds || dados.itens) {
            const calculated = await this.calculateItems(dados.produtoIds ?? [], dados.itens);
            produtos = calculated.produtos;
            itens = calculated.itens;
            valorTotal = calculated.valorTotal;
        }

        const { produtoIds, itens: ignoredItems, tipoPagamento, ...editableData } = dados;
        Object.assign(pedidoCompra, { ...editableData, dataEntrega, produtos, itens, valorTotal });
        const saved = await pedidoCompra.save();

        const conta = pedidoCompra.contaPagar ?? await ContaPagar.findOne({ where: { pedidoCompraId: id } });
        if (conta) {
            conta.valor = valorTotal;
            conta.dataVencimento = dataEntrega;
            if (tipoPagamento) conta.tipoPagamento = tipoPagamento;
            await conta.save();
        }

        return saved;
    }

    async remove(id: number): Promise<void> {
        const pedidoCompra = await this.findOne(id);
        if (!pedidoCompra) throw new NotFoundException('Pedido de compra nao encontrado.');
        if (pedidoCompra.contaPagar) await pedidoCompra.contaPagar.remove();
        await pedidoCompra.remove();
    }

    private async calculateItems(produtoIds: number[], requestedItems?: CreatePedidoCompraDto['itens']) {
        const sourceItems = requestedItems?.length
            ? requestedItems
            : produtoIds.map((produtoId) => ({ produtoId, quantidade: 1, valorUnitario: 0, total: 0 }));
        if (!sourceItems.length) throw new BadRequestException('Informe ao menos um produto.');

        const ids = [...new Set(sourceItems.map((item) => Number(item.produtoId)))];
        const produtos = await Produto.findBy({ id: In(ids) });
        if (produtos.length !== ids.length) throw new BadRequestException('Um ou mais produtos nao foram encontrados.');

        const itens: ItemPedidoCompra[] = sourceItems.map((item) => {
            const quantidade = Number(item.quantidade);
            const valorUnitario = Number(item.valorUnitario);
            if (!Number.isInteger(quantidade) || quantidade < 1 || !Number.isFinite(valorUnitario) || valorUnitario <= 0) {
                throw new BadRequestException('Informe quantidade e valor validos para cada produto.');
            }
            return { produtoId: Number(item.produtoId), quantidade, valorUnitario, total: quantidade * valorUnitario };
        });

        return { produtos, itens, valorTotal: itens.reduce((total, item) => total + item.total, 0) };
    }
}
