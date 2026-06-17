import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateFuncionarioDto } from "./dto/create-funcionario-dto";
import { UpdateFuncionarioDto } from "./dto/update-funcionario-dto";
import { FuncionarioService } from "./funcionario.service";

@Controller('funcionarios')
export class FuncionarioController {
    constructor(private readonly funcionarioService: FuncionarioService) {}

    @Get()
    findAll() {
        return this.funcionarioService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.funcionarioService.findOne(Number(id));
    }

    @Post()
    create(@Body() dados: CreateFuncionarioDto) {
        return this.funcionarioService.create(dados);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dados: UpdateFuncionarioDto) {
        return this.funcionarioService.update(Number(id), dados);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.funcionarioService.remove(Number(id));
    }
}
