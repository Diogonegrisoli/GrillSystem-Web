import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {Cliente} from './cliente.entity';
import { CreateClienteDto } from "./dto/create-cliente-dto";
import { UpdateClienteDto } from "./dto/update-cliente-dto";
import { onlyNumbers, validateCnpj, validateCpf } from "src/common/business-rules";
@Injectable()
export class ClienteService{
    private prepareData(dados: CreateClienteDto | UpdateClienteDto): CreateClienteDto | UpdateClienteDto {
        if (!dados.cpfCnpj && !dados.tipo) {
            return dados;
        }

        const cpfCnpj = dados.cpfCnpj ? onlyNumbers(dados.cpfCnpj) : dados.cpfCnpj;
        const tipo = dados.tipo;

        if (cpfCnpj && tipo === 'fisica' && (cpfCnpj.length !== 11 || !validateCpf(cpfCnpj))) {
            throw new BadRequestException('CPF invalido para cliente do tipo fisica.');
        }

        if (cpfCnpj && tipo === 'juridica' && (cpfCnpj.length !== 14 || !validateCnpj(cpfCnpj))) {
            throw new BadRequestException('CNPJ invalido para cliente do tipo juridica.');
        }

        return {
            ...dados,
            cpfCnpj,
        };
    }
    
    async findOne(id: number): Promise<Cliente | null> {
        return Cliente.findOne({ where: {id} })
    }

    async findAll(): Promise<Cliente[]>{
        return Cliente.find({
            select: {
                id: true,
                nome: true,
                cpfCnpj: true,
                tipo: true,
                telefone:  true,
                endereco: true
            }
        })
    }

    async create(dados:CreateClienteDto): Promise<Cliente>{
        const cliente = Cliente.create({ ...this.prepareData(dados) });

        return cliente.save();
    }

    async update(id: number, dados: UpdateClienteDto): Promise<Cliente>{
        const cliente = await  this.findOne(id);

        if(!cliente){
            throw new NotFoundException('Cliente nao encontrado.');
        }

        const preparedData = this.prepareData({
            ...dados,
            tipo: dados.tipo ?? cliente.tipo,
            cpfCnpj: dados.cpfCnpj ?? cliente.cpfCnpj,
        });

        Object.assign(cliente, preparedData);

        return cliente.save();
    }

    async remove(id: number): Promise<void>{
        const cliente = await this.findOne(id);

        if(!cliente){
            throw new NotFoundException('Cliente nao encontrado.');
        }

        await cliente.remove();
    }
}
