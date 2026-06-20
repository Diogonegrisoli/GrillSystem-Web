import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Render, Res } from "@nestjs/common";
import { TipoPagamento } from "../conta-pagar/conta-pagar.entity";
import { Public } from "../auth/public.decorator";
import { Fornecedor } from "../fornecedor/fornecedor.entity";
import { Funcionario } from "../funcionario/funcionario.entity";
import { Produto } from "../produto/produto.entity";
import { Usuario } from "../usuario/usuario.entity";
import { CreatePedidoCompraDto } from "./dto/create-pedido-compra-dto";
import { UpdatePedidoCompraDto } from "./dto/update-pedido-compra-dto";
import { PedidoCompra, StatusCompra } from "./pedido-compra.entity";
import { PedidoCompraService } from "./pedido-compra.service";

@Controller('pedidos-compra')
export class PedidoCompraController {
    constructor(private readonly pedidoCompraService: PedidoCompraService) {}

    @Public()
    @Get('consultar')
    @Render('shared/list')
    async consultar(@Query('busca') busca?: string) {
        const termo = busca?.trim().toLowerCase();
        const compras = (await this.pedidoCompraService.findAll()).filter((compra) =>
            !termo || String(compra.id).includes(termo) || compra.fornecedor?.nomeFantasia?.toLowerCase().includes(termo) || compra.fornecedor?.cnpj?.includes(termo) || compra.status.toLowerCase().includes(termo)
        );
        return {
            active: 'compras', titulo: 'Consultar Compras', consultaUrl: '/pedidos-compra/consultar',
            buscaPlaceholder: 'Buscar por id, fornecedor, CNPJ ou status', busca: busca ?? '',
            createUrl: '/pedidos-compra/cadastrar', createLabel: 'Cadastrar Compra', financeiroLinks: [],
            columns: [
                { key: 'id', label: 'Id' }, { key: 'nome', label: 'Nome' }, { key: 'cnpj', label: 'CNPJ' },
                { key: 'valor', label: 'Valor' }, { key: 'status', label: 'Status' },
            ],
            items: compras.map((compra) => ({
                id: compra.id,
                nome: compra.fornecedor?.nomeFantasia ?? compra.fornecedorId,
                cnpj: compra.fornecedor?.cnpj ?? '',
                valor: this.formatMoney(compra.valorTotal),
                status: compra.status,
                editUrl: `/pedidos-compra/${compra.id}/editar`,
                viewUrl: `/pedidos-compra/${compra.id}/visualizar`,
                deleteUrl: `/pedidos-compra/${compra.id}/remover`,
                deleteName: `compra #${compra.id}`,
            })),
        };
    }

    @Public()
    @Get('cadastrar')
    @Render('shared/form')
    async cadastrar() {
        const funcionario = await this.getCurrentEmployee();
        return this.formView('Cadastrar Compra', '/pedidos-compra/cadastrar', { funcionarioId: funcionario?.id, quantidade: 1 }, null, false);
    }

    @Public()
    @Post('cadastrar')
    async createFromView(@Body() dados: Record<string, string>, @Res() res: any) {
        try {
            await this.pedidoCompraService.create(this.prepareData(dados));
            return res.redirect('/pedidos-compra/consultar');
        } catch (error) {
            return res.render('shared/form', await this.formView('Cadastrar Compra', '/pedidos-compra/cadastrar', dados, this.getErrorMessage(error), false));
        }
    }

    @Public()
    @Get(':id/visualizar')
    @Render('shared/detail')
    async visualizar(@Param('id') id: string) {
        const compra = await this.getPurchase(Number(id));
        return {
            active: 'compras', titulo: 'Visualizar Compra', voltarUrl: '/pedidos-compra/consultar', editUrl: `/pedidos-compra/${compra.id}/editar`,
            rows: [
                { label: 'Id', value: compra.id }, { label: 'Fornecedor', value: compra.fornecedor?.nomeFantasia ?? compra.fornecedorId },
                { label: 'CNPJ', value: compra.fornecedor?.cnpj ?? '' }, { label: 'Funcionario', value: compra.funcionario?.nome ?? compra.funcionarioId },
                { label: 'Data do Pedido', value: this.formatDate(compra.dataPedido) }, { label: 'Data de Entrega', value: this.formatDate(compra.dataEntrega) },
                { label: 'Status', value: compra.status }, { label: 'Itens', value: this.describeItems(compra) },
                { label: 'Valor Total', value: this.formatMoney(compra.valorTotal) },
            ],
        };
    }

    @Public()
    @Get(':id/editar')
    @Render('shared/form')
    async editar(@Param('id') id: string) {
        const compra = await this.getPurchase(Number(id));
        return this.formView('Editar Compra', `/pedidos-compra/${compra.id}/editar`, {
            ...compra,
            fornecedorId: compra.fornecedorId,
            funcionarioId: compra.funcionarioId,
            tipoPagamento: compra.contaPagar?.tipoPagamento,
            dataEntrega: this.formatInputDate(compra.dataEntrega),
            quantidade: 1,
        }, null, true, compra);
    }

    @Public()
    @Post(':id/editar')
    async updateFromView(@Param('id') id: string, @Body() dados: Record<string, string>, @Res() res: any) {
        try {
            await this.pedidoCompraService.update(Number(id), this.prepareData(dados));
            return res.redirect('/pedidos-compra/consultar');
        } catch (error) {
            const compra = await this.pedidoCompraService.findOne(Number(id));
            return res.render('shared/form', await this.formView('Editar Compra', `/pedidos-compra/${id}/editar`, dados, this.getErrorMessage(error), true, compra ?? undefined));
        }
    }

