import { Usuario } from "src/modules/usuario/usuario.entity";
import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export enum StatusFuncionario{
    ATIVO = 'ativo',
    INATIVO = 'inativo'
}

@Entity('funcionarios')
export class Funcionario extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nome!: string;

    @Column()
    cpf!: string;

    @Column({
        type: 'enum',
        enum: StatusFuncionario,
    })
    status!: StatusFuncionario;

    @OneToOne(() => Usuario, (usuario) => usuario.funcionario)
    usuario?: Usuario;
}
