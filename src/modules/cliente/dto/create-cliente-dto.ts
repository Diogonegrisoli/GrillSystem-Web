import { IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";
import { TipoCliente } from "../cliente.entity";
import { PedidoVenda } from "src/modules/pedido-venda/pedido-venda.entity";

export class CreateClienteDto {
    @IsNotEmpty({ message: 'O campo nome é obrigatório' })
    @MinLength(5, { message: 'O nome deve ter no mínimo 5 caracteres' })
    @MaxLength(100, {message: 'O nome deve ter no máximo 100 caracteres'})
    nome!: string;
    
    @IsNotEmpty({message: 'O CPF/CNPJ deve ser informado!'})
    @Matches(/(^\d{11}$)|(^\d{14}$)|(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/, {message: 'O CPF/CNPJ está incorreto!'})
    cpfCnpj!: string;

    tipo!: TipoCliente;

    @IsNotEmpty({message: 'O telefone deve ser informado!'})
    @MinLength(10, {message: 'Telefone inválido!'})
    @MaxLength(15, {message: 'Telefone inválido!'})
    telefone!: string;

    @IsNotEmpty({message: 'O endereço deve ser informado!'})
    @MaxLength(200, {message: 'O endereço deve ter no máximo 200 caracteres.'})
    endereco!: string;
}