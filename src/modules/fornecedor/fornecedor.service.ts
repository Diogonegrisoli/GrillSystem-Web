import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { onlyNumbers, validateCnpj } from "src/common/business-rules";
import { CreateFornecedorDto } from "./dto/create-fornecedor-dto";
import { UpdateFornecedorDto } from "./dto/update-fornecedor-dto";
import { Fornecedor } from "./fornecedor.entity";

@Injectable()
export class FornecedorService {
    async findOne(id: number): Promise<Fornecedor | null> {
        return Fornecedor.findOne({ where: { id } });
    }

    async findAll(): Promise<Fornecedor[]> {
        return Fornecedor.find();
    }

    async create(dados: CreateFornecedorDto): Promise<Fornecedor> {
        const cnpj = onlyNumbers(dados.cnpj);

        if (!validateCnpj(cnpj)) {
            throw new BadRequestException('CNPJ invalido.');
        }

        const fornecedor = Fornecedor.create({
            ...dados,
            cnpj,
        });

        return fornecedor.save();
    }

    async update(id: number, dados: UpdateFornecedorDto): Promise<Fornecedor> {
        const fornecedor = await this.findOne(id);

        if (!fornecedor) {
            throw new NotFoundException('Fornecedor nao encontrado.');
        }

        const cnpj = dados.cnpj ? onlyNumbers(dados.cnpj) : undefined;

        if (cnpj && !validateCnpj(cnpj)) {
            throw new BadRequestException('CNPJ invalido.');
        }

        Object.assign(fornecedor, {
            ...dados,
            ...(cnpj ? { cnpj } : {}),
        });

        return fornecedor.save();
    }

    async remove(id: number): Promise<void> {
        const fornecedor = await this.findOne(id);

        if (!fornecedor) {
            throw new NotFoundException('Fornecedor nao encontrado.');
        }

        await fornecedor.remove();
    }

}
