import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateProdutoDto } from "./dto/create-produto-dto";
import { UpdateProdutoDto } from "./dto/update-produto-dto";
import { ProdutoService } from "./produto.service";

@Controller('produtos')
export class ProdutoController {
    constructor(private readonly produtoService: ProdutoService) {}

    @Get()
    findAll() {
        return this.produtoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.produtoService.findOne(Number(id));
    }

    @Post()
    create(@Body() dados: CreateProdutoDto) {
        return this.produtoService.create(dados);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dados: UpdateProdutoDto) {
        return this.produtoService.update(Number(id), dados);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.produtoService.remove(Number(id));
    }
}
