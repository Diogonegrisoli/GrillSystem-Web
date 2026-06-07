import { ContaPagar } from "src/modules/conta-pagar/conta-pagar.entity";
import { Fornecedor } from "src/modules/fornecedor/fornecedor.entity";
import { Funcionario } from "src/modules/funcionario/funcionario.entity";
import { Produto } from "src/modules/produto/produto.entity";
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('pedidos_compra')
export class PedidoCompra extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'date' })
    dataPedido!: Date;

    @Column({ type: 'date', nullable: true })
    dataEntrega!: Date;

    @Column()
    status!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    valorTotal!: number;

    @ManyToOne(() => Funcionario, (funcionario) => funcionario.pedidosCompra)
    funcionario!: Funcionario;

    @ManyToMany(() => Produto, (produto) => produto.pedidosCompra)
    @JoinTable()
    produtos!: Produto[];

    @ManyToOne(() => Fornecedor, (fornecedor) => fornecedor.pedidosCompra)
    fornecedor!: Fornecedor;

    @OneToOne(() => ContaPagar, (contaPagar) => contaPagar.pedidoCompra)
    contaPagar!: ContaPagar;
}
