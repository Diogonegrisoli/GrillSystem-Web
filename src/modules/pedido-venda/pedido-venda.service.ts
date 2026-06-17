import { Injectable, NotFoundException } from "@nestjs/common";
import { calculateProductsTotal, ensureDateNotBefore } from "src/common/business-rules";
import { CreatePedidoVendaDto } from "./dto/create-pedido-venda-dto";
import { UpdatePedidoVendaDto } from "./dto/update-pedido-venda-dto";
import { PedidoVenda, StatusPedido } from "./pedido-venda.entity";

@Injectable()
export class PedidoVendaService {
    async findOne(id: number): Promise<PedidoVenda | null> {
        return PedidoVenda.findOne({
            where: { id },
            relations: {
                produtos: true,
            },
        });
    }

    async findAll(): Promise<PedidoVenda[]> {
        return PedidoVenda.find({
            relations: {
                produtos: true,
            },
        });
    }

    async create(dados: CreatePedidoVendaDto): Promise<PedidoVenda> {
        const dataPedido = new Date();
        const dataEntrega = dados.dataEntrega ? new Date(dados.dataEntrega) : dataPedido;
        const { produtos, valorTotal } = await calculateProductsTotal(dados.produtoIds);

        ensureDateNotBefore(dataEntrega, dataPedido, 'dataEntrega', 'dataPedido');

        const pedidoVenda = PedidoVenda.create({
            dataPedido,
            dataEntrega,
            status: StatusPedido.PENDENTE,
            valorTotal,
            clienteId: dados.clienteId,
            produtos,
        });

        return pedidoVenda.save();
    }

    async update(id: number, dados: UpdatePedidoVendaDto): Promise<PedidoVenda> {
        const pedidoVenda = await this.findOne(id);

        if (!pedidoVenda) {
            throw new NotFoundException('Pedido de venda nao encontrado.');
        }

        const dataEntrega = dados.dataEntrega ? new Date(dados.dataEntrega) : pedidoVenda.dataEntrega;
        ensureDateNotBefore(dataEntrega, pedidoVenda.dataPedido, 'dataEntrega', 'dataPedido');

        let produtos = pedidoVenda.produtos;
        let valorTotal = pedidoVenda.valorTotal;

        if (dados.produtoIds) {
            const calculated = await calculateProductsTotal(dados.produtoIds);
            produtos = calculated.produtos;
            valorTotal = calculated.valorTotal;
        }

        const { produtoIds, ...pedidoData } = dados;

        Object.assign(pedidoVenda, {
            ...pedidoData,
            dataEntrega,
            produtos,
            valorTotal,
        });

        return pedidoVenda.save();
    }

    async remove(id: number): Promise<void> {
        const pedidoVenda = await this.findOne(id);

        if (!pedidoVenda) {
            throw new NotFoundException('Pedido de venda nao encontrado.');
        }

        await pedidoVenda.remove();
    }

}
