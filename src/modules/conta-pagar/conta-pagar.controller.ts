import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ContaPagarService } from "./conta-pagar.service";
import { CreateContaPagarDto } from "./dto/create-conta-pagar-dto";
import { UpdateContaPagarDto } from "./dto/update-conta-pagar-dto";

@Controller('contas-pagar')
export class ContaPagarController {
    constructor(private readonly contaPagarService: ContaPagarService) {}

    @Get()
    findAll() {
        return this.contaPagarService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.contaPagarService.findOne(Number(id));
    }

    @Post()
    create(@Body() dados: CreateContaPagarDto) {
        return this.contaPagarService.create(dados);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dados: UpdateContaPagarDto) {
        return this.contaPagarService.update(Number(id), dados);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.contaPagarService.remove(Number(id));
    }
}
