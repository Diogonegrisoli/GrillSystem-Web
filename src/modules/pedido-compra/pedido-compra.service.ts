import { Injectable, NotFoundException } from "@nestjs/common";
import { calculateProductsTotal, ensureDateNotBefore } from "src/common/business-rules";
import { CreatePedidoCompraDto } from "./dto/create-pedido-compra-dto";
import { UpdatePedidoCompraDto } from "./dto/update-pedido-compra-dto";
import { PedidoCompra, StatusCompra } from "./pedido-compra.entity";

@Injectable()
export class PedidoCompraService {
    async findOne(id: number): Promise<PedidoCompra | null> {
        return PedidoCompra.findOne({
            where: { id },
            relations: {
                produtos: true,
            },
        });
    }

    async findAll(): Promise<PedidoCompra[]> {
        return PedidoCompra.find({
            relations: {
                produtos: true,
            },
        });
    }

    async create(dados: CreatePedidoCompraDto): Promise<PedidoCompra> {
        const dataPedido = new Date();
        const dataEntrega = dados.dataEntrega ? new Date(dados.dataEntrega) : undefined;
        const { produtos, valorTotal } = await calculateProductsTotal(dados.produtoIds);

        ensureDateNotBefore(dataEntrega, dataPedido, 'dataEntrega', 'dataPedido');

        const pedidoCompra = PedidoCompra.create({
            dataPedido,
            dataEntrega,
            status: StatusCompra.PENDENTE,
            valorTotal,
            fornecedorId: dados.fornecedorId,
            funcionarioId: dados.funcionarioId,
            produtos,
        });

        return pedidoCompra.save();
    }

    async update(id: number, dados: UpdatePedidoCompraDto): Promise<PedidoCompra> {
        const pedidoCompra = await this.findOne(id);

        if (!pedidoCompra) {
            throw new NotFoundException('Pedido de compra nao encontrado.');
        }

        const dataEntrega = dados.dataEntrega ? new Date(dados.dataEntrega) : pedidoCompra.dataEntrega;
        ensureDateNotBefore(dataEntrega, pedidoCompra.dataPedido, 'dataEntrega', 'dataPedido');

        let produtos = pedidoCompra.produtos;
        let valorTotal = pedidoCompra.valorTotal;

        if (dados.produtoIds) {
            const calculated = await calculateProductsTotal(dados.produtoIds);
            produtos = calculated.produtos;
            valorTotal = calculated.valorTotal;
        }

        const { produtoIds, ...pedidoData } = dados;

        Object.assign(pedidoCompra, {
            ...pedidoData,
            dataEntrega,
            produtos,
            valorTotal,
        });

        return pedidoCompra.save();
    }

    async remove(id: number): Promise<void> {
        const pedidoCompra = await this.findOne(id);

        if (!pedidoCompra) {
            throw new NotFoundException('Pedido de compra nao encontrado.');
        }

        await pedidoCompra.remove();
    }

}
