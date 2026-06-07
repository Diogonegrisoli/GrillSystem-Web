import { Funcionario } from "src/modules/funcionario/funcionario.entity";
import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('usuarios')
export class Usuario extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column()
    senha!: string;

    @OneToOne(() => Funcionario, (funcionario) => funcionario.usuario)
    funcionario!: Funcionario;
}
