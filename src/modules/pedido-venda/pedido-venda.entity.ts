import { Cliente } from "src/modules/cliente/cliente.entity";
import { ContaReceber } from "src/modules/conta-receber/conta-receber.entity";
import { Funcionario } from "src/modules/funcionario/funcionario.entity";
import { Produto } from "src/modules/produto/produto.entity";
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('pedidos_venda')
export class PedidoVenda extends BaseEntity {
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

    @OneToOne(() => ContaReceber, (contaReceber) => contaReceber.pedidoVenda)
    contaReceber!: ContaReceber;

    @ManyToOne(() => Cliente, (cliente) => cliente.pedidosVenda)
    cliente!: Cliente;

    @ManyToMany(() => Produto, (produto) => produto.pedidosVenda)
    @JoinTable()
    produtos!: Produto[];

    @ManyToOne(() => Funcionario, (funcionario) => funcionario.pedidosVenda)
    funcionario!: Funcionario;
}
