import { Injectable, NotFoundException } from "@nestjs/common";
import { createHash } from "crypto";
import { CreateUsuarioDto } from "./dto/create-usuario-dto";
import { UpdateUsuarioDto } from "./dto/update-usuario-dto";
import { Usuario } from "./usuario.entity";

@Injectable()
export class UsuarioService {
    private hashPassword(senha: string): string {
        return createHash('sha256').update(senha).digest('hex');
    }

    async findOne(id: number): Promise<Usuario | null> {
        return Usuario.findOne({ where: { id }, relations: { funcionario: true } });
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        return Usuario.findOne({ where: { email } });
    }

    validatePassword(senha: string, senhaHash: string): boolean {
        return this.hashPassword(senha) === senhaHash;
    }

    async findAll(): Promise<Usuario[]> {
        return Usuario.find({ relations: { funcionario: true } });
    }

    async create(dados: CreateUsuarioDto): Promise<Usuario> {
        const usuario = Usuario.create({
            email: dados.email,
            senhaHash: this.hashPassword(dados.senha),
            funcionarioId: dados.funcionarioId,
        });

        return usuario.save();
    }

    async update(id: number, dados: UpdateUsuarioDto): Promise<Usuario> {
        const usuario = await this.findOne(id);

        if (!usuario) {
            throw new NotFoundException('Usuario nao encontrado.');
        }

        const { senha, funcionarioId, ...editableData } = dados;
        Object.assign(usuario, {
            ...editableData,
            ...(senha ? { senhaHash: this.hashPassword(senha) } : {}),
        });

        return usuario.save();
    }

    async remove(id: number): Promise<void> {
        const usuario = await this.findOne(id);

        if (!usuario) {
            throw new NotFoundException('Usuario nao encontrado.');
        }

        await usuario.remove();
    }

}
