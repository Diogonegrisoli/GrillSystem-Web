import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Render, Res } from "@nestjs/common";
import { Public } from "../auth/public.decorator";
import { CreateFuncionarioDto } from "./dto/create-funcionario-dto";
import { UpdateFuncionarioDto } from "./dto/update-funcionario-dto";
import { StatusFuncionario } from "./funcionario.entity";
import { FuncionarioService } from "./funcionario.service";

@Controller('funcionarios')
export class FuncionarioController {
    constructor(private readonly funcionarioService: FuncionarioService) {}

    @Public()
    @Get('consultar')
    @Render('shared/list')
    async consultar(@Query('busca') busca?: string) {
        const termo = busca?.trim().toLowerCase();
        const funcionarios = (await this.funcionarioService.findAll()).filter((funcionario) =>
            !termo || funcionario.nome.toLowerCase().includes(termo) || funcionario.cpf.includes(termo) || funcionario.status.toLowerCase().includes(termo)
        );
        return {
            active: 'funcionarios',
            titulo: 'Consultar Funcionario',
            consultaUrl: '/funcionarios/consultar',
            buscaPlaceholder: 'Buscar por nome, CPF ou status',
            busca: busca ?? '',
            createUrl: '/funcionarios/cadastrar',
            createLabel: 'Cadastrar Funcionario',
            financeiroLinks: [],
            columns: [
                { key: 'nome', label: 'Nome' },
                { key: 'cpf', label: 'CPF' },
                { key: 'status', label: 'Status' },
            ],
            items: funcionarios.map((funcionario) => ({
                nome: funcionario.nome,
                cpf: funcionario.cpf,
                status: funcionario.status,
                editUrl: `/funcionarios/${funcionario.id}/editar`,
                viewUrl: `/funcionarios/${funcionario.id}/visualizar`,
                deleteUrl: `/funcionarios/${funcionario.id}/remover`,
                deleteName: funcionario.nome,
            })),
        };
    }

    @Public()
    @Get('cadastrar')
    @Render('shared/form')
    cadastrar() {
        return this.formView('Cadastrar Funcionario', '/funcionarios/cadastrar', '/funcionarios/consultar', {}, null, false);
    }

    @Public()
    @Post('cadastrar')
    async createFromView(@Body() dados: Record<string, string>, @Res() res: any) {
        try {
            await this.funcionarioService.create(dados as unknown as CreateFuncionarioDto);
            return res.redirect('/funcionarios/consultar');
        } catch (error) {
            return res.render('shared/form', this.formView('Cadastrar Funcionario', '/funcionarios/cadastrar', '/funcionarios/consultar', dados, this.getErrorMessage(error), false));
        }
    }

    @Public()
    @Get(':id/visualizar')
    @Render('shared/detail')
    async visualizar(@Param('id') id: string) {
        const funcionario = await this.funcionarioService.findOne(Number(id));
        if (!funcionario) throw new NotFoundException('Funcionario nao encontrado.');
        return {
            active: 'funcionarios',
            titulo: 'Visualizar Funcionario',
            voltarUrl: '/funcionarios/consultar',
            editUrl: `/funcionarios/${funcionario.id}/editar`,
            rows: [
                { label: 'Nome', value: funcionario.nome },
                { label: 'CPF', value: funcionario.cpf },
                { label: 'Status', value: funcionario.status },
            ],
        };
    }

    @Public()
    @Get(':id/editar')
    @Render('shared/form')
    async editar(@Param('id') id: string) {
        const funcionario = await this.funcionarioService.findOne(Number(id));
        if (!funcionario) throw new NotFoundException('Funcionario nao encontrado.');
        return this.formView('Editar Funcionario', `/funcionarios/${funcionario.id}/editar`, '/funcionarios/consultar', funcionario, null, true);
    }

    @Public()
    @Post(':id/editar')
    async updateFromView(@Param('id') id: string, @Body() dados: Record<string, string>, @Res() res: any) {
        try {
            const { cpf, ...editableData } = dados;
            await this.funcionarioService.update(Number(id), editableData as UpdateFuncionarioDto);
            return res.redirect('/funcionarios/consultar');
        } catch (error) {
            const funcionario = await this.funcionarioService.findOne(Number(id));
            return res.render('shared/form', this.formView('Editar Funcionario', `/funcionarios/${id}/editar`, '/funcionarios/consultar', {
                ...dados,
                cpf: funcionario?.cpf,
            }, this.getErrorMessage(error), true));
        }
    }

    @Public()
    @Post(':id/remover')
    async removeFromView(@Param('id') id: string, @Res() res: any) {
        await this.funcionarioService.remove(Number(id));
        return res.redirect('/funcionarios/consultar');
    }

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

    private formView(titulo: string, acao: string, voltarUrl: string, values: any, erro: string | null, includeStatus: boolean) {
        const fields: any[] = [
            { name: 'nome', label: 'Nome', required: true, minlength: 3, maxlength: 200 },
            { name: 'cpf', label: 'CPF', required: true, disabled: includeStatus },
        ];

        if (includeStatus) {
            fields.push({
                name: 'status',
                label: 'Status',
                type: 'select',
                options: [
                    { value: StatusFuncionario.ATIVO, label: 'Ativo' },
                    { value: StatusFuncionario.INATIVO, label: 'Inativo' },
                ],
            });
        }

        return { active: 'funcionarios', titulo, acao, voltarUrl, values, erro, fields };
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : 'Nao foi possivel salvar o registro.';
    }
}
