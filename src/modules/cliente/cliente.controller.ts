import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ClienteService } from "./cliente.service";
import { CreateClienteDto } from "./dto/create-cliente-dto";
import { UpdateClienteDto } from "./dto/update-cliente-dto";

@Controller('clientes')
export class ClienteController{
    constructor(private readonly clienteService: ClienteService) {}

    @Get()
    findAll() {
        return this.clienteService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clienteService.findOne(Number(id));
    }

    @Post()
    create(@Body() dados: CreateClienteDto) {
        return this.clienteService.create(dados);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dados: UpdateClienteDto) {
        return this.clienteService.update(Number(id), dados);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.clienteService.remove(Number(id));
    }
}
