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
        return Usuario.findOne({ where: { id } });
    }

    async findAll(): Promise<Usuario[]> {
        return Usuario.find();
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

        Object.assign(usuario, {
            ...dados,
            ...(dados.senha ? { senhaHash: this.hashPassword(dados.senha) } : {}),
        });

        delete (usuario as unknown as { senha?: string }).senha;

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
