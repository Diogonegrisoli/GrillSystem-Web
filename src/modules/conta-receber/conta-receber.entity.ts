import { PedidoVenda } from "src/modules/pedido-venda/pedido-venda.entity";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('contas_receber')
export class ContaReceber extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor!: number;

    @Column({ type: 'date' })
    dataVencimento!: Date;

    @Column({ type: 'date', nullable: true })
    dataRecebimento!: Date;

    @Column()
    tipoPagamento!: string;

    @Column()
    status!: string;

    @OneToOne(() => PedidoVenda, (pedidoVenda) => pedidoVenda.contaReceber)
    @JoinColumn()
    pedidoVenda!: PedidoVenda;
}
