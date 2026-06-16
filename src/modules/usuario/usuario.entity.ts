import { Funcionario } from "src/modules/funcionario/funcionario.entity";
import { BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('usuarios')
export class Usuario extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 150 })
    email!: string;

    @Column()
    senhaHash!: string;

    @Column()
    funcionarioId!: number;

    @OneToOne(() => Funcionario, (funcionario) => funcionario.usuario)
    @JoinColumn()
    funcionario!: Funcionario;
}
