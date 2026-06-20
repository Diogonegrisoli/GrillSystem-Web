import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Render, Res } from "@nestjs/common";
import { Public } from "../auth/public.decorator";
import { Cliente } from "../cliente/cliente.entity";
import { Funcionario } from "../funcionario/funcionario.entity";
import { Produto } from "../produto/produto.entity";
import { Usuario } from "../usuario/usuario.entity";
import { CreatePedidoVendaDto } from "./dto/create-pedido-venda-dto";
import { UpdatePedidoVendaDto } from "./dto/update-pedido-venda-dto";
import { PedidoVenda, StatusPedido } from "./pedido-venda.entity";
import { PedidoVendaService } from "./pedido-venda.service";

@Controller('pedidos-venda')
export class PedidoVendaController {
    constructor(private readonly pedidoVendaService: PedidoVendaService) {}

    @Public()
    @Get('consultar')
    @Render('shared/list')
    async consultar(@Query('busca') busca?: string) {
        const termo = busca?.trim().toLowerCase();
        const vendas = (await this.pedidoVendaService.findAll()).filter((venda) =>
            !termo || String(venda.id).includes(termo) || venda.cliente?.nome?.toLowerCase().includes(termo) || venda.cliente?.cpfCnpj?.includes(termo)
        );
        return {
            active: 'vendas',
            titulo: 'Consultar Vendas',
            consultaUrl: '/pedidos-venda/consultar',
            buscaPlaceholder: 'Buscar por id, cliente ou CPF',
            busca: busca ?? '',
            createUrl: '/pedidos-venda/cadastrar',
            createLabel: 'Cadastrar Venda',
            financeiroLinks: [],
            columns: [
                { key: 'id', label: 'Id' }, { key: 'cliente', label: 'Cliente' }, { key: 'cpf', label: 'CPF' },
                { key: 'dataPedido', label: 'Data do Pedido' }, { key: 'valor', label: 'Valor' },
            ],
            items: vendas.map((venda) => ({
                id: venda.id,
                cliente: venda.cliente?.nome ?? venda.clienteId,
                cpf: venda.cliente?.cpfCnpj ?? '',
                dataPedido: this.formatDate(venda.dataPedido),
                valor: this.formatMoney(venda.valorTotal),
                editUrl: `/pedidos-venda/${venda.id}/editar`,
                viewUrl: `/pedidos-venda/${venda.id}/visualizar`,
                deleteUrl: `/pedidos-venda/${venda.id}/remover`,
                deleteName: `venda #${venda.id}`,
            })),
        };
    }

    @Public()
    @Get('cadastrar')
    @Render('shared/form')
    async cadastrar() {
        const funcionario = await this.getCurrentEmployee();
        return this.formView('Cadastrar Venda', '/pedidos-venda/cadastrar', {
            funcionarioId: funcionario?.id,
            vendedor: funcionario?.nome ?? 'Nenhum usuario associado',
            quantidade: 1,
        }, null, false);
    }

    @Public()
    @Post('cadastrar')
    async createFromView(@Body() dados: Record<string, string>, @Res() res: any) {
        try {
            await this.pedidoVendaService.create(this.prepareData(dados));
            return res.redirect('/pedidos-venda/consultar');
        } catch (error) {
            return res.render('shared/form', await this.formView('Cadastrar Venda', '/pedidos-venda/cadastrar', dados, this.getErrorMessage(error), false));
        }
    }

    @Public()
    @Get(':id/visualizar')
    @Render('shared/detail')
    async visualizar(@Param('id') id: string) {
        const venda = await this.getSale(Number(id));
        return {
            active: 'vendas',
            titulo: 'Visualizar Venda',
            voltarUrl: '/pedidos-venda/consultar',
            editUrl: `/pedidos-venda/${venda.id}/editar`,
            rows: [
                { label: 'Id', value: venda.id },
                { label: 'Cliente', value: venda.cliente?.nome ?? venda.clienteId },
                { label: 'Vendedor', value: venda.funcionario?.nome ?? '' },
                { label: 'Data do Pedido', value: this.formatDate(venda.dataPedido) },
                { label: 'Data de Entrega', value: this.formatDate(venda.dataEntrega) },
                { label: 'Status', value: venda.status },
                { label: 'Itens', value: this.describeSaleItems(venda) },
                { label: 'Valor Total', value: this.formatMoney(venda.valorTotal) },
            ],
        };
    }

    @Public()
    @Get(':id/editar')
    @Render('shared/form')
    async editar(@Param('id') id: string) {
        const venda = await this.getSale(Number(id));
        return this.formView('Editar Venda', `/pedidos-venda/${venda.id}/editar`, {
            ...venda,
            clienteId: venda.clienteId,
            funcionarioId: venda.funcionarioId,
            vendedor: venda.funcionario?.nome ?? '',
            dataEntrega: this.formatInputDate(venda.dataEntrega),
            quantidade: 1,
        }, null, true, venda);
    }

    @Public()
    @Post(':id/editar')
    async updateFromView(@Param('id') id: string, @Body() dados: Record<string, string>, @Res() res: any) {
        try {
            await this.pedidoVendaService.update(Number(id), this.prepareData(dados));
            return res.redirect('/pedidos-venda/consultar');
        } catch (error) {
            const venda = await this.pedidoVendaService.findOne(Number(id));
            return res.render('shared/form', await this.formView('Editar Venda', `/pedidos-venda/${id}/editar`, dados, this.getErrorMessage(error), true, venda ?? undefined));
        }
    }

    @Public()
    @Post(':id/remover')
    async removeFromView(@Param('id') id: string, @Res() res: any) {
        await this.pedidoVendaService.remove(Number(id));
        return res.redirect('/pedidos-venda/consultar');
    }

