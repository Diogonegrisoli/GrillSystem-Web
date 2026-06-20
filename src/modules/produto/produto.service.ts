import { Injectable, NotFoundException } from "@nestjs/common";
import { ensureNotNegative, ensurePositive } from "src/common/business-rules";
import { CreateProdutoDto } from "./dto/create-produto-dto";
import { UpdateProdutoDto } from "./dto/update-produto-dto";
import { Produto } from "./produto.entity";

@Injectable()
export class ProdutoService {
    async findOne(id: number): Promise<Produto | null> {
        return Produto.findOne({ where: { id } });
    }

    async findAll(): Promise<Produto[]> {
        return Produto.find();
    }

    async create(dados: CreateProdutoDto): Promise<Produto> {
        ensurePositive(dados.preco, 'preco');
        ensureNotNegative(dados.quantidade, 'quantidade');

        const produto = Produto.create({
            ...dados,
            codigo: await this.generateCode(),
        });

        return produto.save();
    }

    async update(id: number, dados: UpdateProdutoDto): Promise<Produto> {
        const produto = await this.findOne(id);

        if (!produto) {
            throw new NotFoundException('Produto nao encontrado.');
        }

        if (dados.preco !== undefined) {
            ensurePositive(dados.preco, 'preco');
        }

        if (dados.quantidade !== undefined) {
            ensureNotNegative(dados.quantidade, 'quantidade');
        }

        const { codigo, ...editableData } = dados;
        Object.assign(produto, editableData);

        return produto.save();
    }

    async remove(id: number): Promise<void> {
        const produto = await this.findOne(id);

        if (!produto) {
            throw new NotFoundException('Produto nao encontrado.');
        }

        await produto.remove();
    }

    private async generateCode(): Promise<string> {
        const lastProduct = await Produto.createQueryBuilder('produto')
            .orderBy('produto.id', 'DESC')
            .getOne();
        const nextNumber = (lastProduct?.id ?? 0) + 1;
        return `PRD${String(nextNumber).padStart(5, '0')}`;
    }

}