    @Public()
    @Post(':id/remover')
    async removeFromView(@Param('id') id: string, @Res() res: any) {
        await this.pedidoCompraService.remove(Number(id));
        return res.redirect('/pedidos-compra/consultar');
    }

    @Get() findAll() { return this.pedidoCompraService.findAll(); }
    @Get(':id') findOne(@Param('id') id: string) { return this.pedidoCompraService.findOne(Number(id)); }
    @Post() create(@Body() dados: CreatePedidoCompraDto) { return this.pedidoCompraService.create(dados); }
    @Patch(':id') update(@Param('id') id: string, @Body() dados: UpdatePedidoCompraDto) { return this.pedidoCompraService.update(Number(id), dados); }
    @Delete(':id') remove(@Param('id') id: string) { return this.pedidoCompraService.remove(Number(id)); }

    private async formView(titulo: string, acao: string, values: any, erro: string | null, editing: boolean, compra?: PedidoCompra) {
        const [fornecedores, produtos] = await Promise.all([Fornecedor.find(), Produto.find()]);
        const funcionario = compra?.funcionario ?? await this.getCurrentEmployee();
        const initialItems = this.getInitialItems(compra, produtos, values.itensJson);
        return {
            active: 'compras', titulo, acao, voltarUrl: '/pedidos-compra/consultar', values: { ...values, funcionarioId: values.funcionarioId ?? funcionario?.id }, erro,
            fields: [
                { name: 'fornecedorId', label: 'Fornecedor', type: 'select', required: true, placeholder: 'Selecione um fornecedor', options: fornecedores.map((fornecedor) => ({ value: fornecedor.id, label: `${fornecedor.nomeFantasia} - ${fornecedor.cnpj}` })) },
                { name: 'produtoId', label: 'Produto', type: 'select', required: true, placeholder: 'Selecione um produto', options: produtos.map((produto) => ({ value: produto.id, label: `${produto.codigo} - ${produto.descricao}`, price: Number(produto.preco).toFixed(2) })) },
                { name: 'tipoPagamento', label: 'Forma de pagamento', type: 'select', required: true, placeholder: 'Selecione a forma de pagamento', options: Object.values(TipoPagamento).map((tipo) => ({ value: tipo, label: tipo })) },
                { name: 'valorUnitario', label: 'Valor', type: 'number', required: true, min: 0.01, step: '0.01', money: true },
                { name: 'quantidade', label: 'Quantidade', type: 'number', required: true, min: 1, step: '1' },
                { name: 'dataEntrega', label: 'Data de Entrega', type: 'date', required: true },
                { name: 'funcionarioId', label: 'Funcionario', type: 'hidden', hidden: true },
                ...(editing ? [{ name: 'status', label: 'Status', type: 'select', required: true, options: Object.values(StatusCompra).map((status) => ({ value: status, label: status })) }] : []),
            ],
            itemBuilder: { kind: 'purchase', columns: ['Id', 'Produto', 'Quantidade', 'Valor'], productField: 'produtoId', quantityField: 'quantidade', valueField: 'valorUnitario', ownerField: 'fornecedorId', useProductPrice: true, initialItems },
        };
    }

    private prepareData(dados: Record<string, string>): CreatePedidoCompraDto {
        const itens = this.parseItems(dados.itensJson);
        return {
            fornecedorId: Number(dados.fornecedorId),
            funcionarioId: Number(dados.funcionarioId),
            produtoIds: itens.map((item) => Number(item.produtoId)),
            itens,
            tipoPagamento: dados.tipoPagamento as TipoPagamento,
            dataEntrega: dados.dataEntrega || undefined,
            ...(dados.status ? { status: dados.status as StatusCompra } : {}),
        } as CreatePedidoCompraDto;
    }

    private parseItems(value?: string): NonNullable<CreatePedidoCompraDto['itens']> {
        try { return JSON.parse(value ?? '[]'); } catch { return []; }
    }

    private getInitialItems(compra: PedidoCompra | undefined, produtos: Produto[], rawItems?: string) {
        const parsed = this.parseItems(rawItems);
        const source = parsed?.length ? parsed : compra?.itens ?? [];
        const ownerLabel = compra?.fornecedor ? `${compra.fornecedor.nomeFantasia} - ${compra.fornecedor.cnpj}` : '';
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

    private async getPurchase(id: number): Promise<PedidoCompra> {
        const compra = await this.pedidoCompraService.findOne(id);
        if (!compra) throw new NotFoundException('Compra nao encontrada.');
        return compra;
    }

    private describeItems(compra: PedidoCompra): string {
        return (compra.itens ?? []).map((item) => {
            const produto = compra.produtos?.find((current) => current.id === item.produtoId);
            return `${produto?.descricao ?? `Produto #${item.produtoId}`} (${item.quantidade})`;
        }).join(', ') || compra.produtos?.map((produto) => produto.descricao).join(', ') || '';
    }

    private formatDate(date?: Date | null): string { return date ? new Date(date).toLocaleDateString('pt-BR') : ''; }
    private formatInputDate(date?: Date | null): string { return date ? new Date(date).toISOString().slice(0, 10) : ''; }
    private formatMoney(value: number): string { return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
    private getErrorMessage(error: unknown): string { return error instanceof Error ? error.message : 'Nao foi possivel salvar o registro.'; }
}
