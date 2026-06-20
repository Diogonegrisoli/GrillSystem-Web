import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Render, Res } from "@nestjs/common";
import { PedidoCompra } from "../pedido-compra/pedido-compra.entity";
import { Public } from "../auth/public.decorator";
import { TipoPagamento } from "./conta-pagar.entity";
import { ContaPagarService } from "./conta-pagar.service";
import { CreateContaPagarDto } from "./dto/create-conta-pagar-dto";
import { UpdateContaPagarDto } from "./dto/update-conta-pagar-dto";

@Controller('contas-pagar')
export class ContaPagarController {
    constructor(private readonly contaPagarService: ContaPagarService) {}

    @Public()
    @Get('consultar')
    @Render('shared/list')
    async consultar(@Query('busca') busca?: string) {
        const termo = busca?.trim().toLowerCase();
        const contas = (await this.contaPagarService.findAll()).filter((conta) =>
            !termo ||
            String(conta.id).includes(termo) ||
            conta.pedidoCompra?.fornecedor?.nomeFantasia?.toLowerCase().includes(termo) ||
            conta.tipoPagamento.toLowerCase().includes(termo) ||
            conta.status.toLowerCase().includes(termo)
        );
        return {
            active: 'financeiro',
            titulo: 'Controle de Contas a Pagar',
            consultaUrl: '/contas-pagar/consultar',
            buscaPlaceholder: 'Buscar por id, fornecedor, tipo ou status',
            busca: busca ?? '',
            createUrl: '/contas-pagar/cadastrar',
            createLabel: 'Lancar Conta a Pagar',
            financeiroLinks: [
                { href: '/contas-pagar/consultar', label: 'Contas a Pagar' },
                { href: '/contas-receber/consultar', label: 'Contas a Receber' },
            ],
            columns: [
                { key: 'id', label: 'Id' },
                { key: 'fornecedor', label: 'Fornecedor' },
                { key: 'tipoPagamento', label: 'Tipo de pagamento' },
                { key: 'emissao', label: 'Emissao' },
                { key: 'vencimento', label: 'Vencimento' },
                { key: 'valor', label: 'Valor' },
                { key: 'status', label: 'Status' },
            ],
            items: contas.map((conta) => ({
                id: conta.id,
                fornecedor: conta.pedidoCompra?.fornecedor?.nomeFantasia ?? 'Lancamento manual',
                tipoPagamento: conta.tipoPagamento,
                emissao: this.formatDate(conta.dataEmissao),
                vencimento: this.formatDate(conta.dataVencimento),
                valor: Number(conta.valor).toFixed(2),
                status: conta.status,
                viewUrl: `/contas-pagar/${conta.id}/visualizar`,
                deleteUrl: `/contas-pagar/${conta.id}/remover`,
                deleteName: `conta a pagar #${conta.id}`,
            })),
        };
    }

    @Public()
    @Get('cadastrar')
    @Render('shared/form')
    async cadastrar() {
        return this.formView('Lancar Conta a Pagar', '/contas-pagar/cadastrar', '/contas-pagar/consultar', {}, null);
    }

    @Public()
    @Post('cadastrar')
    async createFromView(@Body() dados: Record<string, string>, @Res() res: any) {
        try {
            await this.contaPagarService.create({
                valor: Number(dados.valor),
                tipoPagamento: dados.tipoPagamento as TipoPagamento,
                dataVencimento: dados.dataVencimento,
                dataPagamento: dados.dataPagamento || undefined,
                pedidoCompraId: dados.pedidoCompraId ? Number(dados.pedidoCompraId) : undefined,
            });
            return res.redirect('/contas-pagar/consultar');
        } catch (error) {
            return res.render('shared/form', await this.formView('Lancar Conta a Pagar', '/contas-pagar/cadastrar', '/contas-pagar/consultar', dados, this.getErrorMessage(error)));
        }
    }

    @Public()
    @Get(':id/visualizar')
    @Render('shared/detail')
    async visualizar(@Param('id') id: string) {
        const conta = await this.contaPagarService.findOne(Number(id));
        if (!conta) throw new NotFoundException('Conta a pagar nao encontrada.');
        return {
            active: 'financeiro',
            titulo: 'Visualizar Conta a Pagar',
            voltarUrl: '/contas-pagar/consultar',
            editUrl: null,
            rows: [
                { label: 'Id', value: conta.id },
                { label: 'Fornecedor', value: conta.pedidoCompra?.fornecedor?.nomeFantasia ?? 'Lancamento manual' },
                { label: 'Tipo de pagamento', value: conta.tipoPagamento },
                { label: 'Emissao', value: this.formatDate(conta.dataEmissao) },
                { label: 'Vencimento', value: this.formatDate(conta.dataVencimento) },
                { label: 'Pagamento', value: this.formatDate(conta.dataPagamento) },
                { label: 'Valor', value: Number(conta.valor).toFixed(2) },
                { label: 'Status', value: conta.status },
            ],
        };
    }

    @Public()
    @Post(':id/remover')
    async removeFromView(@Param('id') id: string, @Res() res: any) {
        await this.contaPagarService.remove(Number(id));
        return res.redirect('/contas-pagar/consultar');
    }

    @Get()
    findAll() {
        return this.contaPagarService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.contaPagarService.findOne(Number(id));
    }

    @Post()
    create(@Body() dados: CreateContaPagarDto) {
        return this.contaPagarService.create(dados);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dados: UpdateContaPagarDto) {
        return this.contaPagarService.update(Number(id), dados);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.contaPagarService.remove(Number(id));
    }

    private async formView(titulo: string, acao: string, voltarUrl: string, values: any, erro: string | null) {
        const pedidosCompra = await PedidoCompra.find({ relations: { fornecedor: true } });
        return {
            active: 'financeiro',
            titulo,
            acao,
            voltarUrl,
            values,
            erro,
            fields: [
                {
                    name: 'pedidoCompraId',
                    label: 'Pedido de Compra',
                    type: 'select',
                    required: false,
                    placeholder: 'Lancamento manual sem pedido',
                    options: pedidosCompra.map((pedido) => ({ value: pedido.id, label: `#${pedido.id} - ${pedido.fornecedor?.nomeFantasia ?? pedido.fornecedorId}` })),
                },
                { name: 'tipoPagamento', label: 'Tipo de pagamento', type: 'select', required: true, options: [
                    { value: TipoPagamento.PIX, label: 'Pix' },
                    { value: TipoPagamento.DINHEIRO, label: 'Dinheiro' },
                    { value: TipoPagamento.CREDITO, label: 'Credito' },
                    { value: TipoPagamento.DEBITO, label: 'Debito' },
                ] },
                { name: 'valor', label: 'Valor', type: 'number', required: true, min: 0.01, step: '0.01', money: true },
                { name: 'dataVencimento', label: 'Data de Vencimento', type: 'date', required: true },
                { name: 'dataPagamento', label: 'Data de Pagamento', type: 'date' },
            ],
        };
    }

    private formatDate(date?: Date | null): string {
        return date ? new Date(date).toLocaleDateString('pt-BR') : '';
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : 'Nao foi possivel salvar o registro.';
    }
}
