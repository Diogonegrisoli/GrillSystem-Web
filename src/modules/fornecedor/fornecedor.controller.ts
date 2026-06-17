import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateFornecedorDto } from "./dto/create-fornecedor-dto";
import { UpdateFornecedorDto } from "./dto/update-fornecedor-dto";
import { FornecedorService } from "./fornecedor.service";

@Controller('fornecedores')
export class FornecedorController {
    constructor(private readonly fornecedorService: FornecedorService) {}

    @Get()
    findAll() {
        return this.fornecedorService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.fornecedorService.findOne(Number(id));
    }

    @Post()
    create(@Body() dados: CreateFornecedorDto) {
        return this.fornecedorService.create(dados);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dados: UpdateFornecedorDto) {
        return this.fornecedorService.update(Number(id), dados);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.fornecedorService.remove(Number(id));
    }
}
