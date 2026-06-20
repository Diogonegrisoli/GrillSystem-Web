import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Render, Res } from "@nestjs/common";
import { Public } from "../auth/public.decorator";
import { CreateProdutoDto } from "./dto/create-produto-dto";
import { UpdateProdutoDto } from "./dto/update-produto-dto";
import { ProdutoService } from "./produto.service";

@Controller('produtos')
export class ProdutoController {
    constructor(private readonly produtoService: ProdutoService) {}

    @Public()
    @Get('consultar')
    @Render('shared/list')
    async consultar(@Query('busca') busca?: string) {
        const termo = busca?.trim().toLowerCase();
        const produtos = (await this.produtoService.findAll()).filter((produto) =>
            !termo || produto.codigo.toLowerCase().includes(termo) || produto.descricao.toLowerCase().includes(termo)
        );

        return {
            active: 'produtos',
            titulo: 'Consultar Produto',
            consultaUrl: '/produtos/consultar',
            buscaPlaceholder: 'Buscar por codigo ou descricao',
            busca: busca ?? '',
            createUrl: '/produtos/cadastrar',
            createLabel: 'Cadastrar Produto',
            financeiroLinks: [],
            columns: [
                { key: 'codigo', label: 'Codigo' },
                { key: 'descricao', label: 'Descricao' },
                { key: 'preco', label: 'Preco' },
                { key: 'situacao', label: 'Situacao' },
            ],
            items: produtos.map((produto) => ({
                id: produto.id,
                codigo: produto.codigo,
                descricao: produto.descricao,
                preco: Number(produto.preco).toFixed(2),
                situacao: produto.quantidade > 0 ? 'Disponivel' : 'Sem estoque',
                editUrl: `/produtos/${produto.id}/editar`,
                viewUrl: `/produtos/${produto.id}/visualizar`,
                deleteUrl: `/produtos/${produto.id}/remover`,
                deleteName: produto.descricao,
            })),
        };
    }

    @Public()
    @Get('cadastrar')
    @Render('shared/form')
    cadastrar() {
        return this.formView('Cadastrar Produto', '/produtos/cadastrar', '/produtos/consultar', {}, null);
    }

    @Public()
    @Post('cadastrar')
    async createFromView(@Body() dados: Record<string, string>, @Res() res: any) {
        try {
            await this.produtoService.create({
                descricao: dados.descricao,
                preco: Number(dados.preco),
                quantidade: Number(dados.quantidade),
            });
            return res.redirect('/produtos/consultar');
        } catch (error) {
            return res.render('shared/form', this.formView('Cadastrar Produto', '/produtos/cadastrar', '/produtos/consultar', dados, this.getErrorMessage(error)));
        }
    }

    @Public()
    @Get(':id/visualizar')
    @Render('shared/detail')
    async visualizar(@Param('id') id: string) {
        const produto = await this.produtoService.findOne(Number(id));
        if (!produto) throw new NotFoundException('Produto nao encontrado.');
        return {
            active: 'produtos',
            titulo: 'Visualizar Produto',
            voltarUrl: '/produtos/consultar',
            editUrl: `/produtos/${produto.id}/editar`,
            rows: [
                { label: 'Codigo', value: produto.codigo },
                { label: 'Descricao', value: produto.descricao },
                { label: 'Preco', value: Number(produto.preco).toFixed(2) },
                { label: 'Quantidade', value: produto.quantidade },
                { label: 'Situacao', value: produto.quantidade > 0 ? 'Disponivel' : 'Sem estoque' },
            ],
        };
    }

    @Public()
    @Get(':id/editar')
    @Render('shared/form')
    async editar(@Param('id') id: string) {
        const produto = await this.produtoService.findOne(Number(id));
        if (!produto) throw new NotFoundException('Produto nao encontrado.');
        return this.formView('Editar Produto', `/produtos/${produto.id}/editar`, '/produtos/consultar', {
            ...produto,
            preco: Number(produto.preco).toFixed(2),
        }, null, true);
    }

    @Public()
    @Post(':id/editar')
    async updateFromView(@Param('id') id: string, @Body() dados: Record<string, string>, @Res() res: any) {
        try {
            const { codigo, ...editableData } = dados;
            await this.produtoService.update(Number(id), {
                ...editableData,
                preco: editableData.preco ? Number(editableData.preco) : undefined,
                quantidade: editableData.quantidade ? Number(editableData.quantidade) : undefined,
            } as UpdateProdutoDto);
            return res.redirect('/produtos/consultar');
        } catch (error) {
            const produto = await this.produtoService.findOne(Number(id));
            return res.render('shared/form', this.formView('Editar Produto', `/produtos/${id}/editar`, '/produtos/consultar', {
                ...dados,
                codigo: produto?.codigo,
            }, this.getErrorMessage(error), true));
        }
    }

    @Public()
    @Post(':id/remover')
    async removeFromView(@Param('id') id: string, @Res() res: any) {
        await this.produtoService.remove(Number(id));
        return res.redirect('/produtos/consultar');
    }

    @Get()
    findAll() {
        return this.produtoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.produtoService.findOne(Number(id));
    }

    @Post()
    create(@Body() dados: CreateProdutoDto) {
        return this.produtoService.create(dados);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dados: UpdateProdutoDto) {
        return this.produtoService.update(Number(id), dados);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.produtoService.remove(Number(id));
    }

    private formView(titulo: string, acao: string, voltarUrl: string, values: any, erro: string | null, editing = false) {
        return {
            active: 'produtos',
            titulo,
            acao,
            voltarUrl,
            values,
            erro,
            fields: [
                ...(editing ? [{ name: 'codigo', label: 'Codigo', disabled: true }] : []),
                { name: 'descricao', label: 'Descricao', required: true, minlength: 10, maxlength: 150, full: true },
                { name: 'preco', label: 'Preco', type: 'number', required: true, min: 0.01, step: '0.01', money: true },
                { name: 'quantidade', label: 'Quantidade', type: 'number', required: true, min: 0, step: '1' },
            ],
        };
    }

    private getErrorMessage(error: unknown): string {
        return error instanceof Error ? error.message : 'Nao foi possivel salvar o registro.';
    }
}