    @Get() findAll() { return this.pedidoVendaService.findAll(); }
    @Get(':id') findOne(@Param('id') id: string) { return this.pedidoVendaService.findOne(Number(id)); }
    @Post() create(@Body() dados: CreatePedidoVendaDto) { return this.pedidoVendaService.create(dados); }
    @Patch(':id') update(@Param('id') id: string, @Body() dados: UpdatePedidoVendaDto) { return this.pedidoVendaService.update(Number(id), dados); }
    @Delete(':id') remove(@Param('id') id: string) { return this.pedidoVendaService.remove(Number(id)); }

    private async formView(titulo: string, acao: string, values: any, erro: string | null, editing: boolean, venda?: PedidoVenda) {
        const [clientes, produtos] = await Promise.all([Cliente.find(), Produto.find()]);
        const funcionario = venda?.funcionario ?? await this.getCurrentEmployee();
        const initialItems = this.getInitialSaleItems(venda, produtos, values.itensJson);
        return {
            active: 'vendas', titulo, acao, voltarUrl: '/pedidos-venda/consultar', values: {
                ...values,
                funcionarioId: values.funcionarioId ?? funcionario?.id,
                vendedor: values.vendedor ?? funcionario?.nome ?? 'Nenhum usuario associado',
            }, erro,
            fields: [
                { name: 'clienteId', label: 'Cliente', type: 'select', required: true, placeholder: 'Selecione um cliente', options: clientes.map((cliente) => ({ value: cliente.id, label: `${cliente.nome} - ${cliente.cpfCnpj}` })) },
                { name: 'produtoId', label: 'Produto', type: 'select', required: true, placeholder: 'Selecione um produto', options: produtos.map((produto) => ({ value: produto.id, label: `${produto.codigo} - ${produto.descricao}`, price: Number(produto.preco).toFixed(2) })) },
                { name: 'quantidade', label: 'Quantidade', type: 'number', required: true, min: 1, step: '1' },
                { name: 'vendedor', label: 'Vendedor', disabled: true },
                { name: 'funcionarioId', label: 'Funcionario', type: 'hidden', hidden: true },
                { name: 'valorUnitario', label: 'Valor unitario do produto', type: 'number', disabled: true, money: true, step: '0.01' },
                { name: 'dataEntrega', label: 'Data de Entrega', type: 'date', required: true },
                ...(editing ? [{ name: 'status', label: 'Status', type: 'select', required: true, options: Object.values(StatusPedido).map((status) => ({ value: status, label: status })) }] : []),
            ],
            itemBuilder: { kind: 'sale', columns: ['Id', 'Cliente', 'Produto', 'Quantidade', 'Valor total'], productField: 'produtoId', quantityField: 'quantidade', valueField: 'valorUnitario', ownerField: 'clienteId', useProductPrice: true, initialItems },
        };
    }

    private prepareData(dados: Record<string, string>): CreatePedidoVendaDto {
        const itens = this.parseItems(dados.itensJson);
        return {
            clienteId: Number(dados.clienteId),
            funcionarioId: dados.funcionarioId ? Number(dados.funcionarioId) : undefined,
            produtoIds: itens.map((item) => Number(item.produtoId)),
            itens,
            dataEntrega: dados.dataEntrega || undefined,
            ...(dados.status ? { status: dados.status as StatusPedido } : {}),
        } as CreatePedidoVendaDto;
    }

    private parseItems(value?: string): NonNullable<CreatePedidoVendaDto['itens']> {
        try { return JSON.parse(value ?? '[]'); } catch { return []; }
    }

    private getInitialSaleItems(venda: PedidoVenda | undefined, produtos: Produto[], rawItems?: string) {
        const parsed = this.parseItems(rawItems);
        const source = parsed?.length ? parsed : venda?.itens ?? [];
        const ownerLabel = venda?.cliente ? `${venda.cliente.nome} - ${venda.cliente.cpfCnpj}` : '';
        return source.map((item) => {
            const produto = produtos.find((current) => current.id === Number(item.produtoId));
            return { ...item, productLabel: produto ? `${produto.codigo} - ${produto.descricao}` : `Produto #${item.produtoId}`, ownerLabel };
        });
    }

    private async getCurrentEmployee(): Promise<Funcionario | undefined> {
        const [usuario] = await Usuario.find({ relations: { funcionario: true }, order: { id: 'ASC' }, take: 1 });
        if (usuario?.funcionario) return usuario.funcionario;
        const [funcionario] = await Funcionario.find({ order: { id: 'ASC' }, take: 1 });
        return funcionario;
    }

    private async getSale(id: number): Promise<PedidoVenda> {
        const venda = await this.pedidoVendaService.findOne(id);
        if (!venda) throw new NotFoundException('Venda nao encontrada.');
        return venda;
    }

    private describeSaleItems(venda: PedidoVenda): string {
        return (venda.itens ?? []).map((item) => {
            const produto = venda.produtos?.find((current) => current.id === item.produtoId);
            return `${produto?.descricao ?? `Produto #${item.produtoId}`} (${item.quantidade})`;
        }).join(', ') || venda.produtos?.map((produto) => produto.descricao).join(', ') || '';
    }

    private formatDate(date?: Date | null): string { return date ? new Date(date).toLocaleDateString('pt-BR') : ''; }
    private formatInputDate(date?: Date | null): string { return date ? new Date(date).toISOString().slice(0, 10) : ''; }
    private formatMoney(value: number): string { return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
    private getErrorMessage(error: unknown): string { return error instanceof Error ? error.message : 'Nao foi possivel salvar o registro.'; }
}
