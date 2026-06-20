import { Usuario } from "src/modules/usuario/usuario.entity";
import { PedidoVenda } from "src/modules/pedido-venda/pedido-venda.entity";
import { PedidoCompra } from "src/modules/pedido-compra/pedido-compra.entity";
import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export enum StatusFuncionario{
    ATIVO = 'ativo',
    INATIVO = 'inativo'
}

@Entity('funcionarios')
export class Funcionario extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nome!: string;

    @Column()
    cpf!: string;

    @Column({
        type: 'enum',
        enum: StatusFuncionario,
    })
    status!: StatusFuncionario;

    @OneToOne(() => Usuario, (usuario) => usuario.funcionario)
    usuario?: Usuario;

    @OneToMany(() => PedidoVenda, (pedidoVenda) => pedidoVenda.funcionario)
    pedidosVenda!: PedidoVenda[];

    @OneToMany(() => PedidoCompra, (pedidoCompra) => pedidoCompra.funcionario)
    pedidosCompra!: PedidoCompra[];
}
