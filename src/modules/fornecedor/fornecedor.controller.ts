import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Render, Res } from "@nestjs/common";
import { Public } from "../auth/public.decorator";
import { CreateFornecedorDto } from "./dto/create-fornecedor-dto";
import { UpdateFornecedorDto } from "./dto/update-fornecedor-dto";
import { FornecedorService } from "./fornecedor.service";

@Controller('fornecedores')
export class FornecedorController {
    constructor(private readonly fornecedorService: FornecedorService) {}

    @Public()
    @Get('consultar')
    @Render('shared/list')
    async consultar(@Query('busca') busca?: string) {
        const termo = busca?.trim().toLowerCase();
        const fornecedores = (await this.fornecedorService.findAll()).filter((fornecedor) =>
            !termo || fornecedor.nomeFantasia.toLowerCase().includes(termo) || fornecedor.cnpj.includes(termo) || fornecedor.email.toLowerCase().includes(termo)
        );
        return {
            active: 'fornecedores',
            titulo: 'Consultar Fornecedor',
            consultaUrl: '/fornecedores/consultar',
            buscaPlaceholder: 'Buscar por nome fantasia, CNPJ ou e-mail',
            busca: busca ?? '',
            createUrl: '/fornecedores/cadastrar',
            createLabel: 'Cadastrar Fornecedor',
            financeiroLinks: [],
            columns: [
                { key: 'nomeFantasia', label: 'Nome Fantasia' },
                { key: 'cnpj', label: 'CNPJ' },
                { key: 'email', label: 'E-mail' },
            ],
            items: fornecedores.map((fornecedor) => ({
                nomeFantasia: fornecedor.nomeFantasia,
                cnpj: fornecedor.cnpj,
                email: fornecedor.email,
                editUrl: `/fornecedores/${fornecedor.id}/editar`,
                viewUrl: `/fornecedores/${fornecedor.id}/visualizar`,
                deleteUrl: `/fornecedores/${fornecedor.id}/remover`,
                deleteName: fornecedor.nomeFantasia,
            })),
        };
    }

    @Public()
    @Get('cadastrar')
    @Render('shared/form')
    cadastrar() {
        return this.formView('Cadastrar Fornecedor', '/fornecedores/cadastrar', '/fornecedores/consultar', {}, null);
    }

    @Public()
    @Post('cadastrar')
    async createFromView(@Body() dados: Record<string, string>, @Res() res: any) {
        try {
            await this.fornecedorService.create(dados as unknown as CreateFornecedorDto);
            return res.redirect('/fornecedores/consultar');
        } catch (error) {
            return res.render('shared/form', this.formView('Cadastrar Fornecedor', '/fornecedores/cadastrar', '/fornecedores/consultar', dados, this.getErrorMessage(error)));
        }
    }

    @Public()
    @Get(':id/visualizar')
    @Render('shared/detail')
    async visualizar(@Param('id') id: string) {
        const fornecedor = await this.fornecedorService.findOne(Number(id));
        if (!fornecedor) throw new NotFoundException('Fornecedor nao encontrado.');
        return {
            active: 'fornecedores',
            titulo: 'Visualizar Fornecedor',
            voltarUrl: '/fornecedores/consultar',
            editUrl: `/fornecedores/${fornecedor.id}/editar`,
            rows: [
                { label: 'Nome Fantasia', value: fornecedor.nomeFantasia },
                { label: 'Razao Social', value: fornecedor.razaoSocial },
                { label: 'CNPJ', value: fornecedor.cnpj },
                { label: 'E-mail', value: fornecedor.email },
                { label: 'Endereco', value: fornecedor.endereco },
            ],
        };
    }

    @Public()
    @Get(':id/editar')
    @Render('shared/form')
    async editar(@Param('id') id: string) {
        const fornecedor = await this.fornecedorService.findOne(Number(id));
        if (!fornecedor) throw new NotFoundException('Fornecedor nao encontrado.');
        return this.formView('Editar Fornecedor', `/fornecedores/${fornecedor.id}/editar`, '/fornecedores/consultar', fornecedor, null, true);
    }

    @Public()
    @Post(':id/editar')
    async updateFromView(@Param('id') id: string, @Body() dados: Record<string, string>, @Res() res: any) {
        try {
            const { cnpj, ...editableData } = dados;
            await this.fornecedorService.update(Number(id), editableData as UpdateFornecedorDto);
            return res.redirect('/fornecedores/consultar');
        } catch (error) {
            const fornecedor = await this.fornecedorService.findOne(Number(id));
            return res.render('shared/form', this.formView('Editar Fornecedor', `/fornecedores/${id}/editar`, '/fornecedores/consultar', {
                ...dados,
                cnpj: fornecedor?.cnpj,
            }, this.getErrorMessage(error), true));
        }
    }

    @Public()
    @Post(':id/remover')
    async removeFromView(@Param('id') id: string, @Res() res: any) {
        await this.fornecedorService.remove(Number(id));
        return res.redirect('/fornecedores/consultar');
    }

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

    private formView(titulo: string, acao: string, voltarUrl: string, values: any, erro: string | null, editing = false) {
        return {
            active: 'fornecedores',
            titulo,
            acao,
            voltarUrl,
            values,
            erro,
            fields: [
                { name: 'nomeFantasia', label: 'Nome Fantasia', required: true, minlength: 3, maxlength: 200 },
                { name: 'razaoSocial', label: 'Razao Social', required: true, minlength: 3, maxlength: 200 },
                { name: 'cnpj', label: 'CNPJ', required: true, disabled: editing },
                { name: 'email', label: 'E-mail', type: 'email', required: true },
                { name: 'endereco', label: 'Endereco', required: true, minlength: 15, maxlength: 300, full: true },
            ],
        };
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : 'Nao foi possivel salvar o registro.';
    }
}
