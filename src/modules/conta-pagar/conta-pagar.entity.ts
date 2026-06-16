import { PedidoCompra } from "src/modules/pedido-compra/pedido-compra.entity";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export enum TipoPagamento{
    DEBITO = 'debito',
    CREDITO = 'credito',
    PIX = 'pix',
    DINHEIRO = 'dinheiro',
}

export enum StatusContaPagar {
    PAGO = 'pago',
    PENDENTE = 'pendente',
    CANCELADO = 'cancelado',
}

@Entity('contas_pagar')
export class ContaPagar extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor!: number;

    @Column({
        type: 'enum',
        enum: TipoPagamento,
    })
    tipoPagamento!: TipoPagamento;

    @Column({ type: 'datetime' })
    dataEmissao!: Date;

    @Column({ type: 'date' })
    dataVencimento!: Date;

    @Column({ type: 'datetime', nullable: true })
    dataPagamento!: Date | null;

    @Column({
        type: 'enum',
        enum: StatusContaPagar,
    })
    status!: StatusContaPagar;

    @Column()
    pedidoCompraId!: number;

    @OneToOne(() => PedidoCompra, (pedidoCompra) => pedidoCompra.contaPagar)
    @JoinColumn()
    pedidoCompra!: PedidoCompra;
}
