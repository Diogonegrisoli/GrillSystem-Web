import { Injectable } from "@nestjs/common";
import {Cliente} from './cliente.entity';
import { CreateClienteDto } from "./dto/create-cliente-dto";
import { UpdateClienteDto } from "./dto/update-cliente-dto";
@Injectable()
export class ClienteService{
    
    async findOne(id: number): Promise<Cliente | null> {
        return Cliente.findOne({
            where: {id}
        })
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
        const cliente = Cliente.create({ ...dados});

        return cliente.save();
    }

    async update(id: number, dados: UpdateClienteDto): Promise<Cliente|null>{
        const cliente = await  this.findOne(id);

        if(!cliente){
            return null;
        }

        Object.assign(cliente);

        return cliente.save();
    }

    async remove(id: number): Promise<void | null>{
        const cliente = await this.findOne(id);

        if(!cliente){
            return null;
        }

        await cliente.remove();
    }
}