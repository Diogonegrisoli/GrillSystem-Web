import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Render, Res } from "@nestjs/common";
import { validateSync } from "class-validator";
import { Public } from "../auth/public.decorator";
import { ClienteService } from "./cliente.service";
import { CreateClienteDto } from "./dto/create-cliente-dto";
import { UpdateClienteDto } from "./dto/update-cliente-dto";

@Controller('clientes')
export class ClienteController{
    constructor(private readonly clienteService: ClienteService) {}

    @Public()
    @Get('consultar')
    @Render('shared/list')
    async consultar(@Query('busca') busca?: string) {
        const clientes = await this.clienteService.findAll();
        const termo = busca?.trim().toLowerCase();
        const clientesFiltrados = termo
            ? clientes.filter((cliente) =>
                cliente.nome.toLowerCase().includes(termo) ||
                cliente.cpfCnpj.includes(termo) ||
                cliente.telefone.includes(termo)
            )
            : clientes;

        return {
            active: 'clientes',
            titulo: 'Consultar Clientes',
            consultaUrl: '/clientes/consultar',
            buscaPlaceholder: 'Buscar por nome, CPF/CNPJ ou telefone',
            busca: busca ?? '',
            createUrl: '/clientes/cadastrar',
            createLabel: 'Cadastrar Cliente',
            financeiroLinks: [],
            columns: [
                { key: 'nome', label: 'Nome' },
                { key: 'cpfCnpj', label: 'CPF/CNPJ' },
                { key: 'tipo', label: 'Tipo' },
                { key: 'telefone', label: 'Telefone' },
            ],
            items: clientesFiltrados.map((cliente) => ({
                nome: cliente.nome,
                cpfCnpj: cliente.cpfCnpj,
                tipo: cliente.tipo,
                telefone: cliente.telefone,
                editUrl: `/clientes/${cliente.id}/editar`,
                viewUrl: `/clientes/${cliente.id}/visualizar`,
                deleteUrl: `/clientes/${cliente.id}/remover`,
                deleteName: cliente.nome,
            })),
        };
    }

    @Public()
    @Get('cadastrar')
    @Render('shared/form')
    cadastrar() {
        return this.formView('Cadastrar Cliente', '/clientes/cadastrar', {}, null, false);
    }

    @Public()
    @Post('cadastrar')
    async createFromView(@Body() dados: Record<string, string>, @Res() res: any) {
        try {
            this.validateDto(CreateClienteDto, dados);
            await this.clienteService.create(dados as unknown as CreateClienteDto);
            return res.redirect('/clientes/consultar');
        } catch (error) {
            return res.render('shared/form', this.formView('Cadastrar Cliente', '/clientes/cadastrar', dados, this.getErrorMessage(error), false));
        }
    }

    @Public()
    @Get(':id/visualizar')
    @Render('shared/detail')
    async visualizar(@Param('id') id: string) {
        const cliente = await this.clienteService.findOne(Number(id));

        if (!cliente) {
            throw new NotFoundException('Cliente nao encontrado.');
        }

        return {
            active: 'clientes',
            titulo: 'Visualizar Cliente',
            voltarUrl: '/clientes/consultar',
            editUrl: `/clientes/${cliente.id}/editar`,
            rows: [
                { label: 'Nome', value: cliente.nome },
                { label: 'CPF/CNPJ', value: cliente.cpfCnpj },
                { label: 'Tipo', value: cliente.tipo },
                { label: 'Telefone', value: cliente.telefone },
                { label: 'Endereco', value: cliente.endereco },
            ],
        };
    }

    @Public()
    @Get(':id/editar')
    @Render('shared/form')
    async editar(@Param('id') id: string) {
        const cliente = await this.clienteService.findOne(Number(id));

        if (!cliente) {
            throw new NotFoundException('Cliente nao encontrado.');
        }

        return this.formView('Editar Cliente', `/clientes/${cliente.id}/editar`, cliente, null, true);
    }

    @Public()
    @Post(':id/editar')
    async updateFromView(@Param('id') id: string, @Body() dados: Record<string, string>, @Res() res: any) {
        const cliente = await this.clienteService.findOne(Number(id));

        if (!cliente) {
            throw new NotFoundException('Cliente nao encontrado.');
        }

        try {
            const updateData = {
                ...dados,
                tipo: cliente.tipo,
                cpfCnpj: cliente.cpfCnpj,
            };
            this.validateDto(UpdateClienteDto, updateData);
            await this.clienteService.update(Number(id), updateData as unknown as UpdateClienteDto);
            return res.redirect('/clientes/consultar');
        } catch (error) {
            return res.render('shared/form', this.formView(
                'Editar Cliente',
                `/clientes/${cliente.id}/editar`,
                {
                    ...cliente,
                    ...dados,
                    tipo: cliente.tipo,
                    cpfCnpj: cliente.cpfCnpj,
                },
                this.getErrorMessage(error),
                true,
            ));
        }
    }

    @Public()
    @Post(':id/remover')
    async removeFromView(@Param('id') id: string, @Res() res: any) {
        await this.clienteService.remove(Number(id));
        return res.redirect('/clientes/consultar');
    }

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

    private getErrorMessage(error: unknown): string {
        if (error && typeof error === 'object' && 'response' in error) {
            const response = (error as { response?: { message?: string | string[] } }).response;
            const message = response?.message;

            if (Array.isArray(message)) {
                return message.join(' ');
            }

            if (message) {
                return message;
            }
        }

        if (error instanceof Error) {
            return error.message;
        }

        return 'Nao foi possivel salvar o cadastro. Confira os campos e tente novamente.';
    }

    private formView(titulo: string, acao: string, values: any, erro: string | null, editing: boolean) {
        return {
            active: 'clientes',
            titulo,
            acao,
            voltarUrl: '/clientes/consultar',
            values,
            erro,
            fields: [
                { name: 'nome', label: 'Nome', required: true, minlength: 3, maxlength: 200 },
                {
                    name: 'tipo',
                    label: 'Tipo',
                    type: 'select',
                    required: true,
                    disabled: editing,
                    options: [
                        { value: 'fisica', label: 'Fisica' },
                        { value: 'juridica', label: 'Juridica' },
                    ],
                },
                { name: 'cpfCnpj', label: 'CPF/CNPJ', required: true, disabled: editing },
                { name: 'telefone', label: 'Telefone', required: true, maxlength: 15 },
                { name: 'endereco', label: 'Endereco', required: true, minlength: 15, maxlength: 300, full: true },
            ],
        };
    }

    private validateDto<T extends object>(dto: new () => T, dados: Record<string, string>): void {
        const object = Object.assign(new dto(), dados);
        const errors = validateSync(object);

        if (errors.length > 0) {
            const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}));
            throw new BadRequestException(messages);
        }
    }
}
