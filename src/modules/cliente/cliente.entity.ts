import { PedidoVenda } from "src/modules/pedido-venda/pedido-venda.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum TipoCliente {
    FISICA = 'fisica',
    JURIDICA = 'juridica',
}

@Entity('clientes')
export class Cliente extends BaseEntity{
    @PrimaryGeneratedColumn()
    id!: number;
    @Column()
    nome!: string;
    @Column()
    cpfCnpj!: string;
    @Column({
        type: 'enum',
        enum: TipoCliente,
    })
    tipo!: TipoCliente;
    @Column()
    telefone!: string;
    @Column()
    endereco!: string;

    @OneToMany(() => PedidoVenda, (pedidoVenda) => pedidoVenda.cliente)
    pedidosVenda!: PedidoVenda[];
}
