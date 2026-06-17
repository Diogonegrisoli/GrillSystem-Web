import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ContaReceberService } from "./conta-receber.service";
import { CreateContaReceberDto } from "./dto/create-conta-receber-dto";
import { UpdateContaReceberDto } from "./dto/update-conta-receber-dto";

@Controller('contas-receber')
export class ContaReceberController {
    constructor(private readonly contaReceberService: ContaReceberService) {}

    @Get()
    findAll() {
        return this.contaReceberService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.contaReceberService.findOne(Number(id));
    }

    @Post()
    create(@Body() dados: CreateContaReceberDto) {
        return this.contaReceberService.create(dados);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dados: UpdateContaReceberDto) {
        return this.contaReceberService.update(Number(id), dados);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.contaReceberService.remove(Number(id));
    }
}
