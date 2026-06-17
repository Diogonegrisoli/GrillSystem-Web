import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateUsuarioDto } from "./dto/create-usuario-dto";
import { UpdateUsuarioDto } from "./dto/update-usuario-dto";
import { UsuarioService } from "./usuario.service";

@Controller('usuarios')
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) {}

    @Get()
    findAll() {
        return this.usuarioService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usuarioService.findOne(Number(id));
    }

    @Post()
    create(@Body() dados: CreateUsuarioDto) {
        return this.usuarioService.create(dados);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dados: UpdateUsuarioDto) {
        return this.usuarioService.update(Number(id), dados);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usuarioService.remove(Number(id));
    }
}
