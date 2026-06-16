import { PedidoVenda } from "src/modules/pedido-venda/pedido-venda.entity";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export enum StatusPagamento {
    PAGO = 'pago',
    PENDENTE = 'pendente',
    ATRASADO = 'atrasado',
    CANCELADO = 'cancelado',
}

export enum TipoPagamentoReceber {
    PIX = 'pix',
    DINHEIRO = 'dinheiro',
    CREDITO = 'credito',
    DEBITO = 'debito',
    BOLETO = 'boleto',
}

@Entity('contas_receber')
export class ContaReceber extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor!: number;

    @Column({ type: 'date' })
    dataVencimento!: Date;

    @Column({ type: 'date', nullable: true })
    dataRecebimento!: Date | null;

    @Column({ type: 'date' })
    dataEmissao!: Date;

    @Column({
        type: 'enum',
        enum: TipoPagamentoReceber,
    })
    tipoPagamento!: TipoPagamentoReceber;

    @Column({
        type: 'enum',
        enum: StatusPagamento,
    })
    statusPagamento!: StatusPagamento;

    @Column()
    pedidoVendaId!: number;

    @OneToOne(() => PedidoVenda, (pedidoVenda) => pedidoVenda.contaReceber)
    @JoinColumn()
    pedidoVenda!: PedidoVenda;
}
