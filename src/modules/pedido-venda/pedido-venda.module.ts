import { Module } from "@nestjs/common";
import { PedidoVendaController } from "./pedido-venda.controller";
import { PedidoVendaService } from "./pedido-venda.service";

@Module({
    imports: [],
    controllers: [PedidoVendaController],
    providers: [PedidoVendaService],
})
export class PedidoVendaModule {}
