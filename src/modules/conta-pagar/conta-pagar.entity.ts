import { PedidoCompra } from "src/modules/pedido-compra/pedido-compra.entity";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('contas_pagar')
export class ContaPagar extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valor!: number;

    @Column()
    tipoPagamento!: string;

    @Column({ type: 'date', nullable: true })
    dataRecebimento!: Date;

    @Column({ type: 'date' })
    dataVencimento!: Date;

    @Column({ type: 'date', nullable: true })
    dataPagamento!: Date;

    @Column()
    status!: string;

    @OneToOne(() => PedidoCompra, (pedidoCompra) => pedidoCompra.contaPagar)
    @JoinColumn()
    pedidoCompra!: PedidoCompra;
}
