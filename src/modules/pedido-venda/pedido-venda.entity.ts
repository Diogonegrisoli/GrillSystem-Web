import { Cliente } from "src/modules/cliente/cliente.entity";
import { ContaReceber } from "src/modules/conta-receber/conta-receber.entity";
import { Funcionario } from "src/modules/funcionario/funcionario.entity";
import { Produto } from "src/modules/produto/produto.entity";
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export enum StatusPedido {
    PENDENTE = 'pendente',
    EM_PRODUCAO = 'em_producao',
    ENVIADO = 'enviado',
    ENTREGUE = 'entregue',
    CANCELADO = 'cancelado',
}

export interface ItemPedidoVenda {
    produtoId: number;
    quantidade: number;
    valorUnitario: number;
    total: number;
}

@Entity('pedidos_venda')
export class PedidoVenda extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'date' })
    dataPedido!: Date;

    @Column({ type: 'date' })
    dataEntrega!: Date;

    @Column({
        type: 'enum',
        enum: StatusPedido,
    })
    status!: StatusPedido;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valorTotal!: number;

    @Column({ type: 'json', nullable: true })
    itens?: ItemPedidoVenda[];

    @OneToOne(() => ContaReceber, (contaReceber) => contaReceber.pedidoVenda)
    contaReceber!: ContaReceber;

    @Column()
    clienteId!: number;

    @ManyToOne(() => Cliente, (cliente) => cliente.pedidosVenda)
    cliente!: Cliente;

    @Column({ nullable: true })
    funcionarioId?: number;

    @ManyToOne(() => Funcionario, (funcionario) => funcionario.pedidosVenda, { nullable: true })
    funcionario?: Funcionario;

    @ManyToMany(() => Produto, (produto) => produto.pedidosVenda)
    @JoinTable()
    produtos!: Produto[];
}
