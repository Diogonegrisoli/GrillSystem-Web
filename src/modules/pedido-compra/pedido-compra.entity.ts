import { ContaPagar } from "src/modules/conta-pagar/conta-pagar.entity";
import { Fornecedor } from "src/modules/fornecedor/fornecedor.entity";
import { Funcionario } from "src/modules/funcionario/funcionario.entity";
import { BaseEntity, Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export enum StatusCompra {
    ENTREGUE = 'entregue',
    EM_ANDAMENTO = 'em_andamento',
    SOLICITADO = 'solicitado',
    PENDENTE = 'pendente',
}

@Entity('pedidos_compra')
export class PedidoCompra extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'date' })
    dataPedido!: Date;

    @Column({ type: 'date', nullable: true })
    dataEntrega!: Date;

    @Column({
        type: 'enum',
        enum: StatusCompra,
    })
    status!: StatusCompra;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valorTotal!: number;

    @Column()
    fornecedorId!: number;

    @Column()
    funcionarioId!: number;

    @ManyToOne(() => Funcionario)
    funcionario!: Funcionario;

    @ManyToOne(() => Fornecedor, (fornecedor) => fornecedor.pedidosCompra)
    fornecedor!: Fornecedor;

    @OneToOne(() => ContaPagar, (contaPagar) => contaPagar.pedidoCompra)
    contaPagar!: ContaPagar;
}
