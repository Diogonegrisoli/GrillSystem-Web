import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('produtos')
export class Produto extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    codigo!: string;

    @Column()
    descricao!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    preco!: number;

    @Column()
    quantidade!: number;
}
