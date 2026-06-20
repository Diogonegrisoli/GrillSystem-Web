import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { onlyNumbers, validateCpf } from "src/common/business-rules";
import { CreateFuncionarioDto } from "./dto/create-funcionario-dto";
import { UpdateFuncionarioDto } from "./dto/update-funcionario-dto";
import { Funcionario, StatusFuncionario } from "./funcionario.entity";

@Injectable()
export class FuncionarioService {
    async findOne(id: number): Promise<Funcionario | null> {
        return Funcionario.findOne({ where: { id } });
    }

    async findAll(): Promise<Funcionario[]> {
        return Funcionario.find();
    }

    async create(dados: CreateFuncionarioDto): Promise<Funcionario> {
        const cpf = onlyNumbers(dados.cpf);

        if (!validateCpf(cpf)) {
            throw new BadRequestException('CPF invalido.');
        }

        const funcionario = Funcionario.create({
            ...dados,
            cpf,
            status: StatusFuncionario.ATIVO,
        });

        return funcionario.save();
    }

    async update(id: number, dados: UpdateFuncionarioDto): Promise<Funcionario> {
        const funcionario = await this.findOne(id);

        if (!funcionario) {
            throw new NotFoundException('Funcionario nao encontrado.');
        }

        const { cpf, ...editableData } = dados;
        Object.assign(funcionario, editableData);

        return funcionario.save();
    }

    async remove(id: number): Promise<void> {
        const funcionario = await this.findOne(id);

        if (!funcionario) {
            throw new NotFoundException('Funcionario nao encontrado.');
        }

        await funcionario.remove();
    }

}
