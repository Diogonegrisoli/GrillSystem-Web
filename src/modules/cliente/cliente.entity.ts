import { PedidoVenda } from "src/modules/pedido-venda/pedido-venda.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum TipoCliente {
    FISICA = 'fisica',
    JURIDICA = 'juridica',
}

@Entity('cliente')
export class Cliente extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    nome!: string;

    @Column({ name: 'cpf_cnpj', length: 14 })
    cpfCnpj!: string;

    @Column({
        type: 'enum',
        enum: TipoCliente,
    })
    tipo!: TipoCliente;

    @Column({ length: 15 })
    telefone!: string;

    @Column({ length: 200 })
    endereco!: string;

    @OneToMany(() => PedidoVenda, (pedidoVenda) => pedidoVenda.cliente)
    pedidosVenda?: PedidoVenda[];
}
