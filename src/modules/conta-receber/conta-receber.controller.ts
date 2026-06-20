import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Render, Res } from "@nestjs/common";
import { Public } from "../auth/public.decorator";
import { StatusPagamento } from "./conta-receber.entity";
import { ContaReceberService } from "./conta-receber.service";
import { CreateContaReceberDto } from "./dto/create-conta-receber-dto";
import { UpdateContaReceberDto } from "./dto/update-conta-receber-dto";

@Controller('contas-receber')
export class ContaReceberController {
    constructor(private readonly contaReceberService: ContaReceberService) {}

    @Public()
    @Get('consultar')
    @Render('shared/list')
    async consultar(@Query('busca') busca?: string) {
        const termo = busca?.trim().toLowerCase();
        const contas = (await this.contaReceberService.findAll()).filter((conta) =>
            !termo ||
            String(conta.id).includes(termo) ||
            conta.pedidoVenda?.cliente?.nome?.toLowerCase().includes(termo) ||
            conta.statusPagamento.toLowerCase().includes(termo)
        );
        return {
            active: 'financeiro',
            titulo: 'Consultar Contas a Receber',
            consultaUrl: '/contas-receber/consultar',
            buscaPlaceholder: 'Buscar por id, cliente ou status',
            busca: busca ?? '',
            createUrl: null,
            createLabel: '',
            financeiroLinks: [
                { href: '/contas-pagar/consultar', label: 'Contas a Pagar' },
                { href: '/contas-receber/consultar', label: 'Contas a Receber' },
            ],
            columns: [
                { key: 'id', label: 'Id' },
                { key: 'cliente', label: 'Cliente' },
                { key: 'emissao', label: 'Data emissao' },
                { key: 'vencimento', label: 'Vencimento' },
                { key: 'valor', label: 'Valor' },
                { key: 'status', label: 'Status' },
            ],
            items: contas.map((conta) => ({
                id: conta.id,
                cliente: conta.pedidoVenda?.cliente?.nome ?? conta.pedidoVendaId,
                emissao: this.formatDate(conta.dataEmissao),
                vencimento: this.formatDate(conta.dataVencimento),
                valor: Number(conta.valor).toFixed(2),
                status: conta.statusPagamento,
                viewUrl: `/contas-receber/${conta.id}/visualizar`,
                receiveUrl: conta.statusPagamento !== StatusPagamento.PAGO ? `/contas-receber/${conta.id}/receber` : null,
                deleteUrl: null,
                deleteName: `conta a receber #${conta.id}`,
            })),
        };
    }

    @Public()
    @Get(':id/visualizar')
    @Render('shared/detail')
    async visualizar(@Param('id') id: string) {
        const conta = await this.contaReceberService.findOne(Number(id));
        if (!conta) throw new NotFoundException('Conta a receber nao encontrada.');
        return {
            active: 'financeiro',
            titulo: 'Visualizar Conta a Receber',
            voltarUrl: '/contas-receber/consultar',
            editUrl: null,
            rows: [
                { label: 'Id', value: conta.id },
                { label: 'Cliente', value: conta.pedidoVenda?.cliente?.nome ?? conta.pedidoVendaId },
                { label: 'Data emissao', value: this.formatDate(conta.dataEmissao) },
                { label: 'Vencimento', value: this.formatDate(conta.dataVencimento) },
                { label: 'Recebimento', value: this.formatDate(conta.dataRecebimento) },
                { label: 'Valor', value: Number(conta.valor).toFixed(2) },
                { label: 'Status', value: conta.statusPagamento },
            ],
        };
    }

    @Public()
    @Post(':id/receber')
    async receber(@Param('id') id: string, @Res() res: any) {
        await this.contaReceberService.update(Number(id), {
            dataRecebimento: new Date().toISOString(),
            statusPagamento: StatusPagamento.PAGO,
        });
        return res.redirect('/contas-receber/consultar');
    }

    @Get()
    findAll() {
        return this.contaReceberService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.contaReceberService.findOne(Number(id));
    }

    @Post()
    create(@Body() dados: CreateContaReceberDto) {
        return this.contaReceberService.create(dados);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dados: UpdateContaReceberDto) {
        return this.contaReceberService.update(Number(id), dados);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.contaReceberService.remove(Number(id));
    }

    private formatDate(date?: Date | null): string {
        return date ? new Date(date).toLocaleDateString('pt-BR') : '';
    }
}
