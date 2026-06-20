import { ContaPagar } from "src/modules/conta-pagar/conta-pagar.entity";
import { Fornecedor } from "src/modules/fornecedor/fornecedor.entity";
import { Funcionario } from "src/modules/funcionario/funcionario.entity";
import { Produto } from "src/modules/produto/produto.entity";
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export enum StatusCompra {
    ENTREGUE = 'entregue',
    EM_ANDAMENTO = 'em_andamento',
    PENDENTE = 'pendente'
}

export interface ItemPedidoCompra {
    produtoId: number;
    quantidade: number;
    valorUnitario: number;
    total: number;
}

@Entity('pedidos_compra')
export class PedidoCompra extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'date' })
    dataPedido!: Date;

    @Column({ type: 'date', nullable: true })
    dataEntrega?: Date;

    @Column({
        type: 'enum',
        enum: StatusCompra,
    })
    status!: StatusCompra;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valorTotal!: number;

    @Column({ type: 'json', nullable: true })
    itens?: ItemPedidoCompra[];

    @Column()
    fornecedorId!: number;

    @Column()
    funcionarioId!: number;

    @ManyToOne(() => Funcionario)
    funcionario!: Funcionario;

    @ManyToOne(() => Fornecedor, (fornecedor) => fornecedor.pedidosCompra)
    fornecedor!: Fornecedor;

    @ManyToMany(() => Produto, (produto) => produto.pedidosCompra)
    @JoinTable()
    produtos!: Produto[];

    @OneToOne(() => ContaPagar, (contaPagar) => contaPagar.pedidoCompra)
    contaPagar!: ContaPagar;
}
