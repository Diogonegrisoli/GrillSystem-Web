import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Render, Res } from "@nestjs/common";
import { Funcionario } from "../funcionario/funcionario.entity";
import { Public } from "../auth/public.decorator";
import { CreateUsuarioDto } from "./dto/create-usuario-dto";
import { UpdateUsuarioDto } from "./dto/update-usuario-dto";
import { UsuarioService } from "./usuario.service";

@Controller('usuarios')
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) {}

    @Public()
    @Get('consultar')
    @Render('shared/list')
    async consultar(@Query('busca') busca?: string) {
        const termo = busca?.trim().toLowerCase();
        const usuarios = (await this.usuarioService.findAll()).filter((usuario) =>
            !termo || String(usuario.id).includes(termo) || usuario.email.toLowerCase().includes(termo) || usuario.funcionario?.nome?.toLowerCase().includes(termo)
        );
        return {
            active: 'usuarios',
            titulo: 'Consultar Usuario',
            consultaUrl: '/usuarios/consultar',
            buscaPlaceholder: 'Buscar por id, e-mail ou funcionario',
            busca: busca ?? '',
            createUrl: '/usuarios/cadastrar',
            createLabel: 'Cadastrar Usuario',
            financeiroLinks: [],
            columns: [
                { key: 'id', label: 'Id' },
                { key: 'email', label: 'E-mail' },
                { key: 'funcionario', label: 'Funcionario' },
            ],
            items: usuarios.map((usuario) => ({
                id: usuario.id,
                email: usuario.email,
                funcionario: usuario.funcionario?.nome ?? usuario.funcionarioId,
                editUrl: `/usuarios/${usuario.id}/editar`,
                viewUrl: `/usuarios/${usuario.id}/visualizar`,
                deleteUrl: `/usuarios/${usuario.id}/remover`,
                deleteName: usuario.email,
            })),
        };
    }

    @Public()
    @Get('cadastrar')
    @Render('shared/form')
    async cadastrar() {
        return this.formView('Cadastrar Usuario', '/usuarios/cadastrar', '/usuarios/consultar', {}, null);
    }

    @Public()
    @Post('cadastrar')
    async createFromView(@Body() dados: Record<string, string>, @Res() res: any) {
        try {
            this.ensurePasswordConfirmation(dados.senha, dados.confirmacaoSenha);
            await this.usuarioService.create(dados as unknown as CreateUsuarioDto);
            return res.redirect('/usuarios/consultar');
        } catch (error) {
            return res.render('shared/form', await this.formView('Cadastrar Usuario', '/usuarios/cadastrar', '/usuarios/consultar', dados, this.getErrorMessage(error)));
        }
    }

    @Public()
    @Get(':id/visualizar')
    @Render('shared/detail')
    async visualizar(@Param('id') id: string) {
        const usuario = await this.usuarioService.findOne(Number(id));
        if (!usuario) throw new NotFoundException('Usuario nao encontrado.');
        return {
            active: 'usuarios',
            titulo: 'Visualizar Usuario',
            voltarUrl: '/usuarios/consultar',
            editUrl: `/usuarios/${usuario.id}/editar`,
            rows: [
                { label: 'Id', value: usuario.id },
                { label: 'E-mail', value: usuario.email },
                { label: 'Funcionario', value: usuario.funcionario?.nome ?? usuario.funcionarioId },
            ],
        };
    }

    @Public()
    @Get(':id/editar')
    @Render('shared/form')
    async editar(@Param('id') id: string) {
        const usuario = await this.usuarioService.findOne(Number(id));
        if (!usuario) throw new NotFoundException('Usuario nao encontrado.');
        return this.formView('Editar Usuario', `/usuarios/${usuario.id}/editar`, '/usuarios/consultar', usuario, null, true);
    }

    @Public()
    @Post(':id/editar')
    async updateFromView(@Param('id') id: string, @Body() dados: Record<string, string>, @Res() res: any) {
        try {
            if (dados.senha) {
                this.ensurePasswordConfirmation(dados.senha, dados.confirmacaoSenha);
            }
            await this.usuarioService.update(Number(id), {
                email: dados.email,
                ...(dados.senha ? { senha: dados.senha } : {}),
            });
            return res.redirect('/usuarios/consultar');
        } catch (error) {
            const usuario = await this.usuarioService.findOne(Number(id));
            return res.render('shared/form', await this.formView('Editar Usuario', `/usuarios/${id}/editar`, '/usuarios/consultar', {
                ...dados,
                id: Number(id),
                funcionarioId: usuario?.funcionarioId,
            }, this.getErrorMessage(error), true));
        }
    }

    @Public()
    @Post(':id/remover')
    async removeFromView(@Param('id') id: string, @Res() res: any) {
        await this.usuarioService.remove(Number(id));
        return res.redirect('/usuarios/consultar');
    }

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

    private async formView(titulo: string, acao: string, voltarUrl: string, values: any, erro: string | null, editing = false) {
        const funcionarios = await Funcionario.find();
        return {
            active: 'usuarios',
            titulo,
            acao,
            voltarUrl,
            values,
            erro,
            fields: [
                { name: 'email', label: 'E-mail', type: 'email', required: true },
                {
                    name: 'senha',
                    label: 'Senha',
                    type: 'password',
                    id: 'password',
                    required: !editing,
                    disabled: editing,
                    minlength: 6,
                    action: editing ? 'enable-password' : undefined,
                    actionLabel: 'Alterar senha',
                },
                {
                    name: 'confirmacaoSenha',
                    label: 'Confirmar senha',
                    type: 'password',
                    id: 'password-confirmation',
                    required: !editing,
                    hidden: editing,
                    minlength: 6,
                },
                {
                    name: 'funcionarioId',
                    label: 'Funcionario',
                    type: 'select',
                    required: true,
                    disabled: editing,
                    options: funcionarios.map((funcionario) => ({ value: funcionario.id, label: `${funcionario.id} - ${funcionario.nome}` })),
                },
            ],
        };
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : 'Nao foi possivel salvar o registro.';
    }

    private ensurePasswordConfirmation(senha?: string, confirmacao?: string): void {
        if (!senha || senha !== confirmacao) {
            throw new BadRequestException('A confirmacao da senha deve ser igual a senha informada.');
        }
    }
}
