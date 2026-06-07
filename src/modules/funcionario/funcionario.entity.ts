import { PedidoCompra } from "src/modules/pedido-compra/pedido-compra.entity";
import { PedidoVenda } from "src/modules/pedido-venda/pedido-venda.entity";
import { Usuario } from "src/modules/usuario/usuario.entity";
import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('funcionarios')
export class Funcionario extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nome!: string;

    @Column()
    cpf!: string;

    @Column()
    status!: string;

    @OneToOne(() => Usuario, (usuario) => usuario.funcionario)
    @JoinColumn()
    usuario!: Usuario;

    @OneToMany(() => PedidoVenda, (pedidoVenda) => pedidoVenda.funcionario)
    pedidosVenda!: PedidoVenda[];

    @OneToMany(() => PedidoCompra, (pedidoCompra) => pedidoCompra.funcionario)
    pedidosCompra!: PedidoCompra[];
}
