import { PedidoCompra } from "src/modules/pedido-compra/pedido-compra.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('fornecedores')
export class Fornecedor extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nomeFantasia!: string;

    @Column()
    razaoSocial!: string;

    @Column()
    cnpj!: string;

    @Column()
    email!: string;

    @Column()
    endereco!: string;

    @OneToMany(() => PedidoCompra, (pedidoCompra) => pedidoCompra.fornecedor)
    pedidosCompra!: PedidoCompra[];
}
