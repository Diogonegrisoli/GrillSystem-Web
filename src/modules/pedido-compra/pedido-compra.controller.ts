import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CreatePedidoCompraDto } from "./dto/create-pedido-compra-dto";
import { UpdatePedidoCompraDto } from "./dto/update-pedido-compra-dto";
import { PedidoCompraService } from "./pedido-compra.service";

@Controller('pedidos-compra')
export class PedidoCompraController {
    constructor(private readonly pedidoCompraService: PedidoCompraService) {}

    @Get()
    findAll() {
        return this.pedidoCompraService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.pedidoCompraService.findOne(Number(id));
    }

    @Post()
    create(@Body() dados: CreatePedidoCompraDto) {
        return this.pedidoCompraService.create(dados);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dados: UpdatePedidoCompraDto) {
        return this.pedidoCompraService.update(Number(id), dados);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.pedidoCompraService.remove(Number(id));
    }
}
