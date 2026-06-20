import { PedidoCompra } from "src/modules/pedido-compra/pedido-compra.entity";
import { PedidoVenda } from "src/modules/pedido-venda/pedido-venda.entity";
import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('produtos')
export class Produto extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    codigo!: string;

    @Column()
    descricao!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    preco!: number;

    @Column()
    quantidade!: number;

    @ManyToMany(() => PedidoVenda, (pedidoVenda) => pedidoVenda.produtos)
    pedidosVenda!: PedidoVenda[];

    @ManyToMany(() => PedidoCompra, (pedidoCompra) => pedidoCompra.produtos)
    pedidosCompra!: PedidoCompra[];
}
