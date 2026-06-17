import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CreatePedidoVendaDto } from "./dto/create-pedido-venda-dto";
import { UpdatePedidoVendaDto } from "./dto/update-pedido-venda-dto";
import { PedidoVendaService } from "./pedido-venda.service";

@Controller('pedidos-venda')
export class PedidoVendaController {
    constructor(private readonly pedidoVendaService: PedidoVendaService) {}

    @Get()
    findAll() {
        return this.pedidoVendaService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.pedidoVendaService.findOne(Number(id));
    }

    @Post()
    create(@Body() dados: CreatePedidoVendaDto) {
        return this.pedidoVendaService.create(dados);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dados: UpdatePedidoVendaDto) {
        return this.pedidoVendaService.update(Number(id), dados);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.pedidoVendaService.remove(Number(id));
    }
}
