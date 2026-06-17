import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { sign, verify } from "jsonwebtoken";
import { UsuarioService } from "../usuario/usuario.service";
import { LoginDto } from "./dto/login-dto";
import { JwtPayload } from "./auth.types";

@Injectable()
export class AuthService {
    constructor(
        private readonly usuarioService: UsuarioService,
        private readonly configService: ConfigService,
    ) {}

    async login(dados: LoginDto) {
        const usuario = await this.usuarioService.findByEmail(dados.email);

        if (!usuario || !this.usuarioService.validatePassword(dados.senha, usuario.senhaHash)) {
            throw new UnauthorizedException('Email ou senha invalidos.');
        }

        const payload: JwtPayload = {
            sub: usuario.id,
            email: usuario.email,
            funcionarioId: usuario.funcionarioId,
        };

        return {
            accessToken: sign(payload, this.getJwtSecret(), {
                expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
            }),
            usuario: payload,
        };
    }

    verifyToken(token: string): JwtPayload {
        try {
            return verify(token, this.getJwtSecret()) as JwtPayload;
        } catch {
            throw new UnauthorizedException('Token invalido ou expirado.');
        }
    }

    private getJwtSecret(): string {
        return this.configService.get<string>('JWT_SECRET', 'grill-system-secret');
    }
}
